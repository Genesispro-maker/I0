"use client"
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export const Modal = ({ children, onClose }: ModalProps) => {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 grid place-content-center p-4 z-50">
      <div className="absolute inset-0 bg-[#000000BF] backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-zinc-900 rounded-lg p-8 max-w-lg w-full shadow-xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};