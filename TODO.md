# TODO

Nothing outstanding. The password endpoint was exercised on the
dev box: both `turnserver` processes bound (3478 and 3578, with no 3479 — coturn
logs `RFC5780 disabled`, so it never claims an alt port), `turnutils_uclient`
authenticated against `lt-cred-mech` and was refused a loopback channel bind by
the denied-peer list, rotation took effect on the live listener, and a
disable/re-enable cycle returned the same external ports with the domain and
password intact.
