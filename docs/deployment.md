# Deployment

CoD Atlas uses GitHub Actions for continuous integration and container image publishing.

The deployment workflow is intentionally kept simple and reproducible.

## Overview

```text
Development branch
       |
       v
 Pull Request
       |
       v
GitHub Actions
validate / test / build
       |
       v
      main
       |
       v
GitHub Actions
multi-arch Docker build
       |
       v
      GHCR
       |
       v
    Staging
```

## Continuous integration

The GitHub Actions workflow is located at:

```text
.github/workflows/ci.yml
```

Pull requests and pushes to `main` run the validation pipeline.

The pipeline:

```text
Install dependencies
        |
        v
Validate curated data
        |
        v
Generate, test
        |
        v
   Static build
```

`npm run data:check` validates the curated source without requiring generated
files. Tests, application builds and container builds generate fresh ignored
JSON artifacts before compiling the application.

## Container publishing

After a successful push to `main`, GitHub Actions additionally builds and publishes the staging container image.

Images are published to GitHub Container Registry:

```text
ghcr.io/time-wasters/cod-atlas
```

The staging image is published as:

```text
ghcr.io/time-wasters/cod-atlas:staging
```

Each build is also tagged with its Git commit SHA:

```text
ghcr.io/time-wasters/cod-atlas:<commit-sha>
```

This provides both a moving staging tag and an immutable reference to each published build.

## Supported platforms

The container image is built for:

```text
linux/amd64
linux/arm64
```

Docker Buildx and QEMU are used by GitHub Actions to create the multi-platform image.

## Authentication

GitHub Actions publishes to GHCR using the automatically provided `GITHUB_TOKEN`.

No manually created publishing token is required for the CI workflow.

The publishing job receives only the permissions required to read the repository and publish packages.

## Build configuration

The Docker build currently supports these optional build arguments:

```text
STEAM_ICON_URL
STEAMGRIDDB_ICON_URL
```

They can be configured through GitHub Actions variables.

## Wiki imports

Call of Duty Wiki imports are intentionally **not part of the CI or deployment workflow**.

Wiki data imports are performed manually and committed to the repository before deployment.

## Staging

The staging deployment uses:

```text
compose.staging.yaml
```

The staging environment consumes the pre-built image from GHCR rather than building the application during deployment.

## Branch model

There is no dedicated long-lived `staging` branch.

`main` represents the current staging candidate:

```text
feature/*
    |
    v
Pull Request
    |
    v
   main
    |
    v
 Staging
```

Staging is treated as a deployment environment rather than a separate development branch.

## Production

Production deployment is not configured yet.

When introduced, production should use an explicit release or immutable image tag rather than the moving `:staging` tag.
