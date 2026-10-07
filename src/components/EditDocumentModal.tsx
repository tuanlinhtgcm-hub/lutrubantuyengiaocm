import React, { useState } from 'react';
import { Edit, X, Save } from 'lucide-react';
import { DocumentItem, AccessLevel, UserRole } from '../types';
import { DOCUMENT_TYPES, CATEGORIES, ISSUING_AUTHORITIES } from '../data/initialDocuments';

interface EditDocumentModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: DocumentItem) => void;
  currentUser: { name: string; email: string; role: UserRole };
}

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  document,
  isOpen,
  onClose,
  onSave,
  currentUser,
}) => {
  if (!isOpen || !document) return null;

  const [title, setTitle] = useState(document.title);
  const [codeNumber, setCodeNumber] = useState(document.codeNumber);
  const [documentType, setDocumentType] = useState(document.documentType);
  const [category, setCategory] = useState(document.category);
  const [issuingAuthority, setIssuingAuthority] = useState(document.issuingAuthority);
  const [issueDate, setIssueDate] = useState(document.issueDate);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(document.accessLevel);
  const [signatory, setSignatory] = useState(document.signatory || '');
  const [summary, setSummary] = useState(document.summary);
  const [keywords, setKeywords] = useState(document.keywords?.join(', ') || '');
  const [ocrContent, setOcrContent] = useState(document.ocrContent || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DocumentItem = {
      ...document,
      title: title.trim(),
      codeNumber: codeNumber.trim(),
      documentType,
      category,
      issuingAuthority,
      issueDate,
      accessLevel,
      signatory: signatory.trim(),
      summary: summary.trim(),
      keywords: keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      ocrContent,
      updatedBy: currentUser.name,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Edit className="w-5 h-5 text-amber-600" />
            CHỈNH SỬA THÔNG TIN TÀI LIỆU
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên tài liệu / Hồ sơ</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số, ký hiệu</label>
              <input
                type="text"
                required
                value={codeNumber}
                onChange={(e) => setCodeNumber(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loại văn bản</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lĩnh vực</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cơ quan ban hành</label>
              <select
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
              >
                {ISSUING_AUTHORITIES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày ban hành (ngày/tháng/năm)
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mức độ truy cập</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-bold text-red-800"
              >
                <option value="public">Công khai</option>
                <option value="internal">Nội bộ</option>
                <option value="restricted">Hạn chế</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Trích yếu nội dung</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nội dung OCR quét</label>
            <textarea
              rows={3}
              value={ocrContent}
              onChange={(e) => setOcrContent(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono text-slate-700 bg-slate-50"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
