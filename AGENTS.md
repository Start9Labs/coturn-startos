# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `coturn`.** A single, general-purpose [Coturn](https://github.com/coturn/coturn) TURN/STUN server that other StartOS services (e.g. Jitsi Meet) depend on. No web UI. It requires a public clearnet domain.
- **TLS is edge-terminated, not by coturn.** coturn runs plain (`no-tls`/`no-dtls`). The single `turn` binding is plain `3478` (UDP+TCP) with an `addSsl` TLS listener on `5349`, so StartOS terminates the client's TLS with the domain's certificate — publicly trusted when the user picks Let's Encrypt — and forwards plaintext to coturn. `turns:` is therefore TLS-over-TCP only (no DTLS; browsers don't use it). Do **not** reintroduce `getSslCertificate`/self-terminated TLS — the local-CA cert it returns is not publicly trusted, which browsers reject for `turns:`.
- **Interfaces:** one `turn` interface (its address set carries both the plain `turn:` address and the `ssl:true` `turns:` address), plus `turn-relay` (a UDP `bindPortRange` of 42000–42499 for media relay allocations, kept below StartOS's 49152+ ephemeral pool so the atomic range bind can't collide).
- **Auth:** TURN REST API — one `static-auth-secret` generated at install and published on the `main` volume. It lives at `shared/turn-secret` (a plain-string file in its own subdirectory) so a dependent can mount **only** `subpath: 'shared'` read-only — never the volume root, which also holds `turnserver.conf` (the secret in plaintext) and `turndb`.

## Inspecting a running install

To run a command inside the service's container (read the generated `turnserver.conf`, grep coturn logs), use `start-cli package attach coturn -n coturn-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `coturn-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
