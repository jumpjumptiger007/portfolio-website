# Favicon Setup

Add your custom favicon files to this directory for proper site identification across browsers and devices.

## Quick Setup

1. Visit [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload your logo/image (minimum 512x512px recommended)
3. Download the generated package
4. Replace the following files in this directory:

- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

## Update Webmanifest

Open `site.webmanifest` and change:

```json
{
  "name": "Your Name | Portfolio",
  "short_name": "YourInitials"
}
```

No need to modify the HTML files - all references will work automatically after replacing the files.
