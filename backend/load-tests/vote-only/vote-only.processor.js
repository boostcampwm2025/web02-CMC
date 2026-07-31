'use strict'

const { io } = require('socket.io-client')

const DEFAULT_API_URL = 'http://localhost:3000'
const DEFAULT_SOCKET_URL = 'http://localhost:3000'
const PREFIX = 'battle_vote_only'

const CLIENT_EVENTS = {
  JOIN: 'battle:join',
  ATTACK_VOTE: 'battle:attack:vote',
}

const SERVER_EVENTS = {
  JOINED: 'battle:joined',
  JOIN_ERROR: 'battle:join:error',
  ATTACK_VOTED: 'battle:attack:voted',
  ATTACK_VOTE_ERROR: 'battle:attack:vote:error',
}

const state = {
  vuSequence: 0,
  joined: [],
  candidates: { A: [], B: [] },
  seedingStarted: false,
  seedingComplete: false,
  seedingPromise: null,
}

async function prepareVoteOnlyBattle(context, events, done) {
  try {
    const battle = await createPublicBattle('load-test-vote-only')
    context.vars.battleId = battle.battleId
    events.emit('counter', `${PREFIX}.battle.created`, 1)

    await postJson(`${getApiUrl()}/dev/battles/${battle.battleId}/start`, {})
    events.emit('counter', `${PREFIX}.battle.started`, 1)

    return complete(done)
  } catch (error) {
    events.emit('counter', `${PREFIX}.battle.prepare_error`, 1)
    return complete(done, error)
  }
}

async function runVoteOnlySession(context, events, done) {
  const startedAt = Date.now()
  let socket
  let disconnected = false

  try {
    const battleId = context.vars.battleId
    const vuId = state.vuSequence++
    const team = pickTeam(vuId)
    const durationMs = asNumber(process.env.TEST_DURATION_SECONDS || context.vars.durationSeconds, 180) * 1000
    const minIntervalMs = asNumber(process.env.VOTE_MIN_INTERVAL_MS || context.vars.voteMinIntervalMs, 1000)
    const maxIntervalMs = asNumber(process.env.VOTE_MAX_INTERVAL_MS || context.vars.voteMaxIntervalMs, 1500)
    const guest = await createGuest(battleId)
    events.emit('counter', `${PREFIX}.guest.created`, 1)

    socket = await connectSocket(guest.id)
    events.emit('counter', `${PREFIX}.socket.connected`, 1)

    attachMetrics(socket, events)
    socket.on('disconnect', () => {
      disconnected = true
    })

    await joinBattle(socket, battleId, team, guest.nickname)
    state.joined.push({ userId: guest.id, team, nickname: guest.nickname })
    events.emit('counter', `${PREFIX}.joined`, 1)

    await waitForJoinedUsers(asNumber(process.env.LOAD_TEST_USERS, 40), 10000)
    await ensureAttackPhaseAndSeeds(battleId, events, asNumber(process.env.ATTACK_SEED_PER_TEAM || context.vars.attackSeedPerTeam, 4))

    let voteIndex = vuId % state.candidates[team].length

    while (!disconnected && Date.now() - startedAt < durationMs) {
      const candidates = state.candidates[team]
      if (candidates.length < 2) {
        events.emit('counter', `${PREFIX}.vote.skipped_not_enough_candidates`, 1)
        await sleep(250)
        continue
      }

      const discussionId = candidates[voteIndex % candidates.length]
      voteIndex += 1

      const voteResult = waitForVoteResult(socket, discussionId, guest.id, 5000)
      socket.emit(CLIENT_EVENTS.ATTACK_VOTE, { battleId, team, discussionId })
      events.emit('counter', `${PREFIX}.sent.vote`, 1)
      events.emit('counter', `${PREFIX}.sent.vote.${team.toLowerCase()}`, 1)
      const result = await voteResult
      if (result === 'timeout') {
        events.emit('counter', `${PREFIX}.vote.await_timeout`, 1)
      }
      await sleep(randomInt(minIntervalMs, maxIntervalMs))
    }

    if (disconnected && Date.now() - startedAt < durationMs) {
      events.emit('counter', `${PREFIX}.socket.disconnected_early`, 1)
    }

    socket.disconnect()
    return complete(done)
  } catch (error) {
    events.emit('counter', `${PREFIX}.vu_error`, 1)
    if (socket) socket.disconnect()
    return complete(done, error)
  }
}

function attachMetrics(socket, events) {
  socket.on(SERVER_EVENTS.ATTACK_VOTED, () => {
    events.emit('counter', `${PREFIX}.received.voted`, 1)
  })
  socket.on(SERVER_EVENTS.ATTACK_VOTE_ERROR, payload => {
    events.emit('counter', `${PREFIX}.error.vote`, 1)
    emitPayloadMessageCounter(events, `${PREFIX}.error.vote`, payload)
  })
  socket.on('disconnect', reason => {
    events.emit('counter', `${PREFIX}.socket.disconnected`, 1)
    events.emit('counter', `${PREFIX}.socket.disconnected.${sanitizeMetricPart(reason)}`, 1)
  })
}

function waitForVoteResult(socket, discussionId, userId, timeoutMs) {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      cleanup()
      resolve('timeout')
    }, timeoutMs)
    const cleanup = () => {
      clearTimeout(timer)
      socket.off(SERVER_EVENTS.ATTACK_VOTED, onVoted)
      socket.off(SERVER_EVENTS.ATTACK_VOTE_ERROR, onError)
    }
    const onVoted = payload => {
      if (!isOwnVoteResult(payload, discussionId, userId)) return
      cleanup()
      resolve('voted')
    }
    const onError = () => {
      cleanup()
      resolve('error')
    }
    socket.on(SERVER_EVENTS.ATTACK_VOTED, onVoted)
    socket.on(SERVER_EVENTS.ATTACK_VOTE_ERROR, onError)
  })
}

function isOwnVoteResult(payload, discussionId, userId) {
  return payload && payload.discussionId === discussionId && Array.isArray(payload.votes) && payload.votes.includes(userId)
}

async function ensureAttackPhaseAndSeeds(battleId, events, seedPerTeam) {
  if (state.seedingComplete) return
  if (state.seedingStarted) {
    await state.seedingPromise
    return
  }
  state.seedingStarted = true
  state.seedingPromise = seedAttackPhase(battleId, events, seedPerTeam)
  await state.seedingPromise
}

async function seedAttackPhase(battleId, events, seedPerTeam) {
  await postJson(`${getApiUrl()}/dev/battles/${battleId}/phase`, {
    phase: 'ATTACK',
    durationMs: asNumber(process.env.ATTACK_PHASE_DURATION_MS, 240000),
    round: 1,
  })
  events.emit('counter', `${PREFIX}.phase.attack`, 1)

  for (const team of ['A', 'B']) {
    const authors = state.joined.filter(user => user.team === team)
    for (let i = 0; i < seedPerTeam; i += 1) {
      const author = authors[i % authors.length]
      const created = await postJson(`${getApiUrl()}/dev/battles/${battleId}/discussion`, {
        type: 'attack',
        team,
        authorId: author.userId,
        content: `vote only attack seed ${team}-${i + 1}`,
      })
      state.candidates[team].push(created.discussionId)
      events.emit('counter', `${PREFIX}.seed.attack.${team.toLowerCase()}`, 1)
    }
  }

  state.seedingComplete = true
}

async function waitForJoinedUsers(target, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (state.joined.length < target && Date.now() < deadline) {
    await sleep(100)
  }
}

async function createPublicBattle(titlePrefix) {
  const authorId = process.env.LOAD_TEST_AUTHOR_ID
  if (!authorId) throw new Error('LOAD_TEST_AUTHOR_ID is required to create a battle')
  return postJson(`${getApiUrl()}/battles`, {
    authorId,
    title: `${titlePrefix}-${Date.now()}`,
    description: `${titlePrefix} load test`,
    aCode: 'function teamA() { return "A" }',
    bCode: 'function teamB() { return "B" }',
    language: 'JS',
    type: 'PUBLIC',
    category: 'ETC',
    playTime: 'FIFTEEN_MIN',
    topics: ['rate-limit'],
  })
}

async function createGuest(battleId) {
  return postJson(`${getApiUrl()}/auth/guest/${battleId}`, {})
}

async function connectSocket(userId) {
  const socket = io(getSocketUrl(), {
    transports: ['websocket'],
    auth: { userId },
    reconnection: false,
    timeout: 5000,
    upgrade: false,
  })
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Socket connect timeout')), 5000)
    socket.once('connect', () => {
      clearTimeout(timer)
      resolve()
    })
    socket.once('connect_error', error => {
      clearTimeout(timer)
      reject(error)
    })
  })
  return socket
}

async function joinBattle(socket, battleId, team, nickname) {
  const joined = once(socket, SERVER_EVENTS.JOINED, SERVER_EVENTS.JOIN_ERROR, 5000)
  socket.emit(CLIENT_EVENTS.JOIN, { battleId, team, nickname })
  await joined
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text}`)
  return data
}

function once(socket, successEvent, errorEvent, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`Timed out waiting for ${successEvent}`))
    }, timeoutMs)
    const cleanup = () => {
      clearTimeout(timer)
      socket.off(successEvent, onSuccess)
      socket.off(errorEvent, onError)
    }
    const onSuccess = payload => {
      cleanup()
      resolve(payload)
    }
    const onError = payload => {
      cleanup()
      reject(new Error(payload && payload.message ? payload.message : `${errorEvent} received`))
    }
    socket.once(successEvent, onSuccess)
    socket.once(errorEvent, onError)
  })
}

function getApiUrl() {
  return trimTrailingSlash(process.env.API_URL || DEFAULT_API_URL)
}

function getSocketUrl() {
  return trimTrailingSlash(process.env.SOCKET_URL || DEFAULT_SOCKET_URL)
}

function pickTeam(vuId) {
  return vuId % 2 === 0 ? 'A' : 'B'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function asNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function complete(done, error) {
  if (typeof done === 'function') return done(error)
  if (error) throw error
  return undefined
}

function emitPayloadMessageCounter(events, prefix, payload) {
  if (payload && payload.message) events.emit('counter', `${prefix}.${sanitizeMetricPart(payload.message)}`, 1)
}

function sanitizeMetricPart(value) {
  return String(value || 'unknown')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80)
    .toLowerCase()
}

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/, '')
}

module.exports = {
  prepareVoteOnlyBattle,
  runVoteOnlySession,
}
