import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.17.2:0',
  releaseNotes: {
    en_US: `Updated Coturn to 4.17.2.

- Fixes an outgoing TTL of 1 on every UDP STUN/TURN response, which stopped replies from travelling past the first router hop.
- Pending data is now flushed before a socket is closed.
- The remainder of the range is build and test-suite work with no effect on the running server.

Full changelog: https://github.com/coturn/coturn/compare/4.17.0...4.17.2`,
    es_ES: `Coturn actualizado a 4.17.2.

- Corrige un TTL de salida de 1 en cada respuesta STUN/TURN por UDP, que impedía que las respuestas pasaran del primer salto de enrutador.
- Los datos pendientes ahora se vacían antes de cerrar un socket.
- El resto del intervalo son cambios de compilación y de las suites de pruebas, sin efecto sobre el servidor en ejecución.

Registro de cambios completo: https://github.com/coturn/coturn/compare/4.17.0...4.17.2`,
    de_DE: `Coturn auf 4.17.2 aktualisiert.

- Behebt eine ausgehende TTL von 1 bei jeder UDP-STUN/TURN-Antwort, wodurch Antworten nicht über den ersten Router-Hop hinauskamen.
- Ausstehende Daten werden jetzt vor dem Schließen eines Sockets geleert.
- Der Rest des Bereichs betrifft Build- und Testsuite-Arbeiten ohne Auswirkung auf den laufenden Server.

Vollständiges Änderungsprotokoll: https://github.com/coturn/coturn/compare/4.17.0...4.17.2`,
    pl_PL: `Zaktualizowano Coturn do 4.17.2.

- Naprawiono wychodzące TTL równe 1 w każdej odpowiedzi STUN/TURN przez UDP, przez które odpowiedzi nie docierały dalej niż do pierwszego routera.
- Oczekujące dane są teraz opróżniane przed zamknięciem gniazda.
- Pozostała część zakresu to prace nad kompilacją i zestawami testów, bez wpływu na działający serwer.

Pełna lista zmian: https://github.com/coturn/coturn/compare/4.17.0...4.17.2`,
    fr_FR: `Coturn mis à jour vers 4.17.2.

- Corrige un TTL sortant de 1 sur chaque réponse STUN/TURN en UDP, qui empêchait les réponses d'aller au-delà du premier saut de routeur.
- Les données en attente sont désormais vidées avant la fermeture d'une socket.
- Le reste de la plage concerne la compilation et les suites de tests, sans effet sur le serveur en fonctionnement.

Journal des modifications complet : https://github.com/coturn/coturn/compare/4.17.0...4.17.2`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
