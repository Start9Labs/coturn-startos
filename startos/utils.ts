import { utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

// STUN/TURN listener (UDP + TCP). StartOS port-forwards cover both transports.
export const listeningPort = 3478
// External TLS port for turns:. StartOS terminates TLS at the edge (addSsl) and
// forwards plaintext to `listeningPort`; coturn serves no TLS/DTLS of its own.
export const tlsPort = 5349
// UDP relay port range for TURN allocations (min-port..max-port). Kept below
// StartOS's 49152+ ephemeral pool so the atomic range bind can't collide with a
// randomly-assigned external port. StartOS bindPortRange caps the span at 500.
export const relayStartPort = 42000
export const relayPortCount = 500
export const relayEndPort = relayStartPort + relayPortCount - 1

// Second listener, for clients that can only be handed a fixed username and
// password — SimpleX's app, go2rtc, and anything else configured by hand. It is
// a separate turnserver PROCESS, not another listener on the first one, because
// coturn's auth mode is process-global: `use-auth-secret` overrides
// username/password auth, and coturn raises a configuration alert if both are
// set. Ports are the shared-secret listener's plus 100, and the relay block is
// the next 500 above its own — still clear of the 49152+ ephemeral pool.
export const staticListeningPort = listeningPort + 100
export const staticTlsPort = tlsPort + 100
export const staticRelayStartPort = relayStartPort + relayPortCount
export const staticRelayEndPort = staticRelayStartPort + relayPortCount - 1

export const turnHostId = 'turn'
export const turnInterfaceId = 'turn'
export const relayInterfaceId = 'turn-relay'
export const staticTurnInterfaceId = 'turn-static'
export const staticRelayInterfaceId = 'turn-static-relay'

export const dataDir = '/var/lib/coturn'
export const confPath = `${dataDir}/turnserver.conf`
export const staticConfPath = `${dataDir}/turnserver-static.conf`

// Fixed rather than generated: the password below carries the entropy, and a
// memorable username is one less thing to copy correctly into a phone.
export const staticUsername = 'startos'

export const coturnMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: dataDir,
  readonly: false,
})

export function generateSecret() {
  return utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 })
}

// Alphanumeric, so it survives being pasted into a `turn:user:pass@host` URI —
// which is the form several clients take — without escaping, and can never
// contain the `:` that separates it from the username in coturn's `user=` line.
export function generateStaticPassword() {
  return utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 32 })
}

// Relaying to these ranges is denied so a TURN client (anyone holding valid
// ephemeral credentials) can't pivot into the user's LAN or the StartOS
// container network. coturn 4.13.1+ already denies loopback, link-local, and
// IPv6 ULA by default; RFC1918 and the other special-use IPv4 blocks are not,
// so they are listed explicitly here. Public addresses stay relayable.
const deniedPeerRanges = [
  '0.0.0.0-0.255.255.255',
  '10.0.0.0-10.255.255.255',
  '100.64.0.0-100.127.255.255',
  '127.0.0.0-127.255.255.255',
  '169.254.0.0-169.254.255.255',
  '172.16.0.0-172.31.255.255',
  '192.0.0.0-192.0.0.255',
  '192.0.2.0-192.0.2.255',
  '192.88.99.0-192.88.99.255',
  '192.168.0.0-192.168.255.255',
  '198.18.0.0-198.19.255.255',
  '198.51.100.0-198.51.100.255',
  '203.0.113.0-203.0.113.255',
  '240.0.0.0-255.255.255.255',
]

export function renderTurnserverConf(cfg: {
  realm: string
  externalIps: string[]
  staticAuthSecret: string
}): string {
  const lines = [
    `listening-port=${listeningPort}`,
    // StartOS terminates TLS at the edge and forwards plaintext, so coturn does
    // not run its own TLS listener. DTLS stays off by not passing `dtls`.
    'no-tls',
    `min-port=${relayStartPort}`,
    `max-port=${relayEndPort}`,
    `realm=${cfg.realm}`,
    `server-name=${cfg.realm}`,
    'fingerprint',
    'use-auth-secret',
    `static-auth-secret=${cfg.staticAuthSecret}`,
    'no-multicast-peers',
    ...deniedPeerRanges.map((range) => `denied-peer-ip=${range}`),
    `pidfile=${dataDir}/turnserver.pid`,
    'log-file=stdout',
    ...cfg.externalIps.map((ip) => `external-ip=${ip}`),
  ]
  return lines.join('\n') + '\n'
}

/**
 * The second listener's config: same realm, same external IPs, same denied-peer
 * list, but authenticating against one long-term account instead of the REST
 * shared secret.
 */
export function renderStaticTurnserverConf(cfg: {
  realm: string
  externalIps: string[]
  username: string
  password: string
}): string {
  const lines = [
    `listening-port=${staticListeningPort}`,
    'no-tls',
    `min-port=${staticRelayStartPort}`,
    `max-port=${staticRelayEndPort}`,
    `realm=${cfg.realm}`,
    `server-name=${cfg.realm}`,
    'fingerprint',
    'lt-cred-mech',
    `user=${cfg.username}:${cfg.password}`,
    // Its own database file. Two turnserver processes run against this volume,
    // and the one account this listener has comes from `user=` above rather
    // than from a database, so it must not share the other's.
    `userdb=${dataDir}/turndb-static`,
    // This credential does not expire the way the REST scheme's do, so bound
    // what a leaked one can consume. Both figures are coturn's own example
    // values: concurrent allocations per user, and across the server.
    'user-quota=12',
    'total-quota=100',
    'no-multicast-peers',
    ...deniedPeerRanges.map((range) => `denied-peer-ip=${range}`),
    `pidfile=${dataDir}/turnserver-static.pid`,
    'log-file=stdout',
    ...cfg.externalIps.map((ip) => `external-ip=${ip}`),
  ]
  return lines.join('\n') + '\n'
}
