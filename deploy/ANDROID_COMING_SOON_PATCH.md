# Android → Wkrótce dostępny

Produkcja żyje w **estateos-app** / branch `recovery-local-snapshot` (nie w tym starym `estateos`).

## Najprościej na Macu (1 komenda)

```bash
cd /Users/marian/estateos-recovery-deploy
# skopiuj scripts/ z tego PR albo:
bash /ścieżka/do/scripts/apply-android-coming-soon-and-deploy.sh
```

Skrypt: nakłada patch → push `recovery-local-snapshot` → `ssh estateos` → `deploy:server-only`.

## Albo daj Cursorowi dostęp
Nadaj Cursorowi **write** do `irommar-byte/estateos-app` i uruchom agenta na tym repo — wtedy zrobi to sam (commit, push, deploy).
