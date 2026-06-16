/**
 * Generates repo-local favicon assets from the About profile photo.
 * Run: npm run icons:generate
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "public/images/about/thiago-oliveira.jpg");
const brandDir = path.join(root, "public/images/brand");
const appDir = path.join(root, "src/app");

/** Face-focused crop on the profile photo (720×720 source). */
const FACE_CROP = { left: 72, top: 96, width: 400, height: 400 };

async function buildBaseIconBuffer() {
  const size = 512;

  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="white"/>
    </svg>`
  );

  return sharp(sourcePath)
    .extract(FACE_CROP)
    .resize(size, size, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.9, saturation: 0.82 })
    .sharpen({ sigma: 0.8 })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function writePngFromBase(baseBuffer, filePath, size) {
  await sharp(baseBuffer).resize(size, size).png({ compressionLevel: 9 }).toFile(filePath);
}

/** Minimal ICO writer for 16/32/48 PNG buffers. */
async function writeIco(filePath, pngBuffers) {
  const images = await Promise.all(
    pngBuffers.map(async (buffer) => {
      const meta = await sharp(buffer).metadata();
      return {
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        buffer,
      };
    })
  );

  const count = images.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const header = Buffer.alloc(headerSize);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  images.forEach((image, index) => {
    const entryOffset = 6 + index * 16;
    header.writeUInt8(image.width >= 256 ? 0 : image.width, entryOffset);
    header.writeUInt8(image.height >= 256 ? 0 : image.height, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(image.buffer.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);
    offset += image.buffer.length;
  });

  await writeFile(filePath, Buffer.concat([header, ...images.map((image) => image.buffer)]));
}

async function main() {
  await mkdir(brandDir, { recursive: true });

  const baseBuffer = await buildBaseIconBuffer();

  const outputs = [
    { file: "favicon-16.png", size: 16 },
    { file: "favicon-32.png", size: 32 },
    { file: "favicon-48.png", size: 48 },
    { file: "icon-192.png", size: 192 },
    { file: "apple-icon.png", size: 180 },
    { file: "icon-512.png", size: 512 },
  ];

  for (const { file, size } of outputs) {
    await writePngFromBase(baseBuffer, path.join(brandDir, file), size);
  }

  const favicon16 = await sharp(baseBuffer).resize(16, 16).png().toBuffer();
  const favicon32 = await sharp(baseBuffer).resize(32, 32).png().toBuffer();
  const favicon48 = await sharp(baseBuffer).resize(48, 48).png().toBuffer();

  await writeIco(path.join(brandDir, "favicon.ico"), [favicon16, favicon32, favicon48]);
  await writeIco(path.join(appDir, "favicon.ico"), [favicon16, favicon32, favicon48]);

  await writePngFromBase(baseBuffer, path.join(appDir, "icon.png"), 32);
  await writePngFromBase(baseBuffer, path.join(appDir, "apple-icon.png"), 180);

  console.log("Site icons generated in public/images/brand and src/app/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
