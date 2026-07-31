'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync, spawn } = require('node:child_process')

const TESTS = {
  'chat-only': {
    scenario: ['chat-only', 'chat-only.yml'],
    prefix: 'battle_chat_only',
    event: 'battle:chat',
    sentCounter: 'battle_chat_only.sent.chat',
    errorCounter: 'battle_chat_only.error.chat',
    buildLabel: () => `chat-only-${envLabel('CHAT_MIN_INTERVAL_MS')}-${envLabel('CHAT_MAX_INTERVAL_MS')}`,
  },
  'attack-only': {
    scenario: ['attack-only', 'attack-only.yml'],
    prefix: 'battle_attack_only',
    event: 'battle:attack',
    sentCounter: 'battle_attack_only.sent.attack',
    errorCounter: 'battle_attack_only.error.attack',
    buildLabel: () => `attack-only-${envLabel('ATTACK_MIN_INTERVAL_MS')}-${envLabel('ATTACK_MAX_INTERVAL_MS')}`,
  },
  'vote-only': {
    scenario: ['vote-only', 'vote-only.yml'],
    prefix: 'battle_vote_only',
    event: 'battle:attack:vote',
    sentCounter: 'battle_vote_only.sent.vote',
    errorCounter: 'battle_vote_only.error.vote',
    buildLabel: () => `vote-only-${envLabel('VOTE_MIN_INTERVAL_MS')}-${envLabel('VOTE_MAX_INTERVAL_MS')}`,
  },
  'normal-mix-target': {
    scenario: ['normal-mix-target', 'normal-mix-target.yml'],
    prefix: 'battle_normal_mix_target',
    event: 'battle:chat',
    events: {
      chat: 'battle:chat',
      attack: 'battle:attack',
      vote: 'battle:attack:vote',
    },
    sentCounter: 'battle_normal_mix_target.sent.total',
    sentCounters: {
      chat: 'battle_normal_mix_target.sent.chat',
      attack: 'battle_normal_mix_target.sent.attack',
      vote: 'battle_normal_mix_target.sent.vote',
    },
    errorCounter: 'battle_normal_mix_target.error.total',
    errorCounters: {
      chat: 'battle_normal_mix_target.error.chat',
      attack: 'battle_normal_mix_target.error.attack',
      vote: 'battle_normal_mix_target.error.vote',
    },
    buildLabel: () => 'normal-mix-target',
  },
  'stress-mix': {
    scenario: ['stress-mix', 'stress-mix.yml'],
    prefix: 'battle_stress_mix',
    event: 'battle:chat',
    events: {
      chat: 'battle:chat',
      attack: 'battle:attack',
      vote: 'battle:attack:vote',
    },
    sentCounter: 'battle_stress_mix.sent.total',
    sentCounters: {
      chat: 'battle_stress_mix.sent.chat',
      attack: 'battle_stress_mix.sent.attack',
      vote: 'battle_stress_mix.sent.vote',
    },
    errorCounter: 'battle_stress_mix.error.total',
    errorCounters: {
      chat: 'battle_stress_mix.error.chat',
      attack: 'battle_stress_mix.error.attack',
      vote: 'battle_stress_mix.error.vote',
    },
    buildLabel: () => `stress-mix-${envLabel('STRESS_SCALE')}x`,
  },
}

const testName = process.argv[2]
const test = TESTS[testName]
if (!test) {
  console.error(`Usage: node load-tests/run-load-test.js ${Object.keys(TESTS).join('|')}`)
  process.exit(1)
}

const RESULTS_DIR = path.resolve(__dirname, 'results')
const TMP_DIR = path.join(RESULTS_DIR, '.tmp')
const SCENARIO_PATH = path.resolve(__dirname, ...test.scenario)
const PROMETHEUS_URL = trimTrailingSlash(process.env.PROMETHEUS_URL || 'http://localhost:9090')
const BACKEND_CONTAINER = process.env.BACKEND_CONTAINER || 'web02-cmc-backend-1'
const SAMPLE_INTERVAL_MS = asNumber(process.env.METRIC_SAMPLE_INTERVAL_MS, 15000)

const startedAt = new Date()
const timestamp = formatTimestamp(startedAt)
const label = process.env.RESULT_LABEL || test.buildLabel()
const rawPath = path.join(TMP_DIR, `${label}-${timestamp}.artillery.json`)
const summaryPath = path.join(RESULTS_DIR, `${label}-${timestamp}-summary.json`)

async function main() {
  fs.mkdirSync(TMP_DIR, { recursive: true })
  fs.mkdirSync(RESULTS_DIR, { recursive: true })

  const restartCountBefore = getRestartCount()
  const sampler = createPrometheusSampler(test.events || { [testName]: test.event })
  sampler.start()

  const artilleryExitCode = await runArtillery()
  const samples = await sampler.stop()
  const restartCountAfter = getRestartCount()

  const artilleryResult = readArtilleryResult(rawPath)
  const summary = buildSummary({
    artilleryExitCode,
    artilleryResult,
    samples,
    restartCountBefore,
    restartCountAfter,
  })

  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`)

  if (process.env.KEEP_RAW_ARTILLERY !== 'true') {
    fs.rmSync(rawPath, { force: true })
  }

  console.log(`\nSaved threshold summary: ${path.relative(process.cwd(), summaryPath)}`)
  if (process.env.KEEP_RAW_ARTILLERY === 'true') {
    console.log(`Kept raw Artillery output: ${path.relative(process.cwd(), rawPath)}`)
  }

  process.exitCode = artilleryExitCode
}

function runArtillery() {
  return new Promise(resolve => {
    const child = spawn('pnpm', ['exec', 'artillery', 'run', '--output', rawPath, SCENARIO_PATH], {
      cwd: path.resolve(__dirname, '..'),
      env: process.env,
      stdio: 'inherit',
    })

    child.on('close', code => resolve(code || 0))
  })
}

function readArtilleryResult(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return parsed.aggregate ? parsed : parsed[parsed.length - 1] || {}
}

function buildSummary({ artilleryExitCode, artilleryResult, samples, restartCountBefore, restartCountAfter }) {
  const aggregate = artilleryResult.aggregate || {}
  const counters = aggregate.counters || {}
  const session = aggregate.summaries?.['vusers.session_length'] || aggregate.histograms?.['vusers.session_length'] || {}
  const sessionMeanSeconds = session.mean ? session.mean / 1000 : null
  const sent = counter(counters, test.sentCounter)
  const sentByEvent = buildNamedCounterMap(counters, test.sentCounters)
  const errorsByEvent = buildNamedCounterMap(counters, test.errorCounters)
  const totalSent = sent || sumValues(sentByEvent)
  const totalErrors = counter(counters, test.errorCounter) || sumValues(errorsByEvent)
  const restartCountDelta = restartCountAfter - restartCountBefore
  const earlyDisconnects = counter(counters, `${test.prefix}.socket.disconnected_early`)
  const transportCloseDisconnects = counter(counters, `${test.prefix}.socket.disconnected.transport_close`)
  const failedVusers = counter(counters, 'vusers.failed')
  const passed = artilleryExitCode === 0 && restartCountDelta === 0 && earlyDisconnects === 0 && failedVusers === 0 && totalErrors === 0

  return {
    run: {
      test: testName,
      label,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      result: passed ? 'PASS' : 'FAIL',
      artilleryExitCode,
    },
    parameters: {
      users: asNumber(process.env.LOAD_TEST_USERS, 40),
      durationSeconds: asNumber(process.env.TEST_DURATION_SECONDS, 180),
      chatMinIntervalMs: optionalNumber(process.env.CHAT_MIN_INTERVAL_MS),
      chatMaxIntervalMs: optionalNumber(process.env.CHAT_MAX_INTERVAL_MS),
      attackMinIntervalMs: optionalNumber(process.env.ATTACK_MIN_INTERVAL_MS),
      attackMaxIntervalMs: optionalNumber(process.env.ATTACK_MAX_INTERVAL_MS),
      voteMinIntervalMs: optionalNumber(process.env.VOTE_MIN_INTERVAL_MS),
      voteMaxIntervalMs: optionalNumber(process.env.VOTE_MAX_INTERVAL_MS),
      stressScale: process.env.STRESS_SCALE || null,
      apiUrl: process.env.API_URL || 'http://localhost:3000',
      socketUrl: process.env.SOCKET_URL || 'http://localhost:3000',
    },
    thresholdEvidence: {
      sent: totalSent,
      sentPerSecond: sessionMeanSeconds ? round(totalSent / sessionMeanSeconds, 2) : null,
      sentByEvent,
      sentPerSecondByEvent: buildRateMap(sentByEvent, sessionMeanSeconds),
      errors: totalErrors,
      errorsByEvent,
      socketConnected: counter(counters, `${test.prefix}.socket.connected`),
      normalDisconnects: counter(counters, `${test.prefix}.socket.disconnected.io_client_disconnect`),
      transportCloseDisconnects,
      earlyDisconnects,
      completedVusers: counter(counters, 'vusers.completed'),
      failedVusers,
      sessionLengthMs: pickFields(session, ['min', 'max', 'mean', 'p95', 'p99']),
      backendRestartCountDelta: restartCountDelta,
      counters: pickCounters(counters, test.prefix),
    },
    prometheusPeaks: samples.peaks,
    prometheusSampleCount: samples.count,
  }
}

function createPrometheusSampler(events) {
  const peaks = {
    eventRatePerSecond: emptyPeak(),
    eventP95Ms: emptyPeak(),
    eventP99Ms: emptyPeak(),
    eventErrorRatePerSecond: emptyPeak(),
    events: Object.fromEntries(
      Object.entries(events).map(([name]) => [
        name,
        {
          eventRatePerSecond: emptyPeak(),
          eventP95Ms: emptyPeak(),
          eventP99Ms: emptyPeak(),
          eventErrorRatePerSecond: emptyPeak(),
        },
      ]),
    ),
    nodeHeapUsedBytes: emptyPeak(),
    processRssBytes: emptyPeak(),
    cpuCores: emptyPeak(),
  }
  const primaryEvent = Object.values(events)[0]
  let timer = null
  let running = false
  let count = 0

  async function sample() {
    if (!running) return
    count += 1
    const sampledAt = new Date().toISOString()
    const eventQueries = Object.entries(events).flatMap(([name, event]) => [
      updatePeak(peaks.events[name].eventRatePerSecond, sampledAt, queryPrometheus(`sum(rate(socket_event_duration_seconds_count{event="${event}"}[1m]))`)),
      updatePeak(
        peaks.events[name].eventP95Ms,
        sampledAt,
        queryPrometheus(`histogram_quantile(0.95,sum(rate(socket_event_duration_seconds_bucket{event="${event}",status="success"}[1m]))by(le))`),
        1000,
      ),
      updatePeak(
        peaks.events[name].eventP99Ms,
        sampledAt,
        queryPrometheus(`histogram_quantile(0.99,sum(rate(socket_event_duration_seconds_bucket{event="${event}",status="success"}[1m]))by(le))`),
        1000,
      ),
      updatePeak(peaks.events[name].eventErrorRatePerSecond, sampledAt, queryPrometheus(`sum(rate(socket_event_errors_total{event="${event}"}[1m]))`)),
    ])
    await Promise.all([
      updatePeak(peaks.eventRatePerSecond, sampledAt, queryPrometheus(`sum(rate(socket_event_duration_seconds_count{event="${primaryEvent}"}[1m]))`)),
      updatePeak(
        peaks.eventP95Ms,
        sampledAt,
        queryPrometheus(`histogram_quantile(0.95,sum(rate(socket_event_duration_seconds_bucket{event="${primaryEvent}",status="success"}[1m]))by(le))`),
        1000,
      ),
      updatePeak(
        peaks.eventP99Ms,
        sampledAt,
        queryPrometheus(`histogram_quantile(0.99,sum(rate(socket_event_duration_seconds_bucket{event="${primaryEvent}",status="success"}[1m]))by(le))`),
        1000,
      ),
      updatePeak(peaks.eventErrorRatePerSecond, sampledAt, queryPrometheus(`sum(rate(socket_event_errors_total{event="${primaryEvent}"}[1m]))`)),
      ...eventQueries,
      updatePeak(peaks.nodeHeapUsedBytes, sampledAt, queryPrometheus('nodejs_heap_size_used_bytes{job="backend"}')),
      updatePeak(peaks.processRssBytes, sampledAt, queryPrometheus('process_resident_memory_bytes{job="backend"}')),
      updatePeak(peaks.cpuCores, sampledAt, queryPrometheus('rate(process_cpu_seconds_total{job="backend"}[1m])')),
    ])
  }

  return {
    start() {
      running = true
      sample()
      timer = setInterval(sample, SAMPLE_INTERVAL_MS)
    },
    async stop() {
      if (timer) clearInterval(timer)
      await sample()
      running = false
      return { count, peaks: normalizePeaks(peaks) }
    },
  }
}

async function updatePeak(peak, sampledAt, valuePromise, multiplier = 1) {
  const value = await valuePromise
  if (value === null) return
  const adjusted = value * multiplier
  if (peak.value === null || adjusted > peak.value) {
    peak.value = round(adjusted, 3)
    peak.sampledAt = sampledAt
  }
}

async function queryPrometheus(query) {
  try {
    const params = new URLSearchParams({ query })
    const response = await fetch(`${PROMETHEUS_URL}/api/v1/query?${params}`)
    if (!response.ok) return null
    const data = await response.json()
    const value = data.data?.result?.[0]?.value?.[1]
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

function getRestartCount() {
  try {
    const output = execFileSync('docker', ['inspect', BACKEND_CONTAINER, '--format', '{{.RestartCount}}'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return asNumber(output.trim(), 0)
  } catch {
    return 0
  }
}

function pickCounters(counters, prefix) {
  return Object.fromEntries(Object.entries(counters).filter(([key]) => key.startsWith(`${prefix}.`)))
}

function buildNamedCounterMap(counters, counterMap) {
  if (!counterMap) return null
  return Object.fromEntries(Object.entries(counterMap).map(([name, key]) => [name, counter(counters, key)]))
}

function buildRateMap(counts, seconds) {
  if (!counts || !seconds) return null
  return Object.fromEntries(Object.entries(counts).map(([name, value]) => [name, round(value / seconds, 2)]))
}

function sumValues(values) {
  if (!values) return 0
  return Object.values(values).reduce((sum, value) => sum + value, 0)
}

function envLabel(name) {
  return process.env[name] || 'default'
}

function formatTimestamp(date) {
  const pad = value => String(value).padStart(2, '0')
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate()), pad(date.getHours()), pad(date.getMinutes())].join('')
}

function counter(counters, key) {
  return counters[key] || 0
}

function pickFields(source, keys) {
  return Object.fromEntries(keys.map(key => [key, source[key] ?? null]))
}

function emptyPeak() {
  return { value: null, sampledAt: null }
}

function normalizePeaks(peaks) {
  return Object.fromEntries(Object.entries(peaks).map(([key, peak]) => [key, peak.value === null ? null : peak]))
}

function optionalNumber(value) {
  return value === undefined ? null : asNumber(value, null)
}

function asNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function round(value, decimals) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/, '')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
