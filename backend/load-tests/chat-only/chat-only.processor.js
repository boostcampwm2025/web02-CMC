'use strict'

const { io } = require('socket.io-client')

const DEFAULT_API_URL = 'http://localhost:3000'
const DEFAULT_SOCKET_URL = 'http://localhost:3000'
const PREFIX = 'battle_chat_only'

const CLIENT_EVENTS = {
  JOIN: 'battle:join',
  CHAT: 'battle:chat',
}

const SERVER_EVENTS = {
  JOINED: 'battle:joined',
  JOIN_ERROR: 'battle:join:error',
  CHATTED: 'battle:chatted',
  CHAT_ERROR: 'battle:chat:error',
}

const state = {
  vuSequence: 0,
}

async function prepareChatOnlyBattle(context, events, done) {
  try {
    const battle = await createPublicBattle('load-test-chat-only')
    context.vars.battleId = battle.battleId
    events.emit('counter', `${PREFIX}.battle.created`, 1)

    await postJson(`${getApiUrl()}/dev/battles/${battle.battleId}/start`, {})
    events.emit('counter', `${PREFIX}.battle.started`, 1)

    await forceAttackPhase(battle.battleId)
    events.emit('counter', `${PREFIX}.phase.attack`, 1)

    return complete(done)
  } catch (error) {
    events.emit('counter', `${PREFIX}.battle.prepare_error`, 1)
    return complete(done, error)
  }
}

async function runChatOnlySession(context, events, done) {
  const startedAt = Date.now()
  let socket
  let disconnected = false

  try {
    const battleId = context.vars.battleId
    const vuId = state.vuSequence++
    const team = pickTeam(vuId)
    const durationMs = asNumber(process.env.TEST_DURATION_SECONDS || context.vars.durationSeconds, 180) * 1000
    const minIntervalMs = asNumber(process.env.CHAT_MIN_INTERVAL_MS || context.vars.chatMinIntervalMs, 3000)
    const maxIntervalMs = asNumber(process.env.CHAT_MAX_INTERVAL_MS || context.vars.chatMaxIntervalMs, 5000)
    const allScopeRatio = asNumber(process.env.CHAT_ALL_SCOPE_RATIO || context.vars.allScopeRatio, 0.7)
    const guest = await createGuest(battleId)
    events.emit('counter', `${PREFIX}.guest.created`, 1)

    socket = await connectSocket(guest.id)
    events.emit('counter', `${PREFIX}.socket.connected`, 1)

    attachMetrics(socket, events)
    socket.on('disconnect', () => {
      disconnected = true
    })

    await joinBattle(socket, battleId, team, guest.nickname)
    events.emit('counter', `${PREFIX}.joined`, 1)

    while (!disconnected && Date.now() - startedAt < durationMs) {
      const scope = Math.random() < allScopeRatio ? 'ALL' : 'TEAM'
      socket.emit(CLIENT_EVENTS.CHAT, {
        battleId,
        scope,
        team,
        text: `chat only load ${guest.id} ${Date.now()}`,
      })
      events.emit('counter', `${PREFIX}.sent.chat`, 1)
      events.emit('counter', `${PREFIX}.sent.chat.${scope.toLowerCase()}`, 1)
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
  socket.on(SERVER_EVENTS.CHATTED, () => {
    events.emit('counter', `${PREFIX}.received.chatted`, 1)
  })
  socket.on(SERVER_EVENTS.CHAT_ERROR, payload => {
    events.emit('counter', `${PREFIX}.error.chat`, 1)
    emitPayloadMessageCounter(events, `${PREFIX}.error.chat`, payload)
  })
  socket.on('disconnect', reason => {
    events.emit('counter', `${PREFIX}.socket.disconnected`, 1)
    events.emit('counter', `${PREFIX}.socket.disconnected.${sanitizeMetricPart(reason)}`, 1)
  })
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

async function forceAttackPhase(battleId) {
  return postJson(`${getApiUrl()}/dev/battles/${battleId}/phase`, {
    phase: 'ATTACK',
    durationMs: asNumber(process.env.ATTACK_PHASE_DURATION_MS, 240000),
    round: 1,
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
  prepareChatOnlyBattle,
  runChatOnlySession,
}

