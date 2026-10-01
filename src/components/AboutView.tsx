import React from 'react';
import { Landmark, Compass, Award, Shield, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white p-8 shadow-xl overflow-hidden border border-amber-400/20">
        <div className="relative z-10 space-y-3">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Giới thiệu cơ quan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">
            BAN TUYÊN GIÁO TỈNH ỦY CÀ MAU
          </h2>
          <p className="text-sm text-slate-200 max-w-3xl leading-relaxed font-light">
            Cơ quan tham mưu, giúp việc của Tỉnh ủy Cà Mau về công tác xây dựng Đảng thuộc các lĩnh vực chính trị, tư tưởng, đạo đức, tuyên truyền, lý luận chính trị, thông tin đối ngoại, văn hóa, văn nghệ, khoa giáo và lịch sử Đảng bộ.
          </p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Chức năng & Nhiệm vụ</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chủ trì tham mưu Ban Thường vụ Tỉnh ủy, Thường trực Tỉnh ủy định hướng tư tưởng chính trị, chỉ đạo công tác thông tin, báo chí, xuất bản; tổ chức học tập, quán triệt các nghị quyết, chỉ thị của Đảng.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Sứ mệnh Chuyển đổi số</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tiên phong hiện đại hóa công tác tuyên giáo bằng hạ tầng dữ liệu số, kho lưu trữ điện tử, phòng họp không giấy và ứng dụng trí tuệ nhân tạo nhằm nâng cao hiệu quả tuyên truyền tại vùng Đất Mũi.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Bảo vệ Nền tảng tư tưởng</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chỉ đạo hoạt động Ban Chỉ đạo 35 các cấp; chủ động đấu tranh phản bác kịp thời các thông tin sai trái, xuyên tạc của các thế lực thù địch trên không gian mạng và giữ vững an ninh tư tưởng.
          </p>
        </div>
      </div>

      {/* Organizational structure */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-red-700" />
          Cơ cấu tổ chức bộ máy Ban Tuyên giáo Tỉnh ủy Cà Mau
        </h3>
        <p className="text-xs text-slate-600">
          Ban Tuyên giáo Tỉnh ủy Cà Mau gồm Thường trực Lãnh đạo Ban và các phòng chuyên môn nghiệp vụ:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            'Văn phòng Ban Tuyên giáo Tỉnh ủy',
            'Phòng Lý luận chính trị và Lịch sử Đảng',
            'Phòng Tuyên truyền - Báo chí - Xuất bản',
            'Phòng Khoa giáo và Văn hóa - Văn nghệ',
            'Phòng Dư luận xã hội và Thông tin đối ngoại',
            'Tổ Chuyên trách Ban Chỉ đạo 35 Tỉnh ủy',
          ].map((dept, i) => (
            <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{dept}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
