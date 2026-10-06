import React, { useState, useRef } from 'react';
import {
  Bell,
  UserCheck,
  Shield,
  LogOut,
  LogIn,
  Bookmark,
  Activity,
  ChevronDown,
  CheckCircle2,
  FileText,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Palette,
  Sliders,
  X,
  RotateCcw,
  Check,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { UserProfile, UserRole, NotificationItem } from '../types';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

const DEFAULT_LOGO = '/logo-tuyen-giao.jpg';
const FALLBACK_ONLINE_LOGO = 'https://i.ibb.co/TDykz9R9/logo-tuyen-giao-bieu-trung.jpg';

interface HeaderProps {
  currentUser: UserProfile;
  onUpdateRole: (role: UserRole) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onOpenCollections: () => void;
  onOpenAuditLogs: () => void;
  onOpenAdminPanel?: () => void;
  onSelectDocumentById: (docId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUpdateRole,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenCollections,
  onOpenAuditLogs,
  onOpenAdminPanel,
  onSelectDocumentById,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Logo state loaded from localStorage or default official emblem
  const [customLogo, setCustomLogo] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('cm_agency_custom_logo');
      if (saved && saved !== 'null' && saved.trim() !== '') {
        return saved;
      }
      return DEFAULT_LOGO;
    } catch {
      return DEFAULT_LOGO;
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Banner background customizer state
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [customBanner, setCustomBanner] = useState<string>(() => {
    try {
      return localStorage.getItem('cm_custom_banner_bg') || '';
    } catch {
      return '';
    }
  });
  const [bannerOverlay, setBannerOverlay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cm_banner_overlay');
      return saved ? Number(saved) : 65;
    } catch {
      return 65;
    }
  });
  const [customBannerUrlInput, setCustomBannerUrlInput] = useState('');
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Preset banner options with high aesthetic quality suitable for Party Committee Archive
  const bannerPresets = [
    {
      id: 'vietnam-flag-silk',
      name: 'Đỏ cờ Tổ quốc Việt Nam (Sóng lụa đỏ cờ #DA251D)',
      value: '/vietnam-flag-banner.svg',
      preview: 'linear-gradient(135deg, #da251d 0%, #e22c24 45%, #9e120d 100%)',
      description: 'Màu đỏ thắm nguyên bản của lá cờ Việt Nam với hiệu ứng sóng lụa trang nghiêm và ánh kim vàng'
    },
    {
      id: 'vietnam-flag-pure-red',
      name: 'Nền đỏ cờ Việt Nam (Sắc đỏ cờ cách mạng quang vinh)',
      value: '/vietnam-flag-pure-red.svg',
      preview: 'linear-gradient(to right, #da251d, #e52b23, #c81b14)',
      description: 'Màu đỏ tươi nguyên bản của lá cờ Tổ quốc Việt Nam, tôn vinh biểu trưng Ban Tuyên giáo'
    },
    {
      id: 'vietnam-flag-gradient',
      name: 'Đỏ cờ Tổ quốc nguyên bản (Gradient chuyển sắc)',
      value: 'linear-gradient(135deg, #da251d 0%, #c61911 50%, #8c0d07 100%)',
      preview: 'linear-gradient(135deg, #da251d 0%, #c61911 50%, #8c0d07 100%)',
      description: 'Màu đỏ cờ tươi thuần khiết không hoa văn, chuẩn nhận diện chính trị'
    },
    {
      id: 'default',
      name: 'Mặc định (Đỏ cờ – Rượu vang – Hải quân)',
      value: '',
      preview: 'linear-gradient(to right, #991b1b, #831843, #1e3a8a)',
      description: 'Gradient trang trọng phối hợp các gam màu chính trị'
    },
    {
      id: 'trong-dong',
      name: 'Trống đồng Đông Sơn & Ánh kim đỏ thắm',
      value: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80',
      preview: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&q=60',
      description: 'Họa tiết ánh hào quang rực rỡ và trang trọng'
    },
    {
      id: 'crimson-flag',
      name: 'Cờ đỏ sao vàng & Búa liềm quang vinh',
      value: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
      preview: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&q=60',
      description: 'Màu đỏ thắm thiêng liêng của cờ Đảng và Tổ quốc'
    },
    {
      id: 'camau-cape',
      name: 'Cà Mau – Non sông gấm vóc cực Nam',
      value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
      preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=60',
      description: 'Sóng nước mênh mông, màu xanh rừng ngập mặn Cà Mau'
    },
    {
      id: 'digital-archive',
      name: 'Chuyển đổi số & Lưu trữ số thông minh',
      value: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      preview: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=60',
      description: 'Không gian mạng dữ liệu số hóa hiện đại'
    },
    {
      id: 'damask-pattern',
      name: 'Gấm đỏ quý phái & Họa tiết truyền thống',
      value: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1600&q=80',
      preview: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=60',
      description: 'Nền trừu tượng đỏ đô sâu lắng, tôn vinh văn bản'
    }
  ];

  const handleApplyBanner = (bannerValue: string) => {
    setCustomBanner(bannerValue);
    try {
      if (bannerValue) {
        localStorage.setItem('cm_custom_banner_bg', bannerValue);
      } else {
        localStorage.removeItem('cm_custom_banner_bg');
      }
    } catch (e) {
      console.error('Không thể lưu banner vào localStorage:', e);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleApplyBanner(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOverlayChange = (val: number) => {
    setBannerOverlay(val);
    try {
      localStorage.setItem('cm_banner_overlay', String(val));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetBanner = () => {
    setCustomBanner('');
    setBannerOverlay(65);
    try {
      localStorage.removeItem('cm_custom_banner_bg');
      localStorage.removeItem('cm_banner_overlay');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, SVG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomLogo(base64);
      try {
        localStorage.setItem('cm_agency_custom_logo', base64);
      } catch (err) {
        console.error('Không thể lưu logo vào localStorage:', err);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Đồng chí muốn khôi phục về Biểu trưng Ban Tuyên giáo mặc định không?')) {
      setCustomLogo(DEFAULT_LOGO);
      try {
        localStorage.setItem('cm_agency_custom_logo', DEFAULT_LOGO);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Authenticated with Firebase
        console.log('Firebase user logged in:', result.user.email);
      }
    } catch (err) {
      console.warn('Google sign in note:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    onUpdateRole('guest');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Quản trị hệ thống', bg: 'bg-red-100 text-red-800 border-red-200' };
      case 'editor':
        return { label: 'Cán bộ biên tập', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'staff':
        return { label: 'Cán bộ cơ quan', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { label: 'Khách tra cứu', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header
      style={{
        backgroundImage: customBanner
          ? (customBanner.startsWith('linear-gradient') || customBanner.startsWith('radial-gradient')
              ? customBanner
              : `url(${customBanner})`)
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className={`relative z-40 text-white shadow-xl border-b-2 border-amber-400 select-none transition-all duration-300 ${
        !customBanner ? 'bg-gradient-to-r from-[#991b1b] via-[#831843] to-[#1e3a8a]' : ''
      }`}
    >
      {/* Background overlay for maximum legibility of text & emblems */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          backgroundColor: customBanner
            ? `rgba(0, 0, 0, ${bannerOverlay / 100})`
            : undefined,
        }}
      />

      {/* Subtle background ornamentation pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        {/* Left: Agency branding and Party emblem */}
        <div className="flex items-center gap-3.5">
          {/* Logo trước Ban Tuyên giáo Tỉnh ủy Cà Mau (để trống cho quản trị tải ảnh lên) */}
          <div className="flex-shrink-0 flex items-center justify-center">
            {/* Hidden native file input for logo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />

            {customLogo ? (
              <div className="relative group w-13 h-13 flex-shrink-0">
                <img
                  src={customLogo}
                  alt="Biểu trưng Ban Tuyên giáo Tỉnh ủy Cà Mau"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_ONLINE_LOGO;
                  }}
                  className="w-13 h-13 object-cover drop-shadow-md rounded-full p-0.5 bg-white border-2 border-amber-300 shadow-md ring-1 ring-amber-400/40"
                />
                {currentUser.role === 'admin' && (
                  <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 backdrop-blur-xs">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow"
                      title="Tải logo khác lên"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow"
                      title="Khôi phục logo mặc định"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : currentUser.role === 'admin' ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-13 h-13 rounded-full border-2 border-dashed border-amber-300/70 hover:border-amber-300 bg-white/5 hover:bg-white/15 transition flex flex-col items-center justify-center text-amber-200 group p-1"
                title="Quản trị viên: Bấm để tải ảnh logo tròn lên"
              >
                <Upload className="w-4 h-4 text-amber-300 group-hover:scale-110 transition" />
                <span className="text-[8.5px] font-semibold text-amber-200/90 mt-0.5 leading-none text-center">
                  Tải logo
                </span>
              </button>
            ) : (
              /* Để trống khi chưa có logo và không phải quản trị */
              <div className="w-2" />
            )}
          </div>

          <div className="flex-shrink-0">
            <h1 className="text-lg md:text-xl font-extrabold tracking-wide uppercase text-white drop-shadow whitespace-nowrap">
              BAN TUYÊN GIÁO TỈNH ỦY CÀ MAU
            </h1>
            <p className="text-xs md:text-sm font-medium text-amber-200 tracking-wide flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-amber-200 font-bold">KHO LƯU TRỮ SỐ</span>
              <span className="text-amber-200/70">–</span>
              <span className="text-amber-200 font-medium">TÀI LIỆU TUYÊN GIÁO</span>
            </p>
          </div>
        </div>

        {/* Right: Quick actions, notifications, user profile & role switcher */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* NÚT THAY ẢNH NỀN BA NƠ */}
          <button
            onClick={() => setShowBannerModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-sm transition border border-white/20 hover:border-amber-300 text-amber-200 shadow-xs"
            title="Tùy chỉnh thay đổi ảnh nền ba-nơ tiêu đề trang"
          >
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Thay ảnh nền ba nơ</span>
            <span className="sm:hidden">Nền ba nơ</span>
          </button>

          {/* Personal Collections Button */}
          <button
            onClick={onOpenCollections}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium backdrop-blur-sm transition border border-white/15 hover:border-amber-300 text-amber-100"
            title="Bộ sưu tập & tài liệu yêu thích của tôi"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Bộ sưu tập</span>
          </button>

          {/* Audit Logs button (For Staff / Admin / Editor) */}
          {currentUser.role !== 'guest' && (
            <button
              onClick={onOpenAuditLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium backdrop-blur-sm transition border border-white/15 text-slate-100"
              title="Nhật ký hoạt động lưu trữ"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Nhật ký</span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 transition border border-white/15 focus:outline-none"
              title="Thông báo mới"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-red-900 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown (high z-index to stay above tabs) */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-slate-200 text-slate-800 z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-gradient-to-r from-red-800 to-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-300" />
                    <span className="font-semibold text-sm">Thông báo Ban Tuyên giáo</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => onMarkAllNotificationsRead()}
                      className="text-xs text-amber-300 hover:underline"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">Chưa có thông báo nào</p>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onMarkNotificationRead(item.id);
                          if (item.documentId) {
                            onSelectDocumentById(item.documentId);
                            setShowNotifMenu(false);
                          }
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition flex items-start gap-2.5 ${
                          !item.isRead ? 'bg-amber-50/70' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {item.type === 'urgent' ? (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${!item.isRead ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.content}</p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                            <span>{item.date}</span>
                            {!item.isRead && (
                              <span className="text-red-600 font-semibold">Chưa xem</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Management Panel Button - Nằm cạnh nút Trương Tuấn Linh */}
          {currentUser.role === 'admin' && onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition border border-amber-200 ring-2 ring-amber-400/40 whitespace-nowrap"
              title="Mở Bảng điều khiển Quản trị hệ thống (không bị ẩn dưới các tab)"
            >
              <Shield className="w-3.5 h-3.5 text-slate-950" />
              <span>Quản trị hệ thống</span>
            </button>
          )}

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-black/20 hover:bg-black/35 border border-white/20 transition text-left"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-xs shadow">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-300">{roleInfo.label}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-amber-200 opacity-80" />
            </button>

            {/* Role Switcher Menu (high z-index to stay above tabs) */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-2xl border border-slate-200 text-slate-800 z-[70] p-2 animate-in fade-in duration-150">
                <div className="p-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded font-medium border bg-slate-100 text-slate-700">
                    Đơn vị: {currentUser.department}
                  </div>
                </div>

                {/* Direct button to open Admin Management Panel if user is Admin */}
                {currentUser.role === 'admin' && onOpenAdminPanel && (
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenAdminPanel();
                    }}
                    className="w-full mt-2 mb-1 p-2 rounded-lg bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <Shield className="w-4 h-4 text-amber-300" />
                    <span>Mở Bảng Quản trị Hệ thống</span>
                  </button>
                )}

                <div className="py-1">
                  <p className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Chuyển vai trò thử nghiệm:
                  </p>
                  {(
                    [
                      { role: 'admin', label: 'Quản trị hệ thống', desc: 'Toàn quyền, phê duyệt tài liệu & hệ thống' },
                      { role: 'editor', label: 'Cán bộ biên tập', desc: 'Thêm, sửa tài liệu, OCR, gắn nhãn' },
                      { role: 'staff', label: 'Cán bộ cơ quan', desc: 'Tra cứu nội bộ, tải file, lưu yêu thích' },
                      { role: 'guest', label: 'Người dùng tra cứu', desc: 'Chỉ xem tài liệu công khai' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        onUpdateRole(item.role);
                        setShowRoleMenu(false);
                        if (item.role === 'admin' && onOpenAdminPanel) {
                          onOpenAdminPanel();
                        }
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-start justify-between transition ${
                        currentUser.role === item.role
                          ? 'bg-amber-50 text-amber-900 font-semibold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                      {currentUser.role === item.role && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
                  <button
                    onClick={() => {
                      handleGoogleLogin();
                      setShowRoleMenu(false);
                    }}
                    className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Đăng nhập Google
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowRoleMenu(false);
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Hidden file input for banner background */}
      <input
        ref={bannerFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBannerUpload}
      />

      {/* Banner Background Customizer Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-amber-500/40 my-6 overflow-hidden flex flex-col max-h-[92vh] text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-900 via-[#831843] to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow font-bold">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide uppercase">
                    THAY ĐỔI ẢNH NỀN BANNER (BA NƠ)
                  </h3>
                  <p className="text-xs text-amber-200 font-light mt-0.5">
                    Ban Tuyên giáo Tỉnh ủy Cà Mau – Tùy biến phông nền tiêu đề trang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBannerModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* 1. Live Preview of Current Banner */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Xem trước Banner hiện tại:
                </label>
                <div
                  style={{
                    backgroundImage: customBanner
                      ? (customBanner.startsWith('linear-gradient') || customBanner.startsWith('radial-gradient')
                          ? customBanner
                          : `url(${customBanner})`)
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  className={`relative rounded-xl p-4 text-white shadow-inner overflow-hidden border border-slate-300 min-h-[90px] flex items-center justify-between ${
                    !customBanner ? 'bg-gradient-to-r from-[#991b1b] via-[#831843] to-[#1e3a8a]' : ''
                  }`}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: customBanner
                        ? `rgba(0, 0, 0, ${bannerOverlay / 100})`
                        : undefined,
                    }}
                  />
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/40 px-2 py-0.5 rounded">
                      BAN TUYÊN GIÁO TỈNH ỦY CÀ MAU
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1 drop-shadow">
                      KHO LƯU TRỮ SỐ – TÀI LIỆU TUYÊN GIÁO
                    </h4>
                  </div>
                  <span className="relative z-10 px-2.5 py-1 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow">
                    {customBanner ? 'Ảnh tùy chỉnh' : 'Nền mặc định'}
                  </span>
                </div>
              </div>

              {/* 2. Upload from computer */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  Cách 1: Tải ảnh từ máy tính / thiết bị của đồng chí
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Chọn ảnh chụp phong cảnh, pa-nô tuyên truyền, cờ Tổ quốc hoặc hình ảnh trụ sở (định dạng JPG, PNG, WEBP).
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold transition flex items-center gap-2 shadow"
                  >
                    <Upload className="w-4 h-4 text-amber-300" />
                    <span>Chọn tệp ảnh từ máy tính</span>
                  </button>
                  {customBanner && (
                    <button
                      type="button"
                      onClick={handleResetBanner}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa ảnh tự tải</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Input Direct Image Link */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                  Cách 2: Nhập đường dẫn ảnh trực tiếp (URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customBannerUrlInput}
                    onChange={(e) => setCustomBannerUrlInput(e.target.value)}
                    placeholder="https://example.com/banner-tuyen-giao.jpg"
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customBannerUrlInput.trim()) {
                        handleApplyBanner(customBannerUrlInput.trim());
                        setCustomBannerUrlInput('');
                      }
                    }}
                    disabled={!customBannerUrlInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold transition shadow"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* 4. Preset Banner Choices */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  Cách 3: Chọn các mẫu ảnh nền Ban Tuyên giáo tuyển chọn có sẵn
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bannerPresets.map((preset) => {
                    const isSelected = customBanner === preset.value;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyBanner(preset.value)}
                        className={`text-left p-2.5 rounded-xl border-2 transition-all relative overflow-hidden group ${
                          isSelected
                            ? 'border-red-700 bg-red-50/50 shadow-md ring-2 ring-red-600/30'
                            : 'border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Mini Thumbnail */}
                          <div
                            style={{
                              backgroundImage: preset.preview.startsWith('linear-gradient') || preset.preview.startsWith('radial-gradient')
                                ? preset.preview
                                : `url(${preset.preview})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                            className="w-14 h-11 rounded-lg flex-shrink-0 border border-slate-300 shadow-xs relative"
                          >
                            {isSelected && (
                              <div className="absolute inset-0 bg-red-900/60 rounded-lg flex items-center justify-center">
                                <Check className="w-4 h-4 text-amber-300 font-bold" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-red-700 transition">
                              {preset.name}
                            </h5>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Overlay Darkness Slider */}
              {customBanner && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      Độ tối lớp phủ chống chói (Đảm bảo chữ và huy hiệu rõ nét):
                    </label>
                    <span className="text-xs font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                      {bannerOverlay}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={bannerOverlay}
                    onChange={(e) => handleOverlayChange(Number(e.target.value))}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-red-700"
                  />
                  <div className="flex justify-between text-[10px] text-amber-800/80">
                    <span>Sáng hơn (20%)</span>
                    <span>Chuẩn rõ nét (65%)</span>
                    <span>Tối hơn (90%)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetBanner}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-slate-200/70 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục nền gốc</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="px-5 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>Hoàn tất & Áp dụng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
