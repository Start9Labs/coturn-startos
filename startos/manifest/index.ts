import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'coturn',
  title: 'Coturn',
  license: 'BSD-3-Clause',
  packageRepo: 'https://github.com/Start9Labs/coturn-startos',
  upstreamRepo: 'https://github.com/coturn/coturn',
  marketingUrl: 'https://github.com/coturn/coturn',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    coturn: {
      source: { dockerTag: 'coturn/coturn:4.14.0' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
