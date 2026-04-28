/**
 * Patches all brand taglines in the DB with the correct { en, es } translations.
 * Safe to run on a live DB — only updates the `tagline` field, nothing else.
 * Usage: bun run update-taglines
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

export {}

const { Pool } = pg
const pool    = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma  = new PrismaClient({ adapter })

const TAGLINES: Record<string, { en: string; es: string }> = {
  apple:      { en: 'Think Different',         es: 'Pensá diferente'                },
  samsung:    { en: "Do What You Can't",       es: 'Hacé lo que no podés'           },
  dell:       { en: 'The Power To Do More',    es: 'El poder de hacer más'          },
  sony:       { en: 'Make.Believe',            es: 'Soñá. Creé.'                    },
  lg:         { en: "Life's Good",             es: 'La vida es buena'               },
  microsoft:  { en: 'Empower Every Person',    es: 'Potenciá a cada persona'        },
  lenovo:     { en: 'Smarter Technology',      es: 'Tecnología más inteligente'     },
  bose:       { en: 'Better Sound',            es: 'Mejor sonido'                   },
  asus:       { en: 'In Search of Incredible', es: 'En busca de lo increíble'       },
  google:     { en: 'Do More With Google',     es: 'Hacé más con Google'            },
  corsair:    { en: 'Level Up',                es: 'Subí de nivel'                  },
  hp:         { en: 'Keep Reinventing',        es: 'Seguí reinventando'             },
  acer:       { en: 'Explore Beyond Limits',   es: 'Explorá más allá de los límites'},
  nvidia:     { en: 'The Way Its Meant',       es: 'Como fue diseñado'              },
  amd:        { en: 'Together We Advance',     es: 'Juntos avanzamos'               },
  intel:      { en: 'Intel Inside',            es: 'Intel adentro'                  },
  jabra:      { en: 'Sound of Life',           es: 'El sonido de la vida'           },
  benq:       { en: 'Designed for You',        es: 'Diseñado para vos'              },
  kingston:   { en: 'Ask a Pro',               es: 'Consultá a un pro'              },
  seagate:    { en: 'There Is No Try',         es: 'No hay intentos'                },
  sennheiser: { en: 'Hear the Difference',     es: 'Escuchá la diferencia'          },
  motorola:   { en: 'Hello Moto',              es: 'Hola Moto'                      },
}

console.log(`\nPatching ${Object.keys(TAGLINES).length} brand taglines...\n`)

let updated = 0
let skipped = 0

for (const [slug, tagline] of Object.entries(TAGLINES)) {
  const result = await prisma.brand.updateMany({
    where: { slug },
    data:  { tagline },
  })
  if (result.count > 0) {
    console.log(`  ✅ ${slug}`)
    updated++
  } else {
    console.log(`  ⚠️  ${slug} — not found in DB`)
    skipped++
  }
}

console.log(`\nDone. Updated: ${updated}  Skipped: ${skipped}\n`)
await prisma.$disconnect()
await pool.end()
