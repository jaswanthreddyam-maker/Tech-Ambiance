import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

const targetDirs = [
  path.join(ROOT_DIR, 'public/assets/images/projects'),
  path.join(ROOT_DIR, 'public/images'),
  path.join(ROOT_DIR, 'src/assets')
];

async function optimizeImages() {
  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg')) {
        const inputPath = path.join(dir, file);
        const outputPath = path.join(dir, file.replace(/\.(png|jpg)$/, '.webp'));
        
        console.log(`Optimizing ${file} -> ${path.basename(outputPath)}`);
        
        try {
          await sharp(inputPath)
            .webp({ quality: 80, effort: 6 })
            .toFile(outputPath);
            
          console.log(`Successfully converted ${file}`);
          fs.unlinkSync(inputPath);
        } catch (err) {
          console.error(`Error converting ${file}:`, err);
        }
      }
    }
  }
}

optimizeImages();
