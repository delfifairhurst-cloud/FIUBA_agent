// Módulo PDF Parser para FIUBA Agent
// Permite extraer texto de archivos PDF (apuntes, parciales de Altillo.com, guías)

// Cargar worker de PDF.js dinámicamente si no está presente
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Renderizar página de PDF como imagen (para enunciados con fórmulas/dibujos)
async function getPdfPageAsImage(file, pageNum = 1, scale = 1.5) {
  if (!window.pdfjsLib) throw new Error('PDF.js no cargado');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const page = await pdf.getPage(Math.min(pageNum, pdf.numPages));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { dataUrl: canvas.toDataURL('image/png'), width: viewport.width, height: viewport.height, pages: pdf.numPages };
}

/**
 * Lee un archivo PDF seleccionado por el usuario y extrae todo su contenido de texto.
 * @param {File} file - El archivo PDF subido por el alumno.
 * @returns {Promise<{ filename: string, text: string, pages: number }>}
 */
async function extractTextFromPDF(file) {
  if (!window.pdfjsLib) {
    throw new Error('La librería PDF.js no está cargada.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const totalPages = pdf.numPages;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ');

    fullText += `\n--- PÁGINA ${pageNum} ---\n` + pageText;
  }

  return {
    filename: file.name,
    text: fullText.trim(),
    pages: totalPages
  };
}
