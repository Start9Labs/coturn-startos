import { turnSecret } from '../fileModels/coturn'
import { sdk } from '../sdk'
import { generateSecret } from '../utils'

export const seedSecret = sdk.setupOnInit(async (effects) => {
  // Generate the shared TURN REST-API secret if it is missing. Seeding on
  // absence (rather than only on install) also re-creates it if it is ever
  // lost, which would otherwise strand the service with no way to recover.
  // On restore the secret arrives from the backup, so this leaves it untouched.
  if ((await turnSecret.read().once()) == null) {
    await turnSecret.write(effects, generateSecret())
  }
})
