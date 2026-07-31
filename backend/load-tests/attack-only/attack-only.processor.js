'use strict'

const { io } = require('socket.io-client')

const DEFAULT_API_URL = 'http://localhost:3000'
const DEFAULT_SOCKET_URL = 'http://localhost:3000'
const PREFIX = 'battle_attack_only'

const CLIENT_EVENTS = {
  JOIN: 'battle:join',
  ATTACK: 'battle:attack',
}

const SERVER_EVENTS = {
  JOINED: 'battle:joined',
  JOIN_ERROR: 'battle:join:error',
  ATTACK_CREATED: 'battle:attack:created',
  ATTACK_ERROR: 'battle:attack:error',
}

const state = {
  vuSequence: 0,
  joined: [],
  phaseReady: false,
  phasePromise: null,
}

async function prepareAttackOnlyBattle(context, events, done) {
  try {
    const battle = await createPublicBattle('load-test-attack-only')
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

async function runAttackOnlySession(context, events, done) {
  const startedAt = Date.now()
  let socket
  let disconnected = false

  try {
    const battleId = context.vars.battleId
    const vuId = state.vuSequence++
    const team = pickTeam(vuId)
    const durationMs = asNumber(process.env.TEST_DURATION_SECONDS || context.vars.durationSeconds, 180) * 1000
    const minIntervalMs = asNumber(process.env.ATTACK_MIN_INTERVAL_MS || context.vars.attackMinIntervalMs, 4000)
    const maxIntervalMs = asNumber(process.env.ATTACK_MAX_INTERVAL_MS || context.vars.attackMaxIntervalMs, 5000)
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
    await ensureAttackPhase(battleId, events)

    while (!disconnected && Date.now() - startedAt < durationMs) {
      socket.emit(CLIENT_EVENTS.ATTACK, {
        battleId,
        team,
        content: `attack only load ${guest.id} ${Date.now()}`,
      })
      events.emit('counter', `${PREFIX}.sent.attack`, 1)
      events.emit('counter', `${PREFIX}.sent.attack.${team.toLowerCase()}`, 1)
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
  socket.on(SERVER_EVENTS.ATTACK_CREATED, () => {
    events.emit('counter', `${PREFIX}.received.attack_created`, 1)
  })
  socket.on(SERVER_EVENTS.ATTACK_ERROR, payload => {
    events.emit('counter', `${PREFIX}.error.attack`, 1)
    emitPayloadMessageCounter(events, `${PREFIX}.error.attack`, payload)
  })
  socket.on('disconnect', reason => {
    events.emit('counter', `${PREFIX}.socket.disconnected`, 1)
    events.emit('counter', `${PREFIX}.socket.disconnected.${sanitizeMetricPart(reason)}`, 1)
  })
}

async function ensureAttackPhase(battleId, events) {
  if (state.phaseReady) return
  if (state.phasePromise) {
    await state.phasePromise
    return
  }
  state.phasePromise = postJson(`${getApiUrl()}/dev/battles/${battleId}/phase`, {
    phase: 'ATTACK',
    durationMs: asNumber(process.env.ATTACK_PHASE_DURATION_MS, 240000),
    round: 1,
  })
  await state.phasePromise
  state.phaseReady = true
  events.emit('counter', `${PREFIX}.phase.attack`, 1)
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
  prepareAttackOnlyBattle,
  runAttackOnlySession,
}

