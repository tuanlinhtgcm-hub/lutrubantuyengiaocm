import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [unit, setUnit] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFullName('');
      setEmail('');
      setUnit('');
      setMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 text-white p-8 shadow-xl border border-red-500/20">
        <span className="text-xs uppercase tracking-widest text-amber-300 font-bold bg-white/10 px-3 py-1 rounded-full">
          Thông tin liên hệ
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide mt-2">
          LIÊN HỆ BAN TUYÊN GIÁO TỈNH ỦY CÀ MAU
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Tiếp nhận phản ánh, ý kiến đóng góp về công tác tuyên giáo và hỗ trợ kỹ thuật kho dữ liệu số
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
          <h3 className="font-bold text-slate-900 text-base">Thông tin trụ sở cơ quan</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Địa chỉ trụ sở:</p>
                <p className="text-slate-600 mt-0.5">
                  Số 05, Phan Ngọc Hiển, Phường Tân Thành, tỉnh Cà Mau
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Điện thoại liên hệ & Đường dây nóng:</p>
                <p className="text-slate-600 mt-0.5 font-mono font-semibold">
                  0913544770
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Thư điện tử công vụ:</p>
                <p className="text-slate-600 mt-0.5 font-mono">
                  btgdv.vp@camau.gov.vn
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Thời gian làm việc:</p>
                <p className="text-slate-600 mt-0.5">
                  Từ thứ Hai đến thứ Sáu (Sáng: 07h00 - 11h00; Chiều: 13h00 - 17h00)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-base">Gửi phản hồi / Góp ý kho số</h3>

          {feedbackSent ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold">Đã gửi thông tin phản hồi thành công!</p>
              <p className="text-[11px] text-emerald-700">
                Bộ phận Quản trị kho lưu trữ số Ban Tuyên giáo Tỉnh ủy Cà Mau sẽ tiếp nhận và xử lý.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên cán bộ / đảng viên:
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A..."
                  className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="canbo@camau.gov.vn"
                    className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cơ quan / Đơn vị:</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Cơ quan, đơn vị công tác..."
                    className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung phản hồi / yêu cầu tài liệu:</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập nội dung cần hỗ trợ hoặc tra cứu bổ sung..."
                  className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-4 h-4" />
                Gửi phản hồi
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
