import { T } from '@start9labs/start-sdk'
import { staticAuth } from '../fileModels/coturn'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  staticListeningPort,
  staticTurnInterfaceId,
  turnHostId,
} from '../utils'

/**
 * The plain and TLS addresses of the password endpoint, as the URIs a client
 * asks for. Empty until a public domain is added and enabled on the interface —
 * an address that is not enabled is not reachable, so there is nothing to hand
 * out yet.
 *
 * Built by hand rather than with `addressInfo.toUrl`, which renders the
 * `scheme://host:port` form an HTTP address takes. A TURN URI has no authority
 * component (RFC 7065): it is `turn:host:port`, and the `//` form is rejected
 * by the clients this endpoint exists to serve.
 */
async function staticUris(effects: T.Effects) {
  return (
    (await sdk.host
      .getOwn(effects, turnHostId, (host) => {
        const hostnames =
          host?.bindings[staticListeningPort]?.interfaces[
            staticTurnInterfaceId
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

export const showCredentials = sdk.Action.withoutInput(
  'show-credentials',

  async ({ effects }) => ({
    name: i18n('Show Username & Password'),
    description: i18n(
      'Display the username, password, and addresses to enter into the app you are setting up.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Password Access'),
    // See passwordAccess: metadata is exported during init, so this read has to
    // be reactive or the action never leaves its disabled state.
    visibility: (await staticAuth.read((s) => s.enabled).const(effects))
      ? 'enabled'
      : {
          disabled: i18n(
            'Turn on Password Access first — there is no password until you do.',
          ),
        },
  }),

  async ({ effects }) => {
    const auth = await staticAuth.read().once()
    if (!auth?.password) {
      throw new Error(
        i18n(
          'Turn on Password Access first — there is no password until you do.',
        ),
      )
    }
    const uris = await staticUris(effects)

    return {
      version: '1' as const,
      title: i18n('Username & Password'),
      message: uris.turn
        ? i18n(
            'Enter these in the app you are setting up. This password does not expire, so treat it like any other password.',
          )
        : i18n(
            'The password is below, but there is no address to give out yet — add and enable a public domain on the TURN/STUN (Password) interface first.',
          ),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Username'),
            description: null,
            value: auth.username,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Password'),
            description: null,
            value: auth.password,
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
