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

  // The password endpoint. The two interface names double as health-check
  // display names in main.ts.
  'TURN/STUN (Password)': 15,
  'STUN and TURN relay endpoint for apps you set up by hand, using a username and password instead of the shared secret.': 16,
  'Relay Ports (Password)': 17,
  'UDP port range for media relayed by the password endpoint': 18,
  'TURN Server (Password)': 19,
  'The password endpoint is publicly reachable.': 20,
  'Enable ${address} on the TURN/STUN (Password) interface.': 21,
  'Enable the public IPv4 address on the Relay Ports (Password) interface.': 22,

  // actions/ — all three share the 'Password Access' group
  'Password Access': 23,
  'Enable Password Access': 24,
  'Disable Password Access': 25,
  'Add a second endpoint that apps sign in to with a username and password, for apps that cannot use the shared secret the StartOS services use.': 26,
  'Turn off the second endpoint. Apps set up with its username and password stop relaying.': 27,
  'This password does not expire. Anyone who has it can use your server to relay calls until you change it, so only give it to apps you trust.': 28,
  'Show Username & Password': 29,
  'Display the username, password, and addresses to enter into the app you are setting up.': 30,
  'Turn on Password Access first — there is no password until you do.': 31,
  'Username & Password': 32,
  'Enter these in the app you are setting up. This password does not expire, so treat it like any other password.': 33,
  'The password is below, but there is no address to give out yet — add and enable a public domain on the TURN/STUN (Password) interface first.': 34,
  Username: 35,
  Password: 36,
  Address: 37,
  'Address (TLS)': 38,
  'Rotate Password': 39,
  'Generate a new password for password access.': 40,
  'Every app set up with the old password stops relaying until you enter the new one.': 41,
  'Password Rotated': 42,
  'The new password is below. Enter it in every app set up with the old one.': 43,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
