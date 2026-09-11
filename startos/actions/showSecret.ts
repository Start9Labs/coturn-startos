import { T } from '@start9labs/start-sdk'
import { turnSecret } from '../fileModels/coturn'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { listeningPort, turnHostId, turnInterfaceId } from '../utils'

/**
 * The shared-secret endpoint's plain and TLS addresses, as the URIs a consumer
 * asks for. Empty until a public domain is added and enabled on the interface —
 * an address that is not enabled is not reachable, so there is nothing to hand
 * out yet.
 *
 * Built by hand rather than with `addressInfo.toUrl`, which renders the
 * `scheme://host:port` form an HTTP address takes. A TURN URI has no authority
 * component (RFC 7065): it is `turn:host:port`, and the `//` form is rejected
 * by the clients this endpoint exists to serve.
 */
async function turnUris(effects: T.Effects) {
  return (
    (await sdk.host
      .getOwn(effects, turnHostId, (host) => {
        const hostnames =
          host?.bindings[listeningPort]?.interfaces[
            turnInterfaceId
          ]?.addressInfo
            .filter({ visibility: 'public', kind: 'domain' })
            .hostnames.filter((h) => h.port != null) ?? []
        const uri = (ssl: boolean) => {
          const h = hostnames.find((x) => x.ssl === ssl)
          return h ? `${ssl ? 'turns' : 'turn'}:${h.hostname}:${h.port}` : null
        }
        return { turn: uri(false), turns: uri(true) }
      })
      .once()) ?? { turn: null, turns: null }
  )
}

/**
 * A service on THIS server never needs this: it declares Coturn as a dependency
 * and reads the secret straight off the mounted volume. `mountDependency` is
 * local-only, though, so a consumer on another server — or one that is not a
 * StartOS package at all — has no path to the secret without it.
 */
export const showSecret = sdk.Action.withoutInput(
  'show-shared-secret',

  async () => ({
    name: i18n('Show Shared Secret'),
    description: i18n(
      'Display the shared secret and addresses for connecting a service running on another server.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Shared Secret'),
    visibility: 'enabled' as const,
  }),

  async ({ effects }) => {
    const secret = await turnSecret.read().once()
    if (!secret) {
      // Seeded on init whenever absent, so reaching here means init has not run
      // yet rather than that the operator has something to fix.
      throw new Error(i18n('The shared secret has not been generated yet.'))
    }
    const uris = await turnUris(effects)

    return {
      version: '1' as const,
      title: i18n('Shared Secret'),
      message: uris.turn
        ? i18n(
            'Enter these in the service you are connecting. It derives its own short-lived credentials from the secret, so never give the secret itself to an end-user app.',
          )
        : i18n(
            'The secret is below, but there is no address to give out yet — add and enable a public domain on the TURN/STUN interface first.',
          ),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Shared Secret'),
            description: null,
            value: secret,
            masked: true,
            copyable: true,
            qr: false,
          },
          ...(uris.turn
            ? [
                {
                  type: 'single' as const,
                  name: i18n('Address'),
                  description: null,
                  value: uris.turn,
                  masked: false,
                  copyable: true,
                  qr: false,
                },
              ]
            : []),
          ...(uris.turns
            ? [
                {
                  type: 'single' as const,
                  name: i18n('Address (TLS)'),
                  description: null,
                  value: uris.turns,
                  masked: false,
                  copyable: true,
                  qr: false,
                },
              ]
            : []),
        ],
      },
    }
  },
)
