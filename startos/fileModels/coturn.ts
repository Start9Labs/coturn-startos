import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Generated in setupMain from the enabled public domain, its StartOS-managed
// certificate, and the shared secret. Written to the `main` volume, which the
// coturn daemon mounts at its data directory.
export const turnserverConf = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './turnserver.conf',
})

export const certFile = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './cert.pem',
})

export const keyFile = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './pkey.pem',
})
