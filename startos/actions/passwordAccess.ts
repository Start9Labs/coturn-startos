import { staticAuth } from '../fileModels/coturn'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { generateStaticPassword, staticUsername } from '../utils'

export const passwordAccess = sdk.Action.withoutInput(
  'password-access',

  async ({ effects }) => {
    // `.const()`, not `.once()`: action metadata is exported during init, so a
    // non-reactive read would pin this to whatever the state was at install and
    // the action would never change what it offers. `setupInterfaces` already
    // watches the same value, so this costs no extra init pass.
    const enabled = await staticAuth.read((s) => s.enabled).const(effects)
    return {
      name: enabled
        ? i18n('Disable Password Access')
        : i18n('Enable Password Access'),
      description: enabled
        ? i18n(
            'Turn off the second endpoint. Apps set up with its username and password stop relaying.',
          )
        : i18n(
            'Add a second endpoint that apps sign in to with a username and password, for apps that cannot use the shared secret the StartOS services use.',
          ),
      // Only when the click will turn it on — switching it off creates no risk.
      warning: enabled
        ? null
        : i18n(
            'This password does not expire. Anyone who has it can use your server to relay calls until you change it, so only give it to apps you trust.',
          ),
      allowedStatuses: 'any',
      group: i18n('Password Access'),
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const auth = await staticAuth.read().once()
    // The password is generated on the first enable and kept thereafter, so
    // switching off and back on does not lock out every app already set up with
    // it. Rotate Password is the deliberate way to change it.
    await staticAuth.merge(effects, {
      enabled: !auth?.enabled,
      username: staticUsername,
      ...(auth?.password ? {} : { password: generateStaticPassword() }),
    })
  },
)
