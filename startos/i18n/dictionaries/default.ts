export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts — daemon + per-address health checks. 'TURN/STUN' and 'Relay Ports'
  // double as the interface display names in interfaces.ts.
  'Starting Coturn!': 0,
  'TURN Server': 1,
  'The TURN server is ready': 2,
  'The TURN server is not ready': 3,
  'Add a public domain to either the TURN/STUN or Relay Ports interface.': 4,
  'TURN/STUN': 5,
  'Plain TURN/STUN is publicly reachable.': 6,
  'Enable ${address} on the TURN/STUN interface.': 7,
  'TURN/STUN (TLS)': 8,
  'TURN over TLS is publicly reachable.': 9,
  'The relay port range is publicly reachable.': 10,
  'Enable the public IPv4 address on the Relay Ports interface.': 11,

  // interfaces.ts — descriptions ('TURN/STUN' and 'Relay Ports' names above)
  'STUN and TURN relay endpoint. Plain UDP/TCP, plus TLS (turns:) for networks that only allow TLS.': 12,
  'Relay Ports': 13,
  'UDP port range for TURN media relay': 14,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
