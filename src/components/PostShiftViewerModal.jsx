import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PostShiftTemplate, { PAGE_WIDTH } from './PostShiftTemplate';
import { X, Download } from 'lucide-react';

export default function PostShiftViewerModal({ postshift, onClose }) {
  const templateRef = useRef();
  const [exporting, setExporting] = useState(false);

  if (!postshift) return null;

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: PAGE_WIDTH + 80,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const A4_WIDTH = 210;
      const A4_HEIGHT = 297;
      
      let pdfWidth = A4_WIDTH;
      let pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (pdfHeight > A4_HEIGHT) {
        pdfHeight = A4_HEIGHT;
        pdfWidth = (canvas.width * pdfHeight) / canvas.height;
      }
      
      const xOffset = (A4_WIDTH - pdfWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, 0, pdfWidth, pdfHeight);
      pdf.save(`PostShift_Review_${postshift.date?.replace(/ /g,'_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'white', borderRadius: 12,
        width: '90vw', maxWidth: 800, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
              Post-Shift Review Checklist
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {postshift.date} — Shift {postshift.shift} — {postshift.time}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#2563eb', color: 'white',
                border: 'none', borderRadius: 8,
                padding: '0.5rem 1rem', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
              }}
            >
              <Download size={15} />
              {exporting ? 'Mengekspor...' : 'Export PDF'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9', border: 'none', borderRadius: 8,
                padding: '0.5rem', cursor: 'pointer', display: 'flex',
              }}
            >
              <X size={18} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Modal Body — Scrollable preview */}
        <div style={{ overflow: 'auto', flex: 1, padding: '1rem', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <PostShiftTemplate ref={templateRef} postshift={postshift} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
