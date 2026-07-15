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

  // Daemon slice — the host inputs turnserver.conf depends on (realm + external
  // IPs). Read with `.const()`, so adding or removing a public domain (or
  // toggling a public IPv4) re-runs `main` and restarts the service to
  // regenerate the config. The realm is any public domain ADDED to the shared
  // host — taken from `available`, not the enabled set — so coturn still comes up
  // when the operator has added a domain via one interface but not yet enabled it
  // on this one; the address health checks below then name what to enable.
  // Per-address enable/disable is deliberately NOT read here: it feeds only the
  // health checks and is watched separately (below), so a toggle updates a
  // message without bouncing turnserver.
  const net = await sdk.host
    .getOwn(effects, turnHostId, (host) => {
      const bind = host?.bindings[listeningPort]
      const realm =
        bind?.addresses.available.find(
          (h) => h.metadata.kind === 'public-domain',
        )?.hostname ?? null
      const externalIps = [
        ...new Set(
          bind?.interfaces[turnInterfaceId]?.addressInfo
            .filter({ visibility: 'public', kind: 'ipv4' })
            .hostnames.map((h) => h.hostname) ?? [],
        ),
      ]
      return { realm, externalIps }
    })
    .const()

  const coturnSub = sdk.SubContainer.of(
    effects,
    { imageId: 'coturn' },
    coturnMounts,
    'coturn-sub',
  )

  // No public domain added yet: coturn has no realm and cannot serve, so the sole
  // health check FAILS (never `disabled`) with a call to action, and none of the
  // per-address checks exist. Adding a domain flips `realm` non-null and re-runs
  // `main` into the branch below.
  if (!net?.realm || !staticAuthSecret) {
    return sdk.Daemons.of(effects).addDaemon('coturn', {
      subcontainer: coturnSub,
      exec: { command: ['sleep', 'infinity'], user: 'nobody' },
      ready: {
        display: i18n('TURN Server'),
        fn: async () => ({
          result: 'failure' as const,
          message: i18n(
            'Add a public domain to either the TURN/STUN or Relay Ports interface.',
          ),
        }),
      },
      requires: [],
    })
  }

  const conf = renderTurnserverConf({
    realm: net.realm,
    externalIps: net.externalIps,
    staticAuthSecret,
  })
  await turnserverConf.write(effects, conf, { allowWriteAfterConst: true })

  // Per-address exposure feeds only the health checks, so rather than have each
  // check poll the host API we WATCH it with `.onChange` and keep the latest
  // snapshot in a local the checks read synchronously — the OS pushes changes
  // instead of us pulling them. `.onChange` delivers the CURRENT value as its
  // first callback (Watchable.produce fetches it immediately; watchGen yields it
  // with prev = null) and it resolves well before the daemons finish starting, so
  // no separate seeding read is needed. For each required public address we track
  // whether it is enabled (present in the enabled `hostnames`) and its exact
  // address string (rendered from `available`, which still carries a disabled
  // address, so the failure message can name what to enable). Not `.const()`:
  // capturing these would restart the service on every toggle; the loop
  // unsubscribes itself when `main` leaves context on its next re-run.
  let exposure = {
    turnEnabled: false,
    turnUrl: null as string | null,
    turnsEnabled: false,
    turnsUrl: null as string | null,
    relayForwarded: false,
  }
  sdk.host
    .getOwn(effects, turnHostId, (host) => {
      const bind = host?.bindings[listeningPort]
      const turnAi = bind?.interfaces[turnInterfaceId]?.addressInfo
      const enabledDomains =
        turnAi?.filter({ visibility: 'public', kind: 'domain' }).hostnames ?? []
      const domainUrl = (ssl: boolean) => {
        const h = bind?.addresses.available.find(
          (a) => a.metadata.kind === 'public-domain' && a.ssl === ssl,
        )
        return h && turnAi ? turnAi.toUrl(h) : null
      }
      const range = host?.bindingRanges[relayStartPort]
      return {
        turnEnabled: enabledDomains.some((h) => !h.ssl),
        turnUrl: domainUrl(false),
        turnsEnabled: enabledDomains.some((h) => h.ssl),
        turnsUrl: domainUrl(true),
        relayForwarded:
          !!range?.enabled &&
          (host?.portForwards ?? []).some(
            (pf) =>
              pf.src.endsWith(`:${range.externalStartPort}`) &&
              pf.count === range.numberOfPorts,
          ),
      }
    })
    .onChange((next) => {
      if (next) exposure = next
      return { cancel: false }
    })

  // While a reachability check is failing, poll it every 5 s instead of the 30 s
  // steady-state cadence so it flips green promptly once the operator enables the
  // address (`.onChange` has already refreshed `exposure` by then).
  const reachabilityTrigger = sdk.trigger.statusTrigger(30_000, {
    starting: 5_000,
    failure: 5_000,
  })

  // One health check per required public address, each naming the exact address
  // to enable when it is off. Each reads the watched `exposure` snapshot, so a
  // toggle updates the check without an API round-trip or touching turnserver.
  return sdk.Daemons.of(effects)
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
      exec: { command: ['turnserver', '-c', confPath], user: 'nobody' },
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
    .addHealthCheck('turn-address', {
      ready: {
        display: i18n('TURN/STUN'),
        trigger: reachabilityTrigger,
        fn: () =>
          exposure.turnEnabled
            ? {
                result: 'success' as const,
                message: i18n('Plain TURN/STUN is publicly reachable.'),
              }
            : {
                result: 'failure' as const,
                message: i18n('Enable ${address} on the TURN/STUN interface.', {
                  address: exposure.turnUrl ?? 'turn:',
                }),
              },
      },
      requires: [],
    })
    .addHealthCheck('turns-address', {
      ready: {
        display: i18n('TURN/STUN (TLS)'),
        trigger: reachabilityTrigger,
        fn: () =>
          exposure.turnsEnabled
            ? {
                result: 'success' as const,
                message: i18n('TURN over TLS is publicly reachable.'),
              }
            : {
                result: 'failure' as const,
                message: i18n('Enable ${address} on the TURN/STUN interface.', {
                  address: exposure.turnsUrl ?? 'turns:',
                }),
              },
      },
      requires: [],
    })
    .addHealthCheck('relay-ports', {
      ready: {
        display: i18n('Relay Ports'),
        trigger: reachabilityTrigger,
        fn: () =>
          exposure.relayForwarded
            ? {
                result: 'success' as const,
                message: i18n('The relay port range is publicly reachable.'),
              }
            : {
                result: 'failure' as const,
                message: i18n(
                  'Enable the public IPv4 address on the Relay Ports interface.',
                ),
              },
      },
      requires: [],
    })
})
