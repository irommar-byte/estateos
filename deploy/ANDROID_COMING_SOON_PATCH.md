# Android: Wkrótce dostępny

Źródło zmian: `irommar-byte/estateos-app` branch `mobile-canonical-20260514` → `deploy/estateos-www-full/`.

## Co zmieniono
- Badge Androida zawsze pokazuje **Wkrótce dostępny** (bez APK / Play / test Play)
- Endpoint `/api/downloads/estateos-android` zwraca 503 coming_soon
- Landing HTML, maile, schema.org i llms.txt bez linków pobierania Androida

## Wdrożenie na VPS (produkcja)
Skopiuj pliki z `deploy/estateos-www-full/` do katalogu WWW, np. `/home/rommar/apple-style-website/`:

```bash
# przykład — dostosuj ścieżkę docelową
rsync -av deploy/estateos-www-full/ /home/rommar/apple-style-website/
cd /home/rommar/apple-style-website && npm run build && pm2 restart nieruchomo
```

Albo zmerguj PR do `estateos-app` (gdy bot dostanie push) i zdeployuj stamtąd.
