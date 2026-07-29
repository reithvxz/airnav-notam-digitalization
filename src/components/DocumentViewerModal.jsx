import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import generatePdf from '../utils/pdfGenerator';
import { X, Download } from 'lucide-react';

/**
 * Generic Document Viewer Modal
 * Replaces PredutyViewerModal, BriefingViewerModal, and PostShiftViewerModal
 * 
 * @param {string} title - Modal title (e.g. "Preduty Briefing")
 * @param {string} subtitle - Modal subtitle (e.g. "2026-07-29 — 10:20")
 * @param {string} exportFilename - PDF export filename
 * @param {React.ComponentType} TemplateComponent - The template component to render (e.g. PredutyTemplate)
 * @param {object} templateProps - Props to pass to the template component (e.g. { preduty: data })
 * @param {function} onClose - Close handler
 */
export default function DocumentViewerModal({ title, subtitle, exportFilename, TemplateComponent, templateProps, onClose }) {
  const templateRef = useRef();
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await generatePdf(templateRef.current, exportFilename);
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
              {title}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {subtitle}
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
            <TemplateComponent ref={templateRef} {...templateProps} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
