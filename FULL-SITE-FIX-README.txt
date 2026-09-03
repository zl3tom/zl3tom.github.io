ZL3TOM FULL SITE FIX - 4 September 2026

This is a complete site package.

Fixed:
- Search uses the same shared JavaScript on all 48 HTML pages
- Restored site-extras.css to every page
- Restored On-Air World Clock styling and live timezone display
- Restored Radio Fun page formatting
- Restored QRZ logbook responsive formatting
- Restored network/activity cards
- Restored guide enhancements
- Kept mobile navigation safeguards
- Generator scripts now keep site-extras.css after future npm run build
- Cache-busted CSS and JS with 20260904-fullfix1

Validated with:
Validated 48 HTML files, 102 JSON-LD blocks, 18 guide cards and 24 sitemap URLs.

DEPLOY AFTER UPLOADING TO GITHUB:
cd /home/ubuntu/zl3tom-site
git reset --hard HEAD
git clean -fd
git pull --ff-only
npm ci
npm run build
npm run check
pm2 restart zl3tom --update-env
pm2 save
