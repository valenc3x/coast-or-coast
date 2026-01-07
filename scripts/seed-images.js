/**
 * Image Seeding Script for Coast or Coast
 *
 * Downloads downtown/skyline images from Unsplash for the game.
 *
 * Features:
 *   - Multiple search terms per city for image variety
 *   - Idempotent: tracks Unsplash photo IDs to avoid duplicates
 *   - Can be run multiple times to incrementally add images
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

// Configuration
const IMAGES_PER_SEARCH_TERM = 3  // Number of images to fetch per search query
const MAX_IMAGES_PER_CITY = 8     // Cap total images per city

const CITIES = {
  west: [
    {
      slug: 'seattle',
      name: 'Seattle',
      searchTerms: [
        'seattle downtown skyline',
        'seattle cityscape buildings',
        'seattle financial district',
        'seattle urban architecture',
        'seattle city aerial'
      ]
    },
    {
      slug: 'portland',
      name: 'Portland',
      searchTerms: [
        'portland oregon downtown skyline',
        'portland cityscape',
        'portland urban buildings',
        'portland city aerial'
      ]
    },
    {
      slug: 'san-francisco',
      name: 'San Francisco',
      searchTerms: [
        'san francisco downtown skyline',
        'san francisco financial district',
        'san francisco cityscape',
        'san francisco urban buildings',
        'san francisco embarcadero'
      ]
    },
    {
      slug: 'los-angeles',
      name: 'Los Angeles',
      searchTerms: [
        'los angeles downtown skyline',
        'la cityscape buildings',
        'los angeles financial district',
        'dtla urban architecture',
        'los angeles city aerial'
      ]
    },
    {
      slug: 'san-diego',
      name: 'San Diego',
      searchTerms: [
        'san diego downtown skyline',
        'san diego cityscape',
        'san diego gaslamp district',
        'san diego urban buildings'
      ]
    },
    {
      slug: 'sacramento',
      name: 'Sacramento',
      searchTerms: [
        'sacramento california downtown',
        'sacramento skyline',
        'sacramento cityscape'
      ]
    },
    {
      slug: 'oakland',
      name: 'Oakland',
      searchTerms: [
        'oakland california downtown',
        'oakland skyline',
        'oakland cityscape buildings'
      ]
    },
    {
      slug: 'phoenix',
      name: 'Phoenix',
      searchTerms: [
        'phoenix arizona downtown skyline',
        'phoenix cityscape',
        'phoenix urban buildings',
        'phoenix financial district'
      ]
    },
    {
      slug: 'denver',
      name: 'Denver',
      searchTerms: [
        'denver colorado downtown skyline',
        'denver cityscape',
        'denver urban buildings',
        'denver financial district'
      ]
    },
    {
      slug: 'las-vegas',
      name: 'Las Vegas',
      searchTerms: [
        'las vegas strip skyline',
        'las vegas downtown cityscape',
        'las vegas urban buildings'
      ]
    },
  ],
  east: [
    {
      slug: 'new-york',
      name: 'New York',
      searchTerms: [
        'new york city manhattan skyline',
        'nyc downtown financial district',
        'manhattan cityscape',
        'new york urban architecture',
        'nyc midtown buildings',
        'new york city aerial'
      ]
    },
    {
      slug: 'boston',
      name: 'Boston',
      searchTerms: [
        'boston downtown skyline',
        'boston cityscape',
        'boston financial district',
        'boston urban buildings'
      ]
    },
    {
      slug: 'philadelphia',
      name: 'Philadelphia',
      searchTerms: [
        'philadelphia downtown skyline',
        'philadelphia cityscape',
        'philly urban buildings',
        'philadelphia center city'
      ]
    },
    {
      slug: 'miami',
      name: 'Miami',
      searchTerms: [
        'miami downtown skyline',
        'miami brickell cityscape',
        'miami urban buildings',
        'miami financial district',
        'miami city aerial'
      ]
    },
    {
      slug: 'washington-dc',
      name: 'Washington D.C.',
      searchTerms: [
        'washington dc downtown',
        'dc cityscape buildings',
        'washington dc urban architecture'
      ]
    },
    {
      slug: 'baltimore',
      name: 'Baltimore',
      searchTerms: [
        'baltimore downtown skyline',
        'baltimore inner harbor cityscape',
        'baltimore urban buildings'
      ]
    },
    {
      slug: 'atlanta',
      name: 'Atlanta',
      searchTerms: [
        'atlanta downtown skyline',
        'atlanta cityscape',
        'atlanta midtown buildings',
        'atlanta urban architecture'
      ]
    },
    {
      slug: 'charlotte',
      name: 'Charlotte',
      searchTerms: [
        'charlotte north carolina downtown skyline',
        'charlotte cityscape',
        'charlotte uptown buildings'
      ]
    },
    {
      slug: 'chicago',
      name: 'Chicago',
      searchTerms: [
        'chicago downtown skyline',
        'chicago loop cityscape',
        'chicago urban architecture',
        'chicago michigan avenue',
        'chicago city aerial'
      ]
    },
    {
      slug: 'pittsburgh',
      name: 'Pittsburgh',
      searchTerms: [
        'pittsburgh downtown skyline',
        'pittsburgh cityscape',
        'pittsburgh golden triangle'
      ]
    },
    {
      slug: 'detroit',
      name: 'Detroit',
      searchTerms: [
        'detroit downtown skyline',
        'detroit cityscape',
        'detroit urban buildings'
      ]
    },
  ]
}

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

/**
 * Load existing manifest or create empty one
 */
function loadManifest() {
  try {
    const data = fs.readFileSync(MANIFEST_PATH, 'utf8')
    return JSON.parse(data)
  } catch {
    return { images: [] }
  }
}

/**
 * Get set of already downloaded Unsplash photo IDs
 */
function getExistingPhotoIds(manifest) {
  return new Set(
    manifest.images
      .filter(img => img.unsplashId)
      .map(img => img.unsplashId)
  )
}

/**
 * Get count of existing images for a city
 */
function getCityImageCount(manifest, coast, citySlug) {
  return manifest.images.filter(
    img => img.coast === coast && img.id.includes(`${coast}-${citySlug}-`)
  ).length
}

/**
 * Get next available image number for a city
 */
function getNextImageNumber(manifest, coast, citySlug) {
  const existing = manifest.images
    .filter(img => img.coast === coast && img.id.startsWith(`${coast}-${citySlug}-`))
    .map(img => {
      const match = img.id.match(/-(\d+)$/)
      return match ? parseInt(match[1], 10) : 0
    })

  return existing.length > 0 ? Math.max(...existing) + 1 : 1
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

  console.log('Coast or Coast - Image Seeder')
  console.log('=============================\n')

  // Ensure directories exist
  fs.mkdirSync(path.join(IMAGES_DIR, 'west'), { recursive: true })
  fs.mkdirSync(path.join(IMAGES_DIR, 'east'), { recursive: true })

  // Load existing manifest for idempotency
  const manifest = loadManifest()
  const existingPhotoIds = getExistingPhotoIds(manifest)

  console.log(`Existing images: ${manifest.images.length}`)
  console.log(`Tracked Unsplash IDs: ${existingPhotoIds.size}\n`)

  let newImagesCount = 0
  let skippedCount = 0

  for (const [coast, cities] of Object.entries(CITIES)) {
    console.log(`\n=== ${coast.toUpperCase()} COAST ===`)

    for (const city of cities) {
      const currentCount = getCityImageCount(manifest, coast, city.slug)

      if (currentCount >= MAX_IMAGES_PER_CITY) {
        console.log(`\n${city.name}: Already have ${currentCount} images (max: ${MAX_IMAGES_PER_CITY}), skipping`)
        continue
      }

      console.log(`\n${city.name}: ${currentCount}/${MAX_IMAGES_PER_CITY} images`)

      let cityNewImages = 0
      let nextNumber = getNextImageNumber(manifest, coast, city.slug)

      // Try each search term until we hit the max
      for (const searchTerm of city.searchTerms) {
        if (currentCount + cityNewImages >= MAX_IMAGES_PER_CITY) {
          break
        }

        try {
          console.log(`  Searching: "${searchTerm}"`)
          const photos = await fetchUnsplashImages(searchTerm, IMAGES_PER_SEARCH_TERM)

          for (const photo of photos) {
            // Skip if we already have this exact photo
            if (existingPhotoIds.has(photo.id)) {
              skippedCount++
              continue
            }

            // Skip if we've hit the city max
            if (currentCount + cityNewImages >= MAX_IMAGES_PER_CITY) {
              break
            }

            const filename = `${city.slug}-${String(nextNumber).padStart(2, '0')}.jpg`
            const relativePath = `${coast}/${filename}`
            const fullPath = path.join(IMAGES_DIR, relativePath)

            // Download regular size (1080px width)
            const imageUrl = photo.urls.regular
            console.log(`    Downloading ${filename}...`)
            await downloadImage(imageUrl, fullPath)

            // Add to manifest with Unsplash ID for deduplication
            manifest.images.push({
              id: `${coast}-${city.slug}-${String(nextNumber).padStart(2, '0')}`,
              file: relativePath,
              city: city.name,
              coast: coast,
              unsplashId: photo.id,
              photographer: photo.user?.name || 'Unknown',
              unsplashLink: photo.links?.html || null
            })

            existingPhotoIds.add(photo.id)
            cityNewImages++
            newImagesCount++
            nextNumber++
          }

          // Rate limiting - be nice to Unsplash API
          await new Promise(r => setTimeout(r, 500))

        } catch (err) {
          console.error(`    Error: ${err.message}`)
        }
      }

      if (cityNewImages > 0) {
        console.log(`  Added ${cityNewImages} new images`)
      }
    }
  }

  // Write updated manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

  console.log('\n=============================')
  console.log(`Total images: ${manifest.images.length}`)
  console.log(`New images downloaded: ${newImagesCount}`)
  console.log(`Duplicates skipped: ${skippedCount}`)
  console.log(`Manifest saved to: public/images.json`)
}

main().catch(console.error)
