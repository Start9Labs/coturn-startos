import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.0:0',
  releaseNotes: {
    en_US: `Updated Coturn to 4.18.0.

- Networking: corrected IPv6 relay address advertisement and external IP handling for each address family.
- Reliability and security: fixed worker send-buffer races and relay-port cleanup, and strengthened validation of authentication fields.
- Standards: improved handling of duplicate TURN attributes, attributes after MESSAGE-INTEGRITY, and ChannelBind requests without an allocation.

Full release notes: https://github.com/coturn/coturn/releases/tag/4.18.0`,
    es_ES: `Coturn actualizado a 4.18.0.

- Redes: se corrigió el anuncio de direcciones de retransmisión IPv6 y el manejo de IP externas para cada familia de direcciones.
- Fiabilidad y seguridad: se corrigieron condiciones de carrera en el búfer de envío de los procesos de trabajo y la liberación de puertos de retransmisión, y se reforzó la validación de los campos de autenticación.
- Estándares: se mejoró el manejo de atributos TURN duplicados, atributos posteriores a MESSAGE-INTEGRITY y solicitudes ChannelBind sin asignación.

Notas de la versión completas: https://github.com/coturn/coturn/releases/tag/4.18.0`,
    de_DE: `Coturn auf 4.18.0 aktualisiert.

- Netzwerk: Die Bekanntgabe von IPv6-Relay-Adressen und die Behandlung externer IP-Adressen für jede Adressfamilie wurden korrigiert.
- Zuverlässigkeit und Sicherheit: Race Conditions in den Sendepuffern der Worker und die Freigabe von Relay-Ports wurden behoben sowie die Validierung von Authentifizierungsfeldern verschärft.
- Standards: Die Behandlung doppelter TURN-Attribute, von Attributen nach MESSAGE-INTEGRITY und von ChannelBind-Anfragen ohne Zuteilung wurde verbessert.

Vollständige Versionshinweise: https://github.com/coturn/coturn/releases/tag/4.18.0`,
    pl_PL: `Zaktualizowano Coturn do 4.18.0.

- Sieć: poprawiono ogłaszanie adresów przekaźników IPv6 oraz obsługę zewnętrznych adresów IP dla każdej rodziny adresów.
- Niezawodność i bezpieczeństwo: naprawiono wyścigi w buforach wysyłania procesów roboczych i zwalnianie portów przekaźnika oraz wzmocniono walidację pól uwierzytelniania.
- Standardy: ulepszono obsługę zduplikowanych atrybutów TURN, atrybutów po MESSAGE-INTEGRITY oraz żądań ChannelBind bez przydziału.

Pełne informacje o wydaniu: https://github.com/coturn/coturn/releases/tag/4.18.0`,
    fr_FR: `Coturn mis à jour vers 4.18.0.

- Réseau : correction de l'annonce des adresses de relais IPv6 et de la gestion des adresses IP externes pour chaque famille d'adresses.
- Fiabilité et sécurité : correction de conditions de concurrence dans les tampons d'envoi des workers et de la libération des ports de relais, et renforcement de la validation des champs d'authentification.
- Normes : amélioration de la gestion des attributs TURN dupliqués, des attributs après MESSAGE-INTEGRITY et des requêtes ChannelBind sans allocation.

Notes de version complètes : https://github.com/coturn/coturn/releases/tag/4.18.0`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
