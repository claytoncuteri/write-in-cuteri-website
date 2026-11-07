# Write-in materials from the 2026 race (hidden, not deleted)

The Nov 3, 2026 election is over. These files taught people how to
write Clayton in, so they were moved out of `public/` and are no
longer served. Old links to them land on the home page with a short
notice (see `next.config.ts` redirects and
`src/components/RedirectNotice.tsx`).

- `cuteri-wallet-card.pdf`: ballot-day write-in reminder card
- `cuteri-volunteer-kit.zip`: one-pager, wallet card, wordmark, banners
- `writein-cuteri-wordmark.svg`: WRITE IN / CUTERI wordmark
- `build-volunteer-kit.sh`: the script that built the zip. It expects
  the files under `public/`, so move them back before running it.

To bring a file back, move it back to its old folder
(`public/downloads/` or `public/images/`) and remove its redirect.
