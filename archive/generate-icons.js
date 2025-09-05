const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG als Base64 string (vereinfachtes Icon)
const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#008080"/>
  <path d="M128 384l128-128 128 128" stroke="white" stroke-width="32" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M128 256l128-128 128 128" stroke="white" stroke-width="32" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon);
  
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, 'public', 'icons', `icon-${size}x${size}.png`));
    
    console.log(`Generated icon-${size}x${size}.png`);
  }
  
  // Favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'public', 'favicon.png'));
    
  console.log('Generated favicon.png');
}

generateIcons().catch(console.error);
