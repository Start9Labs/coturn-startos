import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.19.2:0',
  releaseNotes: {
    en_US: `Updated Coturn to 4.19.2. Fixes a potential server crash when handling UDP authentication challenges.

[Full release notes](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
    es_ES: `Coturn actualizado a 4.19.2. Corrige un posible cierre inesperado del servidor al gestionar desafíos de autenticación UDP.

[Notas de la versión completas](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
    de_DE: `Coturn auf 4.19.2 aktualisiert. Behebt einen möglichen Serverabsturz bei der Verarbeitung von UDP-Authentifizierungsanforderungen.

[Vollständige Versionshinweise](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
    pl_PL: `Zaktualizowano Coturn do wersji 4.19.2. Naprawiono możliwą awarię serwera podczas obsługi wyzwań uwierzytelniania UDP.

[Pełne informacje o wydaniu](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
    fr_FR: `Coturn mis à jour vers 4.19.2. Corrige un risque de plantage du serveur lors du traitement des défis d’authentification UDP.

[Notes de version complètes](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
