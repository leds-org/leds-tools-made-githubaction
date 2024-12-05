# MADE Report Docker Tool

Docker container for generating MADE reports from specified directories.

## Automated Workflows

### MADE Report Generation
- Daily at 9:00, 12:00, and 18:00
- When changes are pushed to `example/` directory
- Manually via GitHub Actions dispatch

### Discord Notifications
- Daily status update at 15:00
- Setup requires Discord webhook added to repository secrets as `DISCORD_WEBHOOK`

## GitHub Actions Setup

1. Create `.github/workflows/made-report.yml`:
```yaml
name: MADE Report Generation

on:
  push:
    branches: [ "main" ]
    paths:
      - 'example/**'
  schedule:
    - cron: '0 9 * * *'
    - cron: '0 12 * * *'
    - cron: '0 18 * * *'
  workflow_dispatch:

jobs:
  generate-report:
    runs-on: ubuntu-latest
    permissions: 
        contents: write
        packages: read
        actions: read
    steps:
      - uses: actions/checkout@v4
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Pull and Run Docker
        run: |
          docker pull ghcr.io/leds-org/leds-tools-made-docker:main
          docker run -v ${{ github.workspace }}/config:/app/config \
                    -v ${{ github.workspace }}:/host \
                    -e JSON_FILE_PATH=/app/config/directories.json \
                    -e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} \
                    ghcr.io/leds-org/leds-tools-made-docker:main
```

2. Create `.github/workflows/discord-notify.yml`:
```yaml
name: Discord Daily Notification

on:
  schedule:
    - cron: '0 15 * * *'
  workflow_dispatch:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Discord notification
        env:
          DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
        uses: Ilshidur/action-discord@master
        with:
          args: 'Daily MADE Report Status Update'
```

## Local Setup

1. Create `directories.json`:
```json
[
  {"path": "example/path1"},
  {"path": "example/path2"}
]
```

2. Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  made-report:
    image: ghcr.io/leds-org/leds-tools-made-docker:main
    environment:
      JSON_FILE_PATH: /app/config/directories.json
    volumes:
      - ./config:/app/config
      - /path/to/your/files:/host
```

## Required Configurations

### Repository Settings
- Enable Actions
- Grant write permissions to workflows
- Set up `GITHUB_TOKEN`
- Add Discord webhook URL as `DISCORD_WEBHOOK` secret

### Volume Mapping
- `/app/config`: Configuration directory
- `/host`: Base directory for source files

### Environment Variables
- `JSON_FILE_PATH`: Path to directories configuration file
- `GITHUB_TOKEN`: GitHub authentication token
- `DISCORD_WEBHOOK`: Discord webhook URL

## Directory Structure
```
.
├── .github/
│   └── workflows/
│       ├── made-report.yml
│       └── discord-notify.yml
├── config/
│   └── directories.json
└── docker-compose.yml
```