#!/usr/bin/env bash
set -euo pipefail

required_variables=(
  GCP_PROJECT_ID
  GCP_REGION
  GCP_BACKEND_MIG
  BACKEND_IMAGE
  VERSION_TAG
)

for name in "${required_variables[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "missing required variable: $name" >&2
    exit 1
  fi
done

if [[ ! "$GCP_BACKEND_MIG" =~ ^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$ ]]; then
  echo "GCP_BACKEND_MIG must be an exact managed instance group name" >&2
  exit 1
fi

if [[ ! "$GCP_REGION" =~ ^[a-z0-9-]+$ ]]; then
  echo "GCP_REGION contains unsupported characters" >&2
  exit 1
fi

if [[ ! "$BACKEND_IMAGE" =~ ^[a-z0-9][a-z0-9._/-]*$ ]]; then
  echo "BACKEND_IMAGE contains unsupported characters" >&2
  exit 1
fi

if [[ ! "$VERSION_TAG" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$ ]]; then
  echo "VERSION_TAG must be a valid container image tag" >&2
  exit 1
fi

GCP_DEPLOY_PATH="${GCP_DEPLOY_PATH:-/opt/cmc}"

if [[ ! "$GCP_DEPLOY_PATH" =~ ^/[A-Za-z0-9._/-]+$ ]]; then
  echo "GCP_DEPLOY_PATH must be an absolute path without whitespace or shell metacharacters" >&2
  exit 1
fi

root="$(git rev-parse --show-toplevel)"
cd "$root"

instance_output="$(
  gcloud compute instance-groups managed list-instances "$GCP_BACKEND_MIG" \
    --project "$GCP_PROJECT_ID" \
    --region "$GCP_REGION" \
    --format='value(name,instance.scope().segment(0),instanceStatus,currentAction)'
)"

instance_records=()
while IFS= read -r record; do
  [[ -n "$record" ]] && instance_records+=("$record")
done <<< "$instance_output"

if [[ "${#instance_records[@]}" -ne 1 ]]; then
  echo "expected exactly one managed instance in $GCP_BACKEND_MIG, found ${#instance_records[@]}" >&2
  [[ -n "$instance_output" ]] && printf '%s\n' "$instance_output" >&2
  exit 1
fi

read -r instance zone instance_status current_action <<< "${instance_records[0]}"

if [[ -z "${instance:-}" || -z "${zone:-}" || "$instance_status" != "RUNNING" || "$current_action" != "NONE" ]]; then
  echo "backend managed instance is not stable: ${instance:-unknown} status=${instance_status:-unknown} action=${current_action:-unknown}" >&2
  exit 1
fi

echo "deploying loadtest backend $BACKEND_IMAGE:$VERSION_TAG to $instance ($zone)"

gcloud compute ssh "$instance" \
  --project "$GCP_PROJECT_ID" \
  --zone "$zone" \
  --tunnel-through-iap \
  --quiet \
  --command="sudo install -d -o \"\$(id -un)\" -g \"\$(id -gn)\" '$GCP_DEPLOY_PATH'"

gcloud compute scp --recurse \
  docker-compose-prod.yml docker-compose.loadtest.yml nginx monitoring \
  "$instance:$GCP_DEPLOY_PATH/" \
  --project "$GCP_PROJECT_ID" \
  --zone "$zone" \
  --tunnel-through-iap \
  --quiet

gcloud auth print-access-token \
  | gcloud compute ssh "$instance" \
      --project "$GCP_PROJECT_ID" \
      --zone "$zone" \
      --tunnel-through-iap \
      --quiet \
      --command="sudo docker login -u oauth2accesstoken --password-stdin 'https://${GCP_REGION}-docker.pkg.dev'"

printf -v deploy_path_q '%q' "$GCP_DEPLOY_PATH"
printf -v backend_image_q '%q' "$BACKEND_IMAGE"
printf -v version_tag_q '%q' "$VERSION_TAG"

gcloud compute ssh "$instance" \
  --project "$GCP_PROJECT_ID" \
  --zone "$zone" \
  --tunnel-through-iap \
  --quiet \
  --command="set -euo pipefail
deploy_path=$deploy_path_q
backend_image=$backend_image_q
version_tag=$version_tag_q
compose=(docker compose -f docker-compose-prod.yml -f docker-compose.loadtest.yml)

cd \"\$deploy_path\"
test -f .env
for required_path in docker-compose-prod.yml docker-compose.loadtest.yml nginx/nginx.conf monitoring/prometheus.yml; do
  if [[ ! -f \"\$required_path\" ]]; then
    echo \"missing deployment file: \$required_path\" >&2
    exit 1
  fi
done

sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" \"\${compose[@]}\" config --quiet
sudo docker run --rm \
  --add-host backend:127.0.0.1 \
  -v \"\$deploy_path/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro\" \
  nginx:1.27-alpine nginx -t

sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" \"\${compose[@]}\" pull
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" \"\${compose[@]}\" run --rm migrate
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" \"\${compose[@]}\" up -d --remove-orphans
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" \"\${compose[@]}\" exec -T nginx nginx -t
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" \"\${compose[@]}\" exec -T nginx nginx -s reload

backend_container_id=\$(sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" \"\${compose[@]}\" ps -q backend)
if [[ -z \"\$backend_container_id\" ]]; then
  echo 'backend container was not created' >&2
  exit 1
fi

running_image=\$(sudo docker inspect --format '{{.Config.Image}}' \"\$backend_container_id\")
if [[ \"\$running_image\" != \"\$backend_image:\$version_tag\" ]]; then
  echo \"backend image mismatch: expected \$backend_image:\$version_tag, got \$running_image\" >&2
  exit 1
fi

running_node_env=\$(sudo docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' \"\$backend_container_id\" | awk -F= '\$1 == \"NODE_ENV\" {print \$2; exit}')
if [[ \"\$running_node_env\" != \"loadtest\" ]]; then
  echo \"backend NODE_ENV mismatch: expected loadtest, got \${running_node_env:-unset}\" >&2
  exit 1
fi

healthy=false
for _ in \$(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1/livez >/dev/null \
    && curl --fail --silent --show-error --max-time 5 http://127.0.0.1/healthz >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done

if [[ \"\$healthy\" != true ]]; then
  echo 'backend failed the /livez or /healthz deployment check' >&2
  sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" \"\${compose[@]}\" ps >&2
  exit 1
fi

umask 077
release_tmp=\$(mktemp \"\$deploy_path/.release.env.XXXXXX\")
trap 'rm -f \"\$release_tmp\"' EXIT
compose_sha256=\$(sha256sum docker-compose-prod.yml | awk '{print \$1}')
loadtest_compose_sha256=\$(sha256sum docker-compose.loadtest.yml | awk '{print \$1}')
nginx_sha256=\$(sha256sum nginx/nginx.conf | awk '{print \$1}')
{
  printf 'BACKEND_IMAGE=%s\\n' \"\$backend_image\"
  printf 'VERSION_TAG=%s\\n' \"\$version_tag\"
  printf 'IMAGE_REF=%s:%s\\n' \"\$backend_image\" \"\$version_tag\"
  printf 'NODE_ENV=loadtest\\n'
  printf 'COMPOSE_SHA256=%s\\n' \"\$compose_sha256\"
  printf 'LOADTEST_COMPOSE_SHA256=%s\\n' \"\$loadtest_compose_sha256\"
  printf 'NGINX_SHA256=%s\\n' \"\$nginx_sha256\"
  printf 'DEPLOYED_AT=%s\\n' \"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
} > \"\$release_tmp\"
mv -f \"\$release_tmp\" \"\$deploy_path/release.env\"
trap - EXIT

sudo docker image prune -f
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" \"\${compose[@]}\" ps"
