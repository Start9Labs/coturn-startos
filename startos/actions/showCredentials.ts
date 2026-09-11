import { staticAuth } from '../fileModels/coturn'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { staticListeningPort, staticTurnInterfaceId } from '../utils'
import { turnUris, uriResults } from './turnUris'

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
    const uris = await turnUris(
      effects,
      staticListeningPort,
      staticTurnInterfaceId,
    )

    return {
      version: '1',
      title: i18n('Username & Password'),
      message: uris.turn
        ? i18n(
            'Enter these in the app you are setting up. This password does not expire, so treat it like any other password.',
          )
        : i18n(
            'The password is below, but there is no address to give out yet — add and enable a public domain on the TURN/STUN (Password) interface first.',
          ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: auth.username,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: auth.password,
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
