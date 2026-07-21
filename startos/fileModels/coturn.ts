import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Generated in setupMain from the enabled public domain, its public IPs, and the
// shared secret. Written to the `main` volume, which the coturn daemon mounts at
// its data directory.
export const turnserverConf = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './turnserver.conf',
})

// The shared TURN REST-API secret, kept in its own `shared/` subdirectory so a
// dependent (e.g. Jitsi) can mount only that subpath read-only — never the
// volume root, which also holds turnserver.conf (the secret in plaintext) and
// the coturn database.
export const turnSecret = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './shared/turn-secret',
})
