import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Calendar,
  Building,
  Tag,
  FileText,
  FileCheck,
  Shield,
  Download,
  Eye,
  Bookmark,
  Share2,
  QrCode,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Film,
  Image as ImageIcon,
  Save,
  FolderOpen,
  X,
  FileStack,
  ArrowUpDown,
  Printer
} from 'lucide-react';
import { DocumentItem, DocumentFormat, AccessLevel, UserRole } from '../types';
import { DOCUMENT_TYPES, CATEGORIES, ISSUING_AUTHORITIES } from '../data/initialDocuments';
import { formatDate } from '../utils/dateUtils';
import { ArchiveService } from '../services/archiveService';

interface AdvancedSearchViewProps {
  documents: DocumentItem[];
  userRole: UserRole;
  bookmarks: string[];
  onSelectDocument: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
  onToggleBookmark: (docId: string) => void;
  initialKeyword?: string;
}

export interface AdvancedSearchQuery {
  keyword: string;
  keywordMatchMode: 'exact' | 'all' | 'any';
  searchInTitle: boolean;
  searchInSummary: boolean;
  searchInOCR: boolean;
  searchInCode: boolean;
  searchInSignatory: boolean;
  codeNumber: string;
  selectedDocTypes: string[];
  selectedCategories: string[];
  selectedAuthorities: string[];
  dateFrom: string;
  dateTo: string;
  timePreset: string;
  selectedAccessLevels: AccessLevel[];
  selectedFormats: DocumentFormat[];
  signatory: string;
  sortBy: 'relevance' | 'newest' | 'oldest' | 'downloads' | 'views';
}

export const AdvancedSearchView: React.FC<AdvancedSearchViewProps> = ({
  documents,
  userRole,
  bookmarks,
  onSelectDocument,
  onDownload,
  onToggleBookmark,
  initialKeyword = '',
}) => {
  const initialQuery: AdvancedSearchQuery = {
    keyword: initialKeyword,
    keywordMatchMode: 'all',
    searchInTitle: true,
    searchInSummary: true,
    searchInOCR: true,
    searchInCode: true,
    searchInSignatory: true,
    codeNumber: '',
    selectedDocTypes: [],
    selectedCategories: [],
    selectedAuthorities: [],
    dateFrom: '',
    dateTo: '',
    timePreset: '',
    selectedAccessLevels: [],
    selectedFormats: [],
    signatory: '',
    sortBy: 'relevance',
  };

  const [query, setQuery] = useState<AdvancedSearchQuery>(initialQuery);
  const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState(true);
  const [showQRModal, setShowQRModal] = useState<DocumentItem | null>(null);
  const [savedQueries, setSavedQueries] = useState<{ id: string; name: string; query: AdvancedSearchQuery }[]>(() => {
    try {
      const data = localStorage.getItem('cm_saved_search_queries');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'q-1',
        name: 'Văn bản Chuyển đổi số 2025 - 2026',
        query: {
          ...initialQuery,
          keyword: 'Chuyển đổi số',
          selectedCategories: ['Chuyển đổi số'],
          timePreset: '2025-2026',
        },
      },
      {
        id: 'q-2',
        name: 'Tài liệu Lịch sử Đảng & Bác Hồ',
        query: {
          ...initialQuery,
          selectedCategories: ['Lịch sử Đảng', 'Thực thành tư tưởng Hồ Chí Minh'],
        },
      },
    ];
  });
  const [showSaveQueryPrompt, setShowSaveQueryPrompt] = useState(false);
  const [saveQueryName, setSaveQueryName] = useState('');

  // Handle Preset Time Selection
  const handleTimePresetChange = (preset: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let from = '';
    let to = todayStr;

    if (preset === '7days') {
      const past = new Date(today);
      past.setDate(today.getDate() - 7);
      from = past.toISOString().split('T')[0];
    } else if (preset === '30days') {
      const past = new Date(today);
      past.setDate(today.getDate() - 30);
      from = past.toISOString().split('T')[0];
    } else if (preset === '2026') {
      from = '2026-01-01';
      to = '2026-12-31';
    } else if (preset === '2025') {
      from = '2025-01-01';
      to = '2025-12-31';
    } else if (preset === '2020-2025') {
      from = '2020-01-01';
      to = '2025-12-31';
    } else {
      to = '';
    }

    setQuery((prev) => ({
      ...prev,
      timePreset: preset,
      dateFrom: from,
      dateTo: to,
    }));
  };

  // Toggle multi-select array helper
  const toggleArrayItem = <T extends string>(arr: T[], item: T): T[] => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  };

  // Reset Filters
  const handleReset = () => {
    setQuery(initialQuery);
  };

  // Save current query to localStorage
  const handleSaveCurrentQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveQueryName.trim()) return;
    const newSaved = [
      ...savedQueries,
      {
        id: `sq-${Date.now()}`,
        name: saveQueryName.trim(),
        query: { ...query },
      },
    ];
    setSavedQueries(newSaved);
    localStorage.setItem('cm_saved_search_queries', JSON.stringify(newSaved));
    setSaveQueryName('');
    setShowSaveQueryPrompt(false);
  };

  const handleApplySavedQuery = (sq: AdvancedSearchQuery) => {
    setQuery(sq);
  };

  const handleDeleteSavedQuery = (id: string) => {
    const updated = savedQueries.filter((q) => q.id !== id);
    setSavedQueries(updated);
    localStorage.setItem('cm_saved_search_queries', JSON.stringify(updated));
  };

  // Advanced Filtering and Scoring Engine
  const searchResults = useMemo(() => {
    const startTime = performance.now();

    const results = documents
      .filter((doc) => {
        // 1. Role-based security check
        if (userRole === 'guest' && doc.accessLevel !== 'public') return false;
        if (userRole === 'staff' && doc.accessLevel === 'confidential') return false;

        // 2. Document Types (OR match within selected)
        if (query.selectedDocTypes.length > 0 && !query.selectedDocTypes.includes(doc.documentType)) {
          return false;
        }

        // 3. Categories (OR match within selected)
        if (query.selectedCategories.length > 0 && !query.selectedCategories.includes(doc.category)) {
          return false;
        }

        // 4. Issuing Authorities
        if (
          query.selectedAuthorities.length > 0 &&
          !query.selectedAuthorities.includes(doc.issuingAuthority)
        ) {
          return false;
        }

        // 5. Access Levels
        if (
          query.selectedAccessLevels.length > 0 &&
          !query.selectedAccessLevels.includes(doc.accessLevel)
        ) {
          return false;
        }

        // 6. File Formats
        if (
          query.selectedFormats.length > 0 &&
          !query.selectedFormats.includes(doc.fileFormat)
        ) {
          return false;
        }

        // 7. Date range
        if (query.dateFrom && doc.issueDate < query.dateFrom) return false;
        if (query.dateTo && doc.issueDate > query.dateTo) return false;

        // 8. Specific Code Number filter
        if (query.codeNumber.trim()) {
          const targetCode = query.codeNumber.trim().toLowerCase();
          if (!doc.codeNumber.toLowerCase().includes(targetCode)) return false;
        }

        // 9. Specific Signatory filter
        if (query.signatory.trim()) {
          const targetSig = query.signatory.trim().toLowerCase();
          if (!doc.signatory || !doc.signatory.toLowerCase().includes(targetSig)) return false;
        }

        // 10. Complex Keyword Search & OCR Content matching
        if (query.keyword.trim()) {
          const rawKeyword = query.keyword.trim().toLowerCase();
          const targetTexts: string[] = [];

          if (query.searchInTitle) targetTexts.push(doc.title.toLowerCase());
          if (query.searchInSummary) targetTexts.push(doc.summary.toLowerCase());
          if (query.searchInCode) targetTexts.push(doc.codeNumber.toLowerCase());
          if (query.searchInSignatory && doc.signatory) targetTexts.push(doc.signatory.toLowerCase());
          if (query.searchInOCR && doc.ocrContent) targetTexts.push(doc.ocrContent.toLowerCase());
          if (doc.keywords) targetTexts.push(doc.keywords.join(' ').toLowerCase());

          const combinedText = targetTexts.join(' ');

          if (query.keywordMatchMode === 'exact') {
            if (!combinedText.includes(rawKeyword)) return false;
          } else if (query.keywordMatchMode === 'all') {
            const words = rawKeyword.split(/\s+/).filter(Boolean);
            const allFound = words.every((w) => combinedText.includes(w));
            if (!allFound) return false;
          } else if (query.keywordMatchMode === 'any') {
            const words = rawKeyword.split(/\s+/).filter(Boolean);
            const anyFound = words.some((w) => combinedText.includes(w));
            if (!anyFound) return false;
          }
        }

        return true;
      })
      .map((doc) => {
        // Calculate relevance score and find OCR excerpt snippet
        let score = 0;
        let ocrSnippet = '';

        if (query.keyword.trim()) {
          const kw = query.keyword.trim().toLowerCase();
          const words = kw.split(/\s+/).filter(Boolean);

          if (doc.codeNumber.toLowerCase().includes(kw)) score += 100;
          if (doc.title.toLowerCase().includes(kw)) score += 50;
          words.forEach((w) => {
            if (doc.title.toLowerCase().includes(w)) score += 15;
            if (doc.summary.toLowerCase().includes(w)) score += 8;
            if (doc.keywords?.some((k) => k.toLowerCase().includes(w))) score += 10;
            if (doc.ocrContent?.toLowerCase().includes(w)) score += 5;
          });

          // Generate OCR snippet with context around found keywords
          if (doc.ocrContent) {
            const ocrLower = doc.ocrContent.toLowerCase();
            let matchIndex = ocrLower.indexOf(kw);
            if (matchIndex === -1 && words.length > 0) {
              matchIndex = ocrLower.indexOf(words[0]);
            }
            if (matchIndex >= 0) {
              const start = Math.max(0, matchIndex - 60);
              const end = Math.min(doc.ocrContent.length, matchIndex + 140);
              ocrSnippet =
                (start > 0 ? '...' : '') +
                doc.ocrContent.substring(start, end).replace(/\n/g, ' ') +
                (end < doc.ocrContent.length ? '...' : '');
            }
          }
        }

        return {
          ...doc,
          relevanceScore: score,
          ocrSnippet: ocrSnippet || (doc.ocrContent ? doc.ocrContent.substring(0, 160) + '...' : doc.summary),
        };
      });

    // Sorting
    results.sort((a, b) => {
      if (query.sortBy === 'relevance') {
        if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
        return b.issueDate.localeCompare(a.issueDate);
      }
      if (query.sortBy === 'newest') return b.issueDate.localeCompare(a.issueDate);
      if (query.sortBy === 'oldest') return a.issueDate.localeCompare(b.issueDate);
      if (query.sortBy === 'downloads') return (b.downloadCount || 0) - (a.downloadCount || 0);
      if (query.sortBy === 'views') return (b.viewCount || 0) - (a.viewCount || 0);
      return 0;
    });

    const executionTimeMs = Math.max(1, Math.round(performance.now() - startTime));
    return { list: results, time: executionTimeMs };
  }, [documents, query, userRole]);

  // Export results to CSV
  const handleExportCSV = () => {
    const headers = ['STT,Số ký hiệu,Tên tài liệu,Loại,Lĩnh vực,Cơ quan,Ngày ban hành,Mức độ,Định dạng'];
    const rows = searchResults.list.map((d, i) =>
      `"${i + 1}","${d.codeNumber}","${d.title.replace(/"/g, '""')}","${d.documentType}","${d.category}","${d.issuingAuthority}","${formatDate(d.issueDate)}","${d.accessLevel}","${d.fileFormat}"`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ket_qua_tra_cuu_nang_cao_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper highlight keyword in snippet
  const highlightSnippet = (snippet: string, keyword: string) => {
    if (!keyword.trim()) return snippet;
    const words = keyword.trim().split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = snippet.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-300 text-slate-950 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 text-white p-6 sm:p-7 rounded-2xl shadow-xl border border-amber-400/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Công cụ Khai thác Dữ liệu Số hóa
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide">
              MODULE TRA CỨU NÂNG CAO ĐA TIÊU CHÍ
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 font-light leading-relaxed">
              Kết hợp linh hoạt từ khóa toàn văn (OCR), số ký hiệu, lĩnh vực chuyên môn, khoảng thời gian ban hành và mức độ bảo mật.
            </p>
          </div>

          {/* Saved search templates */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowSaveQueryPrompt(true)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-200 border border-white/20 transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu mẫu tìm kiếm</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/20 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Saved queries pills */}
        {savedQueries.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] whitespace-nowrap">
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" /> Mẫu đã lưu:
            </span>
            {savedQueries.map((sq) => (
              <div
                key={sq.id}
                className="flex items-center bg-white/10 hover:bg-amber-400/30 rounded-lg pl-2.5 pr-1 py-1 text-[11px] text-amber-200 border border-white/10 whitespace-nowrap transition"
              >
                <button
                  onClick={() => handleApplySavedQuery(sq.query)}
                  className="hover:underline font-semibold mr-1.5"
                >
                  {sq.name}
                </button>
                <button
                  onClick={() => handleDeleteSavedQuery(sq.id)}
                  className="p-1 hover:text-red-400 text-slate-400 rounded"
                  title="Xóa mẫu này"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save query modal */}
      {showSaveQueryPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCurrentQuery}
            className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in"
          >
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Save className="w-4 h-4 text-red-700" />
              Lưu mẫu tra cứu hiện tại
            </h4>
            <input
              type="text"
              required
              autoFocus
              placeholder="VD: Chỉ đạo Biển đảo năm 2026..."
              value={saveQueryName}
              onChange={(e) => setSaveQueryName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowSaveQueryPrompt(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-red-700 text-white font-bold"
              >
                Lưu lại
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER BUILDER PANEL */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setIsFilterPanelExpanded(!isFilterPanelExpanded)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-red-700 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-red-600" />
            <span>Tiêu chí tra cứu nâng cao kết hợp</span>
            <span className="text-[10px] text-slate-400 font-normal">
              ({isFilterPanelExpanded ? 'Thu gọn' : 'Mở rộng'})
            </span>
          </button>

          <span className="text-xs text-slate-500 font-semibold">
            Đang hiển thị <span className="text-red-700 font-bold">{searchResults.list.length}</span> kết quả
          </span>
        </div>

        {isFilterPanelExpanded && (
          <div className="space-y-4 text-xs">
            {/* ROW 1: PRIMARY KEYWORD & SEARCH MODES */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-red-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={query.keyword}
                    onChange={(e) => setQuery({ ...query, keyword: e.target.value })}
                    placeholder="Nhập từ khóa tra cứu (VD: Chuyển đổi số, Nghị quyết, Hải sản IUU...)"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-medium"
                  />
                </div>

                {/* Match Mode */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setQuery({ ...query, keywordMatchMode: 'all' })}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      query.keywordMatchMode === 'all'
                        ? 'bg-white text-red-700 shadow-sm font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    Chứa tất cả từ (AND)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuery({ ...query, keywordMatchMode: 'any' })}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      query.keywordMatchMode === 'any'
                        ? 'bg-white text-red-700 shadow-sm font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    Bất kỳ từ nào (OR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuery({ ...query, keywordMatchMode: 'exact' })}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      query.keywordMatchMode === 'exact'
                        ? 'bg-white text-red-700 shadow-sm font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    Khớp chính xác cụm từ
                  </button>
                </div>
              </div>

              {/* Scope checkboxes (OCR, Title, Summary, CodeNumber) */}
              <div className="flex items-center gap-4 flex-wrap pt-1 text-[11px] text-slate-700 font-medium">
                <span className="text-slate-400 font-semibold">Phạm vi tìm:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={query.searchInOCR}
                    onChange={(e) => setQuery({ ...query, searchInOCR: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-blue-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Quét toàn văn OCR
                  </span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={query.searchInTitle}
                    onChange={(e) => setQuery({ ...query, searchInTitle: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Tiêu đề tài liệu</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={query.searchInSummary}
                    onChange={(e) => setQuery({ ...query, searchInSummary: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Trích yếu tóm tắt</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={query.searchInCode}
                    onChange={(e) => setQuery({ ...query, searchInCode: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Số, ký hiệu văn bản</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={query.searchInSignatory}
                    onChange={(e) => setQuery({ ...query, searchInSignatory: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Người ký duyệt</span>
                </label>
              </div>
            </div>

            {/* ROW 2: CODE NUMBER & SIGNATORY SPECIFIC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số, ký hiệu chính xác hoặc chứa:
                </label>
                <input
                  type="text"
                  value={query.codeNumber}
                  onChange={(e) => setQuery({ ...query, codeNumber: e.target.value })}
                  placeholder="VD: 88-KH, 04-ĐA, 19-CT..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Người ký duyệt / Chức danh:
                </label>
                <input
                  type="text"
                  value={query.signatory}
                  onChange={(e) => setQuery({ ...query, signatory: e.target.value })}
                  placeholder="VD: Bí thư Tỉnh ủy, Trưởng Ban Tuyên giáo..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* ROW 3: DATE RANGE & PRESETS */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-600" />
                  Khoảng thời gian ban hành:
                </label>

                {/* Quick Presets & Dropdown */}
                <div className="flex items-center gap-2 text-[11px] overflow-x-auto flex-wrap">
                  {/* Nút xổ xuống chọn năm */}
                  <select
                    value={['2026', '2025', '2024', '2023', '2022', '2021', '2020'].includes(query.timePreset) ? query.timePreset : ''}
                    onChange={(e) => {
                      const yr = e.target.value;
                      if (!yr) {
                        setQuery({ ...query, dateFrom: '', dateTo: '', timePreset: '' });
                      } else {
                        setQuery({
                          ...query,
                          dateFrom: `${yr}-01-01`,
                          dateTo: `${yr}-12-31`,
                          timePreset: yr,
                        });
                      }
                    }}
                    className="text-xs py-1 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-red-600"
                    title="Nút xổ xuống để lựa chọn năm ban hành"
                  >
                    <option value="">-- Xổ xuống chọn năm --</option>
                    {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2015'].map((y) => (
                      <option key={y} value={y}>Năm {y}</option>
                    ))}
                  </select>

                  {[
                    { key: '', label: 'Tất cả' },
                    { key: '7days', label: '7 ngày qua' },
                    { key: '30days', label: '30 ngày qua' },
                    { key: '2026', label: 'Năm 2026' },
                    { key: '2025', label: 'Năm 2025' },
                    { key: '2020-2025', label: 'Giai đoạn 2020 - 2025' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handleTimePresetChange(p.key)}
                      className={`px-2 py-0.5 rounded transition ${
                        query.timePreset === p.key
                          ? 'bg-red-800 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">Từ ngày:</span>
                  <input
                    type="date"
                    value={query.dateFrom}
                    onChange={(e) => setQuery({ ...query, dateFrom: e.target.value, timePreset: '' })}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">Đến ngày:</span>
                  <input
                    type="date"
                    value={query.dateTo}
                    onChange={(e) => setQuery({ ...query, dateTo: e.target.value, timePreset: '' })}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* ROW 4: DOCUMENT TYPES & CATEGORIES MULTI-SELECT CHIPS */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Types */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700">Loại văn bản:</span>
                  {query.selectedDocTypes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setQuery({ ...query, selectedDocTypes: [] })}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Bỏ chọn ({query.selectedDocTypes.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                  {DOCUMENT_TYPES.map((type) => {
                    const isSelected = query.selectedDocTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setQuery({
                            ...query,
                            selectedDocTypes: toggleArrayItem(query.selectedDocTypes, type),
                          })
                        }
                        className={`px-2 py-0.5 rounded text-[11px] transition font-medium ${
                          isSelected
                            ? 'bg-red-700 text-white font-bold'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700">Lĩnh vực chuyên môn:</span>
                  {query.selectedCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setQuery({ ...query, selectedCategories: [] })}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Bỏ chọn ({query.selectedCategories.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                  {CATEGORIES.map((cat) => {
                    const isSelected = query.selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setQuery({
                            ...query,
                            selectedCategories: toggleArrayItem(query.selectedCategories, cat),
                          })
                        }
                        className={`px-2 py-0.5 rounded text-[11px] transition font-medium ${
                          isSelected
                            ? 'bg-amber-600 text-white font-bold'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ROW 5: ACCESS LEVEL & FORMATS & AUTHORITIES */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Access Levels */}
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Mức độ truy cập:</span>
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      { val: 'public' as AccessLevel, label: 'Công khai' },
                      { val: 'internal' as AccessLevel, label: 'Nội bộ' },
                      { val: 'restricted' as AccessLevel, label: 'Hạn chế' },
                    ] as const
                  ).map((lvl) => {
                    const isSelected = query.selectedAccessLevels.includes(lvl.val);
                    return (
                      <button
                        key={lvl.val}
                        type="button"
                        onClick={() =>
                          setQuery({
                            ...query,
                            selectedAccessLevels: toggleArrayItem(query.selectedAccessLevels, lvl.val),
                          })
                        }
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                          isSelected
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formats */}
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Định dạng tệp:</span>
                <div className="flex flex-wrap gap-1">
                  {(['PDF', 'DOCX', 'XLSX', 'PPTX', 'JPG', 'MP4'] as DocumentFormat[]).map((fmt) => {
                    const isSelected = query.selectedFormats.includes(fmt);
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() =>
                          setQuery({
                            ...query,
                            selectedFormats: toggleArrayItem(query.selectedFormats, fmt),
                          })
                        }
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                          isSelected
                            ? 'bg-red-800 text-white font-bold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Issuing Authority */}
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Cơ quan ban hành:</span>
                <select
                  value={query.selectedAuthorities[0] || ''}
                  onChange={(e) =>
                    setQuery({
                      ...query,
                      selectedAuthorities: e.target.value ? [e.target.value] : [],
                    })
                  }
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">-- Tất cả cơ quan ban hành --</option>
                  {ISSUING_AUTHORITIES.map((auth) => (
                    <option key={auth} value={auth}>
                      {auth}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RESULTS BAR & CONTROLS */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">
            Tìm thấy{' '}
            <span className="text-red-700 font-extrabold text-sm">
              {searchResults.list.length}
            </span>{' '}
            hồ sơ
          </span>
          <span className="text-slate-400">
            (xử lý trong <span className="font-mono text-slate-600">{searchResults.time}ms</span>)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sorting */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sắp xếp:</span>
            <select
              value={query.sortBy}
              onChange={(e) => setQuery({ ...query, sortBy: e.target.value as any })}
              className="text-xs p-1 rounded-md border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="relevance">Độ phù hợp cao nhất</option>
              <option value="newest">Ngày ban hành (Mới nhất)</option>
              <option value="oldest">Ngày ban hành (Cũ nhất)</option>
              <option value="downloads">Lượt tải nhiều nhất</option>
              <option value="views">Lượt xem nhiều nhất</option>
            </select>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition"
            title="Xuất bảng kết quả ra tệp CSV / Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* RESULTS LIST WITH OCR SNIPPET PREVIEW */}
      <div className="space-y-4">
        {searchResults.list.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Không tìm thấy tài liệu theo tiêu chuẩn này</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Đồng chí có thể thử bỏ bớt một số điều kiện lọc (như năm ban hành hoặc định dạng tệp) hoặc chuyển chế độ tìm kiếm sang "Bất kỳ từ nào (OR)".
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-red-700 text-white font-bold text-xs hover:bg-red-800 transition"
            >
              Đặt lại toàn bộ tiêu chí
            </button>
          </div>
        ) : (
          searchResults.list.map((doc, idx) => {
            const isBookmarked = bookmarks.includes(doc.id);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400 hover:shadow-md transition space-y-3"
              >
                {/* Header row of result */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {doc.codeNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                      {doc.documentType}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-500">{doc.issuingAuthority}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 text-[11px] font-medium">Ngày: {formatDate(doc.issueDate)}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        doc.accessLevel === 'public'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : doc.accessLevel === 'internal'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : doc.accessLevel === 'restricted'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {doc.accessLevel.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3
                    onClick={() => onSelectDocument(doc)}
                    className="text-sm font-bold text-slate-900 hover:text-red-700 cursor-pointer transition leading-snug"
                  >
                    {idx + 1}. {doc.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {doc.summary}
                  </p>
                </div>

                {/* OCR Snippet with Highlight */}
                {doc.ocrSnippet && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-sans space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-blue-800 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Trích đoạn từ nội dung quét toàn văn (OCR):
                      </span>
                      <span className="text-slate-400 font-normal">Độ tin cậy OCR 98.6%</span>
                    </div>
                    <p className="text-slate-700 italic leading-relaxed text-[11px]">
                      {highlightSnippet(doc.ocrSnippet, query.keyword)}
                    </p>
                  </div>
                )}

                {/* Footer action bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Định dạng: <strong className="text-slate-700">{doc.fileFormat}</strong> ({doc.fileSize})</span>
                    <span>•</span>
                    <span>Lượt xem: {doc.viewCount}</span>
                    <span>•</span>
                    <span>Lượt tải: {doc.downloadCount}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem hồ sơ</span>
                    </button>

                    <button
                      onClick={() => onDownload(doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về</span>
                    </button>

                    <button
                      onClick={() => onToggleBookmark(doc.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-300'
                          : 'border-slate-200 text-slate-400 hover:text-amber-600'
                      }`}
                      title={isBookmarked ? 'Đã lưu yêu thích' : 'Lưu tài liệu'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => setShowQRModal(doc)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-purple-700 transition"
                      title="Mã QR tra cứu"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Code Quick Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-600" />
                Mã QR tra cứu di động
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

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block shadow-inner">
              <svg viewBox="0 0 160 160" className="w-40 h-40 mx-auto" shapeRendering="crispEdges">
                <rect width="160" height="160" fill="#ffffff" />
                <g fill="#991b1b">
                  <rect x="10" y="10" width="36" height="36" />
                  <rect x="16" y="16" width="24" height="24" fill="#fff" />
                  <rect x="22" y="22" width="12" height="12" fill="#991b1b" />

                  <rect x="114" y="10" width="36" height="36" />
                  <rect x="120" y="16" width="24" height="24" fill="#fff" />
                  <rect x="126" y="22" width="12" height="12" fill="#991b1b" />

                  <rect x="10" y="114" width="36" height="36" />
                  <rect x="16" y="120" width="24" height="24" fill="#fff" />
                  <rect x="22" y="126" width="12" height="12" fill="#991b1b" />

                  <rect x="56" y="20" width="8" height="8" fill="#1e293b" />
                  <rect x="76" y="20" width="16" height="8" fill="#1e293b" />
                  <rect x="56" y="56" width="12" height="12" fill="#d97706" />
                  <rect x="76" y="60" width="8" height="16" fill="#1e293b" />
                  <rect x="96" y="56" width="16" height="8" fill="#1e293b" />
                  <rect x="120" y="64" width="8" height="8" fill="#1e293b" />
                  <rect x="56" y="96" width="16" height="8" fill="#1e293b" />
                  <rect x="80" y="96" width="8" height="16" fill="#1e293b" />
                  <rect x="104" y="104" width="16" height="8" fill="#1e293b" />
                  <rect x="128" y="96" width="8" height="16" fill="#1e293b" />
                  <rect x="56" y="128" width="16" height="8" fill="#1e293b" />
                  <rect x="80" y="120" width="8" height="16" fill="#1e293b" />
                  <rect x="96" y="128" width="16" height="8" fill="#1e293b" />
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
