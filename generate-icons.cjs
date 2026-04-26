const sharp = require('sharp')

// SVG del ícono: letra A con una corchea, fondo verde
const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo verde -->
  <rect width="512" height="512" rx="80" fill="#0F6E56"/>
  
  <!-- Corchea musical grande -->
<circle cx="220" cy="360" r="60" fill="#9FE1CB"/> <rect x="270" y="100" width="28" height="280" fill="#9FE1CB" rx="14"/> <path d="M298 100 Q420 140 400 230 Q380 300 298 280" fill="#9FE1CB"/>
</svg>
`

async function generarIconos() {
  const svgBuffer = Buffer.from(svg)
  
  await sharp(svgBuffer).resize(192, 192).png().toFile('public/icon-192.png')
  console.log('✓ icon-192.png generado')
  
  await sharp(svgBuffer).resize(512, 512).png().toFile('public/icon-512.png')
  console.log('✓ icon-512.png generado')
  
  console.log('¡Íconos listos!')
}

generarIconos().catch(console.error)