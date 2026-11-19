import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.19.2:0',
  releaseNotes: {
    en_US: `Updated Coturn to 4.19.2, a bugfix release that makes DTLS connections more reliable, including for clients reaching the server over IPv4-mapped IPv6 addresses.

[Full release notes](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
    es_ES: `Coturn actualizado a 4.19.2, una versión de correcciones que hace más fiables las conexiones DTLS, incluidas las de clientes que llegan al servidor mediante direcciones IPv6 con IPv4 mapeada.

[Notas de la versión completas](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
    de_DE: `Coturn auf 4.19.2 aktualisiert, ein Fehlerbehebungsrelease, das DTLS-Verbindungen zuverlässiger macht, auch für Clients, die den Server über IPv4-gemappte IPv6-Adressen erreichen.

[Vollständige Versionshinweise](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
    pl_PL: `Zaktualizowano Coturn do wersji 4.19.2 z poprawkami błędów, które zwiększają niezawodność połączeń DTLS, także dla klientów łączących się z serwerem przez adresy IPv6 mapowane na IPv4.

[Pełne informacje o wydaniu](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
    fr_FR: `Coturn mis à jour vers 4.19.2, une version corrective qui fiabilise les connexions DTLS, y compris pour les clients qui joignent le serveur via des adresses IPv6 mappées IPv4.

[Notes de version complètes](https://github.com/coturn/coturn/releases/tag/4.19.2)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
