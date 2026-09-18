import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite">
      {toasts.map((t) => {
        const getIcon = () => {
          switch (t.type) {
            case 'success':
              return <CheckCircle2 size={20} color="#16a34a" />;
            case 'error':
              return <AlertCircle size={20} color="#dc2626" />;
            case 'warning':
              return <AlertTriangle size={20} color="#d97706" />;
            default:
              return <Info size={20} color="#2563eb" />;
          }
        };

        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div style={{ marginTop: '2px', flexShrink: 0 }}>{getIcon()}</div>
            <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{ color: '#94a3b8', padding: '2px', marginLeft: '4px' }}
              title="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
