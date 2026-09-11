import { turnSecret } from '../fileModels/coturn'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { listeningPort, turnInterfaceId } from '../utils'
import { turnUris, uriResults } from './turnUris'

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
      throw new Error(i18n('The shared secret has not been generated yet.'))
    }
    const uris = await turnUris(effects, listeningPort, turnInterfaceId)

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
          ...uriResults(uris),
        ],
      },
    }
  },
)
