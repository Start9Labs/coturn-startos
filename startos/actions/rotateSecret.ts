import { turnSecret } from '../fileModels/coturn'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { generateSecret } from '../utils'

export const rotateSecret = sdk.Action.withoutInput(
  'rotate-shared-secret',

  async () => ({
    name: i18n('Rotate Shared Secret'),
    description: i18n('Generate a new shared secret.'),
    warning: i18n(
      'Coturn restarts, dropping any call it is relaying. Services on this server keep the old secret until you restart them; services on other servers stop relaying until you enter the new one.',
    ),
    allowedStatuses: 'any',
    group: i18n('Shared Secret'),
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const secret = generateSecret()
    await turnSecret.write(effects, secret)

    return {
      version: '1',
      title: i18n('Shared Secret Rotated'),
      message: i18n(
        'The new secret is below. Restart every service on this server that uses Coturn, and enter it in every service on another server.',
      ),
      result: {
        type: 'single',
        name: i18n('Shared Secret'),
        description: null,
        value: secret,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
