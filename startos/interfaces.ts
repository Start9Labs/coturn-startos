import { staticAuth } from './fileModels/coturn'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  listeningPort,
  relayInterfaceId,
  relayPortCount,
  relayStartPort,
  staticListeningPort,
  staticRelayInterfaceId,
  staticRelayStartPort,
  staticTlsPort,
  staticTurnInterfaceId,
  tlsPort,
  turnHostId,
  turnInterfaceId,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const turnMulti = sdk.MultiHost.of(effects, turnHostId)

  // Plain STUN/TURN on UDP+TCP (turn:), plus an edge-terminated TLS endpoint
  // (turns:) via addSsl: StartOS terminates the client's TLS with the domain's
  // certificate — publicly trusted when the user selects Let's Encrypt — and
  // forwards plaintext to coturn, so coturn serves no TLS of its own. Both
  // addresses ride one binding; consumers pick turn vs turns by the `ssl` flag.
  const turnOrigin = await turnMulti.bindPort(listeningPort, {
    protocol: null,
    preferredExternalPort: listeningPort,
    secure: { ssl: false },
    addSsl: {
      preferredExternalPort: tlsPort,
      alpn: null,
      addXForwardedHeaders: false,
      auth: null,
    },
  })
  const turnReceipt = await turnOrigin.export([
    sdk.createInterface(effects, {
      name: i18n('TURN/STUN'),
      id: turnInterfaceId,
      description: i18n(
        'STUN and TURN relay endpoint. Plain UDP/TCP, plus TLS (turns:) for networks that only allow TLS.',
      ),
      type: 'api',
      masked: false,
      schemeOverride: { ssl: 'turns', noSsl: 'turn' },
      username: null,
      path: '',
      query: {},
    }),
  ])

  // Contiguous UDP range coturn allocates relay ports from (min-port..max-port).
  const relayOrigin = await turnMulti.bindPortRange({
    internalStartPort: relayStartPort,
    externalStartPort: relayStartPort,
    numberOfPorts: relayPortCount,
  })
  await relayOrigin.export(
    sdk.createRangeInterface(effects, {
      id: relayInterfaceId,
      name: i18n('Relay Ports'),
      description: i18n('UDP port range for TURN media relay'),
    }),
  )

  // The second listener's bindings exist only while it is switched on, so a
  // server that never turns it on never reserves its 500 relay ports and never
  // shows an interface it has no use for. A binding a pass does not declare is
  // disabled rather than deleted, so switching it back on returns the same
  // external ports, the same domain, and the same per-address choices.
  if (!(await staticAuth.read((s) => s.enabled).const(effects))) {
    return [turnReceipt]
  }

  const staticOrigin = await turnMulti.bindPort(staticListeningPort, {
    protocol: null,
    preferredExternalPort: staticListeningPort,
    secure: { ssl: false },
    addSsl: {
      preferredExternalPort: staticTlsPort,
      alpn: null,
      addXForwardedHeaders: false,
      auth: null,
    },
  })
  const staticReceipt = await staticOrigin.export([
    sdk.createInterface(effects, {
      name: i18n('TURN/STUN (Password)'),
      id: staticTurnInterfaceId,
      description: i18n(
        'STUN and TURN relay endpoint for apps you set up by hand, using a username and password instead of the shared secret.',
      ),
      type: 'api',
      masked: false,
      schemeOverride: { ssl: 'turns', noSsl: 'turn' },
      username: null,
      path: '',
      query: {},
    }),
  ])

  const staticRelayOrigin = await turnMulti.bindPortRange({
    internalStartPort: staticRelayStartPort,
    externalStartPort: staticRelayStartPort,
    numberOfPorts: relayPortCount,
  })
  await staticRelayOrigin.export(
    sdk.createRangeInterface(effects, {
      id: staticRelayInterfaceId,
      name: i18n('Relay Ports (Password)'),
      description: i18n(
        'UDP port range for media relayed by the password endpoint',
      ),
    }),
  )

  return [turnReceipt, staticReceipt]
})
