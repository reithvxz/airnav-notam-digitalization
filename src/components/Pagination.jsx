import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', borderRadius: '6px',
          background: currentPage === 1 ? '#f3f4f6' : 'white',
          border: '1px solid #e5e7eb',
          color: currentPage === 1 ? '#9ca3af' : '#374151',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}
        title="Halaman Pertama"
      >
        <ChevronsLeft size={16} />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', borderRadius: '6px',
          background: currentPage === 1 ? '#f3f4f6' : 'white',
          border: '1px solid #e5e7eb',
          color: currentPage === 1 ? '#9ca3af' : '#374151',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}
      >
        <ChevronLeft size={16} />
      </button>
      
      <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 500, padding: '0 0.5rem' }}>
        Halaman {currentPage} dari {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', borderRadius: '6px',
          background: currentPage === totalPages ? '#f3f4f6' : 'white',
          border: '1px solid #e5e7eb',
          color: currentPage === totalPages ? '#9ca3af' : '#374151',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}
      >
        <ChevronRight size={16} />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', borderRadius: '6px',
          background: currentPage === totalPages ? '#f3f4f6' : 'white',
          border: '1px solid #e5e7eb',
          color: currentPage === totalPages ? '#9ca3af' : '#374151',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}
        title="Halaman Terakhir"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
