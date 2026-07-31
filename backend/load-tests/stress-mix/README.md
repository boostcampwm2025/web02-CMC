# Stress Mix Load Test

`stress-mix`는 `normal-mix-target`에서 정한 rate limit 후보 주변의 여유폭을 확인하는 시나리오다.

기준 후보값은 다음처럼 둔다.

```text
chat   35/s
attack 5/s
vote   30/s
```

40명 기준 실행 interval은 아래처럼 조절된다. 기본적으로 `STRESS_SCALE`만 바꾸면 YAML 기본 interval을 scale로 나눠 적용한다. `CHAT_MIN_INTERVAL_MS` 같은 interval env를 직접 넘기면 직접 넘긴 값이 우선된다.

```text
1.0x
CHAT_MIN_INTERVAL_MS=1050 CHAT_MAX_INTERVAL_MS=1250
ATTACK_MIN_INTERVAL_MS=7200 ATTACK_MAX_INTERVAL_MS=8800
VOTE_MIN_INTERVAL_MS=1200 VOTE_MAX_INTERVAL_MS=1450

1.2x
CHAT_MIN_INTERVAL_MS=880 CHAT_MAX_INTERVAL_MS=1050
ATTACK_MIN_INTERVAL_MS=6000 ATTACK_MAX_INTERVAL_MS=7300
VOTE_MIN_INTERVAL_MS=1000 VOTE_MAX_INTERVAL_MS=1200

1.4x
CHAT_MIN_INTERVAL_MS=740 CHAT_MAX_INTERVAL_MS=900
ATTACK_MIN_INTERVAL_MS=5150 ATTACK_MAX_INTERVAL_MS=6300
VOTE_MIN_INTERVAL_MS=850 VOTE_MAX_INTERVAL_MS=1000
```

로컬 smoke 예시:

```bash
LOAD_TEST_AUTHOR_ID=11111111-1111-4111-8111-111111111111 \
TEST_DURATION_SECONDS=60 \
WARMUP_SECONDS=10 \
STRESS_SCALE=1.0 \
RESULT_LABEL=battle-stress-mix-1.0x-smoke \
API_URL=http://localhost:3000 \
SOCKET_URL=http://localhost:3000 \
pnpm run loadtest:stress-mix
```

1.2x 예시:

```bash
LOAD_TEST_AUTHOR_ID=11111111-1111-4111-8111-111111111111 \
TEST_DURATION_SECONDS=180 \
WARMUP_SECONDS=10 \
STRESS_SCALE=1.2 \
RESULT_LABEL=battle-stress-mix-1.2x \
API_URL=http://localhost:3000 \
SOCKET_URL=http://localhost:3000 \
pnpm run loadtest:stress-mix
```

실제 환경에서는 1.0x, 1.2x, 1.4x를 각각 독립 실행한다. 각 실행 전에는 load-test battle, Redis `battle:*` 키, backend 프로세스 상태를 정리한다.

PASS 기준:

```text
errors = 0
chat/attack/vote error = 0
transport close = 0
early disconnect = 0
vusers.failed = 0
backend restart = 0
```
