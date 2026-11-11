# Deployment

GitHub Actions handles CI and container publishing:

```text
feature/* → PR → validate/test/static build → main → multi-arch image → GHCR → Staging
```

## Continuous integration

`.github/workflows/ci.yml` runs on PRs and pushes to `main`: install dependencies,
validate curated data, generate/test, then build static output.
`npm run data:check` needs no generated files; tests, application builds, and
container builds generate fresh ignored JSON before compiling.

## Container publishing

Successful pushes to `main` publish `ghcr.io/time-wasters/cod-atlas` with a
moving `:staging` tag and an immutable `:<commit-sha>` tag for each build.

## Supported platforms

GitHub Actions uses Docker Buildx and QEMU for `linux/amd64` and `linux/arm64`.

## Authentication

Publishing uses the automatic `GITHUB_TOKEN`; no manual publishing token is
needed. The job receives only repository-read and package-publish permissions.

## Build configuration

Optional Docker build arguments, configured through GitHub Actions variables:
`STEAM_ICON_URL`, `STEAMGRIDDB_ICON_URL`, `MOBYGAMES_ICON_URL`.

## Standalone hosting

Build with `npm run build:static` (Docker:
`docker compose run --rm cod-atlas-tools npm run build:static`) and serve
`dist-static/` from any static web server. The Docker image serves this output
with nginx. No hosting account, project binding, or runtime locations API is
required.

`npm run dev` uses Vite/Vinext for local development. `npm run build` builds the
Vinext renderer, which the fixture-based render tests also exercise.

## Wiki imports

Wiki imports are manual, committed before deployment, and excluded from CI/deployment.

## Staging

`compose.staging.yaml` consumes the prebuilt GHCR image; deployment does not
build the application.

## Branch model

`main` is the staging candidate. Staging is an environment, with no dedicated
long-lived branch: `feature/* → PR → main → Staging`.

## Production

Production is defined by
[the release workflow](../.github/workflows/release-production.yml) and
[`compose.production.yaml`](../compose.production.yaml). The workflow targets
the `production` GitHub environment at <https://cod-atlas.com>.

### Release process

1. Merge the release commit into `main` and wait for its complete `ci.yml` push
   run to succeed, including publication of the commit-SHA image to GHCR.
2. Publish a GitHub release with a stable `vMAJOR.MINOR.PATCH` tag, such as
   `v1.2.3`. Prereleases are skipped. The workflow requires the tagged commit
   to be on `main` and checks for successful push CI on that exact commit.
3. The deployment job uses the `production` environment, subject to any
   configured protection or approval rules. It rechecks that the tag still
   points to the verified commit.
4. The existing `ghcr.io/time-wasters/cod-atlas:<commit-sha>` image is promoted
   to `:<release-tag>` without rebuilding. Source and release digests must
   match; an existing release image with a different digest fails the job.
5. The workflow posts to the Portainer production webhook with
   `?tag=<release-tag>`. Production release runs are serialized and are not
   cancelled by a newer release.

### Deployment configuration

Configure the `PORTAINER_PRODUCTION_WEBHOOK` GitHub Actions secret for the
production deployment job. GHCR authentication uses the automatic
`GITHUB_TOKEN` with package-write permission.

`compose.production.yaml` consumes a versioned GHCR image, currently pinned to
`v1.0.0`, with one replica and an external `proxy-network`. The deployment
environment must provide that network and route traffic to the service's nginx
port 80. The Portainer webhook must apply the requested release tag to the
service image; the workflow does not update the Compose file's image pin.

### Rollout verification and rollback

A successful webhook request confirms that deployment was triggered. Verify
the running service's image version/digest in Portainer and check the production
site separately to confirm the rollout.

To roll back, select a previously verified release image tag or digest in the
production stack and redeploy it through Portainer. Confirm the running image
and site again after the rollback.
