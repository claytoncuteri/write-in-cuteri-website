#!/usr/bin/env bash
# Regenerates public/downloads/cuteri-volunteer-kit.zip from the
# individual download assets. Run this whenever you update any of
# the bundled files. The zip is committed to the repo so production
# serves a static asset (no runtime zipping).
#
# Filenames stay stable across version bumps (cuteri-wallet-card.pdf
# is content-versioned; the bytes change, the path does not). This
# avoids threading "v3" through ~12 callsites in the codebase.
#
# Kit contents:
#   - cuteri-one-pager.pdf            (platform summary + talking points)
#   - cuteri-wallet-card.pdf          (ballot-day write-in reminder card)
#   - writein-cuteri-wordmark.svg     (inline campaign wordmark)
#   - banners/                        (full /public/logo_a_star_divider
#                                      asset tree: social covers, yard
#                                      signs, bumper stickers, OG images
#                                      in cream/navy/white/transparent)
set -euo pipefail
cd "$(dirname "$0")/../public"
rm -f downloads/cuteri-volunteer-kit.zip

# Build the zip with relative paths anchored at /public so the archive
# unfolds with a clean "banners/" subfolder alongside the PDFs and
# wordmark. -j would flatten everything into root; we want hierarchy
# for the banner variants.
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT
mkdir -p "$TMPDIR/cuteri-volunteer-kit"
cp downloads/cuteri-one-pager.pdf "$TMPDIR/cuteri-volunteer-kit/"
cp downloads/cuteri-wallet-card.pdf "$TMPDIR/cuteri-volunteer-kit/"
cp images/writein-cuteri-wordmark.svg "$TMPDIR/cuteri-volunteer-kit/"
cp -R logo_a_star_divider "$TMPDIR/cuteri-volunteer-kit/banners"

(cd "$TMPDIR" && zip -r "$OLDPWD/downloads/cuteri-volunteer-kit.zip" cuteri-volunteer-kit > /dev/null)
echo "Wrote public/downloads/cuteri-volunteer-kit.zip"
ls -la downloads/cuteri-volunteer-kit.zip
