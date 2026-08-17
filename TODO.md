# TODO

Nothing outstanding. The password endpoint was exercised on the dev box: both
`turnserver` processes bound (3478 and 3578, with no 3479 — coturn logs
`RFC5780 disabled`, so it never claims an alt port), `turnutils_uclient`
authenticated against `lt-cred-mech` and was refused a loopback channel bind by
the denied-peer list, rotation took effect on the live listener, and a
disable/re-enable cycle returned the same external ports with the domain and
password intact.

The `turns:` leg is verified too, against a `*.start9.dev` domain on the
StartTunnel gateway: TLSv1.3 sessions terminate at the StartOS edge on 5449 and
are forwarded plaintext to 3578, a correct password allocates through them, and
a wrong one fails to. That is `secure: { ssl: false }` + `addSsl` doing what it
is meant to — the edge holds the certificate and coturn keeps `no-tls`.
