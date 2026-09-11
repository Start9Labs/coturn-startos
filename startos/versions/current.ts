import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.0:1',
  releaseNotes: {
    en_US: `Two clients that both relay through this server can now reach each other. Your LAN and your other services stay blocked.`,
    es_ES: `Dos clientes que retransmiten ambos a través de este servidor ahora pueden alcanzarse entre sí. Tu red local y tus demás servicios siguen bloqueados.`,
    de_DE: `Zwei Clients, die beide über diesen Server weiterleiten, können sich jetzt erreichen. Ihr lokales Netzwerk und Ihre übrigen Dienste bleiben gesperrt.`,
    pl_PL: `Dwa klienty korzystające oba z przekaźnika na tym serwerze mogą teraz łączyć się ze sobą. Twoja sieć lokalna i pozostałe usługi pozostają zablokowane.`,
    fr_FR: `Deux clients qui passent tous deux par le relais de ce serveur peuvent désormais se joindre. Votre réseau local et vos autres services restent bloqués.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
