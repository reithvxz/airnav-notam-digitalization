import html2pdf from 'html2pdf.js';

export default async function generatePdf(element, filename) {
  if (!element) return;

  const opt = {
    margin:       [10, 15], // [top/bottom, left/right] in mm
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF', error);
  }
}
