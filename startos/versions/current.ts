import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.19.1:0',
  releaseNotes: {
    en_US: `Updated Coturn to 4.19.1, a security release. A client can no longer tie up the server's CPU by sending an oversized message over a TCP connection.

[Full release notes](https://github.com/coturn/coturn/releases/tag/4.19.1)`,
    es_ES: `Coturn actualizado a 4.19.1, una versión de seguridad. Un cliente ya no puede acaparar la CPU del servidor enviando un mensaje sobredimensionado por una conexión TCP.

[Notas de la versión completas](https://github.com/coturn/coturn/releases/tag/4.19.1)`,
    de_DE: `Coturn auf 4.19.1 aktualisiert, ein Sicherheitsrelease. Ein Client kann die CPU des Servers nicht mehr durch eine übergroße Nachricht über eine TCP-Verbindung auslasten.

[Vollständige Versionshinweise](https://github.com/coturn/coturn/releases/tag/4.19.1)`,
    pl_PL: `Zaktualizowano Coturn do wersji 4.19.1 z poprawkami bezpieczeństwa. Klient nie może już zablokować procesora serwera, wysyłając zbyt dużą wiadomość przez połączenie TCP.

[Pełne informacje o wydaniu](https://github.com/coturn/coturn/releases/tag/4.19.1)`,
    fr_FR: `Coturn mis à jour vers 4.19.1, une version de sécurité. Un client ne peut plus monopoliser le processeur du serveur en envoyant un message surdimensionné sur une connexion TCP.

[Notes de version complètes](https://github.com/coturn/coturn/releases/tag/4.19.1)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
