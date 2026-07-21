import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.14.0:0',
  releaseNotes: {
    en_US: 'Initial release of Coturn for StartOS.',
    es_ES: 'Versión inicial de Coturn para StartOS.',
    de_DE: 'Erste Veröffentlichung von Coturn für StartOS.',
    pl_PL: 'Pierwsze wydanie Coturn dla StartOS.',
    fr_FR: 'Version initiale de Coturn pour StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
