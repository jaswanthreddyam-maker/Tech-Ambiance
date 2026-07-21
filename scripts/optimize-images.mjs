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
      if (file.endsWith('.webp')) {
        const inputPath = path.join(dir, file);
        const tempPath = path.join(dir, 'temp-' + file);
        
        console.log(`Aggressively optimizing ${file}...`);
        
        try {
          let pipeline = sharp(inputPath);
          
          if (file.includes('logo')) {
            pipeline = pipeline.resize({ width: 256, withoutEnlargement: true });
          } else if (file.includes('gold-floral-clean')) {
            pipeline = pipeline.resize({ width: 720, withoutEnlargement: true });
          } else if (file.includes('cover') || file.includes('landing')) {
             // For project covers that are heavily cropped vertically by the UI
             // we increase compression to save bytes without changing dimensions 
             // since mobile might still need the vertical height.
          }
          
          const buffer = await pipeline
            .webp({ quality: 60, effort: 6 })
            .toBuffer();
            
          const optPath = inputPath.replace('.webp', '-opt.webp');
          fs.writeFileSync(optPath, buffer);
          console.log(`Successfully hyper-optimized ${file}`);
        } catch (err) {
          console.error(`Error converting ${file}:`, err);
        }
      }
    }
  }
}

optimizeImages();
