import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.16.0:0',
  releaseNotes: {
    en_US: `Updated Coturn to 4.16.0.

- Security: DTLS half-open handshakes are now capped and non-handshake records from unknown sources are dropped, the per-thread peer demultiplexing table is bounded, and a new \`--stateless-nonce\` option bounds memory use under STUN floods.
- Standards: ChannelBind is limited to the RFC 8656 channel range, an Allocate that cannot be satisfied now returns 508, and RFC 3489 handling moved out of \`--stun-backward-compatibility\` into its own deprecated flag.
- Fixes: a null dereference when the \`--prometheus-*\` options were given without a value, and duplicate XOR-PEER-ADDRESS entries in Send are now first-wins.

Full changelog: https://github.com/coturn/coturn/blob/4.16.0/ChangeLog`,
    es_ES: `Coturn actualizado a 4.16.0.

- Seguridad: ahora se limita el número de handshakes DTLS a medio abrir y se descartan los paquetes que no son de handshake procedentes de orígenes desconocidos, se acota la tabla de demultiplexado de pares por hilo y la nueva opción \`--stateless-nonce\` limita el uso de memoria ante avalanchas de STUN.
- Estándares: ChannelBind se restringe al rango de canales de RFC 8656, una solicitud Allocate que no se puede satisfacer devuelve ahora 508 y el manejo de RFC 3489 se ha trasladado de \`--stun-backward-compatibility\` a su propia opción obsoleta.
- Correcciones: una desreferencia nula cuando las opciones \`--prometheus-*\` se indicaban sin valor, y los atributos XOR-PEER-ADDRESS duplicados en Send ahora respetan el primero.

Registro de cambios completo: https://github.com/coturn/coturn/blob/4.16.0/ChangeLog`,
    de_DE: `Coturn auf 4.16.0 aktualisiert.

- Sicherheit: halb offene DTLS-Handshakes werden nun begrenzt und Nicht-Handshake-Pakete von unbekannten Quellen verworfen, die Peer-Demultiplex-Tabelle pro Thread ist begrenzt, und die neue Option \`--stateless-nonce\` begrenzt den Speicherverbrauch bei STUN-Fluten.
- Standards: ChannelBind ist auf den Kanalbereich von RFC 8656 beschränkt, eine nicht erfüllbare Allocate-Anfrage liefert jetzt 508, und die RFC-3489-Behandlung wurde von \`--stun-backward-compatibility\` in eine eigene veraltete Option verschoben.
- Korrekturen: eine Null-Dereferenzierung, wenn die \`--prometheus-*\`-Optionen ohne Wert angegeben wurden, sowie doppelte XOR-PEER-ADDRESS-Einträge in Send, bei denen nun der erste gilt.

Vollständiges Änderungsprotokoll: https://github.com/coturn/coturn/blob/4.16.0/ChangeLog`,
    pl_PL: `Zaktualizowano Coturn do 4.16.0.

- Bezpieczeństwo: liczba na wpół otwartych uzgodnień DTLS jest teraz ograniczona, a pakiety spoza uzgadniania z nieznanych źródeł są odrzucane; tablica demultipleksowania peerów na wątek ma limit, a nowa opcja \`--stateless-nonce\` ogranicza zużycie pamięci podczas zalewu pakietami STUN.
- Standardy: ChannelBind został ograniczony do zakresu kanałów z RFC 8656, niemożliwe do spełnienia żądanie Allocate zwraca teraz 508, a obsługa RFC 3489 została przeniesiona z \`--stun-backward-compatibility\` do osobnej, przestarzałej opcji.
- Poprawki: wyłuskanie wskaźnika NULL, gdy opcje \`--prometheus-*\` podano bez wartości, oraz zduplikowane atrybuty XOR-PEER-ADDRESS w Send — liczy się teraz pierwszy z nich.

Pełna lista zmian: https://github.com/coturn/coturn/blob/4.16.0/ChangeLog`,
    fr_FR: `Coturn mis à jour vers 4.16.0.

- Sécurité : les négociations DTLS à moitié ouvertes sont désormais plafonnées et les paquets hors négociation provenant de sources inconnues sont ignorés, la table de démultiplexage des pairs par thread est bornée, et la nouvelle option \`--stateless-nonce\` limite la consommation mémoire lors de déluges STUN.
- Normes : ChannelBind est limité à la plage de canaux de la RFC 8656, une requête Allocate impossible à satisfaire renvoie maintenant 508, et la prise en charge de la RFC 3489 a été déplacée de \`--stun-backward-compatibility\` vers sa propre option obsolète.
- Corrections : un déréférencement null lorsque les options \`--prometheus-*\` étaient fournies sans valeur, et les attributs XOR-PEER-ADDRESS dupliqués dans Send retiennent désormais le premier.

Journal des modifications complet : https://github.com/coturn/coturn/blob/4.16.0/ChangeLog`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
