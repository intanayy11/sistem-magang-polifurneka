import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  itemLabel = 'data',
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  if (totalItems <= 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Helper to generate visible page numbers (if totalPages > 7, smart ellipsis)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 text-xs">
      <span className="text-slate-500 font-medium">
        Menampilkan <strong className="text-slate-800 font-mono">{startIndex + 1}</strong>–<strong className="text-slate-800 font-mono">{endIndex}</strong> dari <strong className="text-slate-800 font-mono">{totalItems}</strong> {itemLabel}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span className="hidden xs:inline">Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-slate-400 font-bold text-xs">
                    ...
                  </span>
                );
              }
              const isActive = currentPage === pageNum;
              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E8A800] text-slate-950 shadow-2xs font-extrabold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span className="hidden xs:inline">Berikutnya</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
