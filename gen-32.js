const sharp = require('sharp');

const svgIcon = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#008080"/>
  <path d="M128 384l128-128 128 128" stroke="white" stroke-width="32" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M128 256l128-128 128 128" stroke="white" stroke-width="32" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

sharp(Buffer.from(svgIcon))
  .resize(32, 32)
  .png()
  .toFile('./public/icons/icon-32x32.png')
  .then(() => console.log('Generated 32x32 icon'));
