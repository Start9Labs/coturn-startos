import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.0:1',
  releaseNotes: {
    en_US: `When both people on a call relayed through this server — the fallback two people behind restrictive routers depend on — the relay never came up, and the call fell back to a worse path or cut out. Coturn was refusing to relay to its own address, which the block on private address ranges covered.

That one address is now allowed explicitly. Your LAN and your other services stay blocked, as before.`,
    es_ES: `Cuando las dos personas de una llamada retransmitían a través de este servidor —la alternativa de la que dependen dos personas tras routers restrictivos—, la retransmisión nunca llegaba a establecerse y la llamada pasaba a una ruta peor o se cortaba. Coturn se negaba a retransmitir hacia su propia dirección, incluida en el bloqueo de rangos de direcciones privadas.

Esa única dirección ahora se permite de forma explícita. Tu red local y tus demás servicios siguen bloqueados, como antes.`,
    de_DE: `Wenn beide Teilnehmer eines Anrufs über diesen Server weitergeleitet wurden — der Rückfallweg, auf den zwei Personen hinter restriktiven Routern angewiesen sind —, kam die Weiterleitung nie zustande, und der Anruf wich auf einen schlechteren Pfad aus oder brach ab. Coturn verweigerte die Weiterleitung an die eigene Adresse, die von der Sperre privater Adressbereiche erfasst war.

Diese eine Adresse ist jetzt ausdrücklich erlaubt. Ihr lokales Netzwerk und Ihre übrigen Dienste bleiben wie bisher gesperrt.`,
    pl_PL: `Gdy obie osoby w połączeniu korzystały z przekaźnika na tym serwerze — rezerwowej drogi, od której zależą dwie osoby za restrykcyjnymi routerami — przekaźnik nigdy nie dochodził do skutku, a połączenie przechodziło na gorszą trasę albo się urywało. Coturn odmawiał przekazywania na własny adres, objęty blokadą prywatnych zakresów adresów.

Ten jeden adres jest teraz wyraźnie dozwolony. Twoja sieć lokalna i pozostałe usługi pozostają zablokowane, tak jak dotąd.`,
    fr_FR: `Lorsque les deux participants d'un appel passaient par le relais de ce serveur — la solution de repli dont dépendent deux personnes derrière des routeurs restrictifs —, le relais ne s'établissait jamais et l'appel basculait vers un chemin de moins bonne qualité ou se coupait. Coturn refusait de relayer vers sa propre adresse, couverte par le blocage des plages d'adresses privées.

Cette seule adresse est désormais autorisée explicitement. Votre réseau local et vos autres services restent bloqués, comme auparavant.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
