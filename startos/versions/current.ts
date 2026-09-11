import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.0:1',
  releaseNotes: {
    en_US: `New **Show Shared Secret** and **Rotate Shared Secret** actions, for connecting a service that runs on another server. Rotating restarts Coturn; services on this server keep the old secret until you restart them, and services on other servers need the new one entered.

Two clients that both relay through this server can now reach each other. Your LAN and your other services stay blocked.`,
    es_ES: `Nuevas acciones **Mostrar el secreto compartido** y **Rotar el secreto compartido**, para conectar un servicio que se ejecuta en otro servidor. Rotarlo reinicia Coturn; los servicios de este servidor conservan el secreto anterior hasta que los reinicies, y en los de otros servidores hay que introducir el nuevo.

Dos clientes que retransmiten ambos a través de este servidor ahora pueden alcanzarse entre sí. Tu red local y tus demás servicios siguen bloqueados.`,
    de_DE: `Neue Aktionen **Gemeinsames Geheimnis anzeigen** und **Gemeinsames Geheimnis rotieren**, um einen Dienst auf einem anderen Server anzubinden. Das Rotieren startet Coturn neu; Dienste auf diesem Server behalten das alte Geheimnis, bis Sie sie neu starten, und in Diensten auf anderen Servern muss das neue eingetragen werden.

Zwei Clients, die beide über diesen Server weiterleiten, können sich jetzt erreichen. Ihr lokales Netzwerk und Ihre übrigen Dienste bleiben gesperrt.`,
    pl_PL: `Nowe akcje **Pokaż współdzielony sekret** i **Zmień współdzielony sekret** do łączenia usługi działającej na innym serwerze. Zmiana sekretu uruchamia Coturn ponownie; usługi na tym serwerze zachowują stary sekret, dopóki ich nie uruchomisz ponownie, a w usługach na innych serwerach trzeba wpisać nowy.

Dwa klienty korzystające oba z przekaźnika na tym serwerze mogą teraz łączyć się ze sobą. Twoja sieć lokalna i pozostałe usługi pozostają zablokowane.`,
    fr_FR: `Nouvelles actions **Afficher le secret partagé** et **Renouveler le secret partagé**, pour connecter un service qui tourne sur un autre serveur. Le renouveler redémarre Coturn ; les services de ce serveur gardent l'ancien secret jusqu'à ce que vous les redémarriez, et il faut saisir le nouveau dans les services d'autres serveurs.

Deux clients qui passent tous deux par le relais de ce serveur peuvent désormais se joindre. Votre réseau local et vos autres services restent bloqués.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
