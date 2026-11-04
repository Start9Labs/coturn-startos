# Updating the upstream version

This package wraps the upstream [coturn/coturn](https://github.com/coturn/coturn) project, distributed as the official `coturn/coturn` Docker image.

## Determining the upstream version

- **coturn** ([coturn/coturn](https://github.com/coturn/coturn)) — fetch the latest release tag:

  ```sh
  gh release view -R coturn/coturn --json tagName -q .tagName
  ```

  coturn's GitHub releases are tagged for the Docker image, e.g. `docker/4.14.0-r0`. The upstream version is the middle part — strip the `docker/` prefix and the `-r<N>` image-revision suffix, giving `4.14.0`.

  Confirm a matching image tag exists on [Docker Hub](https://hub.docker.com/r/coturn/coturn/tags). The current pin lives in `startos/manifest/index.ts` at `images.coturn.source.dockerTag` (the version after the `:` in `coturn/coturn:<version>`).

## Applying the bump

Bump `dockerTag` in `startos/manifest/index.ts` to `coturn/coturn:<new version>`.
