<p align="center">
  <img src="icon.svg" alt="Coturn Logo" width="21%">
</p>

# Coturn on StartOS

> Everything not listed in this document should behave the same as upstream
> Coturn. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Coturn](https://github.com/coturn/coturn) is a STUN and TURN server, used to relay media for services that cannot connect peer-to-peer. This package generates the entire `turnserver.conf` from the addresses StartOS has published rather than exposing it for editing, and keeps the shared secret somewhere a dependent service can mount without seeing anything else. A second, optional listener serves clients that can only be handed a fixed username and password.

- **Upstream repo:** <https://github.com/coturn/coturn>
- **Wrapper repo:** <https://github.com/Start9Labs/coturn-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The upstream image is used unmodified, and one subcontainer runs the service.

| Property      | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| Image         | `coturn/coturn`                                                        |
| Architectures | x86_64, aarch64                                                        |
| Command       | `turnserver -c <config>`, run as `nobody`                              |
| Subcontainer  | `coturn-sub` — both `turnserver` processes, and the one to `attach` to |

A `chown` oneshot runs as root before the daemons to hand the data directory to `nobody`, since they are unprivileged.

| Daemon          | Present                          | Serves                                          |
| --------------- | -------------------------------- | ----------------------------------------------- |
| `coturn`        | always                           | The REST-API shared-secret endpoint             |
| `coturn-static` | only while Password Access is on | The fixed-credential endpoint, on its own ports |

**They are two processes because coturn's authentication mode is per-process.** `use-auth-secret` overrides username/password authentication, and coturn raises a configuration alert if both are set — so one turnserver cannot serve both schemes, however many listeners it binds. Each has its own config, database, pidfile and relay range; they share only the subcontainer and the volume.

## Volume and Data Layout

One volume, and the layout inside it is load-bearing.

| Volume | Mount Point       | Purpose                                                                  |
| ------ | ----------------- | ------------------------------------------------------------------------ |
| `main` | `/var/lib/coturn` | Both configs and databases, `static-auth.json`, and `shared/turn-secret` |

**The shared secret lives in its own `shared/` subdirectory deliberately.** A dependent service — Jitsi, for instance — needs the TURN REST-API secret and nothing else, and a subdirectory is the unit a dependency mount can be scoped to. Mounting the volume root instead would also hand over `turnserver.conf`, which contains the same secret in plaintext, and the coturn database.

**Nothing else belongs in `shared/`.** The second listener's credential lives at the volume root in `static-auth.json`, not there: no dependent consumes it — it is copied into a client by hand — so putting it beside the REST secret would only widen what a dependency mount exposes.

## File Models

Four models. Three are plain strings and none of them is meant to be edited; the fourth is this package's own state.

| File                     | Format | Modelled                  | Written by                              |
| ------------------------ | ------ | ------------------------- | --------------------------------------- |
| `turnserver.conf`        | text   | Yes — `FileHelper.string` | `main`, on every start                  |
| `turnserver-static.conf` | text   | Yes — `FileHelper.string` | `main`, while the second listener is on |
| `shared/turn-secret`     | text   | Yes — `FileHelper.string` | Init, only when it is missing           |
| `static-auth.json`       | JSON   | Yes — `FileHelper.json`   | The Password Access action              |

**`turnserver.conf` is generated in full, not merged.** Every start renders the whole file from three inputs — the realm, the public IPv4 addresses, and the secret — and overwrites what was there. A hand edit does not survive a restart, and there is no configuration action: everything upstream would let you tune is fixed by this package.

What it fixes, and why each differs from simply leaving coturn to its defaults:

| Setting                                 | Value                                       | Reason                                                                                |
| --------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `realm`, `server-name`                  | The public domain added to the interface    | Derived; coturn cannot serve without a realm                                          |
| `external-ip`                           | Each published public IPv4                  | Derived, so relayed candidates carry the address clients can reach                    |
| `use-auth-secret`, `static-auth-secret` | The generated secret                        | Ephemeral REST-API credentials rather than stored user accounts                       |
| `no-tls`                                | set                                         | StartOS terminates TLS at the edge — see [Interfaces](#network-access-and-interfaces) |
| `min-port`, `max-port`                  | The published relay range                   | Must match the range StartOS forwards                                                 |
| `no-multicast-peers`, `denied-peer-ip`  | Multicast plus every special-use IPv4 block | Prevents a client from pivoting into the LAN or the container network                 |
| `fingerprint`                           | set                                         | Required by WebRTC clients                                                            |

The denied-peer list is the security-relevant one: anyone holding valid ephemeral credentials can ask a TURN server to relay to an arbitrary address, so private and special-use ranges are refused explicitly. Recent coturn already refuses loopback, link-local, and IPv6 unique-local addresses on its own; the RFC1918 and other special-use IPv4 blocks are not covered by that default and are listed here.

**`shared/turn-secret`** is generated once, and only when absent. Seeding on absence rather than only at install means a lost secret is regenerated rather than leaving the service permanently unable to authenticate anyone; on a restore the secret arrives from the backup and is left alone.

**`turnserver-static.conf`** is generated the same way and from the same realm and public IPs, differing only in what it authenticates against and where it listens:

| Setting                     | Value                                    | Reason                                                                       |
| --------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| `lt-cred-mech`, `user`      | The one account in `static-auth.json`    | The whole point — a fixed credential a client can be handed                  |
| `listening-port`            | 3578, with 5449 for `turns:`             | The first listener's ports plus 100, since both run in one network namespace |
| `min-port`, `max-port`      | 42500–42999                              | The next relay block above the first listener's, still clear of 49152+       |
| `userdb`                    | `turndb-static`                          | Two turnserver processes on one volume must not share a database             |
| `user-quota`, `total-quota` | 12 and 100, coturn's own example figures | This password does not expire, so bound what a leaked one can consume        |

**`static-auth.json`** holds whether that listener runs and the account it serves. The password is generated on the first enable and kept across a disable, so switching the listener off and on again does not invalidate every client already configured with it; **Rotate Password** is the deliberate way to change it.

## Dependencies

None. Coturn is a leaf service: other packages depend on it, not the other way round.

## Network Access and Interfaces

One interface carrying two addresses, plus a port range that carries no interface of its own.

| Interface              | Id                  | Type | Port                    | Present                        |
| ---------------------- | ------------------- | ---- | ----------------------- | ------------------------------ |
| TURN/STUN              | `turn`              | api  | 3478, and 5349 over TLS | always                         |
| Relay Ports            | `turn-relay`        | —    | 42000–42499 (UDP range) | always                         |
| TURN/STUN (Password)   | `turn-static`       | api  | 3578, and 5449 over TLS | only while that listener is on |
| Relay Ports (Password) | `turn-static-relay` | —    | 42500–42999 (UDP range) | only while that listener is on |

**The second listener's bindings are declared only while it is on**, so a server that never turns it on never reserves its 500 relay ports and never shows an interface it has no use for. A binding a pass does not declare is disabled rather than deleted, so switching it back on returns the same external ports, the same domain, and the same per-address choices — verified: a disable/re-enable cycle came back on 3578/5449 with the domain still enabled.

**A domain is attached per binding, not per host.** All four bindings share the `turn` host, but adding a public domain names an internal port, and the second listener's addresses arrive **disabled** — the same way the Relay Ports interface's do. Turning the listener on is therefore not enough on its own; its domain has to be added and enabled too, which is what its health check tells you.

**Both `turn:` and `turns:` ride one binding.** StartOS terminates the client's TLS at the edge with the domain's certificate — publicly trusted when Let's Encrypt is selected — and forwards plaintext to coturn, which is why coturn is configured with `no-tls` and serves no TLS or DTLS of its own. Consumers choose between the two by scheme; the interface overrides its scheme to `turn` or `turns` accordingly.

**The relay range is a range binding, not an interface.** It is published as a contiguous block of 500 UDP ports which must be forwarded as a block, and it deliberately sits below the ephemeral pool StartOS assigns from, so the atomic range bind cannot collide with a randomly-assigned external port.

**A public domain is required, not optional.** Coturn has no realm without one and cannot serve at all — see [Health Checks](#health-checks) for how that state is reported.

## Installation and First-Run Flow

Install generates the shared secret and nothing else. No task is raised, and no credential is shown — the secret is for dependent services, not for you. The second listener is off, and generates its credential the first time you turn it on.

The service then starts in one of two states, and the difference is visible on the service page rather than buried:

- **No public domain added yet.** Coturn cannot be configured without a realm, so the daemon starts idle and its single health check **fails** with instructions to add a public domain to one of the two interfaces. Nothing is broken; the server simply has nothing to serve.
- **A domain is present.** The config is rendered, `turnserver` starts, and three further checks appear reporting whether each required address is actually enabled.

Adding the domain is enough to move between them — the package notices and restarts itself. Note that the realm is taken from any public domain **added** to the interface, not only from an enabled one, so coturn comes up even when the domain has been added but not yet switched on for this interface; the per-address checks then name exactly what to enable.

## Actions

Three, all concerning the second listener. Everything the first one needs is derived from the addresses StartOS has published, so there is nothing to configure about it.

All three sit in a **Password Access** group, and the two below it are disabled — with the reason shown — until the endpoint is switched on.

### Enable Password Access / Disable Password Access

One button, whose name says what pressing it will do; it reads the current state, so there is no form and no toggle to interpret.

- **What it changes:** `static-auth.json`; through it the password endpoint's interfaces, its config, and its daemon. Generates the password on the first enable.
- **Cost:** seconds, then a restart. Enabling also claims a second external port pair and a second 500-port relay range, both of which need forwarding.
- **Repeat safety:** the password is not regenerated on a re-enable, so apps already set up with it keep working.
- **Carries a warning only when it will enable**, since switching the endpoint off creates no risk.

### Show Username & Password

Displays the credential and the `turn:`/`turns:` addresses to enter into the app being configured. Disabled, with an explanation, until the listener is turned on. The addresses are absent until a public domain is attached — the credential is still shown, with a note saying so.

### Rotate Password

Replaces the password and shows the new one. Disabled until the listener is turned on, and carries a warning: every app configured with the old password stops relaying until it is updated. `main` reads the credential reactively, so the listener restarts on the new password with no further prompt.

## Tasks

None. This package raises no tasks, so the service is never held on a prompt and its ordinary controls are always available.

## Health Checks

One check always, and three more once a realm exists. All four are about reachability rather than process health, because a TURN server that is running but unreachable is useless in a way nothing else would report.

| Check                 | Displayed                | Reports                                                                           | Present                   |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------- | ------------------------- |
| `coturn`              | "TURN Server"            | That the listening port is open — or, with no realm, a failure naming what to add | always                    |
| `turn-address`        | "TURN/STUN"              | Whether the plain `turn:` address is enabled                                      | once a realm exists       |
| `turns-address`       | "TURN/STUN (TLS)"        | Whether the `turns:` address is enabled                                           | once a realm exists       |
| `relay-ports`         | "Relay Ports"            | Whether the relay range is enabled and forwarded as a block                       | once a realm exists       |
| `coturn-static`       | "TURN Server (Password)" | That the second listener's port is open                                           | while that listener is on |
| `turn-static-address` | "TURN/STUN (Password)"   | Whether its address is enabled **and** its relay range forwarded                  | while that listener is on |

The second listener gets one exposure check rather than the first's pair, because neither half is any use without the other — a relayed call needs an address to reach and a range to relay through — and the failure message names whichever is missing.

**Each failing check names the exact address to enable**, rather than reporting a generic fault, and they poll every five seconds while failing instead of the usual thirty — so enabling an address turns the check green promptly.

**A failure here does not mean the daemon is unhealthy.** Three of the four report configuration that the operator has not finished, and the fourth reports the same thing when no domain exists at all. Enabling and disabling an address updates these checks without restarting `turnserver`; only a change to the realm or the public IPs does that, since only those change the generated config.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. No dump step and nothing excluded.

- **Included:** the shared secret, both generated configs, both databases, and `static-auth.json` — so the second listener comes back on if it was on, with the same username and password.
- **Restore:** the secret comes back, so dependent services keep working without re-pairing, and hand-configured clients keep working without being re-entered. Both configs are regenerated from the restored server's own addresses on the first start, so a restore onto a server with a different domain adopts the new one rather than carrying the old.

## Limitations and Differences

1. **`turnserver.conf` is not configurable.** It is regenerated in full on every start; there is no action and no hand edit that survives.
2. **Coturn serves no TLS of its own.** TLS is terminated at the edge by StartOS, so certificate management is the platform's, not coturn's.
3. **A public domain is required** before the service can do anything.
4. **Relaying to private and special-use address ranges is refused**, so a TURN client cannot reach the LAN or other containers through it.
5. **The relay range is fixed** at 500 UDP ports from a fixed start, chosen to sit clear of the ephemeral port pool.
6. **The two authentication schemes cannot be combined on one endpoint.** coturn's mode is per-process, so the fixed-credential listener is a second process on its own ports rather than an option on the first. A client speaks to one or the other.
7. **The password does not expire.** Anything holding it can relay until it is rotated, where the shared secret's credentials time out on their own. The denied-peer list applies to both endpoints, so neither can reach the LAN, and the password endpoint caps concurrent relays per account and in total.
8. **One account, and its username is fixed.** There is no per-client credential and no way to revoke one client without rotating for all of them.
9. **Turning the second listener on doubles what must be forwarded** — a second port pair and a second 500-port UDP range.
10. **No riscv64 build.** x86_64 and aarch64 only.

---

## Quick Reference for AI Consumers

```yaml
package_id: coturn
image: coturn/coturn
architectures:
  - x86_64
  - aarch64
daemons:
  - coturn # always
  - coturn-static # only while the second listener is on
subcontainers:
  - coturn-sub
volumes:
  main: /var/lib/coturn
file_models:
  - turnserver.conf # generated in full on every start
  - turnserver-static.conf # ditto, while the second listener is on
  - shared/turn-secret # scoped subdirectory a dependent can mount read-only
  - static-auth.json # second listener's on/off state and its one account
startos_managed_env_vars: []
dependencies: []
interfaces:
  turn: { type: api, port: 3478 } # 5349 for turns:, terminated at the edge
  turn-relay: { type: api, port: 42000 } # UDP range binding, 500 ports, no interface
  turn-static: { type: api, port: 3578 } # 5449 for turns:; only while enabled
  turn-static-relay: { type: api, port: 42500 } # UDP range, 500 ports; only while enabled
actions:
  - password-access # "Enable/Disable Password Access"; group "Password Access"
  - show-credentials # same group; disabled until password access is on
  - rotate-password # same group; disabled until password access is on
tasks: []
health_checks:
  - coturn # displayed "TURN Server"
  - turn-address # displayed "TURN/STUN"; only once a realm exists
  - turns-address # displayed "TURN/STUN (TLS)"; only once a realm exists
  - relay-ports # displayed "Relay Ports"; only once a realm exists
  - coturn-static # only while the second listener is on
  - turn-static-address # only while the second listener is on
```
