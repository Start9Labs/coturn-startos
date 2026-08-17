<p align="center">
  <img src="icon.svg" alt="Coturn Logo" width="21%">
</p>

# Coturn on StartOS

> Everything not listed in this document should behave the same as upstream
> Coturn. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Coturn](https://github.com/coturn/coturn) is a STUN and TURN server, used to relay media for services that cannot connect peer-to-peer. This package generates the entire `turnserver.conf` from the addresses StartOS has published rather than exposing it for editing, and keeps the shared secret somewhere a dependent service can mount without seeing anything else.

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

| Property      | Value                                                          |
| ------------- | -------------------------------------------------------------- |
| Image         | `coturn/coturn`                                                |
| Architectures | x86_64, aarch64                                                |
| Command       | `turnserver -c <config>`, run as `nobody`                      |
| Subcontainer  | `coturn-sub` — the `coturn` daemon, and the one to `attach` to |

A `chown` oneshot runs as root before the daemon to hand the data directory to `nobody`, since the daemon itself is unprivileged.

## Volume and Data Layout

One volume, and the layout inside it is load-bearing.

| Volume | Mount Point       | Purpose                                                        |
| ------ | ----------------- | -------------------------------------------------------------- |
| `main` | `/var/lib/coturn` | `turnserver.conf`, coturn's database, and `shared/turn-secret` |

**The shared secret lives in its own `shared/` subdirectory deliberately.** A dependent service — Jitsi, for instance — needs the TURN REST-API secret and nothing else, and a subdirectory is the unit a dependency mount can be scoped to. Mounting the volume root instead would also hand over `turnserver.conf`, which contains the same secret in plaintext, and the coturn database.

## File Models

Two models, both plain strings, and neither is meant to be edited.

| File                 | Format | Modelled                  | Written by                    |
| -------------------- | ------ | ------------------------- | ----------------------------- |
| `turnserver.conf`    | text   | Yes — `FileHelper.string` | `main`, on every start        |
| `shared/turn-secret` | text   | Yes — `FileHelper.string` | Init, only when it is missing |

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

## Dependencies

None. Coturn is a leaf service: other packages depend on it, not the other way round.

## Network Access and Interfaces

One interface carrying two addresses, plus a port range that carries no interface of its own.

| Interface   | Id           | Type | Port                    | Description                                |
| ----------- | ------------ | ---- | ----------------------- | ------------------------------------------ |
| TURN/STUN   | `turn`       | api  | 3478, and 5349 over TLS | The STUN and TURN endpoint                 |
| Relay Ports | `turn-relay` | —    | 42000–42499 (UDP range) | The range TURN allocates media relays from |

**Both `turn:` and `turns:` ride one binding.** StartOS terminates the client's TLS at the edge with the domain's certificate — publicly trusted when Let's Encrypt is selected — and forwards plaintext to coturn, which is why coturn is configured with `no-tls` and serves no TLS or DTLS of its own. Consumers choose between the two by scheme; the interface overrides its scheme to `turn` or `turns` accordingly.

**The relay range is a range binding, not an interface.** It is published as a contiguous block of 500 UDP ports which must be forwarded as a block, and it deliberately sits below the ephemeral pool StartOS assigns from, so the atomic range bind cannot collide with a randomly-assigned external port.

**A public domain is required, not optional.** Coturn has no realm without one and cannot serve at all — see [Health Checks](#health-checks) for how that state is reported.

## Installation and First-Run Flow

Install generates the shared secret and nothing else. No task is raised, and no credential is shown — the secret is for dependent services, not for you.

The service then starts in one of two states, and the difference is visible on the service page rather than buried:

- **No public domain added yet.** Coturn cannot be configured without a realm, so the daemon starts idle and its single health check **fails** with instructions to add a public domain to one of the two interfaces. Nothing is broken; the server simply has nothing to serve.
- **A domain is present.** The config is rendered, `turnserver` starts, and three further checks appear reporting whether each required address is actually enabled.

Adding the domain is enough to move between them — the package notices and restarts itself. Note that the realm is taken from any public domain **added** to the interface, not only from an enabled one, so coturn comes up even when the domain has been added but not yet switched on for this interface; the per-address checks then name exactly what to enable.

## Actions

None. Everything coturn needs is derived from the addresses StartOS has published, so there is nothing to configure.

## Tasks

None. This package raises no tasks, so the service is never held on a prompt and its ordinary controls are always available.

## Health Checks

One check always, and three more once a realm exists. All four are about reachability rather than process health, because a TURN server that is running but unreachable is useless in a way nothing else would report.

| Check           | Displayed         | Reports                                                                           | Present             |
| --------------- | ----------------- | --------------------------------------------------------------------------------- | ------------------- |
| `coturn`        | "TURN Server"     | That the listening port is open — or, with no realm, a failure naming what to add | always              |
| `turn-address`  | "TURN/STUN"       | Whether the plain `turn:` address is enabled                                      | once a realm exists |
| `turns-address` | "TURN/STUN (TLS)" | Whether the `turns:` address is enabled                                           | once a realm exists |
| `relay-ports`   | "Relay Ports"     | Whether the relay range is enabled and forwarded as a block                       | once a realm exists |

**Each failing check names the exact address to enable**, rather than reporting a generic fault, and they poll every five seconds while failing instead of the usual thirty — so enabling an address turns the check green promptly.

**A failure here does not mean the daemon is unhealthy.** Three of the four report configuration that the operator has not finished, and the fourth reports the same thing when no domain exists at all. Enabling and disabling an address updates these checks without restarting `turnserver`; only a change to the realm or the public IPs does that, since only those change the generated config.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. No dump step and nothing excluded.

- **Included:** the shared secret, the generated config, and coturn's database.
- **Restore:** the secret comes back, so dependent services keep working without re-pairing. The config is regenerated from the restored server's own addresses on the first start, so a restore onto a server with a different domain adopts the new one rather than carrying the old.

## Limitations and Differences

1. **`turnserver.conf` is not configurable.** It is regenerated in full on every start; there is no action and no hand edit that survives.
2. **Coturn serves no TLS of its own.** TLS is terminated at the edge by StartOS, so certificate management is the platform's, not coturn's.
3. **A public domain is required** before the service can do anything.
4. **Relaying to private and special-use address ranges is refused**, so a TURN client cannot reach the LAN or other containers through it.
5. **The relay range is fixed** at 500 UDP ports from a fixed start, chosen to sit clear of the ephemeral port pool.
6. **No long-term user accounts.** Authentication is the REST-API shared-secret scheme, which issues ephemeral credentials.
7. **No riscv64 build.** x86_64 and aarch64 only.

---

## Quick Reference for AI Consumers

```yaml
package_id: coturn
image: coturn/coturn
architectures:
  - x86_64
  - aarch64
subcontainers:
  - coturn-sub
volumes:
  main: /var/lib/coturn
file_models:
  - turnserver.conf # generated in full on every start
  - shared/turn-secret # scoped subdirectory a dependent can mount read-only
startos_managed_env_vars: []
dependencies: []
interfaces:
  turn: { type: api, port: 3478 } # 5349 for turns:, terminated at the edge
  turn-relay: { type: api, port: 42000 } # UDP range binding, 500 ports, no interface
actions: []
tasks: []
health_checks:
  - coturn # displayed "TURN Server"
  - turn-address # displayed "TURN/STUN"; only once a realm exists
  - turns-address # displayed "TURN/STUN (TLS)"; only once a realm exists
  - relay-ports # displayed "Relay Ports"; only once a realm exists
```
