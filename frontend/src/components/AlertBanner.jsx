import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const AlertBanner = ({ alert, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [alert, onClose, duration]);

  if (!alert) return null;

  const type = alert.type || 'error';

  const styles = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200/90 shadow-2xs',
    warning: 'bg-amber-50 text-amber-900 border-amber-300/90 shadow-2xs',
    error: 'bg-rose-50 text-rose-900 border-rose-200/90 shadow-2xs',
    info: 'bg-blue-50 text-blue-900 border-blue-200/90 shadow-2xs'
  };

  const icons = {
    success: <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />,
    warning: <AlertTriangle size={16} className="shrink-0 text-amber-600" />,
    error: <AlertCircle size={16} className="shrink-0 text-rose-600" />,
    info: <AlertCircle size={16} className="shrink-0 text-blue-600" />
  };

  return (
    <div
      className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 transition-all duration-300 border ${
        styles[type] || styles.error
      }`}
    >
      <div className="flex items-center gap-2.5">
        {icons[type] || icons.error}
        <span className="font-semibold leading-relaxed">{alert.message}</span>
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
