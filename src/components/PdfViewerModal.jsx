import React, { useState, useEffect, useRef } from 'react';
import PdfTemplate from './PdfTemplate';
import html2pdf from 'html2pdf.js';
import { X, Download, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

export default function PdfViewerModal({ notam, onClose }) {
  const { user } = useAuth();
  const printRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (notam) {
      generatePdfBlob();
    }
  }, [notam]);

  const generatePdfBlob = async () => {
    try {
      const element = printRef.current;
      if (!element) return;

      const opt = {
        margin:       [10, 15], // [top/bottom, left/right] in mm
        filename:     'preview.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (!notam) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '900px', height: '90%', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>View NOTAM: {notam.formNo}</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {pdfUrl && (
              <a href={pdfUrl} download={`NOTAM_${notam.formNo.replace(/\//g, '_')}.pdf`} className="btn btn-primary">
                <Download size={20} /> Download PDF
              </a>
            )}
            <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Loader size={40} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Mempersiapkan dokumen...</p>
            </div>
          ) : (
            <iframe src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Viewer" />
          )}
        </div>
      </div>

      {createPortal(
        <div style={{ position: 'absolute', top: 0, left: 0, width: '800px', zIndex: -1000, opacity: 0, pointerEvents: 'none' }}>
          <PdfTemplate ref={printRef} formData={notam.formData} user={{name: notam.creatorName || notam.creator, jabatan: notam.creatorJabatan}} formNo={notam.formNo} />
        </div>,
        document.body
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
