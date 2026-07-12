# TODO

- [ ] **Switch `main.ts` to dynamic daemons once the SDK is fixed.** `main` currently uses `setupMain` → `Daemons.of`, so the `.const()` host read restarts the whole service whenever a public domain is added or removed. That collides with StartOS's port-forward / IPv6-firewall probes, which abort with "tests cannot be performed because the service is not running."

  The fix is for `setupMain` to return a `Daemons.dynamic()` reconciler, so a domain change reconciles the daemon set in place and the service stays `running`. That composition is currently not expressible: `setupMain` is typed to require a `Daemons`, and `Daemons.dynamic()` returns a `main` export rather than the `DaemonsReconciler` (a `DaemonBuildable`) it constructs. Tracked in [Start9Labs/start-technologies#3470](https://github.com/Start9Labs/start-technologies/issues/3470).

  When that lands, restructure to:

  ```ts
  export const main = sdk.setupMain(async ({ effects }) => {
    ...
    return sdk.Daemons.dynamic(effects, async ({ effects }) => { ... })
  })
  ```

  Notes for that rewrite:
  - Split the host read: the **daemon slice** (`domain`, `externalIps` — the only inputs to `turnserver.conf`) drives the reconcile; the per-address exposure booleans feed only health checks and must not rebuild the daemon.
  - Fold a hash of the rendered conf into the daemon's `exec.env` (e.g. `CONFIG_REV`), so the reconciler restarts `turnserver` when the config _content_ changes — rewriting the file alone does not change its `configHash`.
  - Health-check `fn`s must read the host **live per poll** (`.once()`, never `.const()`): the reconciler leaves an unchanged-hash check's old closure running, so captured values would go stale.
