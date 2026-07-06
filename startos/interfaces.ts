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
  turnsInterfaceId,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const turnMulti = sdk.MultiHost.of(effects, turnHostId)

  // TURN/STUN over UDP + TCP. Coturn owns the socket; StartOS forwards the port.
  const turnOrigin = await turnMulti.bindPort(listeningPort, {
    protocol: null,
    preferredExternalPort: listeningPort,
    secure: { ssl: false },
    addSsl: null,
  })
  const turnReceipt = await turnOrigin.export([
    sdk.createInterface(effects, {
      name: i18n('TURN / STUN'),
      id: turnInterfaceId,
      description: i18n('STUN and TURN relay endpoint over UDP and TCP'),
      type: 'api',
      masked: false,
      schemeOverride: null,
      username: null,
      path: '',
      query: {},
    }),
  ])

  // TURN over TLS/DTLS. Coturn terminates TLS with the domain's certificate.
  const turnsOrigin = await turnMulti.bindPort(tlsPort, {
    protocol: null,
    preferredExternalPort: tlsPort,
    secure: { ssl: false },
    addSsl: null,
  })
  const turnsReceipt = await turnsOrigin.export([
    sdk.createInterface(effects, {
      name: i18n('TURN over TLS'),
      id: turnsInterfaceId,
      description: i18n('TURN relay over TLS and DTLS'),
      type: 'api',
      masked: false,
      schemeOverride: null,
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

  return [turnReceipt, turnsReceipt]
})
