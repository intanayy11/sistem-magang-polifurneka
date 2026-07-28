import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const AlertBanner = ({ alert, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [alert, onClose, duration]);

  if (!alert) return null;

  const isSuccess = alert.type === 'success';

  return (
    <div
      className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 transition-all duration-300 ${
        isSuccess
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
          : 'bg-rose-50 text-rose-800 border border-rose-200 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
        ) : (
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
        )}
        <span className="font-medium">{alert.message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          title="Tutup"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
