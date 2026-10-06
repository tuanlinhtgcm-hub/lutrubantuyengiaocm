import React, { useState } from 'react';
import {
  Home,
  Info,
  FolderArchive,
  Compass,
  BookOpen,
  Landmark,
  Megaphone,
  Film,
  HelpCircle,
  PhoneCall,
  Menu,
  SlidersHorizontal,
  X,
  GraduationCap,
  Palette,
  Award,
  Mic,
  MessageSquareQuote,
  Cpu,
  FlaskConical,
  Globe,
  Anchor,
  Layers,
  Sparkles
} from 'lucide-react';

export type NavItemKey =
  | 'home'
  | 'about'
  | 'archive'
  | 'advanced-search'
  | 'directives'
  | 'political-theory'
  | 'ho-chi-minh-thought'
  | 'party-history'
  | 'rapporteur'
  | 'social-opinion'
  | 'digital-transformation'
  | 'propaganda'
  | 'culture-arts'
  | 'science-education'
  | 'science-technology'
  | 'foreign-information'
  | 'islands-seas'
  | 'coordination-work'
  | 'other-categories'
  | 'multimedia'
  | 'reports-forms'
  | 'guide'
  | 'contact';

interface NavbarProps {
  activeTab: NavItemKey;
  onSelectTab: (key: NavItemKey) => void;
}

interface NavItemDef {
  key: NavItemKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Phân hệ công cụ & tra cứu chính (Hàng 1)
  const systemMainItems: NavItemDef[] = [
    { key: 'archive', label: 'Kho tài liệu', icon: FolderArchive },
    { key: 'advanced-search', label: 'Tra cứu nâng cao', icon: SlidersHorizontal },
    { key: 'directives', label: 'Văn bản chỉ đạo', icon: Compass },
    { key: 'multimedia', label: 'Hình ảnh – Video', icon: Film },
  ];

  // 2. Phân hệ thông tin cơ quan & trợ giúp (Hàng 1 - cánh phải)
  const systemInfoItems: NavItemDef[] = [
    { key: 'about', label: 'Giới thiệu', icon: Info },
    { key: 'guide', label: 'Hướng dẫn', icon: HelpCircle },
    { key: 'contact', label: 'Liên hệ', icon: PhoneCall },
  ];

  // 3. 13 Lĩnh vực Nghiệp vụ Tuyên giáo (Hàng 2) - Được sắp xếp chuẩn logic theo 4 khối nghiệp vụ
  // Khối I: Nền tảng Lý luận & Lịch sử Đảng
  const blockTheoryItems: NavItemDef[] = [
    { key: 'political-theory', label: 'Lý luận chính trị', icon: BookOpen },
    { key: 'ho-chi-minh-thought', label: 'Tư tưởng Hồ Chí Minh', icon: Award },
    { key: 'party-history', label: 'Lịch sử Đảng bộ', icon: Landmark },
  ];

  // Khối II: Tuyên truyền & Dư luận xã hội
  const blockPropagandaItems: NavItemDef[] = [
    { key: 'propaganda', label: 'Tuyên truyền', icon: Megaphone },
    { key: 'rapporteur', label: 'Báo cáo viên', icon: Mic },
    { key: 'social-opinion', label: 'Dư luận xã hội', icon: MessageSquareQuote },
  ];

  // Khối III: Khoa giáo, Văn hóa & Khoa học công nghệ
  const blockSocialItems: NavItemDef[] = [
    { key: 'science-education', label: 'Khoa giáo', icon: GraduationCap },
    { key: 'culture-arts', label: 'Văn hoá - Văn nghệ', icon: Palette },
    { key: 'science-technology', label: 'Khoa học - Công nghệ', icon: FlaskConical },
    { key: 'digital-transformation', label: 'Chuyển đổi số', icon: Cpu },
  ];

  // Khối IV: Đối ngoại, Biển đảo & Lĩnh vực khác
  const blockExternalItems: NavItemDef[] = [
    { key: 'foreign-information', label: 'Thông tin đối ngoại', icon: Globe },
    { key: 'islands-seas', label: 'Tuyên truyền Biển đảo', icon: Anchor },
    { key: 'other-categories', label: 'Lĩnh vực khác', icon: Layers },
  ];

  const allCategoryBlocks = [
    { title: 'Lý luận & Tư tưởng', items: blockTheoryItems },
    { title: 'Tuyên truyền & Dư luận', items: blockPropagandaItems },
    { title: 'Khoa giáo & Văn hóa', items: blockSocialItems },
    { title: 'Đối ngoại & Biển đảo', items: blockExternalItems },
  ];

  // Render từng nút bấm trên thanh điều hướng
  const renderNavButton = (
    item: NavItemDef,
    options?: {
      isCompact?: boolean;
      highlightActive?: boolean;
      subtleBg?: boolean;
    }
  ) => {
    const Icon = item.icon;
    const isActive = activeTab === item.key;
    const isCompact = options?.isCompact ?? true;

    return (
      <button
        key={item.key}
        onClick={() => onSelectTab(item.key)}
        className={`flex items-center gap-1.5 ${
          isCompact ? 'px-2.5 py-1 text-[11px] lg:text-xs' : 'px-3 py-1.5 text-xs'
        } font-medium rounded-md transition-all whitespace-nowrap border ${
          isActive
            ? 'bg-red-800 text-amber-300 border-amber-400 font-bold shadow-xs ring-1 ring-amber-400/40'
            : options?.subtleBg
            ? 'text-slate-300 hover:text-white hover:bg-slate-700/80 border-slate-700/40 hover:border-slate-600 bg-slate-800/40'
            : 'text-slate-200 hover:text-white hover:bg-slate-700/80 border-slate-700/60 hover:border-slate-500 bg-slate-800/80'
        }`}
      >
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <nav className="bg-[#1e293b] text-slate-100 shadow-lg sticky top-0 z-30 border-b border-slate-700 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Thanh tiêu đề trên Mobile */}
        <div className="flex md:hidden items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              Menu Điều hướng & 13 Lĩnh vực
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none"
            title="Đóng / mở menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP NAVIGATION: BỐ CỤC 2 HÀNG LOGIC, KHOA HỌC & ĐẸP MẮT */}
        {/* ======================================================== */}
        <div className="hidden md:flex flex-col py-1.5 gap-1.5 w-full">
          {/* HÀNG 1: TRANG CHỦ + PHÂN HỆ TRA CỨU CỐT LÕI + THÔNG TIN HỖ TRỢ */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1.5 pt-0.5">
            {/* Cánh trái: Nút Trang chủ nổi bật + Các phân hệ tra cứu hệ thống */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => onSelectTab('home')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition border shadow-xs ${
                  activeTab === 'home'
                    ? 'bg-red-800 text-amber-300 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                    : 'bg-red-900/90 hover:bg-red-800 text-amber-200 hover:text-white border-red-700/80 hover:border-amber-400'
                }`}
                title="Về Trang chủ Kho lưu trữ"
              >
                <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-amber-300' : 'text-amber-300'}`} />
                <span className="tracking-wide">Trang chủ</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-0.5" />

              {/* Nhóm công cụ tra cứu cốt lõi */}
              <div className="flex items-center gap-1.5">
                {systemMainItems.map((item) => renderNavButton(item, { isCompact: true }))}
              </div>
            </div>

            {/* Cánh phải: Thông tin cơ quan, Hướng dẫn & Liên hệ */}
            <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
              <div className="h-4 w-px bg-slate-700 mx-0.5 hidden lg:block" />
              {systemInfoItems.map((item) =>
                renderNavButton(item, { isCompact: true, subtleBg: true })
              )}
            </div>
          </div>

          {/* HÀNG 2: THANH CHUYÊN ĐỀ 13 LĨNH VỰC NGHIỆP VỤ TUYÊN GIÁO */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Nhãn nhận diện hàng lĩnh vực */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-[10.5px] font-bold uppercase tracking-wider whitespace-nowrap">
                Lĩnh vực nghiệp vụ:
              </span>
            </div>

            {/* Khối I: Lý luận & Tư tưởng */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {blockTheoryItems.map((item) => renderNavButton(item, { isCompact: true }))}
            </div>

            <div className="h-3.5 w-px bg-slate-700/80 flex-shrink-0 mx-0.5" />

            {/* Khối II: Tuyên truyền & Dư luận */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {blockPropagandaItems.map((item) => renderNavButton(item, { isCompact: true }))}
            </div>

            <div className="h-3.5 w-px bg-slate-700/80 flex-shrink-0 mx-0.5" />

            {/* Khối III: Khoa giáo & Văn hóa */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {blockSocialItems.map((item) => renderNavButton(item, { isCompact: true }))}
            </div>

            <div className="h-3.5 w-px bg-slate-700/80 flex-shrink-0 mx-0.5" />

            {/* Khối IV: Đối ngoại & Biển đảo */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {blockExternalItems.map((item) => renderNavButton(item, { isCompact: true }))}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE DRAWER: BỐ CỤC THEO KHỐI RÕ RÀNG, DỄ TRA CỨU */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-700 px-3 pt-2 pb-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
          {/* Nút Trang chủ */}
          <button
            onClick={() => {
              onSelectTab('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-left transition ${
              activeTab === 'home'
                ? 'bg-red-800 text-amber-300 shadow'
                : 'bg-red-950/80 text-amber-200 hover:bg-red-900'
            }`}
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span>Trang chủ Kho lưu trữ số</span>
          </button>

          {/* 1. Nhóm Công cụ tra cứu & Tư liệu */}
          <div className="pt-1">
            <p className="px-2 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Phân hệ Tra cứu & Tư liệu:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {systemMainItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelectTab(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-medium rounded-md text-left transition ${
                      isActive
                        ? 'bg-red-800 text-amber-300 font-bold border border-amber-400/80'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white bg-slate-800/60 border border-slate-700/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Nhóm 13 Lĩnh vực Nghiệp vụ Tuyên giáo */}
          <div className="pt-1 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                13 Lĩnh vực Nghiệp vụ Tuyên giáo:
              </span>
              <span className="text-[9px] bg-red-900/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40 font-mono">
                13 lĩnh vực
              </span>
            </div>

            {allCategoryBlocks.map((block) => (
              <div key={block.title} className="space-y-1">
                <p className="px-2 text-[10px] text-slate-400 font-semibold italic">
                  {block.title}:
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {block.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          onSelectTab(item.key);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-md text-left transition ${
                          isActive
                            ? 'bg-red-800 text-amber-300 font-bold border border-amber-400/70 shadow-xs'
                            : 'text-slate-200 hover:bg-slate-800 hover:text-white bg-slate-800/40 border border-slate-700/40'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 3. Nhóm Thông tin cơ quan & Hướng dẫn */}
          <div className="pt-2 border-t border-slate-800">
            <p className="px-2 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Thông tin & Trợ giúp:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {systemInfoItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelectTab(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition ${
                      isActive
                        ? 'bg-red-800 text-amber-300 font-bold border border-amber-400/70'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white bg-slate-800/30 border border-slate-700/30'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
