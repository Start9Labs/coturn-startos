import { createHash } from 'crypto'
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

  // Return the reconciler rather than a static `Daemons.of` chain: inside this
  // builder `constRetry` reruns-and-reconciles instead of firing
  // `effects.restart()`, so adding or removing a public domain updates the
  // daemon set in place and the service stays `running`. A full restart here
  // would collide with StartOS's port-forward / IPv6-firewall probes, which
  // abort with "tests cannot be performed because the service is not running".
  return sdk.Daemons.dynamic(effects, async ({ effects }) => {
    const staticAuthSecret = await turnSecret.read().const(effects)

    // Daemon slice — the ONLY host inputs to turnserver.conf (realm + external
    // IPs). `.const()` here reruns the builder exactly when the conf must
    // change. The per-address exposure booleans are deliberately NOT read here:
    // they feed only health checks, and folding them in would rebuild the
    // daemon set on every address toggle.
    const net = await sdk.host
      .getOwn(effects, turnHostId, (host) => {
        const turnAi =
          host?.bindings[listeningPort]?.interfaces[turnInterfaceId]
            ?.addressInfo
        const domains =
          turnAi?.filter({ visibility: 'public', kind: 'domain' }).hostnames ??
          []
        const externalIps = [
          ...new Set(
            turnAi
              ?.filter({ visibility: 'public', kind: 'ipv4' })
              .hostnames.map((h) => h.hostname) ?? [],
          ),
        ]
        return { domain: domains[0]?.hostname ?? null, externalIps }
      })
      .const()

    // Lazy subcontainer is required under the reconciler: an eager handle would
    // defeat the "leave alone" diff (and the reconciler throws on one).
    const coturnSub = sdk.SubContainer.of(
      effects,
      { imageId: 'coturn' },
      coturnMounts,
      'coturn-sub',
    )

    // Live per-poll read of the exposure a health check reports. `.once()`,
    // never `.const()`: the reconciler leaves an unchanged-hash check's old
    // closure running across reruns, so a captured value would go stale. Reading
    // live keeps each check fresh on its poll without rebuilding the daemon.
    const readExposure = () =>
      sdk.host
        .getOwn(effects, turnHostId, (host) => {
          const turnAi =
            host?.bindings[listeningPort]?.interfaces[turnInterfaceId]
              ?.addressInfo
          const domains =
            turnAi?.filter({ visibility: 'public', kind: 'domain' })
              .hostnames ?? []
          const range = host?.bindingRanges[relayStartPort]
          return {
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
        .once()

    // Fold a hash of the rendered conf into the daemon's env. The reconciler
    // diffs daemons by a hash over their spec — a rewritten config FILE is
    // invisible to it — so without this a regenerated conf would never restart
    // turnserver.
    let configRev = 'idle'
    if (net?.domain && staticAuthSecret) {
      const conf = renderTurnserverConf({
        realm: net.domain,
        externalIps: net.externalIps,
        staticAuthSecret,
      })
      await turnserverConf.write(effects, conf, { allowWriteAfterConst: true })
      configRev = createHash('sha256').update(conf).digest('hex')
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
                env: { CONFIG_REV: configRev },
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

    // One health check per required public address, each naming the exact
    // address to enable if it is off. Reading exposure live means a toggle
    // updates the check on its next poll without touching turnserver.
    return daemons
      .addHealthCheck('turn-address', {
        ready: {
          display: i18n('TURN / STUN (3478)'),
          fn: async () =>
            (await readExposure()).turnDomain
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
            (await readExposure()).turnsDomain
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
            (await readExposure()).relayForwarded
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
})
