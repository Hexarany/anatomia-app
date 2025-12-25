# PWA Setup Instructions

## PWA Icons

The application is configured for PWA, but you need to add icon files:

### Required Icons:

1. **pwa-192x192.png** (192x192 pixels)
2. **pwa-512x512.png** (512x512 pixels)
3. **apple-touch-icon.png** (180x180 pixels)
4. **favicon.ico** (optional, 32x32 or 16x16)

Place these files in the `client/public/` directory.

### How to Create Icons:

You can use online tools like:
- https://realfavicongenerator.net/
- https://favicon.io/
- https://www.pwabuilder.com/imageGenerator

Or use your logo and resize it to the required dimensions.

### Quick Setup with Placeholder:

If you don't have icons yet, you can create simple colored squares:

1. Create a 512x512 PNG with your app color (#1976d2)
2. Add text "Anatomia" in the center
3. Resize to 192x192 for the smaller icon
4. Save both in `client/public/`

## Features Enabled:

✅ Offline caching for static assets
✅ API response caching (5 minutes)
✅ Cloudinary images caching (30 days)
✅ Google Fonts caching (1 year)
✅ Auto-update on new version
✅ Install prompt dialog
✅ Floating install button
✅ Works on mobile and desktop

## Testing PWA:

### Development:
```bash
npm run build
npm run preview
```

Then open in Chrome and check:
- DevTools → Application → Manifest
- DevTools → Application → Service Workers

### Production:
PWA features only work on HTTPS. Ensure SSL is configured (e.g., Nginx + certbot).

## Browser Support:

- ✅ Chrome/Edge (full support)
- ✅ Safari (partial support, no install prompt)
- ✅ Firefox (partial support)
- ✅ Samsung Internet (full support)

## Customization:

Edit `client/vite.config.ts` to customize:
- App name and description
- Theme colors
- Cache strategies
- Icon paths
