#!/usr/bin/env bash
set -euo pipefail

mode="deploy"
case "${1:-}" in
  "")
    ;;
  --preflight)
    mode="preflight"
    ;;
  *)
    echo "usage: $0 [--preflight]" >&2
    exit 2
    ;;
esac

required_variables=(
  GCP_PROJECT_ID
  GCP_REGION
  GCP_BACKEND_MIG
)

if [[ "$mode" == "deploy" ]]; then
  required_variables+=(
    BACKEND_IMAGE
    VERSION_TAG
  )
fi

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

if [[ "$mode" == "deploy" ]]; then
  if [[ ! "$BACKEND_IMAGE" =~ ^[a-z0-9][a-z0-9._/-]*$ ]]; then
    echo "BACKEND_IMAGE contains unsupported characters" >&2
    exit 1
  fi

  if [[ ! "$VERSION_TAG" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$ ]]; then
    echo "VERSION_TAG must be a valid container image tag" >&2
    exit 1
  fi
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

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to inspect effective OS Login metadata" >&2
  exit 1
fi

instance_metadata="$(
  gcloud compute instances describe "$instance" \
    --project "$GCP_PROJECT_ID" \
    --zone "$zone" \
    --format='json(metadata.items)'
)"
instance_oslogin="$(
  jq -r '[.metadata.items[]? | select(.key == "enable-oslogin") | .value][0] // empty' \
    <<< "$instance_metadata"
)"

if [[ -n "$instance_oslogin" ]]; then
  effective_oslogin="$instance_oslogin"
  oslogin_source="instance metadata"
else
  project_metadata="$(
    gcloud compute project-info describe \
      --project "$GCP_PROJECT_ID" \
      --format='json(commonInstanceMetadata.items)'
  )"
  effective_oslogin="$(
    jq -r '[.commonInstanceMetadata.items[]? | select(.key == "enable-oslogin") | .value][0] // empty' \
      <<< "$project_metadata"
  )"
  oslogin_source="project metadata"
fi

if [[ ! "$effective_oslogin" =~ ^[Tt][Rr][Uu][Ee]$ ]]; then
  echo "OS Login is not enabled for $instance; effective value from $oslogin_source is '${effective_oslogin:-unset}'" >&2
  echo "set enable-oslogin=TRUE on the current instance before rerunning deployment" >&2
  exit 1
fi

echo "backend preflight passed: instance=$instance zone=$zone oslogin=$oslogin_source"

required_runtime_variables=(
  GF_SECURITY_ADMIN_PASSWORD
  NODE_ENV
  FRONTEND_URL
  DATABASE_URL
  REDIS_HOST
  REDIS_PORT
  JWT_ACCESS_SECRET
  JWT_REFRESH_SECRET
  JWT_ACCESS_EXPIRES_IN
  JWT_REFRESH_EXPIRES_IN
  GEMINI_API_KEYS
  GITHUB_CLIENT_ID
  GITHUB_CLIENT_SECRET
  GITHUB_CALLBACK_URL
  KAKAO_CLIENT_ID
  KAKAO_CLIENT_SECRET
  KAKAO_CALLBACK_URL
)
printf -v required_runtime_variables_q '%q ' "${required_runtime_variables[@]}"

gcloud compute ssh "$instance" \
  --project "$GCP_PROJECT_ID" \
  --zone "$zone" \
  --tunnel-through-iap \
  --quiet \
  --command="set -euo pipefail
env_file='$GCP_DEPLOY_PATH/.env'
sudo test -f \"\$env_file\"
for name in $required_runtime_variables_q; do
  if ! sudo grep -Eq \"^\${name}=.+\" \"\$env_file\"; then
    echo \"missing or empty runtime variable in \$env_file: \$name\" >&2
    exit 1
  fi
done"
echo "backend SSH preflight passed: required runtime variables exist in $GCP_DEPLOY_PATH/.env"

if [[ "$mode" == "preflight" ]]; then
  exit 0
fi

echo "deploying $BACKEND_IMAGE:$VERSION_TAG to $instance ($zone)"

remote_stage_path="/tmp/cmc-deploy-${VERSION_TAG}"
printf -v deploy_path_q '%q' "$GCP_DEPLOY_PATH"
printf -v remote_stage_path_q '%q' "$remote_stage_path"
printf -v backend_image_q '%q' "$BACKEND_IMAGE"
printf -v version_tag_q '%q' "$VERSION_TAG"

gcloud compute ssh "$instance" \
  --project "$GCP_PROJECT_ID" \
  --zone "$zone" \
  --tunnel-through-iap \
  --quiet \
  --command="set -euo pipefail
remote_stage_path=$remote_stage_path_q
rm -rf \"\$remote_stage_path\"
install -d -m 0700 \"\$remote_stage_path\""

gcloud compute scp --recurse \
  docker-compose-prod.yml nginx monitoring \
  "$instance:$remote_stage_path/" \
  --project "$GCP_PROJECT_ID" \
  --zone "$zone" \
  --tunnel-through-iap \
  --quiet

gcloud compute ssh "$instance" \
  --project "$GCP_PROJECT_ID" \
  --zone "$zone" \
  --tunnel-through-iap \
  --quiet \
  --command="set -euo pipefail
deploy_path=$deploy_path_q
remote_stage_path=$remote_stage_path_q

sudo install -d -o \"\$(id -un)\" -g \"\$(id -gn)\" \"\$deploy_path\"
sudo install \
  -o \"\$(id -un)\" \
  -g \"\$(id -gn)\" \
  -m 0644 \
  \"\$remote_stage_path/docker-compose-prod.yml\" \
  \"\$deploy_path/docker-compose-prod.yml\"

for directory in nginx monitoring; do
  sudo install -d \"\$deploy_path/\$directory\"
  sudo cp -a \"\$remote_stage_path/\$directory/.\" \"\$deploy_path/\$directory/\"
  sudo chown -R \"\$(id -un):\$(id -gn)\" \"\$deploy_path/\$directory\"
done

rm -rf \"\$remote_stage_path\""

gcloud auth print-access-token \
  | gcloud compute ssh "$instance" \
      --project "$GCP_PROJECT_ID" \
      --zone "$zone" \
      --tunnel-through-iap \
      --quiet \
      --command="sudo docker login -u oauth2accesstoken --password-stdin 'https://${GCP_REGION}-docker.pkg.dev'"

gcloud compute ssh "$instance" \
  --project "$GCP_PROJECT_ID" \
  --zone "$zone" \
  --tunnel-through-iap \
  --quiet \
  --command="set -euo pipefail
deploy_path=$deploy_path_q
backend_image=$backend_image_q
version_tag=$version_tag_q

cd \"\$deploy_path\"
test -f .env
for required_path in docker-compose-prod.yml nginx/nginx.conf monitoring/prometheus.yml; do
  if [[ ! -f \"\$required_path\" ]]; then
    echo \"missing deployment file: \$required_path\" >&2
    exit 1
  fi
done

sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" docker compose -f docker-compose-prod.yml config --quiet
sudo docker run --rm \
  --add-host backend:127.0.0.1 \
  -v \"\$deploy_path/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro\" \
  nginx:1.27-alpine nginx -t

sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" docker compose -f docker-compose-prod.yml pull
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" docker compose -f docker-compose-prod.yml run --rm migrate
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" docker compose -f docker-compose-prod.yml up -d --remove-orphans
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" docker compose -f docker-compose-prod.yml exec -T nginx nginx -t
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" docker compose -f docker-compose-prod.yml exec -T nginx nginx -s reload

backend_container_id=\$(sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" docker compose -f docker-compose-prod.yml ps -q backend)
if [[ -z \"\$backend_container_id\" ]]; then
  echo 'backend container was not created' >&2
  exit 1
fi

running_image=\$(sudo docker inspect --format '{{.Config.Image}}' \"\$backend_container_id\")
if [[ \"\$running_image\" != \"\$backend_image:\$version_tag\" ]]; then
  echo \"backend image mismatch: expected \$backend_image:\$version_tag, got \$running_image\" >&2
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
  sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" docker compose -f docker-compose-prod.yml ps >&2
  exit 1
fi

umask 077
release_tmp=\$(mktemp \"\$deploy_path/.release.env.XXXXXX\")
trap 'rm -f \"\$release_tmp\"' EXIT
compose_sha256=\$(sha256sum docker-compose-prod.yml | awk '{print \$1}')
nginx_sha256=\$(sha256sum nginx/nginx.conf | awk '{print \$1}')
{
  printf 'BACKEND_IMAGE=%s\\n' \"\$backend_image\"
  printf 'VERSION_TAG=%s\\n' \"\$version_tag\"
  printf 'IMAGE_REF=%s:%s\\n' \"\$backend_image\" \"\$version_tag\"
  printf 'COMPOSE_SHA256=%s\\n' \"\$compose_sha256\"
  printf 'NGINX_SHA256=%s\\n' \"\$nginx_sha256\"
  printf 'DEPLOYED_AT=%s\\n' \"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
} > \"\$release_tmp\"
mv -f \"\$release_tmp\" \"\$deploy_path/release.env\"
trap - EXIT

sudo docker image prune -f
sudo env BACKEND_IMAGE=\"\$backend_image\" VERSION_TAG=\"\$version_tag\" docker compose -f docker-compose-prod.yml ps"
