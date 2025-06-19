# GitHub Actions Workflows

## CI - Build and Test

The `ci.yml` workflow provides continuous integration for the Node.js monorepo, building and testing both frontend and backend applications.

### Features

- **Multi-job pipeline**: Separate jobs for build/test, coverage, and security audit
- **pnpm support**: Uses pnpm for efficient package management and workspace support
- **Caching**: Implements pnpm store caching for faster builds
- **Code quality**: Runs linting and formatting checks
- **Testing**: Executes test suites for both applications
- **Coverage reporting**: Generates and uploads test coverage reports
- **Security**: Performs dependency audits and checks for outdated packages
- **Artifacts**: Uploads build artifacts for both frontend and backend

### Jobs

1. **build-and-test**: Main CI job that installs dependencies, runs linting, tests, and builds
2. **test-coverage**: Generates detailed test coverage reports for the backend
3. **security-audit**: Performs security audits and dependency checks

### Triggers

- Push to main/develop branches
- Pull requests to main/develop branches

## Docker Build and Push

The `docker-build.yml` workflow automatically builds and pushes multi-platform Docker images to the GitHub Container Registry (ghcr.io).

### Triggers

The workflow runs on:
- **Push to main/develop branches**: Builds and pushes images with branch name tags
- **Pull requests**: Builds images for testing (without pushing)
- **Git tags (v*)**: Builds and pushes images with semantic version tags

### Platforms

The workflow builds images for the following platforms:
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM 64-bit)

### Image Tags

Images are tagged automatically based on the trigger:
- **Branch pushes**: `ghcr.io/owner/repo:branch-name`
- **Main branch**: `ghcr.io/owner/repo:latest`
- **Tags**: `ghcr.io/owner/repo:v1.2.3`, `ghcr.io/owner/repo:v1.2`, `ghcr.io/owner/repo:v1`
- **Pull requests**: `ghcr.io/owner/repo:pr-123`

### Features

- **Multi-platform builds**: Uses Docker Buildx for cross-platform compilation
- **Layer caching**: GitHub Actions cache for faster subsequent builds
- **Security**: Build provenance attestation for supply chain security
- **Automatic login**: Uses `GITHUB_TOKEN` for authentication

### Usage

1. **Automatic**: The workflow runs automatically on pushes and PRs
2. **Manual**: Can be triggered manually from the Actions tab
3. **Pull images**: `docker pull ghcr.io/owner/repo:latest`

### Requirements

- Repository must have Actions enabled
- No additional secrets required (uses built-in `GITHUB_TOKEN`)
- Package visibility can be configured in repository settings

### Troubleshooting

- **Permission denied**: Ensure the repository has package write permissions
- **Build failures**: Check the Actions logs for detailed error messages
- **Platform issues**: Some dependencies might not support all platforms
