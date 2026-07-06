import { utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

// TURN/STUN listener (UDP + TCP). StartOS port-forwards cover both transports.
export const listeningPort = 3478
// TLS/DTLS listener (turns:). Coturn terminates TLS itself.
export const tlsPort = 5349
// UDP relay port range for TURN allocations. StartOS bindPortRange caps at 500.
export const relayStartPort = 49152
export const relayPortCount = 500
export const relayEndPort = relayStartPort + relayPortCount - 1

export const turnHostId = 'turn'
export const turnInterfaceId = 'turn'
export const turnsInterfaceId = 'turns'
export const relayInterfaceId = 'turn-relay'

export const dataDir = '/var/lib/coturn'
export const confPath = `${dataDir}/turnserver.conf`
export const certPath = `${dataDir}/cert.pem`
export const pkeyPath = `${dataDir}/pkey.pem`

export const coturnMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: dataDir,
  readonly: false,
})

export function generateSecret() {
  return utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 })
}

export function renderTurnserverConf(cfg: {
  realm: string
  externalIps: string[]
  staticAuthSecret: string
}): string {
  const lines = [
    `listening-port=${listeningPort}`,
    `tls-listening-port=${tlsPort}`,
    `min-port=${relayStartPort}`,
    `max-port=${relayEndPort}`,
    `realm=${cfg.realm}`,
    `server-name=${cfg.realm}`,
    'fingerprint',
    'use-auth-secret',
    `static-auth-secret=${cfg.staticAuthSecret}`,
    `cert=${certPath}`,
    `pkey=${pkeyPath}`,
    `pidfile=${dataDir}/turnserver.pid`,
    'log-file=stdout',
    'simple-log',
    ...cfg.externalIps.map((ip) => `external-ip=${ip}`),
  ]
  return lines.join('\n') + '\n'
}

// Coturn reads config/cert/key from fixed file paths, so a content change alone
// doesn't restart it. Fold a revision of every dynamic input into the daemon env
// so the Daemons reconciler restarts coturn whenever any of them change (public
// domain, IP, secret, or a renewed certificate).
export function configRevision(...parts: string[]): string {
  const s = parts.join(' ')
  let h = 5381
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(h, 33) + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(16)
}
