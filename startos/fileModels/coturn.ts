import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Generated in setupMain from the enabled public domain, its public IPs, and the
// shared secret. Written to the `main` volume, which the coturn daemon mounts at
// its data directory.
export const turnserverConf = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './turnserver.conf',
})

// The shared TURN REST-API secret; dependents mount the `public` volume read-only to read it.
export const turnSecret = FileHelper.string({
  base: sdk.volumes.public,
  subpath: './turn-secret',
})

// Whether the second, username-and-password listener runs, and the account it serves.
export const staticAuth = FileHelper.json(
  { base: sdk.volumes.main, subpath: './static-auth.json' },
  z.looseObject({
    enabled: z.boolean().catch(false).default(false),
    username: z.string().catch('').default(''),
    password: z.string().catch('').default(''),
  }),
)

// Generated in setupMain alongside turnserver.conf, from the same realm and
// public IPs, whenever the second listener is switched on.
export const staticTurnserverConf = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './turnserver-static.conf',
})
