import React, { useState } from 'react';
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  ArrowUp,
  Palette,
  Sparkles,
  RotateCcw,
  X,
  Check,
  Building2,
  FileText
} from 'lucide-react';
import { UserProfile } from '../types';
import { NavItemKey } from './Navbar';

interface FooterProps {
  currentUser: UserProfile;
  onSelectTab: (key: NavItemKey) => void;
}

interface FooterPreset {
  id: string;
  name: string;
  value: string;
  preview: string;
  description: string;
}

const FOOTER_BG_PRESETS: FooterPreset[] = [
  {
    id: 'slate-900',
    name: 'Xanh than bóng đêm (Mặc định)',
    value: '#0f172a',
    preview: '#0f172a',
    description: 'Trang nghiêm, sâu lắng, chuẩn nhận diện cơ quan điện tử'
  },
  {
    id: 'crimson-flag',
    name: 'Đỏ cờ Tổ quốc thẫm',
    value: '#450a0a',
    preview: '#450a0a',
    description: 'Sắc đỏ cờ Đảng và Quốc kỳ Việt Nam uy nghiêm, tôn kính'
  },
  {
    id: 'red-900',
    name: 'Đỏ cờ thắm cách mạng',
    value: '#7f1d1d',
    preview: '#7f1d1d',
    description: 'Sắc đỏ cờ tươi trang trọng của khối cơ quan Đảng'
  },
  {
    id: 'wine-900',
    name: 'Rượu vang quý phái Bordeaux',
    value: '#4c0519',
    preview: '#4c0519',
    description: 'Sâu lắng, ấm áp, vững chãi và quyền uy'
  },
  {
    id: 'navy-950',
    name: 'Xanh hải quân Đất Mũi',
    value: '#0c1a30',
    preview: '#0c1a30',
    description: 'Màu sóng nước, biển đảo cực Nam Tổ quốc'
  },
  {
    id: 'emerald-950',
    name: 'Xanh ngọc bích sẫm',
    value: '#062e24',
    preview: '#062e24',
    description: 'Sắc xanh rừng tràm U Minh và sinh thái Đất Mũi'
  },
  {
    id: 'stone-900',
    name: 'Nâu đá tư liệu lịch sử',
    value: '#1c1917',
    preview: '#1c1917',
    description: 'Cổ kính, chuẩn tư liệu lịch sử và lưu trữ tài liệu quý'
  },
  {
    id: 'pure-black',
    name: 'Đen tuyền tuyệt đối',
    value: '#000000',
    preview: '#000000',
    description: 'Độ tương phản cao, làm nổi bật thông tin và logo'
  },
  {
    id: 'grad-crimson-wine',
    name: 'Gradient Đỏ cờ – Rượu vang',
    value: 'linear-gradient(to right, #450a0a, #4c0519, #0f172a)',
    preview: 'linear-gradient(to right, #450a0a, #4c0519, #0f172a)',
    description: 'Phối màu chuyển sắc đỏ cờ sang xanh than'
  },
  {
    id: 'grad-dat-mui',
    name: 'Gradient Biển đảo Đất Mũi',
    value: 'linear-gradient(to right, #0c1a30, #0f172a, #172554)',
    preview: 'linear-gradient(to right, #0c1a30, #0f172a, #172554)',
    description: 'Chuyển sắc hải quân sâu thẳm non nước Cà Mau'
  },
  {
    id: 'grad-vietnam-flag',
    name: 'Gradient Cờ đỏ quang vinh',
    value: 'linear-gradient(to right, #7f1d1d, #991b1b, #450a0a)',
    preview: 'linear-gradient(to right, #7f1d1d, #991b1b, #450a0a)',
    description: 'Dải màu đỏ cờ thắm rực rỡ và trang trọng'
  }
];

const FOOTER_BORDER_PRESETS = [
  { name: 'Đỏ cờ thắm', value: '#b91c1c' },
  { name: 'Vàng ánh kim', value: '#f59e0b' },
  { name: 'Đỏ tươi', value: '#dc2626' },
  { name: 'Xanh dương', value: '#2563eb' },
  { name: 'Xanh ngọc', value: '#059669' },
  { name: 'Trắng bạc', value: '#94a3b8' },
  { name: 'Không viền', value: 'transparent' },
];

export const Footer: React.FC<FooterProps> = ({ currentUser, onSelectTab }) => {
  // Footer customizer state (Admin only, saved to localStorage)
  const [footerBg, setFooterBg] = useState<string>(() => {
    try {
      return localStorage.getItem('cm_footer_bg') || '#0f172a';
    } catch {
      return '#0f172a';
    }
  });

  const [footerBorderColor, setFooterBorderColor] = useState<string>(() => {
    try {
      return localStorage.getItem('cm_footer_border') || '#b91c1c';
    } catch {
      return '#b91c1c';
    }
  });

  const [showColorModal, setShowColorModal] = useState<boolean>(false);
  const [customHexInput, setCustomHexInput] = useState<string>('#0f172a');

  const handleApplyBg = (bgValue: string) => {
    setFooterBg(bgValue);
    try {
      localStorage.setItem('cm_footer_bg', bgValue);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyBorder = (borderValue: string) => {
    setFooterBorderColor(borderValue);
    try {
      localStorage.setItem('cm_footer_border', borderValue);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDefaults = () => {
    setFooterBg('#0f172a');
    setFooterBorderColor('#b91c1c');
    try {
      localStorage.removeItem('cm_footer_bg');
      localStorage.removeItem('cm_footer_border');
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer
        style={{
          background: footerBg,
          borderTopColor: footerBorderColor,
        }}
        className="text-slate-300 text-xs border-t-4 pt-10 pb-8 transition-colors duration-300 relative select-none"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cân đối 3 cột hài hòa, thanh lịch và cân xứng về mặt thị giác */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 pb-8 border-b border-white/10">
            {/* Cột 1: Cơ quan chủ quản & Định danh số */}
            <div className="space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src="/logo-tuyen-giao.jpg"
                    alt="Biểu trưng Ban Tuyên giáo"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://i.ibb.co/TDykz9R9/logo-tuyen-giao-bieu-trung.jpg';
                    }}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 bg-white p-0.5 shadow-md flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wide drop-shadow">
                      BAN TUYÊN GIÁO TỈNH ỦY CÀ MAU
                    </h4>
                    <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      Kho Lưu trữ số – Tài liệu Tuyên giáo
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed mt-3 text-justify">
                  Hệ thống số hóa, lưu trữ và bảo quản điện tử các văn kiện chỉ đạo, nghị quyết, đề án, lịch sử Đảng bộ và tài liệu tuyên giáo chính thức của Đảng bộ tỉnh Cà Mau.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Thời gian tiếp nhận & làm việc:</span>
                </div>
                <p className="text-[10.5px] text-slate-300 pl-5">
                  Thứ Hai – Thứ Sáu (Sáng 07h00 - 11h00 | Chiều 13h00 - 17h00)
                </p>
                <p className="text-[10px] text-slate-400 pl-5">
                  Tra cứu dữ liệu và khai thác kho tài liệu số trực tuyến 24/7
                </p>
              </div>
            </div>

            {/* Cột 2: Trụ sở & Thông tin liên hệ */}
            <div className="space-y-3.5">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-white/10">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Trụ sở & Thông tin liên hệ</span>
              </h5>

              <ul className="space-y-3 text-[11px] text-slate-300">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">Địa chỉ cơ quan:</span>
                    <span className="text-white font-medium">Số 05, đường Phan Ngọc Hiển, Phường Tân Thành, thành phố Cà Mau, tỉnh Cà Mau</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">Điện thoại liên hệ:</span>
                    <span className="text-white font-bold tracking-wide">0913544770</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">Thư điện tử công vụ:</span>
                    <span className="text-amber-200 font-medium">btgdv.vp@camau.gov.vn</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Cột 3: Chuyên mục trọng tâm & Tra cứu nhanh */}
            <div className="space-y-3.5">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-white/10">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Chuyên mục trọng tâm</span>
              </h5>

              <ul className="space-y-2 text-[11px]">
                <li>
                  <button
                    onClick={() => onSelectTab('advanced-search')}
                    className="hover:text-amber-300 font-semibold text-amber-300/95 transition flex items-center gap-2 text-left group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition"></span>
                    <span>Tra cứu nâng cao đa tiêu chí & Quét OCR</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectTab('political-theory')}
                    className="hover:text-amber-300 text-slate-300 transition flex items-center gap-2 text-left group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-amber-400 transition"></span>
                    <span>Tài liệu Lý luận chính trị & Tư tưởng Bác Hồ</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectTab('party-history')}
                    className="hover:text-amber-300 text-slate-300 transition flex items-center gap-2 text-left group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-amber-400 transition"></span>
                    <span>Lịch sử Đảng bộ tỉnh Cà Mau qua các thời kỳ</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectTab('science-education')}
                    className="hover:text-amber-300 text-slate-300 transition flex items-center gap-2 text-left group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-amber-400 transition"></span>
                    <span>Công tác Khoa giáo & Văn hóa - Văn nghệ</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectTab('directives')}
                    className="hover:text-amber-300 text-slate-300 transition flex items-center gap-2 text-left group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-amber-400 transition"></span>
                    <span>Văn bản chỉ đạo & Đề án Chuyển đổi số</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectTab('guide')}
                    className="hover:text-amber-300 text-slate-300 transition flex items-center gap-2 text-left group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-amber-400 transition"></span>
                    <span>Hướng dẫn tra cứu & quét OCR văn bản</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Dòng bản quyền và thanh công cụ quản trị chân trang */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
            <p>© 2026 Ban Tuyên giáo Tỉnh ủy Cà Mau.</p>

            <div className="flex items-center gap-2.5">
              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setShowColorModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 hover:text-amber-200 border border-amber-400/50 text-xs font-bold transition shadow-xs group"
                  title="Quản trị viên: Tùy chỉnh màu nền và đường viền chân trang"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition" />
                  <span>Đổi màu nền chân trang</span>
                </button>
              )}

              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition"
                title="Cuộn lên đầu trang"
              >
                <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
                <span>Lên đầu trang</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Tùy chỉnh màu sắc chân trang (Dành cho Quản trị viên) */}
      {showColorModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in duration-200">
            {/* Header modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 text-red-700">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Tùy chỉnh màu nền chân trang
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chức năng quản trị: Thiết lập gam màu trang trọng cho khu vực Footer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowColorModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview Khung chân trang */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Xem trước chân trang thực tế:
              </label>
              <div
                style={{
                  background: footerBg,
                  borderTopColor: footerBorderColor,
                }}
                className="rounded-xl p-4 text-white shadow-inner border-t-4 transition-colors duration-200 space-y-2 border border-slate-300/40"
              >
                <div className="flex items-center gap-2">
                  <img
                    src="/logo-tuyen-giao.jpg"
                    alt="Logo"
                    className="w-6 h-6 rounded-full border border-amber-300 bg-white"
                  />
                  <span className="font-bold text-xs uppercase tracking-wide">
                    BAN TUYÊN GIÁO TỈNH ỦY CÀ MAU
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Hệ thống số hóa, lưu trữ và bảo quản điện tử tài liệu Tuyên giáo
                </p>
                <div className="pt-2 border-t border-white/10 flex justify-between text-[9px] text-slate-400">
                  <span>© 2026 Ban Tuyên giáo Tỉnh ủy Cà Mau.</span>
                  <span className="text-amber-300 font-medium">Bản xem trước</span>
                </div>
              </div>
            </div>

            {/* Danh sách các mẫu màu nền có sẵn */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                1. Chọn các mẫu màu trang trọng chuẩn nhận diện:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FOOTER_BG_PRESETS.map((preset) => {
                  const isSelected = footerBg === preset.value;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyBg(preset.value)}
                      className={`text-left p-2.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-red-600 bg-red-50/60 shadow-sm ring-1 ring-red-500'
                          : 'border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        style={{ background: preset.preview }}
                        className="w-10 h-10 rounded-lg border border-slate-300 shadow-xs flex-shrink-0 flex items-center justify-center text-white"
                      >
                        {isSelected && <Check className="w-4 h-4 text-amber-300 font-bold" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {preset.name}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {preset.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tùy chỉnh màu viền trên (Border Top) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                2. Chọn màu đường viền trên chân trang:
              </label>
              <div className="flex flex-wrap gap-2">
                {FOOTER_BORDER_PRESETS.map((b) => {
                  const isSelected = footerBorderColor === b.value;
                  return (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => handleApplyBorder(b.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-900 shadow-xs font-bold ring-1 ring-red-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        style={{ background: b.value }}
                        className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      />
                      <span>{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tự nhập mã màu tùy ý */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Hoặc chọn mã màu tùy ý:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={footerBg.startsWith('#') ? footerBg : '#0f172a'}
                  onChange={(e) => handleApplyBg(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                  title="Chọn màu bất kỳ"
                />
                <input
                  type="text"
                  placeholder="#0f172a hoặc mã CSS gradient"
                  value={customHexInput}
                  onChange={(e) => setCustomHexInput(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customHexInput.trim()) {
                      handleApplyBg(customHexInput.trim());
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Footer modal buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại mặc định</span>
              </button>
              <button
                type="button"
                onClick={() => setShowColorModal(false)}
                className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition shadow"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
