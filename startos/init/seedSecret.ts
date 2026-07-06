import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { generateSecret } from '../utils'

export const seedSecret = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await storeJson.write(effects, { TURN_SECRET: generateSecret() })
  }
})
