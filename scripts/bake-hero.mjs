// scripts/bake-hero.mjs
// Bakes the hero background into a black → red → white duotone, once, offline, so the
// browser doesn't have to colour-grade it with CSS filters/blend modes on every frame.
//
//   node scripts/bake-hero.mjs <input image> [output]
//   default output: public/arena-hero-duotone.jpg
import sharp from 'sharp'

const [input, output = 'public/arena-hero-duotone.jpg'] = process.argv.slice(2)
if (!input) {
  console.error('usage: node scripts/bake-hero.mjs <input image> [output]')
  process.exit(1)
}

// Luminance (0..1) → colour. Matches the site tokens: void #0A0A0A, signal #FF2B1C, chalk #FFFFFF.
const STOPS = [
  [0.0, [10, 10, 10]],
  [0.45, [142, 15, 10]],
  [0.8, [255, 43, 28]],
  [1.0, [255, 255, 255]],
]
const lut = new Uint8Array(256 * 3)
for (let i = 0; i < 256; i++) {
  const t = i / 255
  let k = STOPS.findIndex(([stop]) => t <= stop)
  k = Math.max(1, k === -1 ? STOPS.length - 1 : k)
  const [t0, c0] = STOPS[k - 1]
  const [t1, c1] = STOPS[k]
  const f = (t - t0) / (t1 - t0)
  for (let c = 0; c < 3; c++) lut[i * 3 + c] = Math.round(c0[c] + (c1[c] - c0[c]) * f)
}

const { data, info } = await sharp(input)
  .resize({ width: 2400, withoutEnlargement: true })
  .grayscale()
  .normalise({ lower: 1, upper: 99.5 })
  .raw()
  .toBuffer({ resolveWithObject: true })

const rgb = Buffer.alloc(info.width * info.height * 3)
for (let p = 0; p < data.length; p++) {
  const l = data[p] * 3
  rgb[p * 3] = lut[l]
  rgb[p * 3 + 1] = lut[l + 1]
  rgb[p * 3 + 2] = lut[l + 2]
}

const out = await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
  .jpeg({ quality: 78, mozjpeg: true, progressive: true })
  .toFile(output)

console.log(`${output}: ${info.width}x${info.height}, ${(out.size / 1024).toFixed(0)} KB`)
