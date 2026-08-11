#!/usr/bin/env bash
# Jeden skrypt: jak na Macu — patch na recovery + push + deploy VPS.
set -euo pipefail

ROOT="${ESTATEOS_RECOVERY_DIR:-$HOME/estateos-recovery-deploy}"
PATCH_DIR="$(cd "$(dirname "$0")" && pwd)"
PATCH="$PATCH_DIR/android-coming-soon.patch"

if [[ ! -d "$ROOT/.git" ]]; then
  echo "Nie znaleziono worktree: $ROOT"
  echo "Ustaw ESTATEOS_RECOVERY_DIR=/Users/marian/estateos-recovery-deploy"
  exit 1
fi

cd "$ROOT"
git fetch origin
git checkout recovery-local-snapshot
git pull --ff-only origin recovery-local-snapshot

if git apply --check "$PATCH"; then
  git apply "$PATCH"
else
  echo "Patch nie nakłada się czysto — spróbuj ręcznie albo daj Cursorowi push do estateos-app."
  exit 1
fi

git add -A
git commit -m "fix(www): disable Android downloads, show Wkrótce dostępny" || true
git push origin recovery-local-snapshot

ssh estateos 'cd ~/estateos && git pull && npm run deploy:server-only'
echo "Gotowe. Sprawdź https://estateos.pl — Android powinien być Wkrótce dostępny."
