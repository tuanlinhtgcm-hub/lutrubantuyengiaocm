import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { DocumentItem } from '../types';

interface DeleteConfirmModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (docId: string, reason: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  document,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !document) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(document.id, reason.trim() || 'Xóa theo quyết định rà soát hồ sơ');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              XÁC NHẬN XÓA TÀI LIỆU KHỎI KHO
            </h3>
            <p className="text-[11px] text-slate-500">Hành động này sẽ được ghi vào nhật ký kiểm toán hệ thống</p>
          </div>
        </div>

        <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-900 space-y-1">
          <p className="font-bold text-slate-900">{document.title}</p>
          <p className="text-[11px] text-slate-600">Số hiệu: <span className="font-mono font-bold">{document.codeNumber}</span></p>
          <p className="text-[11px] text-slate-600">Mức độ: <span className="font-semibold uppercase">{document.accessLevel}</span></p>
        </div>

        <form onSubmit={handleConfirm} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lý do xóa văn bản <span className="text-red-600">*</span>:
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Thu hồi theo công văn số..., thay thế bằng văn bản mới..."
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Trash2 className="w-4 h-4" />
              Xác nhận xóa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
