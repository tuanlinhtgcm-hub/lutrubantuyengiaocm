import React, { useState } from 'react';
import {
  Upload,
  X,
  FileText,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Info,
  Layers,
  Calendar,
  Building,
  Shield,
  Tag
} from 'lucide-react';
import { DocumentItem, DocumentFormat, AccessLevel, UserRole } from '../types';
import { DOCUMENT_TYPES, CATEGORIES, ISSUING_AUTHORITIES } from '../data/initialDocuments';
import { ArchiveService } from '../services/archiveService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (doc: DocumentItem) => void;
  currentUser: { name: string; email: string; role: UserRole };
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSaveDocument,
  currentUser,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [codeNumber, setCodeNumber] = useState('');
  const [documentType, setDocumentType] = useState('Kế hoạch');
  const [category, setCategory] = useState('Lý luận chính trị');
  const [issuingAuthority, setIssuingAuthority] = useState('Ban Tuyên giáo Tỉnh ủy');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('public');
  const [signatory, setSignatory] = useState('');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState('');
  const [fileFormat, setFileFormat] = useState<DocumentFormat>('PDF');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [ocrContent, setOcrContent] = useState('');

  // Status indicators
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<DocumentItem | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    // 1. Auto parse filename
    const parsed = ArchiveService.parseFileName(file.name);
    setTitle(parsed.title);
    setCodeNumber(parsed.codeNumber);
    setDocumentType(parsed.documentType);
    setFileFormat(parsed.fileFormat);

    // Format size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(file.size > 0 ? `${sizeInMB} MB` : '1.8 MB');

    // 2. Check duplicates
    const duplicate = ArchiveService.checkDuplicates(parsed.codeNumber, parsed.title);
    setDuplicateWarning(duplicate);

    // 3. Simulated intelligent OCR extraction
    setIsOcrProcessing(true);
    setTimeout(() => {
      const generatedOcr = `BAN TUYÊN GIÁO TỈNH ỦY CÀ MAU - Số: ${parsed.codeNumber}\nTRÍCH YẾU: ${parsed.title.toUpperCase()}\nCăn cứ quy định của Ban Bí thư Trung ương Đảng và Thường trực Tỉnh ủy Cà Mau; xét đề nghị của Văn phòng Ban Tuyên giáo.\nNội dung văn bản quy định cụ thể các nhiệm vụ trọng tâm công tác tuyên giáo trên địa bàn tỉnh Cà Mau năm ${parsed.year}.\nYêu cầu các cơ quan, đơn vị, Đảng bộ trực thuộc nghiêm túc triển khai thực hiện.`;
      setOcrContent(generatedOcr);
      if (!summary) {
        setSummary(`Văn bản ${parsed.documentType.toLowerCase()} của ${issuingAuthority} về ${parsed.title.toLowerCase()}.`);
      }
      setIsOcrProcessing(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên tài liệu');
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: title.trim(),
      codeNumber: codeNumber.trim() || '---/BTGTU',
      documentType,
      category,
      issuingAuthority,
      issueDate,
      accessLevel,
      signatory: signatory.trim(),
      summary: summary.trim() || title,
      keywords: keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      fileFormat,
      fileSize,
      ocrContent,
      updatedBy: currentUser.name,
      updatedAt: new Date().toISOString(),
      downloadCount: 0,
      viewCount: 1,
    };

    onSaveDocument(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-700" />
              TIẾP NHẬN & TẢI LÊN TÀI LIỆU SỐ HÓA
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tải lên tệp văn bản, hệ thống tự động bóc tách thông tin và quét OCR nhận diện nội dung
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop File Zone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Chọn tệp đính kèm (hỗ trợ nhiều tệp PDF, DOCX, XLSX, PPTX, JPG, PNG, MP4):
          </label>
          <div className="border-2 border-dashed border-slate-300 hover:border-red-600 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-amber-50/30 group">
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.pptx,.jpg,.png,.mp4,.doc,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Nhấn vào đây để tải tệp lên hoặc kéo thả vào khung
              </p>
              <p className="text-[11px] text-slate-400">
                Hệ thống tự động trích xuất: Số ký hiệu, Loại văn bản, Năm ban hành & Quét OCR
              </p>
            </label>
          </div>
        </div>

        {/* Selected file tags list */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-semibold">Tệp đã chọn:</span>
            {selectedFiles.map((file, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveFileIndex(idx);
                  processFile(file);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap ${
                  activeFileIndex === idx
                    ? 'bg-red-800 text-white border-red-800'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                {file.name}
              </button>
            ))}
          </div>
        )}

        {/* Duplicate warning alert */}
        {duplicateWarning && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs flex items-start gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">CẢNH BÁO TÀI LIỆU TRÙNG LẶP:</span> Đã tìm thấy tài liệu có số hiệu/tên tương tự trong hệ thống:
              <div className="font-semibold text-red-800 mt-0.5">
                "{duplicateWarning.title}" ({duplicateWarning.codeNumber})
              </div>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Đồng chí vui lòng kiểm tra kỹ để tránh nhập trùng bản ghi vào kho số.
              </p>
            </div>
          </div>
        )}

        {/* OCR Status banner */}
        {isOcrProcessing ? (
          <div className="p-2.5 bg-blue-50 text-blue-800 rounded-lg text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
            <span>Đang quét OCR và bóc tách dữ liệu từ tài liệu...</span>
          </div>
        ) : ocrContent ? (
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Đã tự động trích xuất thông tin cơ bản và văn bản toàn phần OCR</span>
          </div>
        ) : null}

        {/* Metadata Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên tài liệu / Hồ sơ <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Kế hoạch triển khai công tác Tuyên giáo năm 2026..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600 font-medium"
            />
          </div>

          {/* Row 2: CodeNumber, DocumentType, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số, ký hiệu <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={codeNumber}
                onChange={(e) => setCodeNumber(e.target.value)}
                placeholder="VD: 88-KH/BTGTU"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loại văn bản</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-red-600 font-medium"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lĩnh vực công tác</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-red-600 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: IssuingAuthority, IssueDate, AccessLevel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cơ quan ban hành</label>
              <select
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-red-600 font-medium"
              >
                {ISSUING_AUTHORITIES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày ban hành</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mức độ truy cập</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-red-600 font-bold text-red-800"
              >
                <option value="public">Công khai (Mọi người)</option>
                <option value="internal">Nội bộ (Cán bộ cơ quan)</option>
                <option value="restricted">Hạn chế (Chỉ biên tập & lãnh đạo)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Signatory & Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Người ký duyệt</label>
              <input
                type="text"
                value={signatory}
                onChange={(e) => setSignatory(e.target.value)}
                placeholder="Họ tên & chức danh người ký..."
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Từ khóa tìm kiếm (ngăn cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="VD: Chuyển đổi số, Tuyên giáo Cà Mau, Kế hoạch..."
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Row 5: Summary */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Trích yếu tóm tắt nội dung
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Tóm tắt nội dung chính của văn bản..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600 leading-relaxed"
            />
          </div>

          {/* Row 6: OCR Extracted Text Preview */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Nội dung bóc tách OCR (phục vụ tìm kiếm toàn văn)</span>
              <span className="text-[10px] text-slate-400">Có thể chỉnh sửa nếu cần</span>
            </label>
            <textarea
              rows={3}
              value={ocrContent}
              onChange={(e) => setOcrContent(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600 font-mono text-slate-700 bg-slate-50"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold shadow-md transition active:scale-95"
            >
              Lưu vào kho lưu trữ số
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
