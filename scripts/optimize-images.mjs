import {rm, stat, readdir, rename} from 'node:fs/promises'
import {join, extname} from 'node:path'
import {fileURLToPath} from 'node:url'
import sharp from 'sharp'

const ROOT = new URL('../', import.meta.url)
const ASSETS_DIR = new URL('assets/', ROOT)
const MIN_SIZE_TO_PROCESS = 80 * 1024

const rules = [
  {match: /^assets\/hero\.jpg$/, width: 1920, quality: 78},
  {match: /^assets\/carousel\/(Aboutus|gallery|governance|Alumni|infocentre)\.jpg$/, width: 1280, quality: 76},
  {match: /^assets\/carousel\/partners\.jpg$/, width: 900, quality: 76},
  {match: /^assets\/gallery\//, width: 1600, quality: 74},
  {match: /^assets\/.*\.(jpg|jpeg)$/i, width: 1400, quality: 76},
  {match: /^assets\/.*\.png$/i, width: 1400, quality: 82},
]

const supportedExts = new Set(['.jpg', '.jpeg', '.png'])
const files = await listFiles(ASSETS_DIR)

let processed = 0
let savedBytes = 0

for (const fileUrl of files) {
  const relativePath = decodeURIComponent(fileUrl.pathname).split('/frontend/').at(-1)
  const ext = extname(relativePath).toLowerCase()
  if (!supportedExts.has(ext)) continue

  const before = await stat(fileUrl)
  if (before.size < MIN_SIZE_TO_PROCESS) continue

  const rule = rules.find((item) => item.match.test(relativePath))
  if (!rule) continue

  const filePath = fileURLToPath(fileUrl)
  const tempPath = `${filePath}.optimized`
  let pipeline = sharp(filePath, {failOn: 'none'}).rotate()
  const metadata = await pipeline.metadata()

  if (metadata.width && metadata.width > rule.width) {
    pipeline = pipeline.resize({width: rule.width, withoutEnlargement: true})
  }

  if (ext === '.png') {
    pipeline = pipeline.png({
      quality: rule.quality,
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: before.size < 700 * 1024,
    })
  } else {
    pipeline = pipeline.jpeg({
      quality: rule.quality,
      mozjpeg: true,
      progressive: true,
    })
  }

  await pipeline.toFile(tempPath)

  const after = await stat(tempPath)
  if (after.size < before.size) {
    await rename(tempPath, filePath)
    processed += 1
    savedBytes += before.size - after.size
    console.log(`${relativePath}: ${formatBytes(before.size)} -> ${formatBytes(after.size)}`)
  } else {
    await rm(tempPath, {force: true})
  }
}

console.log(`optimized ${processed} images, saved ${formatBytes(savedBytes)}`)

async function listFiles(dirUrl) {
  const entries = await readdir(dirUrl, {withFileTypes: true})
  const result = []

  for (const entry of entries) {
    const childUrl = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, dirUrl)
    if (entry.isDirectory()) {
      result.push(...await listFiles(childUrl))
    } else {
      result.push(childUrl)
    }
  }

  return result
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
