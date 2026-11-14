import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.19.0:0',
  releaseNotes: {
    en_US: `Updated Coturn to 4.19.0, a bugfix and hardening release.

- Fixes TURN allocation refresh for clients authenticating with OAuth tokens
- Fixes a relayed packet's TTL leaking into the server's own UDP replies
- A transient permission error while sending no longer drops the client's UDP socket
- Hardens message parsing and authentication against malformed input

[Full release notes](https://github.com/coturn/coturn/releases/tag/4.19.0)`,
    es_ES: `Coturn actualizado a 4.19.0, una versión de correcciones y refuerzo de seguridad.

- Corrige la renovación de asignaciones TURN para clientes que se autentican con tokens OAuth
- Corrige que el TTL de un paquete retransmitido se filtrara a las respuestas UDP del propio servidor
- Un error de permisos transitorio al enviar ya no cierra el socket UDP del cliente
- Refuerza el análisis de mensajes y la autenticación frente a entradas malformadas

[Notas de la versión completas](https://github.com/coturn/coturn/releases/tag/4.19.0)`,
    de_DE: `Coturn auf 4.19.0 aktualisiert, ein Fehlerbehebungs- und Härtungsrelease.

- Behebt die Verlängerung von TURN-Allocations für Clients, die sich mit OAuth-Tokens authentifizieren
- Behebt, dass die TTL eines weitergeleiteten Pakets in die eigenen UDP-Antworten des Servers gelangte
- Ein vorübergehender Berechtigungsfehler beim Senden schließt den UDP-Socket des Clients nicht mehr
- Härtet die Nachrichtenverarbeitung und Authentifizierung gegen fehlerhafte Eingaben

[Vollständige Versionshinweise](https://github.com/coturn/coturn/releases/tag/4.19.0)`,
    pl_PL: `Zaktualizowano Coturn do wersji 4.19.0 z poprawkami błędów i wzmocnieniem bezpieczeństwa.

- Naprawia odnawianie alokacji TURN dla klientów uwierzytelniających się tokenami OAuth
- Naprawia przenikanie TTL przekazywanego pakietu do własnych odpowiedzi UDP serwera
- Przejściowy błąd uprawnień podczas wysyłania nie zamyka już gniazda UDP klienta
- Wzmacnia parsowanie wiadomości i uwierzytelnianie wobec nieprawidłowych danych

[Pełne informacje o wydaniu](https://github.com/coturn/coturn/releases/tag/4.19.0)`,
    fr_FR: `Coturn mis à jour vers 4.19.0, une version de corrections et de renforcement.

- Corrige le renouvellement des allocations TURN pour les clients authentifiés par jetons OAuth
- Corrige la fuite du TTL d'un paquet relayé dans les réponses UDP du serveur lui-même
- Une erreur de permission passagère lors d'un envoi ne ferme plus le socket UDP du client
- Renforce l'analyse des messages et l'authentification face aux entrées malformées

[Notes de version complètes](https://github.com/coturn/coturn/releases/tag/4.19.0)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
