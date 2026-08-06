import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'slideUp 0.3s ease-out',
        textAlign: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <AlertTriangle size={32} color="#dc2626" />
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#111827' }}>
          {title || 'Konfirmasi Hapus'}
        </h3>
        <p style={{ margin: '0 0 2rem 0', color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {message || 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.'}
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="btn" 
            onClick={onClose}
            style={{ 
              flex: 1, 
              background: '#f3f4f6', 
              color: '#374151', 
              border: 'none', 
              fontWeight: 600,
              padding: '0.75rem'
            }}
          >
            Batal
          </button>
          <button 
            className="btn" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ 
              flex: 1, 
              background: '#dc2626', 
              color: 'white', 
              border: 'none', 
              fontWeight: 600,
              padding: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)'
            }}
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
