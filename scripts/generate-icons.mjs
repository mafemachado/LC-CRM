import sharp from "sharp"
import { readFileSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgPath   = resolve(__dirname, "../public/logo.svg")
const outDir    = resolve(__dirname, "../public/icons")

mkdirSync(outDir, { recursive: true })

const svgBuffer = readFileSync(svgPath)
const sizes     = [72, 96, 128, 144, 152, 192, 384, 512]

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`${outDir}/icon-${size}x${size}.png`)
  console.log(`✅ icon-${size}x${size}.png`)
}

// Apple touch icon (180x180)
await sharp(svgBuffer).resize(180, 180).png().toFile(resolve(__dirname, "../public/apple-touch-icon.png"))
console.log("✅ apple-touch-icon.png")

// Favicon (32x32)
await sharp(svgBuffer).resize(32, 32).png().toFile(resolve(__dirname, "../public/favicon-32x32.png"))
console.log("✅ favicon-32x32.png")

console.log("\n🎉 Ícones gerados com sucesso!")
