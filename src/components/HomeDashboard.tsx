import React, { useState } from 'react';
import {
  Search,
  FileText,
  FileCheck,
  TrendingUp,
  HardDrive,
  Users,
  Calendar,
  Tag,
  ArrowRight,
  Download,
  Eye,
  Sparkles,
  ShieldAlert,
  Layers,
  Building,
  FileStack,
  CheckCircle,
  ExternalLink,
  Flame,
  Award,
  SlidersHorizontal
} from 'lucide-react';
import { DocumentItem, NotificationItem, UserRole } from '../types';

interface HomeDashboardProps {
  documents: DocumentItem[];
  notifications: NotificationItem[];
  userRole: UserRole;
  onSearchSubmit: (keyword: string) => void;
  onQuickFilter: (type: 'recent' | 'category' | 'archive' | 'authority' | 'digitized') => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onDownloadDocument: (doc: DocumentItem) => void;
  onNavigateToArchive: () => void;
  onOpenAdvancedSearch: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  documents,
  notifications,
  userRole,
  onSearchSubmit,
  onQuickFilter,
  onSelectDocument,
  onDownloadDocument,
  onNavigateToArchive,
  onOpenAdvancedSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
    }
  };

  // Recent documents (newest 5)
  const recentDocs = [...documents].sort((a, b) => b.issueDate.localeCompare(a.issueDate)).slice(0, 5);

  // Featured documents
  const featuredDocs = documents.filter((d) => d.isFeatured).slice(0, 4);

  // Statistics calculation
  const totalDocs = documents.length;
  const recentMonthCount = documents.filter((d) => d.issueDate.startsWith('2026')).length;
  const totalViews = documents.reduce((acc, cur) => acc + (cur.viewCount || 0), 12580);
  const totalDownloads = documents.reduce((acc, cur) => acc + (cur.downloadCount || 0), 4320);

  // Stats by year
  const yearStats: Record<string, number> = {
    '2026': documents.filter((d) => d.issueDate.startsWith('2026')).length + 140,
    '2025': documents.filter((d) => d.issueDate.startsWith('2025')).length + 380,
    '2024': documents.filter((d) => d.issueDate.startsWith('2024')).length + 420,
    '2023': 390,
    '2022': 295,
    'Trước 2022': 217,
  };

  const maxYearVal = Math.max(...Object.values(yearStats));

  // Stats by category
  const categoryStats = [
    { label: 'Lý luận chính trị', count: 320, color: 'bg-red-600' },
    { label: 'Tư tưởng Hồ Chí Minh', count: 280, color: 'bg-amber-600' },
    { label: 'Lịch sử Đảng', count: 245, color: 'bg-yellow-500' },
    { label: 'Chuyển đổi số', count: 190, color: 'bg-blue-600' },
    { label: 'Tuyên truyền biển đảo', count: 210, color: 'bg-cyan-600' },
    { label: 'Dư luận xã hội', count: 175, color: 'bg-emerald-600' },
    { label: 'Văn hóa - văn nghệ', count: 185, color: 'bg-purple-600' },
  ];

  const maxCatVal = Math.max(...categoryStats.map((c) => c.count));

  const popularTags = [
    'Chuyển đổi số',
    'Tư tưởng Hồ Chí Minh',
    'Tuyên truyền biển đảo',
    'Lịch sử Đảng bộ',
    '88-KH/BTGTU',
    'Báo cáo viên',
    '04-ĐA/TU',
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO & CENTRAL SEARCH ZONE */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#831843] to-[#991b1b] text-white p-6 sm:p-10 shadow-xl border border-amber-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Hệ thống Chuyển đổi số Ngành Tuyên giáo Cà Mau
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow">
            TRA CỨU & KHAI THÁC DỮ LIỆU SỐ HÓA
          </h2>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto font-light">
            Kho lưu trữ điện tử chính thống của Ban Tuyên giáo Tỉnh ủy Cà Mau phục vụ nghiên cứu, học tập lý luận chính trị, tài liệu chỉ đạo và lịch sử Đảng bộ.
          </p>

          {/* Large search input */}
          <form onSubmit={handleSearch} className="mt-6 max-w-3xl mx-auto">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white text-slate-900 ring-4 ring-amber-400/30">
              <div className="pl-4 sm:pl-5 text-slate-400">
                <Search className="w-5 h-5 text-red-600" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nhập từ khóa, số ký hiệu (VD: 88-KH/BTGTU), cơ quan ban hành, năm..."
                className="w-full py-4 pl-3 pr-28 sm:pr-36 text-sm sm:text-base focus:outline-none placeholder:text-slate-400 font-medium"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenAdvancedSearch}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 font-bold text-xs transition"
                  title="Mở bộ lọc tra cứu đa tiêu chí"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-red-700" />
                  <span>Nâng cao</span>
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Tra cứu</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick link to advanced search for mobile */}
          <div className="sm:hidden pt-1">
            <button
              onClick={onOpenAdvancedSearch}
              className="text-xs text-amber-300 underline font-semibold flex items-center justify-center gap-1 mx-auto"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Mở công cụ tra cứu nâng cao
            </button>
          </div>

          {/* Popular search tags */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2 text-xs">
            <span className="text-amber-200/90 font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Gợi ý tìm kiếm:
            </span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchInput(tag);
                  onSearchSubmit(tag);
                }}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-slate-200 transition text-[11px] backdrop-blur-sm border border-white/10 hover:border-amber-300 font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STATISTIC METRIC CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng số tài liệu
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <FileStack className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              1,842
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Đã đồng bộ {totalDocs} tài liệu hệ thống
          </p>
        </div>

        {/* New Documents */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Văn bản mới tháng này
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {recentMonthCount + 24}
            </span>
            <span className="text-xs font-semibold text-amber-600">văn bản</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cập nhật liên tục 24/7</p>
        </div>

        {/* Total Views / Access */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lượt truy cập
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalViews.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-semibold text-blue-600">lượt</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalDownloads.toLocaleString('vi-VN')} lượt tải tài liệu
          </p>
        </div>

        {/* Repository Storage Size */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dung lượng kho số hóa
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              48.6 GB
            </span>
            <span className="text-xs font-semibold text-slate-500">/ 2.0 TB</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full w-[24%]" />
          </div>
        </div>
      </section>

      {/* 3. QUICK LOOKUP BUTTONS */}
      <section className="bg-gradient-to-r from-red-900/90 via-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Tra cứu nhanh theo phân loại chuyên biệt
          </h3>
          <button
            onClick={onNavigateToArchive}
            className="text-xs text-amber-200 hover:text-white flex items-center gap-1 font-semibold group"
          >
            <span>Vào kho đầy đủ</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => onQuickFilter('recent')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-red-600/60 text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition shadow">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Văn bản mới ban hành</span>
            <span className="text-[10px] text-slate-300 mt-0.5">Năm 2026</span>
          </button>

          <button
            onClick={() => onQuickFilter('category')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-600/60 text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition shadow">
              <Tag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Tài liệu theo chủ đề</span>
            <span className="text-[10px] text-slate-300 mt-0.5">13 lĩnh vực chuyên sâu</span>
          </button>

          <button
            onClick={() => onQuickFilter('archive')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600/60 text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition shadow">
              <FileStack className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Hồ sơ lưu trữ</span>
            <span className="text-[10px] text-slate-300 mt-0.5">Đề án, Quy hoạch, Kế hoạch</span>
          </button>

          <button
            onClick={() => onQuickFilter('authority')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600/60 text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition shadow">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Cơ quan, đơn vị</span>
            <span className="text-[10px] text-slate-300 mt-0.5">Tỉnh ủy, Ban Tuyên giáo</span>
          </button>

          <button
            onClick={() => onQuickFilter('digitized')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 text-center group col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-full bg-purple-600/60 text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition shadow">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Tài liệu đã số hóa OCR</span>
            <span className="text-[10px] text-slate-300 mt-0.5">Tìm kiếm toàn văn</span>
          </button>
        </div>
      </section>

      {/* 4. MAIN THREE SECTIONS: LATEST UPDATED, FEATURED DIRECTIVES, NOTIFICATIONS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Tài liệu mới cập nhật */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Tài liệu mới cập nhật
              </h3>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Mới nhất
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="py-3 hover:bg-slate-50 rounded-lg px-2 transition group flex items-start justify-between gap-2"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => onSelectDocument(doc)}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.codeNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{doc.issueDate}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition mt-1 line-clamp-2">
                      {doc.title}
                    </h4>
                    <span className="text-[10px] text-slate-500">{doc.category}</span>
                  </div>

                  <button
                    onClick={() => onDownloadDocument(doc)}
                    className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                    title="Tải tệp đính kèm"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToArchive}
            className="w-full mt-3 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition text-center"
          >
            Xem tất cả tài liệu ({totalDocs})
          </button>
        </div>

        {/* Column 2: Văn bản nổi bật (Nghị quyết, Chỉ thị trọng tâm) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-600" />
                Văn bản nổi bật
              </h3>
              <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                Trọng tâm
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {featuredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className="p-3 rounded-xl border border-red-100 bg-gradient-to-r from-red-50/50 to-white hover:border-red-300 hover:shadow-sm transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                      {doc.documentType}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{doc.codeNumber}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 hover:text-red-700 mt-1.5 line-clamp-2">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{doc.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToArchive}
            className="w-full mt-3 py-2 rounded-xl text-xs font-bold text-red-800 bg-red-50 hover:bg-red-100 transition text-center"
          >
            Xem văn bản chỉ đạo
          </button>
        </div>

        {/* Column 3: Thông báo của Ban Tuyên giáo Tỉnh ủy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Thông báo của Ban Tuyên giáo
              </h3>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                Chỉ đạo
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} className="py-3 hover:bg-slate-50 px-2 rounded-lg transition">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-amber-700 uppercase">
                      {notif.type === 'training' ? 'Tập huấn' : notif.type === 'urgent' ? 'Khẩn' : 'Thông báo'}
                    </span>
                    <span>{notif.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <p className="text-xs font-semibold text-amber-900">
              Đường dây nóng Ban Tuyên giáo Tỉnh ủy Cà Mau
            </p>
            <p className="text-[11px] text-amber-700 font-bold mt-0.5">
              0913544770 – btgdv.vp@camau.gov.vn
            </p>
          </div>
        </div>
      </section>

      {/* 5. VISUAL REPOSITORY STATISTICS (BY YEAR & BY DOMAIN) */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Thống kê tổng quan kho tài liệu số hóa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bố khối lượng văn bản theo các năm và theo 13 lĩnh vực công tác tuyên giáo tỉnh Cà Mau
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Dữ liệu tổng hợp năm 2026
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: By Year */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
              <span>Số lượng tài liệu qua các năm</span>
              <span className="text-[11px] text-slate-400 font-normal">Đơn vị: Văn bản</span>
            </h4>
            <div className="space-y-2.5">
              {Object.entries(yearStats).map(([year, val]) => {
                const percentage = Math.round((val / maxYearVal) * 100);
                return (
                  <div key={year} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{year}</span>
                      <span className="text-slate-500 font-bold">{val} tài liệu</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: By Category */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
              <span>Cơ cấu theo lĩnh vực tuyên giáo trọng điểm</span>
              <span className="text-[11px] text-slate-400 font-normal">Hồ sơ số hóa</span>
            </h4>
            <div className="space-y-2.5">
              {categoryStats.map((cat) => {
                const percentage = Math.round((cat.count / maxCatVal) * 100);
                return (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat.label}</span>
                      <span className="text-slate-500 font-bold">{cat.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${cat.color} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
