export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts — daemon + per-address health checks
  'Starting Coturn!': 0,
  'TURN Server': 1,
  'The TURN server is ready': 2,
  'The TURN server is not ready': 3,
  'Waiting for a public domain': 4,
  'TURN / STUN (3478)': 5,
  'Plain TURN/STUN is publicly reachable.': 6,
  'Enable the public domain on the turn: (3478) address of the TURN / STUN interface.': 7,
  'TURN over TLS (5349)': 8,
  'TURN over TLS is publicly reachable.': 9,
  'Enable the public domain on the turns: (5349) address of the TURN / STUN interface.': 10,
  'The relay port range is publicly reachable.': 11,
  'Enable the public IPv4 address on the TURN Relay Ports interface.': 12,

  // interfaces.ts ('TURN Relay Ports' is also the relay health-check display)
  'TURN / STUN': 13,
  'STUN and TURN relay endpoint. Plain UDP/TCP, plus TLS (turns:) for networks that only allow TLS.': 14,
  'TURN Relay Ports': 15,
  'UDP port range for TURN media relay': 16,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
