import { turnserverConf, turnSecret } from './fileModels/coturn'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  confPath,
  coturnMounts,
  dataDir,
  listeningPort,
  relayStartPort,
  renderTurnserverConf,
  turnHostId,
  turnInterfaceId,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Coturn!'))

  const staticAuthSecret = await turnSecret.read().const(effects)

  // Everything Coturn needs from its host, in one reactive read:
  //   domain / externalIps      — realm + external-ip for turnserver.conf
  //   turnDomain / turnsDomain  — public domain enabled on the turn: (3478,
  //                               ssl:false) and turns: (5349, ssl:true) address
  //   relayForwarded            — the relay range's ports are actually forwarded
  //                               (the range has no addressInfo, so this is read
  //                               from the host's computed portForwards)
  // Each of the last three is surfaced as its own health check below, naming the
  // exact address to enable when it is off.
  //
  // KNOWN LIMITATION: under `Daemons.of`, this `.const()` re-runs main via
  // `effects.restart()`, so adding or removing a domain restarts the whole
  // service — which collides with StartOS's port-forward / IPv6-firewall probes
  // ("tests cannot be performed because the service is not running"). The fix is
  // to return `Daemons.dynamic()` from `setupMain` so the daemon set reconciles
  // in place; that composition is currently not expressible in the SDK. Tracked
  // in Start9Labs/start-technologies#3470 — switch once it lands. See TODO.md.
  const net = await sdk.host
    .getOwn(effects, turnHostId, (host) => {
      const turnAi =
        host?.bindings[listeningPort]?.interfaces[turnInterfaceId]?.addressInfo
      const domains =
        turnAi?.filter({ visibility: 'public', kind: 'domain' }).hostnames ?? []
      const externalIps = [
        ...new Set(
          turnAi
            ?.filter({ visibility: 'public', kind: 'ipv4' })
            .hostnames.map((h) => h.hostname) ?? [],
        ),
      ]
      const range = host?.bindingRanges[relayStartPort]
      return {
        domain: domains[0]?.hostname ?? null,
        externalIps,
        turnDomain: domains.some((h) => !h.ssl),
        turnsDomain: domains.some((h) => h.ssl),
        relayForwarded:
          !!range?.enabled &&
          (host?.portForwards ?? []).some(
            (pf) =>
              pf.src.endsWith(`:${range.externalStartPort}`) &&
              pf.count === range.numberOfPorts,
          ),
      }
    })
    .const()

  const coturnSub = sdk.SubContainer.of(
    effects,
    { imageId: 'coturn' },
    coturnMounts,
    'coturn-sub',
  )

  if (net?.domain && staticAuthSecret) {
    const conf = renderTurnserverConf({
      realm: net.domain,
      externalIps: net.externalIps,
      staticAuthSecret,
    })
    await turnserverConf.write(effects, conf, { allowWriteAfterConst: true })
  }

  const daemons =
    net?.domain && staticAuthSecret
      ? sdk.Daemons.of(effects)
          .addOneshot('chown', {
            subcontainer: coturnSub,
            exec: {
              command: ['chown', '-R', 'nobody:nogroup', dataDir],
              user: 'root',
            },
            requires: [],
          })
          .addDaemon('coturn', {
            subcontainer: coturnSub,
            exec: {
              command: ['turnserver', '-c', confPath],
              user: 'nobody',
            },
            ready: {
              display: i18n('TURN Server'),
              fn: () =>
                sdk.healthCheck.checkPortListening(effects, listeningPort, {
                  successMessage: i18n('The TURN server is ready'),
                  errorMessage: i18n('The TURN server is not ready'),
                }),
            },
            requires: ['chown'],
          })
      : sdk.Daemons.of(effects).addDaemon('coturn', {
          subcontainer: coturnSub,
          exec: { command: ['sleep', 'infinity'], user: 'nobody' },
          ready: {
            display: i18n('TURN Server'),
            fn: async () => ({
              result: 'disabled' as const,
              message: i18n('Waiting for a public domain'),
            }),
          },
          requires: [],
        })

  // One health check per required public address, each naming the exact address
  // to enable if it is off.
  return daemons
    .addHealthCheck('turn-address', {
      ready: {
        display: i18n('TURN / STUN (3478)'),
        fn: async () =>
          net?.turnDomain
            ? {
                result: 'success' as const,
                message: i18n('Plain TURN/STUN is publicly reachable.'),
              }
            : {
                result: 'failure' as const,
                message: i18n(
                  'Enable the public domain on the turn: (3478) address of the TURN / STUN interface.',
                ),
              },
      },
      requires: [],
    })
    .addHealthCheck('turns-address', {
      ready: {
        display: i18n('TURN over TLS (5349)'),
        fn: async () =>
          net?.turnsDomain
            ? {
                result: 'success' as const,
                message: i18n('TURN over TLS is publicly reachable.'),
              }
            : {
                result: 'failure' as const,
                message: i18n(
                  'Enable the public domain on the turns: (5349) address of the TURN / STUN interface.',
                ),
              },
      },
      requires: [],
    })
    .addHealthCheck('relay-ports', {
      ready: {
        display: i18n('TURN Relay Ports'),
        fn: async () =>
          net?.relayForwarded
            ? {
                result: 'success' as const,
                message: i18n('The relay port range is publicly reachable.'),
              }
            : {
                result: 'failure' as const,
                message: i18n(
                  'Enable the public IPv4 address on the TURN Relay Ports interface.',
                ),
              },
      },
      requires: [],
    })
})
