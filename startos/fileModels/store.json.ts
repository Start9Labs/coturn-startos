import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  // Shared TURN REST-API secret. Generated at install and published on the
  // `main` volume for dependent services (e.g. Jitsi) to read.
  TURN_SECRET: z.string(),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
