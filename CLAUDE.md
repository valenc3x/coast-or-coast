# Coast or Coast

A geography guessing game where players identify if a downtown photo is from the West Coast or East Coast.

## Tech Stack

- React 19 with Vite
- Plain CSS (no framework)
- Static images stored locally

## Project Structure

```
coast-or-coast/
├── public/
│   ├── images/
│   │   ├── west/          # West coast city photos
│   │   └── east/          # East coast city photos
│   └── images.json        # Image manifest
├── src/
│   ├── components/
│   │   ├── StartScreen.jsx/css
│   │   ├── Game.jsx/css
│   │   └── GameOver.jsx/css
│   ├── App.jsx/css
│   ├── index.css
│   └── main.jsx
├── scripts/
│   └── seed-images.js     # Unsplash download script
└── vite.config.js
```

## Development

```bash
npm install
npm run dev
```

## Adding Images

### Option 1: Unsplash API
```bash
UNSPLASH_ACCESS_KEY=your_key npm run seed-images
```

The script is **idempotent** - it tracks downloaded Unsplash photo IDs and will:
- Skip already-downloaded images on subsequent runs
- Cap each city at 8 images max
- Use multiple search terms per city for variety

### Option 2: Manual
1. Add `.jpg` files to `public/images/west/` or `public/images/east/`
2. Update `public/images.json`:
```json
{
  "images": [
    { "id": "west-seattle-01", "file": "west/seattle-01.jpg", "city": "Seattle", "coast": "west" }
  ]
}
```

### Naming Convention
- Files: `{city-slug}-{number}.jpg` (e.g., `seattle-01.jpg`)
- IDs: `{coast}-{city-slug}-{number}` (e.g., `west-seattle-01`)

## Game Mechanics

- Streak-based scoring: keep guessing correctly to build your streak
- One wrong guess = game over
- Images are randomly shuffled each game
- Equal number of images from each coast per game
- City name revealed after each guess

## Cities Included

**West Coast:** Seattle, Portland, San Francisco, Los Angeles, San Diego, Sacramento, Oakland, Phoenix, Denver, Las Vegas

**East Coast:** New York, Boston, Philadelphia, Miami, Washington D.C., Baltimore, Atlanta, Charlotte, Chicago, Pittsburgh, Detroit
