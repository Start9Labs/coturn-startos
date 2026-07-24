import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.15.0:0',
  releaseNotes: {
    en_US: `Updated Coturn to 4.15.0.

- Security: STUN attributes after MESSAGE-INTEGRITY are now ignored (GHSA-5538-7cxj-5jcc), plus hardened mobility session resume, ACME handling, and several buffer/overflow fixes.
- New: \`--log-min-level\` log filtering, \`--drain-min-allocations\` shutdown threshold, and RFC 8016 make-before-break mobility handoff.
- Reliability: alignment-safe wire-buffer access, fixed shutdown OpenSSL races, and an alternate-server deadlock.

Full release notes: https://github.com/coturn/coturn/releases/tag/4.15.0`,
    es_ES: `Coturn actualizado a 4.15.0.

- Seguridad: ahora se ignoran los atributos STUN posteriores a MESSAGE-INTEGRITY (GHSA-5538-7cxj-5jcc), además de reforzar la reanudación de sesiones de movilidad, el manejo de ACME y varias correcciones de desbordamiento de búfer.
- Novedades: filtrado de registros con \`--log-min-level\`, umbral de apagado \`--drain-min-allocations\` y transferencia de movilidad make-before-break de RFC 8016.
- Fiabilidad: acceso al búfer con alineación segura, corrección de condiciones de carrera de OpenSSL al apagar y un bloqueo del servidor alternativo.

Notas de la versión completas: https://github.com/coturn/coturn/releases/tag/4.15.0`,
    de_DE: `Coturn auf 4.15.0 aktualisiert.

- Sicherheit: STUN-Attribute nach MESSAGE-INTEGRITY werden nun ignoriert (GHSA-5538-7cxj-5jcc), zusätzlich gehärtete Mobility-Sitzungswiederaufnahme, ACME-Behandlung und mehrere Pufferüberlauf-Korrekturen.
- Neu: Log-Filterung mit \`--log-min-level\`, Herunterfahr-Schwellwert \`--drain-min-allocations\` und RFC-8016 Make-before-break-Mobility-Übergabe.
- Zuverlässigkeit: ausrichtungssicherer Zugriff auf Wire-Puffer, behobene OpenSSL-Races beim Herunterfahren und ein Deadlock beim Alternativ-Server.

Vollständige Versionshinweise: https://github.com/coturn/coturn/releases/tag/4.15.0`,
    pl_PL: `Zaktualizowano Coturn do 4.15.0.

- Bezpieczeństwo: atrybuty STUN po MESSAGE-INTEGRITY są teraz ignorowane (GHSA-5538-7cxj-5jcc), a także wzmocniono wznawianie sesji mobilności, obsługę ACME i kilka poprawek przepełnienia bufora.
- Nowości: filtrowanie dzienników \`--log-min-level\`, próg wyłączania \`--drain-min-allocations\` oraz przekazywanie mobilności make-before-break z RFC 8016.
- Niezawodność: bezpieczny pod względem wyrównania dostęp do bufora, naprawione wyścigi OpenSSL przy wyłączaniu oraz zakleszczenie serwera alternatywnego.

Pełne informacje o wydaniu: https://github.com/coturn/coturn/releases/tag/4.15.0`,
    fr_FR: `Coturn mis à jour vers 4.15.0.

- Sécurité : les attributs STUN situés après MESSAGE-INTEGRITY sont désormais ignorés (GHSA-5538-7cxj-5jcc), avec un renforcement de la reprise de session de mobilité, de la gestion ACME et plusieurs corrections de dépassement de tampon.
- Nouveautés : filtrage des journaux \`--log-min-level\`, seuil d'arrêt \`--drain-min-allocations\` et transfert de mobilité make-before-break RFC 8016.
- Fiabilité : accès aux tampons réseau avec alignement sûr, correction de conditions de concurrence OpenSSL à l'arrêt et d'un interblocage du serveur alternatif.

Notes de version complètes: https://github.com/coturn/coturn/releases/tag/4.15.0`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
