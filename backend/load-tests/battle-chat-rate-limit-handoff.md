# Battle Rate Limit Load Test Handoff

## 목적

`battle:chat`, `battle:attack`, `battle:attack:vote` Socket.IO 이벤트의 처리 한계를 RPS 조절로 측정하고, normal mix와 stress mix 결과를 바탕으로 애플리케이션 레벨 rate limit 후보를 산출한다.

현재 테스트 단계에서는 rate limit을 서버에 먼저 설정하지 않는다. 클라이언트 발송 interval로 RPS를 조절하면서 서버가 안정적으로 처리할 수 있는 hard threshold를 찾고, 그 결과에 안전계수를 적용해 추후 rate limit 후보를 산출한다.

> 참고: 코드 기준 실제 채팅 이벤트명은 `battle:chat`이다. 대화 중 표현한 `battles:chat`은 같은 대상을 의미한다.

## 기본 가정

- 하루 사용자 수: 100명
- 동시간 최대 접속자: 40명, 전체의 40%
- 단일 battle에 40명이 모두 접속하는 최악 fanout 상황을 우선 측정
- A팀 20명, B팀 20명으로 분배
- public battle로 생성해서 guest 사용자도 socket join 가능
- Socket.IO 연결 시 guest user id를 `handshake.auth.userId`로 전달
- 테스트 phase는 DevController로 `ATTACK`에 고정

## 테스트 전략

테스트는 5단계로 나눈다.

```txt
1. chat only
2. attack only
3. vote only
4. normal mix
5. stress mix
```

각 단계의 역할은 다르다.

```txt
only 테스트
= 각 이벤트의 단독 upper bound 확인

normal mix
= only 결과에 안전계수를 적용한 초기 cap 후보가 현실 비율에서 과도하게 낮거나 높지 않은지 검증

stress mix
= 후보 RPS 근처 또는 초과 조합에서 peak 요청을 서버가 안정적으로 받아내는지 검증
```

최종 rate limit은 only 테스트 결과만으로 바로 정하지 않는다. only 결과는 상한선이다. 실제 운영 후보는 upper bound보다 낮게 잡고, normal mix와 stress mix를 통과한 값만 최종 후보로 본다.

## 이벤트별 의미

### battle:chat

- 모든 phase에서 발생 가능
- `ALL` scope는 battle room 전체 fanout
- `TEAM` scope는 팀 room fanout
- 이전 테스트에서 Node heap 증가의 주요 원인으로 관측됨

### battle:attack

- `ATTACK` phase에서 이의제기 후보 생성
- state의 attack 배열, opinionHistory, Redis discussion 저장, 팀 room broadcast를 유발
- 사용자가 글을 작성해야 하므로 vote보다 실제 peak 가능성은 낮지만, state 크기를 빠르게 키울 수 있음

### battle:attack:vote

- `ATTACK` phase에서 후보에 대한 투표
- Redis vote set, state update, 팀 room broadcast를 유발
- 클릭 이벤트라 짧은 시간에 몰릴 가능성이 가장 높음
- 같은 user가 같은 discussion에 다시 vote하면 `이미 투표한 항목입니다` 오류가 발생하므로 테스트 설계에서 중복 vote를 피해야 함

## 공통 준비 상태

모든 테스트는 본 부하 시작 전에 다음 상태를 만든다.

```txt
1 public battle
40 connected sockets
A team: 20 users
B team: 20 users
phase: ATTACK
Redis active battle state 존재
```

Redis key 예시:

```txt
battle:core:{battleId}
battle:attacks:{battleId}
battle:defenses:{battleId}
battle:chats:all:{battleId}
battle:chats:a:{battleId}
battle:chats:b:{battleId}
```

DB 요청 폭증 여부도 함께 본다. 현재 `loadBattleState`는 `liveStates -> Redis -> DB` 순서이므로, active battle state가 live memory 또는 Redis에 있으면 본 부하 구간에서 DB query가 폭증하지 않는 것이 기대 동작이다.

## 결과 저장 방식

임계값 산출 테스트는 Artillery 원본 JSON을 직접 보존하지 않는다. 원본 JSON에는 10초 단위 period 데이터가 모두 들어가서 파일이 커지므로, wrapper script가 임시 파일로만 만든 뒤 필요한 값만 요약해서 저장한다.

현재 only 테스트 파일 구조:

```txt
backend/load-tests/chat-only
backend/load-tests/attack-only
backend/load-tests/vote-only
backend/load-tests/run-load-test.js
```

실행 스크립트:

```txt
pnpm run loadtest:chat-only
pnpm run loadtest:attack-only
pnpm run loadtest:vote-only
```

저장 파일:

```txt
backend/load-tests/results/{label}-{timestamp}-summary.json
```

summary에는 임계값 판단에 필요한 값만 남긴다.

- 이벤트별 발송 수
- 이벤트별 산출 rate
- 이벤트별 error 수
- 정상 종료 / `transport_close` / early disconnect 수
- VU 성공/실패 수
- backend restart 증가량
- Prometheus peak: event rate, p95, p99, heap, RSS, CPU

원본 Artillery output이 필요할 때만 `KEEP_RAW_ARTILLERY=true`를 붙인다.

## 1. Chat Only

### 목적

`battle:chat` 단독 upper bound를 찾는다. attack과 vote를 섞지 않고, chat fanout 자체가 어디서 서버를 무너뜨리는지 확인한다.

### 부하 구성

```txt
chat: sweep
attack: 0
vote: 0
users: 40
duration: 3 minutes
scope: ALL 70%, TEAM 30%
```

### 실행 예시

```bash
LOAD_TEST_AUTHOR_ID=11111111-1111-4111-8111-111111111111 \
CHAT_MIN_INTERVAL_MS=500 \
CHAT_MAX_INTERVAL_MS=1000 \
VOTE_ENABLED=false \
RESULT_LABEL=battle-chat-only-500-1000 \
API_URL=http://localhost:3000 \
SOCKET_URL=http://localhost:3000 \
pnpm run loadtest:chat-only
```

### 판단

```txt
PASS:
- 3분 유지
- backend restart 0
- transport_close 0
- early disconnect 0
- battle:chat:error 0 또는 기대 가능한 rate limit error만 발생

FAIL:
- backend OOM/restart
- socket 전체 transport_close
- p99 급등 후 수신 broadcast 감소
```

### 현재 관측값

기존 chat-only 결과:

```txt
약 53 chat/s PASS
약 61 chat/s FAIL
약 72 chat/s FAIL
```

따라서 현재 로컬 Docker 기준 chat 단독 hard threshold는 약 53~61/s 사이로 본다. 운영 후보는 이보다 낮은 40~45/s 또는 최대 50/s 범위에서 검증한다.

## 2. Attack Only

### 목적

`battle:attack` 단독 upper bound를 찾는다. chat과 vote 없이 attack 생성 자체가 어디까지 가능한지 확인한다.

### 부하 구성

```txt
chat: 0
attack: sweep
vote: 0
users: 40
duration: 3 minutes
phase: ATTACK
```

### 주의

attack은 state의 attack 배열과 opinionHistory를 계속 키운다. 따라서 높은 rate에서 heap이 증가할 수 있다. 이 값은 단독 upper bound이며, 실제 운영 cap은 normal mix에서 더 낮게 조정될 수 있다.

### 판단

```txt
PASS:
- 3분 유지
- battle:attack:error 0
- backend restart 0
- transport_close 0
- attack p95/p99 안정

FAIL:
- backend restart
- transport_close
- attack p99 급등
- heap/RSS 지속 우상향
```

## 3. Vote Only

### 목적

`battle:attack:vote` 단독 upper bound를 찾는다. vote는 후보가 있어야 가능하므로, 본 부하 시작 전에 팀별 attack 후보를 seed한다. 본 부하 중 attack 생성은 기본적으로 하지 않는다.

### 부하 구성

```txt
chat: 0
attack: seed only
vote: sweep
users: 40
duration: 3 minutes
phase: ATTACK
seed: A팀 4~8개, B팀 4~8개
```

### Vote Error 방지

vote 테스트에서는 랜덤 target을 그대로 쓰면 안 된다. 같은 user가 같은 discussion에 다시 vote하면 서버가 정상적으로 `이미 투표한 항목입니다`를 반환한다. 이 에러는 rate limit 임계값 측정에는 노이즈다.

권장 방식:

```txt
team candidates: [0, 1, 2, 3]

user 0: 0 -> 1 -> 2 -> 3 -> 0
user 1: 1 -> 2 -> 3 -> 0 -> 1
user 2: 2 -> 3 -> 0 -> 1 -> 2
user 3: 3 -> 0 -> 1 -> 2 -> 3
```

규칙:

- user별 `currentVoteDiscussionId`를 processor state에 저장
- 다음 vote target은 반드시 현재 target과 달라야 함
- 후보가 2개 미만이면 vote 시작 금지
- 가능하면 팀별 후보 4개 이상 seed
- 후보별 부하 분산을 위해 user별 시작 offset을 다르게 둠
- 각 user는 vote in-flight를 1개만 유지함. `battle:attack:voted` 또는 `battle:attack:vote:error` 응답을 받은 뒤 다음 vote를 보냄
- 응답 대기 timeout은 서버 지연 신호로 별도 counter에 남김. timeout이 반복되면 vote threshold 후보에서 제외

주의:

```txt
후보 순환 index만으로는 고부하 중복 vote error를 완전히 막기 어렵다.
서버 처리가 밀리면 같은 user가 A -> B -> C -> D -> A를 빠르게 보낸 뒤,
B/C/D 처리가 끝나기 전에 두 번째 A가 처리될 수 있다.
이 경우 첫 번째 A vote set에 user가 아직 남아 있어 `이미 투표한 항목입니다`가 발생한다.
따라서 vote loop는 다음 vote를 보내기 전에 서버 응답을 기다린다.
```

### 판단

```txt
PASS:
- 3분 유지
- battle:attack:vote:error 0
- backend restart 0
- transport_close 0

FAIL:
- 중복 vote error가 발생하면 시나리오 오류로 보고 재실행
- backend restart 또는 transport_close 발생
- vote p99 급등
```

## 4. Normal Mix

### 목적

only 테스트로 구한 upper bound에 안전계수를 적용한 초기 rate limit 후보가 현실적인 평균 사용량에서 안정적으로 동작하는지 검증한다.

normal mix는 최종 cap을 직접 찾는 테스트라기보다, 후보 cap이 정상 사용자 흐름을 과도하게 막지 않으면서 서버가 안정적인지 확인하는 테스트다.

### 초기 후보 산출

only 결과에 이벤트별 안전계수를 적용한다.

예시:

```txt
chat upper bound: 55/s
attack upper bound: 8/s
vote upper bound: 80/s

초기 후보:
chat cap: 40~45/s
attack cap: 4~5/s
vote cap: 30~50/s
```

안전계수는 고정 공식이 아니라 이벤트 특성에 따라 다르게 둔다.

```txt
chat:
- fanout과 heap 영향이 크므로 보수적으로 설정

attack:
- state 크기를 계속 키우므로 normal mix에서 낮춰 검증

vote:
- 클릭 이벤트라 순간적으로 몰릴 수 있으나 현재 limiter가 burst를 분리하지 않으므로 normal sustained 값을 보수적으로 설정
```

### 부하 구성

```txt
chat: 후보 cap의 60~80%
attack: 후보 cap의 30~60%
vote: 후보 cap의 30~60%
users: 40
duration: 5~10 minutes
phase: ATTACK
```

예시:

```txt
chat cap 후보: 45/s
attack cap 후보: 5/s
vote cap 후보: 40/s

normal mix load:
chat: 30~35/s
attack: 2~3/s
vote: 15~25/s
```

### 성공 기준

```txt
rate limit error:
- 거의 없어야 함
- 정상 사용자 패턴인데 차단이 많으면 cap 후보가 너무 낮음

server:
- backend restart 0
- transport_close 0
- early disconnect 0
- p99 latency 안정
- heap/RSS가 지속 우상향하지 않음
```

## 5. Stress Mix

### 목적

후보 RPS 근처 또는 초과 조합에서 서버가 peak 요청을 안정적으로 받아내는지 검증한다. stress mix는 정상 사용자 경험 검증이 아니라 peak 안정성 검증이다.

### 부하 구성

```txt
chat: 후보 cap의 100~130%
attack: 후보 cap의 100~130%
vote: 후보 cap의 100~150%
users: 40
duration: 3~5 minutes
phase: ATTACK
```

예시:

```txt
chat cap 후보: 45/s
attack cap 후보: 5/s
vote cap 후보: 40/s

stress mix load:
chat: 45~55/s
attack: 5~7/s
vote: 40~60/s
```

### 성공 기준

stress mix는 아직 rate limiter를 켠 보호 검증이 아니다. 후보 RPS 이상에서도 서버가 restart, transport close, 메모리 폭주 없이 처리 가능한지 확인한다.

```txt
PASS:
- 이벤트 error 0 또는 원인이 명확한 시나리오 error만 발생
- backend restart 0
- transport_close 0
- early disconnect 0
- heap/RSS 폭주 없음
- p99가 허용 범위 안에서 유지

FAIL:
- backend OOM/restart
- socket 전체 transport_close
- heap/RSS가 계속 증가하다가 회복하지 않음
- p99가 급등하고 수신 broadcast가 크게 감소
```

### 해석

stress mix에서 가장 높은 통과 조합을 그대로 운영 cap으로 올리지 않는다. stress mix의 목적은 "후보보다 높은 peak 요청에서도 서버가 안정적인지" 확인하는 것이다.

최종 운영 cap은 only hard threshold, normal mix 안정성, stress mix peak 안정성을 함께 보고 정한다.

## Payload Shape

### battle:join

```json
{
  "battleId": "{{ battleId }}",
  "team": "A",
  "nickname": "load-user-001"
}
```

### battle:chat

```json
{
  "battleId": "{{ battleId }}",
  "scope": "ALL",
  "team": "A",
  "text": "load test chat message"
}
```

### battle:attack

```json
{
  "battleId": "{{ battleId }}",
  "team": "A",
  "content": "load test attack content"
}
```

### battle:attack:vote

```json
{
  "battleId": "{{ battleId }}",
  "team": "A",
  "discussionId": "{{ attackDiscussionId }}"
}
```

## Artillery 구현 메모

### 비회원 Socket.IO 인증

public battle이어도 Socket.IO 연결에는 `handshake.auth.userId`가 필요하다. 비회원은 테스트 시작 후 battle별 guest 계정을 먼저 만들고, 반환된 guest id를 socket auth에 넣는다.

```txt
POST /api/auth/guest/{battleId}
-> { id, nickname, createdAt }

io(SOCKET_URL, {
  transports: ['websocket'],
  auth: { userId: guest.id }
})
```

그 다음 `battle:join` payload에는 같은 `battleId`, 선택한 `team`, `guest.nickname`을 보낸다.

### 상태 관리가 필요한 값

Artillery processor에서 아래 값을 관리한다.

```txt
users:
- socket/session userId
- team
- nickname
- currentVoteDiscussionId
- voteCursor or voteOffset

battle:
- battleId
- current phase
- attack candidates by team
```

### 후보 수집

`battle:attack` emit 후 서버는 team room에 `battle:attack:created`를 emit한다. Artillery는 이 응답을 listen해서 후보 pool에 저장한다.

```txt
on battle:attack:created:
- candidate.team 확인
- candidate.discussionId 저장
```

vote only에서는 본 부하 전에 DevController 또는 socket event로 후보를 seed하고, 후보 pool이 충분해진 뒤 vote를 시작한다.

### 실패 이벤트 수집

아래 서버 이벤트를 카운트한다.

```txt
battle:chat:error
battle:attack:error
battle:attack:vote:error
disconnect
connect_error
```

`battle:attack:vote:error`가 `이미 투표한 항목입니다`로 발생하면 rate limit 실패가 아니라 시나리오 오류로 본다. user별 vote target 순환 로직을 수정한 뒤 다시 실행한다.

## 측정 지표

### 애플리케이션

```txt
battle:chat latency p50/p95/p99
battle:attack latency p95/p99
battle:attack:vote latency p95/p99
error rate by event
disconnect/reconnect count
transport_close count
early disconnect count
```

### 서버

```txt
CPU
memory/RSS
Node heap used
event loop delay
Socket.IO connected clients
backend restart count
```

### Redis

```txt
ops/sec
latency
memory
command mix:
- GET/MGET or GET
- MSET
- SADD
- SMEMBERS
- EVAL
```

### DB

```txt
query count during active load window
unexpected Prisma query spikes
connection count
```

기대값:

```txt
active battle state가 Redis/liveStates에 있으면 chat/attack/vote 중 DB query가 폭발하지 않아야 한다.
```

## Rate Limit 판단 기준

최종 rate limit 후보는 다음 기준으로 판단한다.

```txt
normal mix:
- 정상 현실 비율에서 차단이 거의 없어야 함
- backend restart 0
- transport_close 0
- heap/RSS 안정

stress mix:
- 초과 요청은 rate limit error로 막혀도 됨
- backend restart 0
- transport_close 0
- heap/RSS 폭주 없음
```

권장 rate limit 차원:

```txt
per userId per battle
per socketId
per battleId room aggregate
```

서버가 여러 대가 될 수 있으면 Redis 기반 shared limiter가 필요하다.

## 실행 전 체크리스트

- 이전 load-test battle DB row 정리 여부 확인
- Redis `battle:*` 잔여 key 정리 여부 확인
- battle 생성 및 시작 완료
- 40 users join 완료
- A/B 20명 분배 확인
- ATTACK phase 고정 확인
- Redis active state 존재 확인
- Prometheus/Grafana 준비
- Redis Insight 또는 Redis metrics 준비
- 서버 로그에서 unexpected error 확인 가능
- Artillery 결과 저장 위치: `backend/load-tests/results`

## 현재까지 확인된 값

### Chat Only

```txt
약 53 chat/s PASS
약 61 chat/s FAIL
약 72 chat/s FAIL
```

해석:

```txt
chat-only hard threshold: 약 53~61/s
chat 운영 후보: 40~45/s, 최대 50/s 범위에서 mix 검증 필요
```

### Attack With Chat Base

현재까지 실행한 attack 테스트는 순수 attack only가 아니라 chat base load가 포함된 부분 mix다.

```txt
chat 약 43~44/s + attack 4.44/s PASS
chat 약 43~44/s + attack 5.67/s PASS
chat 약 43~44/s + attack 8.86/s FAIL
```

해석:

```txt
chat 43~44/s가 깔린 상태에서 attack hard threshold는 5.67~8.86/s 사이
attack 운영 후보는 4~5/s부터 normal mix로 검증
```

## 최종 요약

현재 rate limiter가 burst를 따로 수용하지 않는 counter 방식이므로 peak mix를 별도 필수 단계로 두지 않는다. 대신 `chat only`, `attack only`, `vote only`로 이벤트별 단독 upper bound를 확인하고, 이 값에 안전계수를 적용해 초기 cap 후보를 만든다.

그 다음 `normal mix`로 현실적인 평균 사용량에서 정상 사용자가 과도하게 차단되지 않는지 확인한다. 마지막으로 `stress mix`에서 cap 후보 근처 또는 초과 부하를 넣어 rate limiter가 서버를 보호하는지 확인한다.

최종 rate limit은 only 테스트의 최대 통과값이 아니라, normal mix와 stress mix를 모두 통과한 보수적인 조합으로 정한다.
