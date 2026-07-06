# Coturn

Coturn is a TURN/STUN relay server. On its own it has no web interface — other services (for example **Jitsi Meet**) use it to connect audio and video calls when participants are behind home routers, mobile carriers, or restrictive firewalls.

To be useful, Coturn must be reachable from the public internet. That means two things: a **public domain** and some **router port forwarding**.

## 1. Add and enable a public domain

Coturn will not start relaying until you attach a public (clearnet) domain to it. Until you do, the **Public Domain** health check shows a failure.

1. Make sure you have added a clearnet domain to your StartOS server (**System → Domains**).
2. Open Coturn's **Interfaces** tab.
3. On the **TURN / STUN** interface, add and enable your public domain.

StartOS automatically issues a TLS certificate for that domain, so Coturn can offer encrypted TURN (`turns:`). Once the domain is enabled and the certificate is ready, Coturn starts and the **TURN Server** health check turns green.

## 2. Open the required ports on your router

Coturn needs the following ports forwarded from your router/ISP to your StartOS server so that remote peers can reach it:

- **3478** — TCP and UDP (STUN / TURN)
- **5349** — TCP and UDP (TURN over TLS/DTLS)
- **49152–49651** — UDP (the media relay port range)

If these ports are not open, calls may fail to connect for people outside your network.

## 3. Connect a service to Coturn

Coturn is meant to be used by other StartOS services. A service that supports an external TURN server (such as Jitsi Meet) will depend on Coturn and pick up its address and shared secret automatically once Coturn is installed and running with a public domain — there is nothing to copy by hand.

## What you get

- **A shared TURN/STUN server** for real-time audio and video.
- **Automatic TLS** using your public domain's certificate.
- **No web UI and nothing to log into** — Coturn works in the background for the services that depend on it.

## Limitations

- Coturn must be reachable from the public internet, so a public domain and open router ports are required. It cannot work over Tor or your LAN only.
- Relay capacity is bounded by the 49152–49651 port range (about 500 simultaneous relayed streams), which is plenty for a personal server.
