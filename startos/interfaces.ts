import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  listeningPort,
  relayInterfaceId,
  relayPortCount,
  relayStartPort,
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
      name: i18n('TURN / STUN'),
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
      name: i18n('TURN Relay Ports'),
      description: i18n('UDP port range for TURN media relay'),
    }),
  )

  return [turnReceipt]
})
