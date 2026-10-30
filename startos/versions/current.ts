import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.0:4',
  releaseNotes: {
    en_US:
      'Clarifies what the address health checks confirm: that an endpoint is published, not that traffic reaches it.',
    es_ES:
      'Aclara lo que confirman las comprobaciones de estado de las direcciones: que un punto de acceso está publicado, no que el tráfico llegue a él.',
    de_DE:
      'Stellt klar, was die Adress-Integritätsprüfungen bestätigen: dass ein Endpunkt veröffentlicht ist, nicht dass Datenverkehr ihn erreicht.',
    pl_PL:
      'Wyjaśnia, co potwierdzają kontrole stanu adresów: że punkt końcowy jest opublikowany, a nie że dociera do niego ruch.',
    fr_FR:
      "Précise ce que confirment les vérifications d'état des adresses : qu'un point de terminaison est publié, et non que le trafic l'atteint.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
