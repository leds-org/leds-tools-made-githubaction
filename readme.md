# MADE Report Docker Tool

Docker container for generating MADE reports from specified directories.

## Automated Reports Generation

Reports are automatically generated:
- Daily at 9:00, 12:00, and 18:00
- When changes are pushed to the `example/` directory
- Manually via GitHub Actions dispatch

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

2. Required Repository Settings:
   - Enable Actions in repository settings
   - Grant write permissions to workflows
   - Set up `GITHUB_TOKEN` with appropriate scopes

3. Manual Trigger:
   - Go to Actions tab
   - Select "MADE Report Generation"
   - Click "Run workflow"

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

## Volume Mapping

- `/app/config`: Configuration directory
- `/host`: Base directory for source files

## Environment Variables

- `JSON_FILE_PATH`: Path to directories configuration file
- `GITHUB_TOKEN`: GitHub authentication token (for Actions)

## Directory Structure

```
.
├── .github/
│   └── workflows/
│       └── made-report.yml
├── config/
│   └── directories.json
└── docker-compose.yml
```