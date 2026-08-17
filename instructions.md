# Coturn

Coturn has no interface of its own — there is nothing to open or log into. To be useful it must be reachable from the public internet by remote peers, which means giving it a **public domain** and forwarding a few **router ports**. This page walks through both, then how a dependent service connects to it.

## Documentation

- [Coturn wiki](https://github.com/coturn/coturn/wiki) — the upstream configuration and operational reference.

## What you get on StartOS

- **A shared TURN/STUN server** for real-time audio and video, usable by any StartOS service that supports an external TURN server.
- **Automatic TLS at the StartOS edge** using your public domain's certificate, so the encrypted `turns:` endpoint presents a publicly trusted certificate that web browsers accept.
- **An optional second endpoint** with a fixed username and password, for apps you configure by hand rather than StartOS services — see [Apps you configure by hand](#apps-you-configure-by-hand).
- **No web UI and nothing to log into** — Coturn works in the background for the services that depend on it.

## Getting set up

Coturn will not relay anything until it has a public domain attached and the right ports reaching it from the internet.

### 1. Add and enable a public domain

Coturn will not start relaying until you attach a public (clearnet) domain to it. Until you do, its **TURN Server** health check fails and asks you to add one; the per-address reachability checks below only appear once a domain exists.

1. Make sure you have added a clearnet domain to your StartOS server (**System → Domains**).
2. Open Coturn's **Interfaces** tab.
3. On the **TURN/STUN** interface, add and enable your public domain. Select **Let's Encrypt** as its certificate provider so that encrypted TURN (`turns:`) presents a publicly trusted certificate — web browsers reject an untrusted one. This enables the public domain on both of that interface's addresses: **`turn:` (3478)** for plain TURN/STUN and **`turns:` (5349)** for TURN over TLS.
4. Open the **Relay Ports** interface and **enable its public IPv4 address.** This interface receives your domain automatically, but its public address is **disabled by default** — you have to turn it on yourself, or the media relay range (42000–42499) is not forwarded and calls that need a relay fail.

Coturn needs all three of those addresses enabled. If any is off, that part of Coturn stops working, and its matching health check — **TURN/STUN**, **TURN/STUN (TLS)**, or **Relay Ports** — fails, naming the exact address to switch on.

StartOS terminates TLS for the `turns:` endpoint at the edge using that domain's certificate. Once the domain and the relay address are enabled, Coturn's health checks turn green.

### 2. Open the required ports on your router

Coturn needs the following ports forwarded from your router/ISP to your StartOS server so that remote peers can reach it:

- **3478** — TCP and UDP (STUN / TURN)
- **5349** — TCP (TURN over TLS)
- **42000–42499** — UDP (the media relay port range)

If these ports are not open, calls may fail to connect for people outside your network.

## Using Coturn

Coturn is meant to be used by other StartOS services. A service that supports an external TURN server — Jitsi Meet, Synapse, Nextcloud Talk, Mattermost Calls — will depend on Coturn and pick up its address and shared secret automatically once Coturn is installed and running with a public domain. There is nothing to copy by hand.

### Apps you configure by hand

Those services all authenticate with Coturn's **shared secret**, from which each mints its own short-lived credentials. Plenty of other software cannot do that and asks instead for a plain TURN **username and password** — the SimpleX Chat app's "WebRTC ICE servers" setting, go2rtc's `ice_servers` (which is what Home Assistant streams camera video through), and many others.

Coturn cannot serve both schemes on one endpoint: the mode is chosen per server process, and the shared secret overrides username-and-password authentication. So this package can run a **second** endpoint alongside the first, on its own ports, for exactly those apps.

To use it:

1. Run **Enable Password Access**. Coturn restarts, and two more interfaces appear.
2. On the new **TURN/STUN (Password)** interface, add and enable your public domain, exactly as in step 1 above.
3. Enable the public IPv4 address on **Relay Ports (Password)**.
4. Forward the new ports on your router: **3578** (TCP and UDP), **5449** (TCP), and **42500–42999** (UDP).
5. Run **Show Username & Password** and enter what it displays into your app.

Leave it off if you have nothing to point at it — while it is off there is no second endpoint and nothing extra to forward.

**This password does not expire.** Anyone who has it can use your server to relay calls until you change it, so only give it to apps you trust. **Rotate Password** replaces it — every app set up with the old one then needs the new one. Relaying to private addresses is refused on both endpoints, so neither can be used to reach your home network.

## Limitations

- Coturn must be reachable from the public internet, so a public domain and open router ports are required. It cannot work over Tor or your LAN only.
- Relay capacity is bounded by the 42000–42499 port range (about 500 simultaneous relayed streams), which is plenty for a personal server. The password endpoint has its own range of the same size.
- The password endpoint has exactly one account, whose username is fixed. You cannot issue a separate credential per app, or revoke one app without rotating for all of them.
