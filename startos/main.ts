import { turnserverConf, turnSecret } from './fileModels/coturn'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  confPath,
  coturnMounts,
  dataDir,
  listeningPort,
  renderTurnserverConf,
  turnHostId,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Coturn!'))

  const staticAuthSecret = await turnSecret.read().const(effects)

  // The enabled public clearnet domain (and public IPv4s) on the TURN host.
  // A public domain is a host-level address, so scan every interface on the
  // host rather than assuming which binding StartOS surfaces it on. Coturn
  // needs the domain for its realm (and for StartOS to serve a publicly-trusted
  // turns: certificate) and the public IPs for relay candidates; without a
  // domain it can't operate.
  const domainInfo = await sdk.host
    .getOwn(effects, turnHostId, (host) => {
      const interfaces = host
        ? Object.values(host.bindings).flatMap((b) =>
            Object.values(b.interfaces),
          )
        : []
      const publicHostnames = (kind: 'domain' | 'ipv4') =>
        interfaces.flatMap((i) =>
          i.addressInfo
            .filter({ visibility: 'public', kind })
            .hostnames.map((h) => h.hostname),
        )
      const domain = publicHostnames('domain')[0] ?? null
      const externalIps = [...new Set(publicHostnames('ipv4'))]
      return domain ? { domain, externalIps } : null
    })
    .const()

  const coturnSub = sdk.SubContainer.of(
    effects,
    { imageId: 'coturn' },
    coturnMounts,
    'coturn-sub',
  )

  if (!domainInfo || !staticAuthSecret) {
    return sdk.Daemons.of(effects)
      .addDaemon('coturn', {
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
      .addHealthCheck('public-domain', {
        ready: {
          display: i18n('Public Domain'),
          fn: async () => ({
            result: 'failure' as const,
            message: i18n(
              'Add and enable a public domain so Coturn can serve TURN/STUN traffic.',
            ),
          }),
        },
        requires: [],
      })
  }

  const conf = renderTurnserverConf({
    realm: domainInfo.domain,
    externalIps: domainInfo.externalIps,
    staticAuthSecret,
  })

  await turnserverConf.write(effects, conf, { allowWriteAfterConst: true })

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
    .addHealthCheck('public-domain', {
      ready: {
        display: i18n('Public Domain'),
        fn: async () => ({
          result: 'success' as const,
          message: i18n('A public domain is active'),
        }),
      },
      requires: [],
    })
})
