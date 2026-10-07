import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Download,
  Bookmark,
  Share2,
  QrCode,
  FileText,
  FileCheck,
  Shield,
  ShieldAlert,
  Calendar,
  Building,
  Tag,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
  Edit,
  ExternalLink,
  Lock,
  ChevronRight,
  X,
  Copy,
  Check,
  History,
  FileSpreadsheet,
  Film,
  Image as ImageIcon,
  FileCode,
  Sparkles,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { DocumentItem, FilterCriteria, UserRole, AccessLevel, DocumentFormat } from '../types';
import { DOCUMENT_TYPES, CATEGORIES, ISSUING_AUTHORITIES } from '../data/initialDocuments';
import { ArchiveService } from '../services/archiveService';
import { formatDate } from '../utils/dateUtils';

interface DocumentArchiveProps {
  documents: DocumentItem[];
  userRole: UserRole;
  currentUserId: string;
  bookmarks: string[];
  filterCriteria: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
  onResetFilters: () => void;
  onSelectDocument: (doc: DocumentItem) => void;
  selectedDocument: DocumentItem | null;
  onCloseDetail: () => void;
  onDownload: (doc: DocumentItem) => void;
  onToggleBookmark: (docId: string) => void;
  onOpenUploadModal: () => void;
  onOpenEditModal: (doc: DocumentItem) => void;
  onDeleteDocument: (doc: DocumentItem) => void;
  onOpenAdvancedSearch?: () => void;
}

export const DocumentArchive: React.FC<DocumentArchiveProps> = ({
  documents,
  userRole,
  currentUserId,
  bookmarks,
  filterCriteria,
  onFilterChange,
  onResetFilters,
  onSelectDocument,
  selectedDocument,
  onCloseDetail,
  onDownload,
  onToggleBookmark,
  onOpenUploadModal,
  onOpenEditModal,
  onDeleteDocument,
  onOpenAdvancedSearch,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'downloads'>('newest');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQRModal, setShowQRModal] = useState<DocumentItem | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'ocr' | 'history' | 'related'>('overview');

  // List of available issuing years for dropdown selection
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    documents.forEach((d) => {
      if (d.issueDate) {
        const yr = d.issueDate.substring(0, 4);
        if (/^\d{4}$/.test(yr)) {
          yearsSet.add(yr);
        }
      }
    });
    ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2015'].forEach((y) => yearsSet.add(y));
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [documents]);

  // Filter documents based on criteria and role permissions
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Security role check:
      // Guests only see public
      if (userRole === 'guest' && doc.accessLevel !== 'public') {
        return false;
      }
      // Staff see public, internal, restricted (not confidential unless admin/editor)
      if (userRole === 'staff' && doc.accessLevel === 'confidential') {
        return false;
      }

      // Keyword search (title, codeNumber, summary, keywords, ocrContent, issuingAuthority)
      if (filterCriteria.keyword) {
        const kw = filterCriteria.keyword.toLowerCase().trim();
        const inTitle = doc.title.toLowerCase().includes(kw);
        const inCode = doc.codeNumber.toLowerCase().includes(kw);
        const inSummary = doc.summary.toLowerCase().includes(kw);
        const inAuth = doc.issuingAuthority.toLowerCase().includes(kw);
        const inKeywords = doc.keywords.some((k) => k.toLowerCase().includes(kw));
        const inOCR = doc.ocrContent ? doc.ocrContent.toLowerCase().includes(kw) : false;

        if (!inTitle && !inCode && !inSummary && !inAuth && !inKeywords && !inOCR) {
          return false;
        }
      }

      // Document Type
      if (filterCriteria.documentType && doc.documentType !== filterCriteria.documentType) {
        return false;
      }

      // Category
      if (filterCriteria.category && doc.category !== filterCriteria.category) {
        return false;
      }

      // Issuing Authority
      if (filterCriteria.issuingAuthority && doc.issuingAuthority !== filterCriteria.issuingAuthority) {
        return false;
      }

      // Access Level
      if (filterCriteria.accessLevel && doc.accessLevel !== filterCriteria.accessLevel) {
        return false;
      }

      // File Format
      if (filterCriteria.fileFormat && doc.fileFormat !== filterCriteria.fileFormat) {
        return false;
      }

      // Year filter
      if (filterCriteria.year) {
        if (!doc.issueDate.startsWith(filterCriteria.year)) {
          return false;
        }
      }

      // Date range filter
      if (filterCriteria.dateFrom && doc.issueDate < filterCriteria.dateFrom) {
        return false;
      }
      if (filterCriteria.dateTo && doc.issueDate > filterCriteria.dateTo) {
        return false;
      }

      return true;
    });
  }, [documents, filterCriteria, userRole]);

  // Sort documents
  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      if (sortBy === 'newest') return b.issueDate.localeCompare(a.issueDate);
      if (sortBy === 'oldest') return a.issueDate.localeCompare(b.issueDate);
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'vi');
      if (sortBy === 'downloads') return (b.downloadCount || 0) - (a.downloadCount || 0);
      return 0;
    });
  }, [filteredDocuments, sortBy]);

  // Handle Internal Link Share
  const handleShareInternal = (doc: DocumentItem) => {
    if (doc.accessLevel === 'confidential' || doc.accessLevel === 'restricted') {
      alert(`LƯU Ý AN TOÀN THÔNG TIN:\nTài liệu "${doc.codeNumber}" thuộc diện [${getAccessLevelBadge(doc.accessLevel).label}].\nChỉ sao chép liên kết cho cán bộ có thẩm quyền trong nội bộ cơ quan.`);
    }
    const internalUrl = `${window.location.origin}?docId=${doc.id}`;
    navigator.clipboard.writeText(internalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getFormatBadge = (format: DocumentFormat) => {
    switch (format) {
      case 'PDF':
        return { bg: 'bg-red-50 text-red-700 border-red-200', icon: FileText };
      case 'DOCX':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText };
      case 'XLSX':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FileSpreadsheet };
      case 'PPTX':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: FileText };
      case 'JPG':
      case 'PNG':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: ImageIcon };
      case 'MP4':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Film };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: FileCode };
    }
  };

  const getAccessLevelBadge = (level: AccessLevel) => {
    switch (level) {
      case 'public':
        return { label: 'Công khai', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'internal':
        return { label: 'Nội bộ', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'restricted':
        return { label: 'Hạn chế', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'confidential':
        return { label: 'Mật', bg: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { label: 'Công khai', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
            KHO TÀI LIỆU TUYÊN GIÁO ĐIỆN TỬ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tìm kiếm, phân loại đa chiều và quản lý hồ sơ số hóa của Tỉnh ủy và Ban Tuyên giáo Cà Mau
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenAdvancedSearch && (
            <button
              onClick={onOpenAdvancedSearch}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-xs"
              title="Mở Module tra cứu nâng cao kết hợp OCR"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
              <span>Tra cứu nâng cao</span>
            </button>
          )}

          {ArchiveService.canEdit(userRole) && (
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tiếp nhận & Tải lên tài liệu</span>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table' ? 'bg-white shadow text-red-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng bảng"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid' ? 'bg-white shadow text-red-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3-ZONE MAIN LAYOUT: Left Zone (Filter), Middle Zone (Results), Right Zone (Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==============================================================
            ZONE A (CỘT TRÁI): BỘ LỌC VÀ DANH MỤC
            ============================================================== */}
        <aside className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-red-600" />
              Bộ lọc & Danh mục
            </h3>
            <button
              onClick={onResetFilters}
              className="text-[11px] text-red-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              Đặt lại
            </button>
          </div>

          {/* 1. Keyword search input inside filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Từ khóa / Số ký hiệu
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={filterCriteria.keyword}
                onChange={(e) => onFilterChange({ ...filterCriteria, keyword: e.target.value })}
                placeholder="Nhập tên, số hiệu, OCR..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          {/* 2. Loại tài liệu (Đầy đủ theo yêu cầu người dùng) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Loại tài liệu</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {filterCriteria.documentType ? 'Đang lọc' : 'Tất cả'}
              </span>
            </label>
            <select
              value={filterCriteria.documentType}
              onChange={(e) => onFilterChange({ ...filterCriteria, documentType: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-red-600 text-slate-800 font-medium"
            >
              <option value="">-- Tất cả loại văn bản ({DOCUMENT_TYPES.length}) --</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Lĩnh vực (Đầy đủ 13 lĩnh vực theo yêu cầu) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Lĩnh vực công tác</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {filterCriteria.category ? 'Đang lọc' : 'Tất cả'}
              </span>
            </label>
            <select
              value={filterCriteria.category}
              onChange={(e) => onFilterChange({ ...filterCriteria, category: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-red-600 text-slate-800 font-medium"
            >
              <option value="">-- Tất cả lĩnh vực ({CATEGORIES.length}) --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Cơ quan ban hành */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cơ quan ban hành
            </label>
            <select
              value={filterCriteria.issuingAuthority}
              onChange={(e) =>
                onFilterChange({ ...filterCriteria, issuingAuthority: e.target.value })
              }
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-red-600 text-slate-800 font-medium"
            >
              <option value="">-- Tất cả cơ quan --</option>
              {ISSUING_AUTHORITIES.map((auth) => (
                <option key={auth} value={auth}>
                  {auth}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Mức độ truy cập (Bảo mật) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mức độ truy cập
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { val: '', label: 'Tất cả' },
                { val: 'public', label: 'Công khai' },
                { val: 'internal', label: 'Nội bộ' },
                { val: 'restricted', label: 'Hạn chế' },
              ].map((lvl) => (
                <button
                  key={lvl.val}
                  type="button"
                  onClick={() => onFilterChange({ ...filterCriteria, accessLevel: lvl.val })}
                  className={`px-2 py-1.5 text-xs rounded-lg border text-center transition font-medium ${
                    filterCriteria.accessLevel === lvl.val
                      ? 'bg-red-800 text-white border-red-800 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Định dạng tệp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Định dạng tệp
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['', 'PDF', 'DOCX', 'XLSX', 'PPTX', 'JPG', 'MP4'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onFilterChange({ ...filterCriteria, fileFormat: fmt })}
                  className={`px-2.5 py-1 text-xs rounded-md border font-medium transition ${
                    filterCriteria.fileFormat === fmt
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fmt || 'Tất cả'}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Thời gian ban hành */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-700" />
                Năm ban hành
              </label>
              {filterCriteria.year && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filterCriteria, year: '' })}
                  className="text-[10px] text-red-600 font-semibold hover:underline"
                >
                  Xóa lọc năm
                </button>
              )}
            </div>

            {/* Nút xổ xuống (dropdown) lựa chọn năm */}
            <div className="relative mb-2">
              <select
                value={filterCriteria.year}
                onChange={(e) => onFilterChange({ ...filterCriteria, year: e.target.value })}
                className="w-full text-xs py-2 px-3 pr-8 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 shadow-xs cursor-pointer appearance-none"
              >
                <option value="">-- Tất cả các năm ban hành --</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Năm ban hành: {yr}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Chọn nhanh các năm tiêu biểu */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              {['', '2026', '2025', '2024'].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => onFilterChange({ ...filterCriteria, year: yr })}
                  className={`py-1 text-[11px] rounded border text-center font-medium transition ${
                    filterCriteria.year === yr
                      ? 'bg-red-800 text-white border-red-800 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {yr || 'Tất cả'}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-medium">Hoặc chọn khoảng ngày:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  value={filterCriteria.dateFrom}
                  onChange={(e) =>
                    onFilterChange({ ...filterCriteria, dateFrom: e.target.value })
                  }
                  className="text-[11px] p-1.5 rounded border border-slate-200"
                  title="Từ ngày"
                />
                <input
                  type="date"
                  value={filterCriteria.dateTo}
                  onChange={(e) =>
                    onFilterChange({ ...filterCriteria, dateTo: e.target.value })
                  }
                  className="text-[11px] p-1.5 rounded border border-slate-200"
                  title="Đến ngày"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ==============================================================
            ZONE B (KHU VỰC GIỮA): DANH SÁCH KẾT QUẢ
            ============================================================== */}
        <main
          className={`${
            selectedDocument ? 'lg:col-span-5' : 'lg:col-span-9'
          } bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm transition-all duration-300 space-y-4`}
        >
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Tìm thấy{' '}
                <span className="text-red-700 font-extrabold text-sm">
                  {sortedDocuments.length}
                </span>{' '}
                kết quả
              </span>
              {(filterCriteria.keyword ||
                filterCriteria.documentType ||
                filterCriteria.category ||
                filterCriteria.accessLevel) && (
                <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  Bộ lọc đang bật
                </span>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
              >
                <option value="newest">Ngày ban hành (Mới nhất)</option>
                <option value="oldest">Ngày ban hành (Cũ nhất)</option>
                <option value="title">Tên tài liệu (A-Z)</option>
                <option value="downloads">Lượt tải nhiều nhất</option>
              </select>
            </div>
          </div>

          {/* When empty */}
          {sortedDocuments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Không tìm thấy tài liệu phù hợp</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Vui lòng thử lại với từ khóa khác, bỏ bớt điều kiện lọc hoặc liên hệ quản trị viên để được hỗ trợ.
              </p>
              <button
                onClick={onResetFilters}
                className="px-3.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* ==============================================================
               TABLE VIEW (Chuẩn bảng thông tin lưu trữ hành chính cơ quan Đảng)
               ============================================================== */
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3 py-3 w-12 text-center">STT</th>
                    <th className="px-3 py-3">Tên tài liệu / Hồ sơ</th>
                    <th className="px-3 py-3 whitespace-nowrap">Số, ký hiệu</th>
                    <th className="px-3 py-3 whitespace-nowrap">Loại văn bản</th>
                    <th className="px-3 py-3">Cơ quan ban hành</th>
                    <th className="px-3 py-3 whitespace-nowrap">Ngày ban hành</th>
                    <th className="px-3 py-3">Lĩnh vực</th>
                    <th className="px-3 py-3 whitespace-nowrap">Mức độ</th>
                    <th className="px-3 py-3 text-right whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedDocuments.map((doc, idx) => {
                    const isSelected = selectedDocument?.id === doc.id;
                    const formatBadge = getFormatBadge(doc.fileFormat);
                    const accessBadge = getAccessLevelBadge(doc.accessLevel);
                    const isBookmarked = bookmarks.includes(doc.id);
                    const FormatIcon = formatBadge.icon;

                    return (
                      <tr
                        key={doc.id}
                        className={`hover:bg-amber-50/40 transition cursor-pointer ${
                          isSelected ? 'bg-amber-50/80 font-medium' : ''
                        }`}
                        onClick={() => onSelectDocument(doc)}
                      >
                        {/* STT */}
                        <td className="px-3 py-3 text-center text-slate-400 font-medium">
                          {idx + 1}
                        </td>

                        {/* Tên tài liệu / hồ sơ */}
                        <td className="px-3 py-3 min-w-[200px]">
                          <div className="flex items-start gap-2">
                            <span
                              className={`p-1 rounded text-[10px] font-bold border flex-shrink-0 mt-0.5 ${formatBadge.bg}`}
                              title={doc.fileFormat}
                            >
                              <FormatIcon className="w-3.5 h-3.5 inline mr-1" />
                              {doc.fileFormat}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900 line-clamp-2 hover:text-red-700">
                                {doc.title}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <span>{doc.fileSize}</span>
                                <span>•</span>
                                <span>{doc.viewCount} xem</span>
                                <span>•</span>
                                <span>{doc.downloadCount} tải</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Số, ký hiệu */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {doc.codeNumber}
                          </span>
                        </td>

                        {/* Loại văn bản */}
                        <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-700">
                          {doc.documentType}
                        </td>

                        {/* Cơ quan ban hành */}
                        <td className="px-3 py-3 text-slate-600 min-w-[130px]">
                          {doc.issuingAuthority}
                        </td>

                        {/* Ngày ban hành */}
                        <td className="px-3 py-3 whitespace-nowrap text-slate-700 font-medium">
                          {formatDate(doc.issueDate)}
                        </td>

                        {/* Lĩnh vực */}
                        <td className="px-3 py-3 text-slate-600 min-w-[140px]">
                          <span className="text-[11px] font-medium text-slate-700">
                            {doc.category}
                          </span>
                        </td>

                        {/* Mức độ truy cập */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${accessBadge.bg}`}
                          >
                            {accessBadge.label}
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td
                          className="px-3 py-3 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {/* Xem chi tiết */}
                            <button
                              onClick={() => onSelectDocument(doc)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                              title="Xem chi tiết hồ sơ"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Tải xuống */}
                            <button
                              onClick={() => onDownload(doc)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="Tải tệp đính kèm"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Bookmark / Lưu yêu thích */}
                            <button
                              onClick={() => onToggleBookmark(doc.id)}
                              className={`p-1.5 rounded-lg transition ${
                                isBookmarked
                                  ? 'text-amber-600 bg-amber-50'
                                  : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              }`}
                              title={isBookmarked ? 'Đã lưu yêu thích' : 'Lưu vào bộ sưu tập'}
                            >
                              <Bookmark className="w-3.5 h-3.5 fill-current" />
                            </button>

                            {/* Chia sẻ nội bộ */}
                            <button
                              onClick={() => handleShareInternal(doc)}
                              className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                              title="Sao chép liên kết nội bộ"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Mã QR */}
                            <button
                              onClick={() => setShowQRModal(doc)}
                              className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                              title="Xem mã QR tra cứu di động"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit / Delete for Admin / Editor */}
                            {ArchiveService.canEdit(userRole) && (
                              <button
                                onClick={() => onOpenEditModal(doc)}
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                title="Chỉnh sửa tài liệu"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {ArchiveService.canDelete(userRole) && (
                              <button
                                onClick={() => onDeleteDocument(doc)}
                                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                title="Xóa tài liệu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* ==============================================================
               GRID CARD VIEW (Chế độ xem thẻ sinh động)
               ============================================================== */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedDocuments.map((doc) => {
                const isSelected = selectedDocument?.id === doc.id;
                const formatBadge = getFormatBadge(doc.fileFormat);
                const accessBadge = getAccessLevelBadge(doc.accessLevel);
                const isBookmarked = bookmarks.includes(doc.id);
                const FormatIcon = formatBadge.icon;

                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className={`rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-red-500 bg-amber-50/40 shadow-md ring-1 ring-red-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {doc.codeNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${accessBadge.bg}`}
                        >
                          {accessBadge.label}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 hover:text-red-700 line-clamp-2">
                        {doc.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{doc.summary}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{doc.issuingAuthority}</span>
                        <span className="font-medium text-slate-600">{formatDate(doc.issueDate)}</span>
                      </div>

                      <div
                        className="flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${formatBadge.bg}`}
                        >
                          <FormatIcon className="w-3 h-3" />
                          {doc.fileFormat} • {doc.fileSize}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onToggleBookmark(doc.id)}
                            className={`p-1 rounded ${
                              isBookmarked ? 'text-amber-600' : 'text-slate-400 hover:text-amber-600'
                            }`}
                            title="Lưu yêu thích"
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => onDownload(doc)}
                            className="p-1 text-slate-400 hover:text-emerald-700"
                            title="Tải về"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowQRModal(doc)}
                            className="p-1 text-slate-400 hover:text-purple-700"
                            title="Mã QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* ==============================================================
            ZONE C (KHU VỰC PHẢI): CỬA SỔ CHI TIẾT TÀI LIỆU (DRAWER / PANEL)
            ============================================================== */}
        {selectedDocument && (
          <aside className="lg:col-span-4 bg-white rounded-2xl p-5 border border-amber-300 shadow-xl space-y-4 animate-in fade-in slide-in-from-right-4 duration-200 sticky top-16 max-h-[85vh] overflow-y-auto">
            {/* Header of Detail Panel */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Hồ sơ lưu trữ điện tử
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
                  {selectedDocument.title}
                </h3>
              </div>
              <button
                onClick={onCloseDetail}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Đóng chi tiết"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tabs inside Zone C: Tổng quan / Nội dung OCR / Lịch sử / Liên quan */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveDetailTab('overview')}
                className={`flex-1 py-1.5 rounded-md text-center transition ${
                  activeDetailTab === 'overview'
                    ? 'bg-white text-red-800 shadow font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveDetailTab('ocr')}
                className={`flex-1 py-1.5 rounded-md text-center transition ${
                  activeDetailTab === 'ocr'
                    ? 'bg-white text-blue-800 shadow font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quét OCR
              </button>
              <button
                onClick={() => setActiveDetailTab('history')}
                className={`flex-1 py-1.5 rounded-md text-center transition ${
                  activeDetailTab === 'history'
                    ? 'bg-white text-slate-800 shadow font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lịch sử
              </button>
              <button
                onClick={() => setActiveDetailTab('related')}
                className={`flex-1 py-1.5 rounded-md text-center transition ${
                  activeDetailTab === 'related'
                    ? 'bg-white text-slate-800 shadow font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Liên quan
              </button>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeDetailTab === 'overview' && (
              <div className="space-y-3.5 text-xs">
                {/* Meta details list */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số, ký hiệu:</span>
                    <span className="font-bold text-slate-900">
                      {selectedDocument.codeNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loại văn bản:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedDocument.documentType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cơ quan ban hành:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {selectedDocument.issuingAuthority}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày ban hành:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(selectedDocument.issueDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lĩnh vực:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {selectedDocument.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Người ký duyệt:</span>
                    <span className="font-medium text-slate-700">
                      {selectedDocument.signatory || 'Lãnh đạo Ban'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cán bộ cập nhật:</span>
                    <span className="text-slate-700">{selectedDocument.updatedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thời gian cập nhật:</span>
                    <span className="text-slate-500">
                      {new Date(selectedDocument.updatedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Mức độ truy cập:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        getAccessLevelBadge(selectedDocument.accessLevel).bg
                      }`}
                    >
                      {getAccessLevelBadge(selectedDocument.accessLevel).label}
                    </span>
                  </div>
                </div>

                {/* Abstract summary */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Trích yếu nội dung:</h4>
                  <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedDocument.summary}
                  </p>
                </div>

                {/* Keywords */}
                {selectedDocument.keywords && selectedDocument.keywords.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-amber-600" /> Từ khóa liên quan:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDocument.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px]"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulated Interactive Document Viewer */}
                <div className="pt-2">
                  <h4 className="font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Xem trước tệp đính kèm:</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {selectedDocument.fileFormat} • {selectedDocument.fileSize}
                    </span>
                  </h4>

                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-700 font-mono text-[11px] space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between text-amber-400 border-b border-slate-800 pb-1.5">
                      <span className="font-bold uppercase tracking-wider text-[10px]">
                        {selectedDocument.issuingAuthority.toUpperCase()}
                      </span>
                      <span className="text-[10px] bg-red-950 text-red-200 px-1.5 py-0.5 rounded">
                        {selectedDocument.codeNumber}
                      </span>
                    </div>
                    <div className="text-center font-bold text-white text-xs pt-1 uppercase">
                      {selectedDocument.title}
                    </div>
                    <div className="text-slate-300 text-[10px] italic text-center">
                      (Văn bản chính thức lưu trữ tại Kho dữ liệu Ban Tuyên giáo Tỉnh ủy)
                    </div>
                    <div className="pt-2 text-slate-400 text-[11px] leading-relaxed line-clamp-3">
                      {selectedDocument.ocrContent || selectedDocument.summary}
                    </div>
                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
                      <span>Người ký: {selectedDocument.signatory || 'Trưởng ban'}</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <Check className="w-3 h-3" /> Đã ký số điện tử
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons in Detail */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => onDownload(selectedDocument)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải văn bản ({selectedDocument.fileFormat} – {selectedDocument.fileSize})</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onToggleBookmark(selectedDocument.id)}
                      className="py-2 px-1 text-center rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1"
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          bookmarks.includes(selectedDocument.id)
                            ? 'text-amber-600 fill-current'
                            : 'text-slate-400'
                        }`}
                      />
                      <span>Lưu</span>
                    </button>
                    <button
                      onClick={() => handleShareInternal(selectedDocument)}
                      className="py-2 px-1 text-center rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1"
                    >
                      {copiedLink ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{copiedLink ? 'Đã chép' : 'Chia sẻ'}</span>
                    </button>
                    <button
                      onClick={() => setShowQRModal(selectedDocument)}
                      className="py-2 px-1 text-center rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-600" />
                      <span>Mã QR</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: OCR QUÉT TOÀN VĂN */}
            {activeDetailTab === 'ocr' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] leading-relaxed">
                    Công nghệ nhận dạng ký tự quang học (OCR) tự động trích xuất toàn bộ văn bản từ tệp scan/PDF để tìm kiếm nhanh nội dung câu chữ.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans max-h-72 overflow-y-auto whitespace-pre-wrap select-text">
                  {selectedDocument.ocrContent || 'Chưa có nội dung OCR cho tài liệu này.'}
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedDocument.ocrContent || '');
                    alert('Đã sao chép văn bản OCR vào khay nhớ tạm.');
                  }}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép văn bản OCR
                </button>
              </div>
            )}

            {/* TAB CONTENT: LỊCH SỬ CHỈNH SỬA */}
            {activeDetailTab === 'history' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-600" />
                  Nhật ký chỉnh sửa & Phiên bản
                </h4>
                <div className="divide-y divide-slate-100">
                  {selectedDocument.history && selectedDocument.history.length > 0 ? (
                    selectedDocument.history.map((h, i) => (
                      <div key={i} className="py-2.5 space-y-0.5">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{h.action}</span>
                          <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Thực hiện bởi: <span className="font-medium text-slate-700">{h.userName}</span>
                        </div>
                        {h.note && <div className="text-[11px] text-slate-600 italic">{h.note}</div>}
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-slate-400">Chưa có lịch sử thay đổi</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: TÀI LIỆU LIÊN QUAN */}
            {activeDetailTab === 'related' && (
              <div className="space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-800">Tài liệu cùng chủ đề:</h4>
                {documents
                  .filter(
                    (d) =>
                      d.id !== selectedDocument.id &&
                      (d.category === selectedDocument.category ||
                        d.issuingAuthority === selectedDocument.issuingAuthority)
                  )
                  .slice(0, 4)
                  .map((relDoc) => (
                    <div
                      key={relDoc.id}
                      onClick={() => onSelectDocument(relDoc)}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 transition cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-slate-500">
                        {relDoc.codeNumber}
                      </span>
                      <h5 className="font-semibold text-slate-800 line-clamp-1 hover:text-red-700">
                        {relDoc.title}
                      </h5>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>{relDoc.category}</span>
                        <span>{formatDate(relDoc.issueDate)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* QR Code Quick Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-600" />
                Mã QR tra cứu nhanh
              </h3>
              <button
                onClick={() => setShowQRModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-semibold line-clamp-2">
              {showQRModal.title}
            </p>
            <p className="text-[11px] text-slate-400">Số ký hiệu: {showQRModal.codeNumber}</p>

            {/* Generated SVG QR Code representation */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block shadow-inner">
              <svg viewBox="0 0 160 160" className="w-44 h-44 mx-auto" shapeRendering="crispEdges">
                <rect width="160" height="160" fill="#ffffff" />
                {/* Simulated crisp QR pattern blocks */}
                <g fill="#1e293b">
                  {/* Top-left corner */}
                  <rect x="10" y="10" width="40" height="40" fill="#991b1b" />
                  <rect x="16" y="16" width="28" height="28" fill="#ffffff" />
                  <rect x="22" y="22" width="16" height="16" fill="#991b1b" />

                  {/* Top-right corner */}
                  <rect x="110" y="10" width="40" height="40" fill="#991b1b" />
                  <rect x="116" y="16" width="28" height="28" fill="#ffffff" />
                  <rect x="122" y="22" width="16" height="16" fill="#991b1b" />

                  {/* Bottom-left corner */}
                  <rect x="10" y="110" width="40" height="40" fill="#991b1b" />
                  <rect x="16" y="116" width="28" height="28" fill="#ffffff" />
                  <rect x="22" y="122" width="16" height="16" fill="#991b1b" />

                  {/* Pattern data bits */}
                  <rect x="60" y="15" width="8" height="8" />
                  <rect x="75" y="20" width="8" height="8" />
                  <rect x="90" y="15" width="8" height="8" />
                  <rect x="60" y="35" width="8" height="8" />
                  <rect x="80" y="40" width="8" height="8" />
                  <rect x="15" y="60" width="8" height="8" />
                  <rect x="35" y="65" width="8" height="8" />
                  <rect x="60" y="60" width="12" height="12" fill="#d97706" />
                  <rect x="80" y="65" width="10" height="10" />
                  <rect x="100" y="60" width="8" height="8" />
                  <rect x="120" y="65" width="12" height="8" />
                  <rect x="140" y="75" width="8" height="8" />
                  <rect x="20" y="80" width="8" height="8" />
                  <rect x="40" y="85" width="12" height="8" />
                  <rect x="65" y="85" width="8" height="8" />
                  <rect x="85" y="80" width="15" height="8" />
                  <rect x="110" y="85" width="8" height="8" />
                  <rect x="130" y="90" width="10" height="8" />
                  <rect x="60" y="105" width="12" height="8" />
                  <rect x="80" y="115" width="8" height="8" />
                  <rect x="105" y="110" width="8" height="8" />
                  <rect x="125" y="120" width="12" height="8" />
                  <rect x="140" y="135" width="8" height="8" />
                  <rect x="60" y="135" width="8" height="8" />
                  <rect x="75" y="140" width="12" height="8" />
                  <rect x="95" y="135" width="8" height="8" />
                </g>
              </svg>
            </div>

            <p className="text-[11px] text-slate-500">
              Quét bằng camera điện thoại hoặc ứng dụng Zalo để mở và xem tài liệu trên thiết bị di động.
            </p>

            <button
              onClick={() => setShowQRModal(null)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
