import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  titleBn?: string;
  message?: string;
  itemName?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  titleBn,
  message,
  itemName,
  confirmLabel = 'Delete Now (ডিলিট করুন)',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-zinc-900 border border-red-500/30 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400 shadow-lg shadow-red-950/50">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="space-y-1 pr-6">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-1.5">
              <span>{title}</span>
            </h3>
            {titleBn && (
              <span className="text-xs font-mono text-red-300 block">{titleBn}</span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
          {itemName && (
            <div className="text-sm font-semibold text-white break-words">
              &ldquo;{itemName}&rdquo;
            </div>
          )}
          <p className="text-xs text-zinc-300 leading-relaxed">
            {message || 'আপনি কি নিশ্চিত যে এটি স্থায়ীভাবে মুছে ফেলতে চান? এটি মুছে ফেলার পর আর পুনরুদ্ধার করা যাবে না।'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel (বাতিল)
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-lg shadow-red-900/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
