import { FileHelper, IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'node:fs/promises'
import { turnSecret } from '../fileModels/coturn'
import { sdk } from '../sdk'

export const v_4_18_0_6 = VersionInfo.of({
  version: '4.18.0:6',
  releaseNotes: {
    en_US: 'StartOS package improvements; no change to Coturn.',
    es_ES: 'Mejoras del paquete de StartOS; sin cambios en Coturn.',
    de_DE: 'Verbesserungen am StartOS-Paket; keine Änderung an Coturn.',
    pl_PL: 'Ulepszenia pakietu StartOS; bez zmian w Coturn.',
    fr_FR: 'Améliorations du paquet StartOS ; aucun changement pour Coturn.',
  },
  migrations: {
    up: async ({ effects }) => {
      const secret = await FileHelper.string({
        base: sdk.volumes.main,
        subpath: './shared/turn-secret',
      })
        .read()
        .once()
      if (secret != null) await turnSecret.write(effects, secret)
      await rm(sdk.volumes.main.subpath('shared'), {
        recursive: true,
        force: true,
      })
    },
    down: IMPOSSIBLE,
  },
})
