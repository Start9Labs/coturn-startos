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

export const turnHostId = 'turn'
export const turnInterfaceId = 'turn'
export const relayInterfaceId = 'turn-relay'

export const dataDir = '/var/lib/coturn'
export const confPath = `${dataDir}/turnserver.conf`

export const coturnMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: dataDir,
  readonly: false,
})

export function generateSecret() {
  return utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 })
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
    // not run its own TLS/DTLS listeners.
    'no-tls',
    'no-dtls',
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
    'simple-log',
    ...cfg.externalIps.map((ip) => `external-ip=${ip}`),
  ]
  return lines.join('\n') + '\n'
}
