# Coturn

Coturn relays nothing until you attach a public (clearnet) domain to it and forward its ports at your router. Both steps are below, and neither can be skipped.

## Documentation

- [Coturn wiki](https://github.com/coturn/coturn/wiki) — the upstream documentation index.
- [`turnserver` reference](https://github.com/coturn/coturn/wiki/turnserver) — the upstream reference for every Coturn setting.

## What you get on StartOS

A shared TURN/STUN relay that other StartOS services — Jitsi Meet, for example — use to connect audio and video calls when participants are behind home routers, mobile carriers, or restrictive firewalls. There is no web interface and nothing to log into; Coturn works in the background for the services that depend on it.

It exposes two interfaces:

- **TURN/STUN** — port `3478` (UDP and TCP) for STUN and plain TURN (`turn:`), plus port `5349` (TCP) for TURN over TLS (`turns:`). StartOS terminates the TLS for you with your domain's certificate.
- **Relay Ports** — the UDP range `42000`–`42499` that relayed audio and video flows through.

A shared secret is generated for you at install, and dependent services read it themselves — there is nothing to copy by hand.

## Getting set up

Until a public domain is attached, Coturn's **TURN Server** health check fails asking for one, and the reachability checks below do not appear yet.

1. Open Coturn's **Interfaces** tab and select the **TURN/STUN** interface.
2. Click **Add Domain**, choose **Public**, and enter a domain you control.
3. For **Certificate Authority**, select **Let's Encrypt**. Browsers reject an untrusted certificate for `turns:` with no way to click through, so a locally issued one will not work.
4. Saving enables the domain on both of that interface's addresses — `turn:` on `3478` and `turns:` on `5349`.
5. Open the **Relay Ports** interface. It receives your domain automatically, but its public IPv4 address is **disabled by default** — switch it on yourself, or relayed calls fail.
6. Forward these ports from your router to your StartOS server:
   - **3478** — TCP and UDP
   - **5349** — TCP
   - **42000–42499** — UDP

   StartOS lists every forward it expects under **System → Gateways → View port forwards**.

All three addresses have to stay enabled. If one is off, its health check — **TURN/STUN**, **TURN/STUN (TLS)**, or **Relay Ports** — fails and names the exact address to switch on.

## Using Coturn

Coturn is there for other services to use. A service that supports an external TURN server declares Coturn as a dependency and picks up its address and shared secret automatically, once Coturn is running with a public domain. Install and set up Coturn first, then install the service that needs it.

Day to day there is nothing to operate: watch the four health checks on the **Dashboard** tab, and read **Logs** if calls stop connecting.

## Limitations

Coturn has to be reachable from the public internet by arbitrary peers, so it cannot run over Tor or on your LAN alone. A public domain and open router ports are required.
