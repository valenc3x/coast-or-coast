/**
 * Image Seeding Script for Coast or Coast
 *
 * Downloads downtown/skyline images from Unsplash for the game.
 *
 * Usage:
 *   1. Get a free API key from https://unsplash.com/developers
 *   2. Set UNSPLASH_ACCESS_KEY environment variable
 *   3. Run: npm run seed-images
 *
 * Or manually add images to public/images/west/ and public/images/east/
 * and update public/images.json accordingly.
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images')
const MANIFEST_PATH = path.join(PUBLIC_DIR, 'images.json')

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

const CITIES = {
  west: [
    { slug: 'seattle', searchTerm: 'seattle downtown skyline' },
    { slug: 'portland', searchTerm: 'portland oregon downtown' },
    { slug: 'san-francisco', searchTerm: 'san francisco downtown skyline' },
    { slug: 'los-angeles', searchTerm: 'los angeles downtown skyline' },
    { slug: 'san-diego', searchTerm: 'san diego downtown skyline' },
    { slug: 'sacramento', searchTerm: 'sacramento california downtown' },
    { slug: 'oakland', searchTerm: 'oakland california downtown' },
    { slug: 'phoenix', searchTerm: 'phoenix arizona downtown' },
  ],
  east: [
    { slug: 'new-york', searchTerm: 'new york city manhattan skyline' },
    { slug: 'boston', searchTerm: 'boston downtown skyline' },
    { slug: 'philadelphia', searchTerm: 'philadelphia downtown skyline' },
    { slug: 'miami', searchTerm: 'miami downtown skyline' },
    { slug: 'washington-dc', searchTerm: 'washington dc downtown' },
    { slug: 'baltimore', searchTerm: 'baltimore downtown skyline' },
    { slug: 'atlanta', searchTerm: 'atlanta downtown skyline' },
    { slug: 'charlotte', searchTerm: 'charlotte north carolina downtown' },
  ]
}

const IMAGES_PER_CITY = 2

async function fetchUnsplashImages(searchTerm, count) {
  return new Promise((resolve, reject) => {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=${count}&orientation=landscape`

    const options = {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    }

    https.get(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.errors) {
            reject(new Error(json.errors.join(', ')))
          } else {
            resolve(json.results || [])
          }
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

async function downloadImage(imageUrl, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath)
    https.get(imageUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        https.get(response.headers.location, (res) => {
          res.pipe(file)
          file.on('finish', () => {
            file.close()
            resolve()
          })
        }).on('error', reject)
      } else {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      }
    }).on('error', reject)
  })
}

function getCityDisplayName(slug) {
  const names = {
    'seattle': 'Seattle',
    'portland': 'Portland',
    'san-francisco': 'San Francisco',
    'los-angeles': 'Los Angeles',
    'san-diego': 'San Diego',
    'sacramento': 'Sacramento',
    'oakland': 'Oakland',
    'phoenix': 'Phoenix',
    'new-york': 'New York',
    'boston': 'Boston',
    'philadelphia': 'Philadelphia',
    'miami': 'Miami',
    'washington-dc': 'Washington D.C.',
    'baltimore': 'Baltimore',
    'atlanta': 'Atlanta',
    'charlotte': 'Charlotte'
  }
  return names[slug] || slug
}

async function main() {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    Image Seeding Script                       ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  No UNSPLASH_ACCESS_KEY found.                                ║
║                                                                ║
║  To auto-download images:                                      ║
║  1. Get a free API key from https://unsplash.com/developers    ║
║  2. Run: UNSPLASH_ACCESS_KEY=your_key npm run seed-images      ║
║                                                                ║
║  Or manually add images:                                       ║
║  1. Add .jpg files to public/images/west/ and east/            ║
║  2. Update public/images.json with entries like:               ║
║     {                                                          ║
║       "id": "west-seattle-01",                                 ║
║       "file": "west/seattle-01.jpg",                           ║
║       "city": "Seattle",                                       ║
║       "coast": "west"                                          ║
║     }                                                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`)
    process.exit(0)
  }

  console.log('Starting image download from Unsplash...\n')

  // Ensure directories exist
  fs.mkdirSync(path.join(IMAGES_DIR, 'west'), { recursive: true })
  fs.mkdirSync(path.join(IMAGES_DIR, 'east'), { recursive: true })

  const manifest = { images: [] }

  for (const [coast, cities] of Object.entries(CITIES)) {
    console.log(`\n=== ${coast.toUpperCase()} COAST ===`)

    for (const city of cities) {
      console.log(`\nFetching: ${city.slug}`)

      try {
        const photos = await fetchUnsplashImages(city.searchTerm, IMAGES_PER_CITY)

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i]
          const filename = `${city.slug}-${String(i + 1).padStart(2, '0')}.jpg`
          const relativePath = `${coast}/${filename}`
          const fullPath = path.join(IMAGES_DIR, relativePath)

          // Download regular size (1080px width)
          const imageUrl = photo.urls.regular
          console.log(`  Downloading ${filename}...`)
          await downloadImage(imageUrl, fullPath)

          manifest.images.push({
            id: `${coast}-${city.slug}-${String(i + 1).padStart(2, '0')}`,
            file: relativePath,
            city: getCityDisplayName(city.slug),
            coast: coast
          })
        }

        // Rate limiting - be nice to Unsplash
        await new Promise(r => setTimeout(r, 1000))
      } catch (err) {
        console.error(`  Error fetching ${city.slug}: ${err.message}`)
      }
    }
  }

  // Write manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`\n✓ Downloaded ${manifest.images.length} images`)
  console.log(`✓ Manifest written to public/images.json`)
}

main().catch(console.error)
