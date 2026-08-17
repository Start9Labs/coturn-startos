import { staticAuth } from '../fileModels/coturn'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { generateStaticPassword } from '../utils'

export const rotatePassword = sdk.Action.withoutInput(
  'rotate-password',

  async ({ effects }) => ({
    name: i18n('Rotate Password'),
    description: i18n('Generate a new password for password access.'),
    warning: i18n(
      'Every app set up with the old password stops relaying until you enter the new one.',
    ),
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
    const password = generateStaticPassword()
    // `main` reads this reactively, so the endpoint's config is regenerated and
    // turnserver restarted on the new password without a further prompt.
    await staticAuth.merge(effects, { password })

    return {
      version: '1' as const,
      title: i18n('Password Rotated'),
      message: i18n(
        'The new password is below. Enter it in every app set up with the old one.',
      ),
      result: {
        type: 'single' as const,
        name: i18n('Password'),
        description: null,
        value: password,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
