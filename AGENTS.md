# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `coturn`.** A single, general-purpose [Coturn](https://github.com/coturn/coturn) TURN/STUN server that other StartOS services (e.g. Jitsi Meet) depend on. No web UI. It requires a public clearnet domain and terminates TLS itself using the StartOS-issued certificate for that domain.
- **Interfaces:** `turn` (3478 UDP+TCP), `turns` (5349 TLS/DTLS), and `turn-relay` (a UDP `bindPortRange` of 49152–49651 for media relay allocations).
- **Auth:** TURN REST API — one `static-auth-secret` generated at install and published on the `main` volume (`store.json` → `TURN_SECRET`) for dependent packages to read.

## Inspecting a running install

To run a command inside the service's container (read the generated `turnserver.conf`, grep coturn logs), use `start-cli package attach coturn -n coturn-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `coturn-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
