#!/usr/bin/env bash
# Regenerates public/images/cuteri-volunteer-kit.zip from the
# individual download assets. Run this whenever you update any of
# the bundled files. The zip is committed to the repo so production
# serves a static asset (no runtime zipping).
set -euo pipefail
cd "$(dirname "$0")/../public/images"
rm -f cuteri-volunteer-kit.zip
zip -j cuteri-volunteer-kit.zip \
  cuteri-one-pager.pdf \
  cuteri-wallet-card.pdf \
  writein-cuteri-wordmark.svg
echo "Wrote public/images/cuteri-volunteer-kit.zip"
