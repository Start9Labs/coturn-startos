export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Coturn!': 0,
  'TURN Server': 1,
  'The TURN server is ready': 2,
  'The TURN server is not ready': 3,
  'Waiting for a public domain': 4,
  'Public Domain': 5,
  'A public domain is active': 6,
  'Add and enable a public domain so Coturn can serve TURN/STUN traffic.': 7,

  // interfaces.ts
  'TURN / STUN': 8,
  'STUN and TURN relay endpoint. Plain UDP/TCP, plus TLS (turns:) for networks that only allow TLS.': 9,
  'TURN Relay Ports': 10,
  'UDP port range for TURN media relay': 11,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
