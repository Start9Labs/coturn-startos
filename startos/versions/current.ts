import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.17.0:0',
  releaseNotes: {
    en_US: `Updated Coturn to 4.17.0.

- Security: allocation quotas can no longer be bypassed under \`--mobility\`, DTLS no longer allocates per-peer state before the source has proved return routability, and \`EVEN-PORT\` requests with the R bit clear no longer leak relay ports.
- Hardening: challenge nonces are now stateless authenticated cookies by default, so unauthenticated STUN requests are answered without allocating a session.
- Internal: coturn no longer starts DTLS listeners unless asked, so the package drops the now-deprecated \`no-dtls\` setting; log lines also carry ISO-8601 timestamps and occupy exactly one line each.

Full release notes: https://github.com/coturn/coturn/releases/tag/4.17.0`,
    es_ES: `Coturn actualizado a 4.17.0.

- Seguridad: ya no es posible eludir las cuotas de asignación con \`--mobility\`, DTLS deja de reservar estado por par antes de que el origen demuestre la enrutabilidad de retorno, y las solicitudes \`EVEN-PORT\` con el bit R sin activar ya no filtran puertos de retransmisión.
- Refuerzo: los nonces de desafío son ahora, de forma predeterminada, cookies autenticadas sin estado, por lo que las solicitudes STUN no autenticadas se responden sin crear una sesión.
- Interno: coturn ya no inicia escuchas DTLS salvo que se le indique, así que el paquete elimina la opción \`no-dtls\`, ahora obsoleta; además, las líneas de registro incluyen marcas de tiempo ISO-8601 y ocupan exactamente una línea cada una.

Notas de la versión completas: https://github.com/coturn/coturn/releases/tag/4.17.0`,
    de_DE: `Coturn auf 4.17.0 aktualisiert.

- Sicherheit: Zuteilungskontingente lassen sich unter \`--mobility\` nicht mehr umgehen, DTLS reserviert keinen Zustand pro Gegenstelle mehr, bevor die Quelle die Rückroutbarkeit nachgewiesen hat, und \`EVEN-PORT\`-Anfragen mit gelöschtem R-Bit geben keine Relay-Ports mehr preis.
- Härtung: Challenge-Nonces sind jetzt standardmäßig zustandslose authentifizierte Cookies, sodass nicht authentifizierte STUN-Anfragen ohne Anlegen einer Sitzung beantwortet werden.
- Intern: coturn startet DTLS-Listener nur noch auf Anforderung, daher entfällt im Paket die inzwischen veraltete Option \`no-dtls\`; Logzeilen tragen zudem ISO-8601-Zeitstempel und belegen jeweils genau eine Zeile.

Vollständige Versionshinweise: https://github.com/coturn/coturn/releases/tag/4.17.0`,
    pl_PL: `Zaktualizowano Coturn do 4.17.0.

- Bezpieczeństwo: limitów przydziałów nie można już obejść przy użyciu \`--mobility\`, DTLS nie rezerwuje stanu dla każdego peera, zanim źródło potwierdzi routowalność zwrotną, a żądania \`EVEN-PORT\` z wyzerowanym bitem R nie powodują już wycieku portów przekaźnika.
- Wzmocnienia: nonce'y wyzwań są teraz domyślnie bezstanowymi uwierzytelnionymi ciasteczkami, więc nieuwierzytelnione żądania STUN są obsługiwane bez tworzenia sesji.
- Wewnętrzne: coturn uruchamia nasłuch DTLS wyłącznie na żądanie, więc pakiet usuwa przestarzałe już ustawienie \`no-dtls\`; wiersze dziennika zawierają ponadto znaczniki czasu ISO-8601 i zajmują dokładnie jeden wiersz każdy.

Pełne informacje o wydaniu: https://github.com/coturn/coturn/releases/tag/4.17.0`,
    fr_FR: `Coturn mis à jour vers 4.17.0.

- Sécurité : les quotas d'allocation ne peuvent plus être contournés avec \`--mobility\`, DTLS n'alloue plus d'état par pair avant que la source ait prouvé sa routabilité de retour, et les requêtes \`EVEN-PORT\` dont le bit R est à zéro ne fuient plus de ports de relais.
- Renforcement : les nonces de défi sont désormais par défaut des cookies authentifiés sans état, de sorte que les requêtes STUN non authentifiées reçoivent une réponse sans créer de session.
- Interne : coturn ne démarre plus les écouteurs DTLS sauf demande explicite, le paquet supprime donc l'option \`no-dtls\` devenue obsolète ; les lignes de journal portent en outre un horodatage ISO-8601 et occupent exactement une ligne chacune.

Notes de version complètes : https://github.com/coturn/coturn/releases/tag/4.17.0`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
