# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **Don't `retire()` the static listener's bindings.** Leaving them undeclared while it is off disables rather than deletes them, which is what keeps the user's domain and per-address choices across a disable/re-enable.
- **Action metadata that depends on state must read it with `.const(effects)`, never `.once()`.** Metadata is exported by an init script, so a non-reactive read pins it to whatever the state was at install; `tsc` cannot catch this.
- **An input goes in `main`'s `.const()` only if the rendered config depends on it.** Anything the health checks alone read is watched with `.onChange` into a local, so a toggle does not restart `turnserver`.
- **Never render a TURN address with `addressInfo.toUrl`.** It produces `scheme://host:port`; a TURN URI has no authority component (RFC 7065) and must be `turn:host:port`, so build it from the hostname and port. The health-check messages use `toUrl` deliberately — they name an address for the user to find in the StartOS UI, which renders that form.
- **Test with coturn's own client from inside the container:** `start-cli package attach coturn -n coturn-sub -- sh -c 'S=$(grep -m1 "^static-auth-secret=" /var/lib/coturn/turnserver.conf | cut -d= -f2); turnutils_uclient -t -c -y -n 1 -p 3478 -W "$S" 127.0.0.1'`. Under `-y` the channel bind must succeed; `channel bind: error 403` means `denied-peer-ip` is refusing the container's own address, so `allowed-peer-ip` has gone missing. `Cannot complete Allocation` is a failed login. If you run the client from the image with `docker run` instead, pass `--entrypoint turnutils_uclient` — the upstream entrypoint evals its arguments and the client ends up dialing localhost.
