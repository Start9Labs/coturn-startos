import { certFile, keyFile, turnserverConf } from './fileModels/coturn'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  configRevision,
  confPath,
  coturnMounts,
  dataDir,
  listeningPort,
  renderTurnserverConf,
  turnHostId,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Coturn!'))

  const store = await storeJson.read().const(effects)
  const staticAuthSecret = store?.TURN_SECRET

  // The StartOS-managed certificate + key for a domain. Subscribes reactively so
  // a renewal re-runs setupMain. Returns null while it is still provisioning.
  const getCertificate = async (
    domain: string,
  ): Promise<{ certPem: string; keyPem: string } | null> => {
    try {
      const fullchain = await sdk
        .getSslCertificate(effects, [domain], 'ecdsa')
        .const()
      if (!fullchain) return null
      const keyPem = await sdk.getSslKey(effects, {
        hostnames: [domain],
        algorithm: 'ecdsa',
      })
      return {
        certPem: fullchain.map((pem) => pem.trimEnd()).join('\n') + '\n',
        keyPem,
      }
    } catch {
      return null
    }
  }

  // The enabled public clearnet domain (and public IPv4s) on the TURN host.
  // A public domain is a host-level address, so scan every interface on the
  // host (turn, turns) rather than assuming which binding StartOS surfaces it
  // on. Coturn needs a domain for its realm + TLS certificate, and the public
  // IP for relay candidates; without a domain it can't operate.
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

  // The StartOS-managed certificate for the domain. Subscribes reactively, so a
  // renewal re-runs setupMain. May be briefly unavailable while it provisions.
  const cert =
    domainInfo && staticAuthSecret
      ? await getCertificate(domainInfo.domain)
      : null

  const coturnSub = sdk.SubContainer.of(
    effects,
    { imageId: 'coturn' },
    coturnMounts,
    'coturn-sub',
  )

  if (!domainInfo || !staticAuthSecret || !cert) {
    return sdk.Daemons.of(effects)
      .addDaemon('coturn', {
        subcontainer: coturnSub,
        exec: { command: ['sleep', 'infinity'] },
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
          fn: async () =>
            domainInfo
              ? {
                  result: 'loading' as const,
                  message: i18n(
                    'Provisioning the TLS certificate for your public domain…',
                  ),
                }
              : {
                  result: 'failure' as const,
                  message: i18n(
                    'Add and enable a public domain so Coturn can serve TURN/STUN traffic.',
                  ),
                },
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
  await certFile.write(effects, cert.certPem, { allowWriteAfterConst: true })
  await keyFile.write(effects, cert.keyPem, { allowWriteAfterConst: true })

  const configRev = configRevision(conf, cert.certPem, cert.keyPem)

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
        env: { COTURN_CONFIG_REV: configRev },
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
