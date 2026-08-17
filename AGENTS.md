# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **The shared secret must stay in its own `shared/` subdirectory.** It exists so a dependent can mount that subpath alone; the volume root also holds `turnserver.conf` (the same secret in plaintext) and coturn's database. Don't move it, and don't let anything else land in `shared/` — `static-auth.json` in particular belongs at the volume root, since no dependent consumes it.
- **The two auth schemes are two `turnserver` processes, and that is forced, not a choice.** coturn's authentication mode is per-process: `use-auth-secret` overrides username/password auth, and coturn raises a configuration alert if both are set. Don't try to collapse `coturn-static` into another listener on the `coturn` daemon. The two share the subcontainer and the volume, so they must not share a config, a `userdb`, a pidfile, or a relay range — the static listener's ports are the first's plus 100, and its relay block is the next 500 up.
- **The static listener's bindings are declared only while it is enabled**, which is what keeps its 500 relay ports unreserved on a server that never uses it. `setupInterfaces` disables rather than deletes an undeclared binding, so the user's domain and per-address choices survive a disable/re-enable — don't "fix" this by declaring them unconditionally, and don't `retire()` them.
- **The static password survives a disable, and only Rotate Password replaces it.** Regenerating on every enable would silently break every client already configured with it.
- **Action metadata that depends on state must read it with `.const(effects)`, never `.once()`.** Metadata is exported by an init script, so a non-reactive read pins it to whatever the state was at install: `show-credentials` was permanently `disabled`, and `password-access` would never change between its Enable and Disable names. Caught on the dev box, not by `tsc`. `setupInterfaces` watches the same value, so the reactive read costs no extra init pass.
- **Run `turnutils_uclient` with `--entrypoint`.** The upstream image's `docker-entrypoint.sh` evals its arguments, so the client ends up dialing localhost and reporting `Connection refused` against a server that is fine. In its output, `channel bind: error 403` means authentication and the allocation both succeeded and only the peer was refused by `denied-peer-ip`; a failed login reads `Cannot complete Allocation`.
- **Never render a TURN address with `addressInfo.toUrl`.** It produces the `scheme://host:port` form an HTTP address takes; a TURN URI has no authority component (RFC 7065) and must be `turn:host:port`. The `//` form is rejected by the very clients this listener exists for, so `get-static-credential` builds its URIs from the hostname and port directly. The health-check messages still use `toUrl` deliberately — they name an address for the user to find in the StartOS UI, which renders the same form.
- **Only the realm and the public IPs belong in `main`'s `.const()`.** Per-address enable/disable feeds the health checks and is watched with `.onChange` into a local instead — capturing it in the `.const()` would restart `turnserver` on every toggle. If you add an input that the rendered config depends on, it goes in the `.const()`; anything the checks alone read does not.
- **The realm is read from `addresses.available`, not from the enabled set**, so coturn still comes up when a domain has been added but not yet enabled on this interface. The per-address checks are what tell the operator to enable it.
- **`no-tls` is deliberate** — StartOS terminates the client's TLS at the edge and forwards plaintext, so coturn must not run a TLS listener of its own. Adding one would need the certificate this package does not have.
- **`denied-peer-ip` covers what coturn's defaults do not.** Recent releases deny loopback, link-local, and IPv6 ULA on their own; RFC1918 and the other special-use IPv4 blocks are listed explicitly because they are not. Don't trim the list on the assumption upstream handles it.
