import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.17.2:1',
  releaseNotes: {
    en_US: `New **Password Access** actions add a second TURN endpoint that apps sign in to with a username and password, for apps you set up by hand — SimpleX, go2rtc and anything else that asks for a TURN username and password rather than a shared secret.

It is off by default and costs nothing until you turn it on: no second endpoint, no second relay range to forward. Coturn's authentication mode is per-process, so this runs as a second listener on its own ports rather than as an option on the existing one — Jitsi, Synapse, Nextcloud and Mattermost keep using the first endpoint, unchanged.

**Show Username & Password** displays what to enter, and **Rotate Password** replaces it. This password does not expire, so the endpoint limits how many relays one account may hold at a time.`,
    es_ES: `Las nuevas acciones de **Acceso con contraseña** añaden un segundo punto de acceso TURN al que las aplicaciones se conectan con usuario y contraseña, para aplicaciones que configuras a mano: SimpleX, go2rtc y cualquier otra que pida un usuario y una contraseña TURN en lugar de un secreto compartido.

Viene desactivado y no cuesta nada hasta que lo actives: ningún segundo punto de acceso, ningún segundo rango de retransmisión que reenviar. El modo de autenticación de Coturn es por proceso, así que esto se ejecuta como un segundo escucha en sus propios puertos y no como una opción del existente: Jitsi, Synapse, Nextcloud y Mattermost siguen usando el primer punto de acceso, sin cambios.

**Mostrar usuario y contraseña** muestra qué introducir, y **Rotar la contraseña** la reemplaza. Esta contraseña no caduca, por lo que el punto de acceso limita cuántas retransmisiones puede mantener a la vez una misma cuenta.`,
    de_DE: `Die neuen Aktionen für den **Passwortzugang** ergänzen einen zweiten TURN-Endpunkt, an dem sich Anwendungen mit Benutzername und Passwort anmelden — für Anwendungen, die Sie von Hand einrichten: SimpleX, go2rtc und alles andere, das nach TURN-Benutzername und -Passwort statt nach einem gemeinsamen Geheimnis fragt.

Er ist standardmäßig aus und kostet nichts, bis Sie ihn einschalten: kein zweiter Endpunkt, kein zweiter weiterzuleitender Relay-Bereich. Coturns Authentifizierungsmodus gilt pro Prozess, daher läuft dies als zweiter Listener auf eigenen Ports und nicht als Option des bestehenden — Jitsi, Synapse, Nextcloud und Mattermost nutzen weiterhin unverändert den ersten Endpunkt.

**Benutzername & Passwort anzeigen** zeigt, was einzutragen ist, **Passwort rotieren** ersetzt es. Dieses Passwort läuft nicht ab, weshalb der Endpunkt begrenzt, wie viele Relays ein Konto gleichzeitig halten darf.`,
    pl_PL: `Nowe akcje **Dostępu hasłem** dodają drugi punkt końcowy TURN, do którego aplikacje logują się nazwą użytkownika i hasłem — dla aplikacji konfigurowanych ręcznie: SimpleX, go2rtc i wszystkiego innego, co prosi o nazwę użytkownika i hasło TURN zamiast współdzielonego sekretu.

Domyślnie jest wyłączony i nic nie kosztuje, dopóki go nie włączysz: żadnego drugiego punktu końcowego ani drugiego zakresu przekaźnika do przekierowania. Tryb uwierzytelniania Coturn działa na poziomie procesu, więc jest to drugi nasłuch na własnych portach, a nie opcja istniejącego — Jitsi, Synapse, Nextcloud i Mattermost bez zmian korzystają z pierwszego punktu końcowego.

**Pokaż nazwę użytkownika i hasło** wyświetla, co wpisać, a **Zmień hasło** je zastępuje. To hasło nie wygasa, dlatego punkt końcowy ogranicza liczbę przekazów utrzymywanych jednocześnie przez jedno konto.`,
    fr_FR: `Les nouvelles actions d'**Accès par mot de passe** ajoutent un second point de terminaison TURN auquel les applications se connectent avec un identifiant et un mot de passe, pour les applications que vous configurez à la main : SimpleX, go2rtc et tout ce qui demande un identifiant et un mot de passe TURN plutôt qu'un secret partagé.

Il est désactivé par défaut et ne coûte rien tant que vous ne l'activez pas : pas de second point de terminaison, pas de seconde plage de relais à rediriger. Le mode d'authentification de Coturn s'applique par processus ; il s'agit donc d'un second écouteur sur ses propres ports et non d'une option de l'existant — Jitsi, Synapse, Nextcloud et Mattermost continuent d'utiliser le premier point de terminaison, sans changement.

**Afficher l'identifiant et le mot de passe** montre ce qu'il faut saisir, et **Renouveler le mot de passe** le remplace. Ce mot de passe n'expire pas : le point de terminaison limite donc le nombre de relais qu'un même compte peut détenir simultanément.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
