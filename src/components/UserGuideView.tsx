import React from 'react';
import { HelpCircle, Search, Filter, QrCode, Download, Shield, Sparkles, BookOpen } from 'lucide-react';

export const UserGuideView: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Tra cứu & Tìm kiếm tài liệu',
      desc: 'Sử dụng thanh tìm kiếm trung tâm hoặc bộ lọc đa chiều (loại văn bản, 13 lĩnh vực, cơ quan ban hành, năm). Nhập số ký hiệu như "88-KH/BTGTU" để tìm đích danh.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Khai thác nội dung OCR & Xem trước',
      desc: 'Bấm vào tài liệu để mở cửa sổ chi tiết. Chuyển sang thẻ "Quét OCR" để xem toàn văn đã bóc tách tự động, hỗ trợ tìm kiếm câu chữ trong văn bản scan.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Tải văn bản & Quét mã QR',
      desc: 'Tải nhanh tệp gốc (PDF, Word, Excel, PPTX, Video). Sử dụng tính năng "Mã QR" để quét bằng điện thoại/Zalo chia sẻ nhanh tài liệu trong các cuộc họp.',
      icon: QrCode,
    },
    {
      step: '04',
      title: 'Bộ sưu tập cá nhân & Đánh dấu yêu thích',
      desc: 'Bấm biểu tượng Bookmark để lưu văn bản vào mục tài liệu cá nhân. Cán bộ có thể tự tạo các nhóm chuyên đề như "Học tập Bác Hồ" hay "Chuyển đổi số".',
      icon: BookOpen,
    },
    {
      step: '05',
      title: 'Quyền hạn bảo mật & Phê duyệt',
      desc: 'Tài liệu phân loại 4 mức: Công khai, Nội bộ, Hạn chế và Mật. Cán bộ biên tập & Quản trị viên có quyền tiếp nhận tài liệu mới, cảnh báo tệp trùng và duyệt xuất bản.',
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8 shadow-xl border border-blue-400/20">
        <span className="text-xs uppercase tracking-widest text-amber-300 font-bold bg-white/10 px-3 py-1 rounded-full">
          Cẩm nang nghiệp vụ
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide mt-2">
          HƯỚNG DẪN SỬ DỤNG KHO LƯU TRỮ SỐ
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Tài liệu hướng dẫn cán bộ, đảng viên khai thác hiệu quả hệ thống thông tin lưu trữ số hóa Ban Tuyên giáo Tỉnh ủy Cà Mau
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start gap-4 hover:border-amber-400 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-red-700 font-mono w-8">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
