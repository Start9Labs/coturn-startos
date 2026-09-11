import { turnSecret } from '../fileModels/coturn'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { generateSecret } from '../utils'

/**
 * Replaces the secret in place. `main` reads it with `.const()`, so the write
 * alone regenerates both configs and restarts turnserver — and drops every
 * call being relayed at the time.
 *
 * Dependents are NOT notified. A service on this server reads the secret off
 * the mounted volume once, when it starts, so it keeps presenting the old one
 * until it is restarted; a service on another server keeps it until someone
 * enters the new one. The warning says both, because nothing here can do
 * either on the operator's behalf.
 */
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
    visibility: 'enabled' as const,
  }),

  async ({ effects }) => {
    const secret = generateSecret()
    await turnSecret.write(effects, secret)

    return {
      version: '1' as const,
      title: i18n('Shared Secret Rotated'),
      message: i18n(
        'The new secret is below. Restart every service on this server that uses Coturn, and enter it in every service on another server.',
      ),
      result: {
        type: 'single' as const,
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
