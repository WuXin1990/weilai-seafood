
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
    <div className="absolute top-safe-top left-0 w-full z-[100] pointer-events-none flex flex-col items-center gap-3 p-4 pt-16">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={`pointer-events-auto relative overflow-hidden flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border animate-fade-in-down cursor-pointer transition-all active:scale-95 group min-w-[200px] max-w-[90%] ${
            toast.type === 'success' ? 'bg-green-900/80 border-green-500/30 text-green-100' : 
            toast.type === 'error' ? 'bg-red-900/80 border-red-500/30 text-red-100' : 
            'bg-ocean-800/90 border-gold-500/30 text-gold-100'
          }`}
        >
            {/* Icon */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === 'success' ? 'bg-green-500/20' : 
                toast.type === 'error' ? 'bg-red-500/20' : 
                'bg-gold-500/20'
            }`}>
                {toast.type === 'success' && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {toast.type === 'error' && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>}
                {toast.type === 'info' && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
            </div>

            <span className="text-sm font-medium tracking-wide leading-snug">{toast.text}</span>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/10">
                <div 
                    className={`h-full animate-progress ${
                        toast.type === 'success' ? 'bg-green-500' : 
                        toast.type === 'error' ? 'bg-red-500' : 
                        'bg-gold-500'
                    }`}
                    style={{ animationDuration: '3000ms' }}
                ></div>
            </div>
            
            <style>{`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation-name: progress;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
