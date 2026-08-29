// Script para generar iconos PNG desde el SVG
// Ejecutar: node generate-icons.js
// Requiere: npm install canvas (opcional, si no tiene crea placeholder)

const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');

// Crear un PNG placeholder de 1x1 pixel azul oscuro (el usuario puede reemplazarlo)
function createPlaceholderPng(size) {
  // PNG minimal header + blue pixel
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xD7, 0x63, 0x10, 0x60, 0x18, 0x00, 0x00,
    0x00, 0x60, 0x00, 0x01, 0xFB, 0xD2, 0x84, 0xEC,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82
  ]);
  return pngHeader;
}

// Crear iconos placeholder
fs.writeFileSync(path.join(frontendDir, 'icon-192.png'), createPlaceholderPng(192));
fs.writeFileSync(path.join(frontendDir, 'icon-512.png'), createPlaceholderPng(512));

console.log('Iconos placeholder creados.');
console.log('IMPORTANTE: Reemplazá icon-192.png e icon-512.png con tu imagen real.');
console.log('La imagen debe ser cuadrada (192x192 y 512x512 px).');
