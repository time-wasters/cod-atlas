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

## Wiki imports

Wiki imports are manual, committed before deployment, and excluded from CI/deployment.

## Staging

`compose.staging.yaml` consumes the prebuilt GHCR image; deployment does not
build the application.

## Branch model

`main` is the staging candidate. Staging is an environment, with no dedicated
long-lived branch: `feature/* → PR → main → Staging`.

## Production

Not configured. When introduced, use an explicit release or immutable image tag,
not the moving `:staging` tag.
