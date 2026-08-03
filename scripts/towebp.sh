#!/usr/bin/env bash
# Usage:
#   ./scripts/towebp.sh path/to/image.png              # one file
#   ./scripts/towebp.sh public/images/portfolio        # every png/jpg/jpeg in a folder
#   ./scripts/towebp.sh a.png b.jpg c.jpeg              # several files
# Quality: override with Q=95 ./scripts/towebp.sh ...   (default 92)
set -euo pipefail
Q="${Q:-92}"
command -v cwebp >/dev/null || { echo "cwebp not found — run: brew install webp"; exit 1; }

convert() {
  local src="$1"
  local out="${src%.*}.webp"
  cwebp -q "$Q" -quiet "$src" -o "$out"
  printf "%s -> %s  (%s -> %s)\n" "$src" "$out" \
    "$(du -h "$src" | cut -f1)" "$(du -h "$out" | cut -f1)"
}

for arg in "$@"; do
  if [ -d "$arg" ]; then
    find "$arg" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) \
      | while read -r f; do convert "$f"; done
  elif [ -f "$arg" ]; then
    convert "$arg"
  else
    echo "skip (not found): $arg"
  fi
done