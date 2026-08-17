# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **The shared secret must stay in its own `shared/` subdirectory.** It exists so a dependent can mount that subpath alone; the volume root also holds `turnserver.conf` (the same secret in plaintext) and coturn's database. Don't move it, and don't let anything else land in `shared/`.
- **Only the realm and the public IPs belong in `main`'s `.const()`.** Per-address enable/disable feeds the health checks and is watched with `.onChange` into a local instead — capturing it in the `.const()` would restart `turnserver` on every toggle. If you add an input that the rendered config depends on, it goes in the `.const()`; anything the checks alone read does not.
- **The realm is read from `addresses.available`, not from the enabled set**, so coturn still comes up when a domain has been added but not yet enabled on this interface. The per-address checks are what tell the operator to enable it.
- **`no-tls` is deliberate** — StartOS terminates the client's TLS at the edge and forwards plaintext, so coturn must not run a TLS listener of its own. Adding one would need the certificate this package does not have.
- **`denied-peer-ip` covers what coturn's defaults do not.** Recent releases deny loopback, link-local, and IPv6 ULA on their own; RFC1918 and the other special-use IPv4 blocks are listed explicitly because they are not. Don't trim the list on the assumption upstream handles it.
