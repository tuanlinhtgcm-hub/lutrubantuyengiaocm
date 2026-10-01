import React from 'react';
import {
  Home,
  Info,
  FolderArchive,
  Compass,
  BookOpen,
  Landmark,
  Megaphone,
  Film,
  FileSpreadsheet,
  HelpCircle,
  PhoneCall,
  Menu,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';

export type NavItemKey =
  | 'home'
  | 'about'
  | 'archive'
  | 'advanced-search'
  | 'directives'
  | 'political-theory'
  | 'party-history'
  | 'propaganda'
  | 'multimedia'
  | 'reports-forms'
  | 'guide'
  | 'contact';

interface NavbarProps {
  activeTab: NavItemKey;
  onSelectTab: (key: NavItemKey) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const homeItem = { key: 'home' as NavItemKey, label: 'Trang chủ', icon: Home };

  const row1Items = [
    { key: 'archive' as NavItemKey, label: 'Kho tài liệu', icon: FolderArchive },
    { key: 'advanced-search' as NavItemKey, label: 'Tra cứu nâng cao', icon: SlidersHorizontal },
    { key: 'directives' as NavItemKey, label: 'Văn bản chỉ đạo', icon: Compass },
    { key: 'political-theory' as NavItemKey, label: 'Lý luận chính trị', icon: BookOpen },
    { key: 'party-history' as NavItemKey, label: 'Lịch sử Đảng bộ', icon: Landmark },
    { key: 'propaganda' as NavItemKey, label: 'Tuyên truyền', icon: Megaphone },
  ];

  const row2Items = [
    { key: 'multimedia' as NavItemKey, label: 'Hình ảnh – Video', icon: Film },
    { key: 'reports-forms' as NavItemKey, label: 'Báo cáo – Biểu mẫu', icon: FileSpreadsheet },
    { key: 'about' as NavItemKey, label: 'Giới thiệu', icon: Info },
    { key: 'guide' as NavItemKey, label: 'Hướng dẫn', icon: HelpCircle },
    { key: 'contact' as NavItemKey, label: 'Liên hệ', icon: PhoneCall },
  ];

  const allItems = [homeItem, ...row1Items, ...row2Items];

  const renderNavButton = (
    item: { key: NavItemKey; label: string; icon: React.ComponentType<{ className?: string }> },
    isCompact: boolean = true
  ) => {
    const Icon = item.icon;
    const isActive = activeTab === item.key;
    return (
      <button
        key={item.key}
        onClick={() => onSelectTab(item.key)}
        className={`flex items-center gap-1.5 ${
          isCompact ? 'px-2.5 py-1 text-[11px] lg:text-xs' : 'px-3 py-1.5 text-xs'
        } font-medium rounded-md transition-all whitespace-nowrap border ${
          isActive
            ? 'bg-red-800 text-amber-300 border-amber-400 font-bold shadow-xs'
            : 'text-slate-200 hover:text-white hover:bg-slate-700/80 border-slate-700/50 hover:border-slate-600 bg-slate-800/60'
        }`}
      >
        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <nav className="bg-[#1e293b] text-slate-100 shadow-md sticky top-0 z-30 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile menu bar */}
        <div className="flex md:hidden items-center justify-between h-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <FolderArchive className="w-4 h-4" />
            Menu Điều hướng
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desktop Navigation: Nút Trang chủ + Hai hàng ngang các đề mục */}
        <div className="hidden md:flex items-center gap-3 py-2 w-full">
          {/* Nút Trang chủ nổi bật chiều cao đồng bộ 2 hàng */}
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-lg font-bold text-xs transition border self-stretch min-w-[84px] shadow-xs ${
              activeTab === 'home'
                ? 'bg-red-800 text-amber-300 border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600/80 hover:border-slate-500'
            }`}
            title="Về Trang chủ Kho lưu trữ"
          >
            <Home className={`w-4 h-4 mb-0.5 ${activeTab === 'home' ? 'text-amber-300' : 'text-amber-400'}`} />
            <span className="tracking-wide">Trang chủ</span>
          </button>

          {/* Hai hàng ngang các đề mục sau Trang chủ */}
          <div className="flex-1 flex flex-col gap-1.5 justify-center overflow-x-auto no-scrollbar py-0.5">
            {/* Hàng 1: Phân hệ hồ sơ & tra cứu cốt lõi */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {row1Items.map((item) => renderNavButton(item))}
            </div>

            {/* Hàng 2: Đa phương tiện, biểu mẫu & hỗ trợ tra cứu */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {row2Items.map((item) => renderNavButton(item))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-700 px-3 pt-2 pb-3 space-y-2">
          {/* Mobile Home button */}
          <button
            onClick={() => {
              onSelectTab('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-left transition ${
              activeTab === 'home'
                ? 'bg-red-800 text-amber-300'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-amber-300' : 'text-amber-400'}`} />
            <span>Trang chủ</span>
          </button>

          {/* Group 1: Phân hệ tài liệu */}
          <div className="pt-1">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
              Văn bản & Tra cứu:
            </p>
            <div className="grid grid-cols-2 gap-1">
              {row1Items.map((item) => {
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
                        ? 'bg-red-800 text-amber-300 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Đa phương tiện & Hỗ trợ */}
          <div className="pt-1 border-t border-slate-800">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tiện ích & Thông tin:
            </p>
            <div className="grid grid-cols-2 gap-1">
              {row2Items.map((item) => {
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
                        ? 'bg-red-800 text-amber-300 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
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
