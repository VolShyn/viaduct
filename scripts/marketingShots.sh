#!/usr/bin/env bash
# Converts the captures from cypress/e2e/marketingShots.cy.ts into the webp
# files the landing imports.
#
#   npx cypress run --spec cypress/e2e/marketingShots.cy.ts --browser electron \
#     --config viewportWidth=1800,viewportHeight=1125 --env SHOTS=1
#   scripts/marketingShots.sh
#
# The captures come out at twice the asked size, because the machine running
# them has a 2x screen and Cypress shoots in device pixels. Downsampling to
# 1800x1125 is why they are sharp; capturing at 1x and scaling up would not be.
set -euo pipefail

shots="cypress/screenshots/marketingShots.cy.ts"
out="src/assets/marketing"
[ -d "$shots" ] || { echo "no captures in $shots — run the spec first" >&2; exit 1; }

for png in "$shots"/*.png; do
  name="$(basename "$png" .png)"
  case "$name" in *"(failed)"*) continue;; esac
  ffmpeg -v error -y -i "$png" -vf scale=1800:1125 -pix_fmt rgb24 "/tmp/$name.png"
  cwebp -quiet -q 82 "/tmp/$name.png" -o "$out/$name.webp"
  rm -f "/tmp/$name.png"
  printf '%-24s %s\n' "$name.webp" "$(du -h "$out/$name.webp" | cut -f1)"
done
