
import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-0 left-0 w-full z-[100] pointer-events-none flex flex-col items-center pt-[calc(env(safe-area-inset-top)+20px)] px-6 gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={`pointer-events-auto relative bg-ocean-900 border border-white/10 px-6 py-4 flex items-center gap-4 min-w-[280px] max-w-full animate-fade-in-down shadow-2xl transition-all active:scale-95`}
        >
            <div className={`w-1.5 h-1.5 ${
                toast.type === 'success' ? 'bg-gold-500' : 
                toast.type === 'error' ? 'bg-red-500' : 
                'bg-white'
            }`}></div>
            <span className="text-[11px] font-bold text-white uppercase tracking-widest flex-1">{toast.text}</span>
            
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-white/5 overflow-hidden">
                <div 
                    className="h-full bg-gold-500 animate-progress"
                    style={{ animationDuration: '3000ms' }}
                />
            </div>
            
            <style>{`
                @keyframes progress { from { width: 100%; } to { width: 0%; } }
                .animate-progress { animation: progress linear forwards; }
            `}</style>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
