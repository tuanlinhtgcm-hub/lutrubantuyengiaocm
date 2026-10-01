import React, { useState } from 'react';
import {
  Shield,
  X,
  Database,
  Users,
  Activity,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Building,
  RefreshCw,
  Search,
  HardDrive,
  Edit,
  UserCheck,
  UserCog,
  UserPlus,
  Plus,
  Trash2,
  Save,
  Check,
  Mail,
  Phone,
  RotateCcw
} from 'lucide-react';
import { DocumentItem, UserProfile, AuditLog, UserRole } from '../types';
import { CATEGORIES, ISSUING_AUTHORITIES } from '../data/initialDocuments';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: string;
  lastActive: string;
  phone?: string;
  notes?: string;
}

interface AdminManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  documents: DocumentItem[];
  auditLogs: AuditLog[];
  onOpenUploadModal: () => void;
  onOpenAuditLogs: () => void;
  onUpdateRole: (role: UserRole) => void;
  onUpdateCurrentUser?: (user: Partial<UserProfile>) => void;
}

export const AdminManagementModal: React.FC<AdminManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  documents,
  auditLogs,
  onOpenUploadModal,
  onOpenAuditLogs,
  onUpdateRole,
  onUpdateCurrentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'security' | 'users'>('overview');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // System stats calculation
  const totalDocs = documents.length;
  const publicDocs = documents.filter((d) => d.accessLevel === 'public').length;
  const internalDocs = documents.filter((d) => d.accessLevel === 'internal').length;
  const confidentialDocs = documents.filter((d) => d.accessLevel === 'confidential' || d.accessLevel === 'restricted').length;
  const totalDownloads = documents.reduce((acc, d) => acc + (d.downloadCount || 0), 0);
  const totalViews = documents.reduce((acc, d) => acc + (d.viewCount || 0), 0);

  // Initial staff list for administration
  const initialStaffList: StaffMember[] = [
    {
      id: 'user-01',
      name: currentUser.name || 'Trương Tuấn Linh',
      email: currentUser.email || 'tuanlinhtgcm@gmail.com',
      role: currentUser.role || 'admin',
      department: currentUser.department || 'Lãnh đạo Ban Tuyên giáo Tỉnh ủy',
      status: 'Đang hoạt động',
      lastActive: 'Vừa xong',
      phone: '0912.345.678',
      notes: 'Quản trị viên trưởng hệ thống lưu trữ số'
    },
    {
      id: 'user-02',
      name: 'Lê Văn An',
      email: 'vanan.btg@camau.gov.vn',
      role: 'editor',
      department: 'Phòng Tuyên truyền - Báo chí - Xuất bản',
      status: 'Đang hoạt động',
      lastActive: '15 phút trước',
      phone: '0913.567.890',
      notes: 'Phụ trách biên tập và số hóa OCR tài liệu'
    },
    {
      id: 'user-03',
      name: 'Nguyễn Thị Mai',
      email: 'thimai.btg@camau.gov.vn',
      role: 'staff',
      department: 'Phòng Lý luận chính trị và Lịch sử Đảng',
      status: 'Đang hoạt động',
      lastActive: '2 giờ trước',
      phone: '0918.789.012',
      notes: 'Cán bộ nghiên cứu lý luận chính trị'
    },
    {
      id: 'user-04',
      name: 'Trần Hoàng Nam',
      email: 'hoangnam.btg@camau.gov.vn',
      role: 'staff',
      department: 'Văn phòng Ban Tuyên giáo',
      status: 'Đang hoạt động',
      lastActive: 'Hôm qua',
      phone: '0914.890.123',
      notes: 'Văn thư lưu trữ cơ quan'
    },
    {
      id: 'user-05',
      name: 'Cán bộ tra cứu ngoài',
      email: 'canbo.tracuu@camau.dcs.vn',
      role: 'guest',
      department: 'Khách tra cứu tài liệu công khai',
      status: 'Tạm khóa quyền sửa',
      lastActive: '3 ngày trước',
      phone: '0909.112.233',
      notes: 'Tài khoản cấp phép nghiên cứu tài liệu mở'
    }
  ];

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('cm_staff_members_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialStaffList;
  });

  const handleSaveMember = (memberData: StaffMember) => {
    const exists = staffMembers.some((m) => m.id === memberData.id);
    let updated: StaffMember[];
    if (exists) {
      updated = staffMembers.map((m) => (m.id === memberData.id ? memberData : m));
    } else {
      updated = [memberData, ...staffMembers];
    }
    setStaffMembers(updated);
    try {
      localStorage.setItem('cm_staff_members_list', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Synchronize with currentUser if the edited member is the logged-in user
    if (currentUser.id === memberData.id || currentUser.email === memberData.email) {
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser({
          name: memberData.name,
          email: memberData.email,
          role: memberData.role,
          department: memberData.department,
        });
      }
      if (currentUser.role !== memberData.role) {
        onUpdateRole(memberData.role);
      }
    }

    setEditingMember(null);
    setFeedbackToast(`Đã lưu cập nhật thông tin cán bộ "${memberData.name}" thành công!`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleDeleteMember = (member: StaffMember) => {
    if (member.id === 'user-01' || member.role === 'admin') {
      alert('Không thể xóa tài khoản Quản trị hệ thống nòng cốt!');
      return;
    }
    if (window.confirm(`Đồng chí có chắc chắn muốn xóa tài khoản của cán bộ "${member.name}" khỏi danh sách?`)) {
      const updated = staffMembers.filter((m) => m.id !== member.id);
      setStaffMembers(updated);
      try {
        localStorage.setItem('cm_staff_members_list', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      setFeedbackToast(`Đã xóa cán bộ "${member.name}" khỏi danh sách.`);
      setTimeout(() => setFeedbackToast(null), 3000);
    }
  };

  const handleResetDefaultMembers = () => {
    if (window.confirm('Khôi phục lại danh sách cán bộ mặc định ban đầu?')) {
      setStaffMembers(initialStaffList);
      try {
        localStorage.removeItem('cm_staff_members_list');
      } catch (e) {
        console.error(e);
      }
      setFeedbackToast('Đã khôi phục danh sách cán bộ mặc định.');
      setTimeout(() => setFeedbackToast(null), 3000);
    }
  };

  const handleBackupData = () => {
    const backupData = {
      agency: 'Ban Tuyên giáo Tỉnh ủy Cà Mau',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.name,
      totalDocuments: documents.length,
      documents: documents,
      auditLogs: auditLogs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sao_luu_kho_so_tuyen_giao_camau_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border-2 border-amber-500/40 my-6 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header of Admin Modal */}
        <div className="bg-gradient-to-r from-red-900 via-[#831843] to-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide uppercase">
                  TRUNG TÂM QUẢN TRỊ HỆ THỐNG
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase shadow">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium">
                Ban Tuyên giáo Tỉnh ủy Cà Mau • Kho lưu trữ số & Bảo mật thông tin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackupData}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-amber-200 border border-white/20 transition"
              title="Xuất file sao lưu toàn bộ dữ liệu"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sao lưu dữ liệu</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-red-600 text-white transition focus:outline-none"
              title="Đóng giao diện quản trị"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar for Admin Tabs */}
        <div className="bg-slate-100 px-5 pt-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'overview'
                ? 'bg-white text-red-800 border-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Database className="w-4 h-4 text-red-700" />
            <span>Tổng quan hệ thống</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'documents'
                ? 'bg-white text-red-800 border-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-700" />
            <span>Kiểm soát tài liệu & Danh mục</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'users'
                ? 'bg-white text-red-800 border-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>Người dùng & Phân quyền</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'security'
                ? 'bg-white text-red-800 border-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Nhật ký & Giám sát ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Tổng số văn bản</span>
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{totalDocs}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Đã được số hóa 100%</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Văn bản công khai</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-emerald-700 mt-2">{publicDocs}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Truy cập rộng rãi cán bộ, đảng viên</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Văn bản Nội bộ & Mật</span>
                    <Lock className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-2xl font-black text-red-700 mt-2">{internalDocs + confidentialDocs}</p>
                  <p className="text-[11px] text-red-600/80 font-medium mt-1">Kiểm soát truy cập nghiêm ngặt</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Lượt xem & Tải về</span>
                    <HardDrive className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-black text-amber-600 mt-2">{totalViews + totalDownloads}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{totalDownloads} lượt tải tài liệu</p>
                </div>
              </div>

              {/* Status and Action banner */}
              <div className="bg-gradient-to-r from-red-800 to-amber-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-bold text-sm text-amber-200 flex items-center justify-center md:justify-start gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    Trạng thái hệ thống: Sẵn sàng bảo mật cao
                  </h4>
                  <p className="text-xs text-white/90">
                    Máy chủ vận hành trên hạ tầng đám mây Google AI Studio • Tích hợp phân quyền RBAC đa cấp độ
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUploadModal();
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Tải lên văn bản mới</span>
                  </button>
                  <button
                    onClick={handleBackupData}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất file JSON sao lưu</span>
                  </button>
                </div>
              </div>

              {/* System configuration summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Building className="w-4 h-4 text-red-700" />
                    Thông tin cơ quan quản lý
                  </h5>
                  <div className="text-xs space-y-2 text-slate-600">
                    <p><strong className="text-slate-800">Cơ quan:</strong> Ban Tuyên giáo Tỉnh ủy Cà Mau</p>
                    <p><strong className="text-slate-800">Địa chỉ:</strong> Số 05, Phan Ngọc Hiển, Phường Tân Thành, tỉnh Cà Mau</p>
                    <p><strong className="text-slate-800">Điện thoại liên hệ:</strong> 0913544770</p>
                    <p><strong className="text-slate-800">Hòm thư công vụ:</strong> btgdv.vp@camau.gov.vn</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    Danh mục dữ liệu đã cấu hình
                  </h5>
                  <div className="text-xs space-y-2 text-slate-600">
                    <p><strong className="text-slate-800">Cơ quan ban hành ({ISSUING_AUTHORITIES.length}):</strong> {ISSUING_AUTHORITIES.join(', ')}</p>
                    <p><strong className="text-slate-800">Lĩnh vực ({CATEGORIES.length}):</strong> Bao gồm "Danh mục khác", Lý luận chính trị, Lịch sử Đảng, Chuyển đổi số, Tuyên truyền biển đảo...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS CONTROL */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Danh mục tài liệu trong cơ sở dữ liệu</h4>
                  <p className="text-xs text-slate-500">Xem nhanh tình trạng phê duyệt và mức độ bảo mật</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUploadModal();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Tiếp nhận tài liệu</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Số / Ký hiệu</th>
                        <th className="p-3">Trích yếu văn bản</th>
                        <th className="p-3">Cơ quan ban hành</th>
                        <th className="p-3">Lĩnh vực</th>
                        <th className="p-3 text-center">Bảo mật</th>
                        <th className="p-3 text-center">Định dạng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono font-bold text-red-700 whitespace-nowrap">
                            {doc.codeNumber}
                          </td>
                          <td className="p-3 font-medium text-slate-800 max-w-xs truncate" title={doc.title}>
                            {doc.title}
                          </td>
                          <td className="p-3 text-slate-600 whitespace-nowrap">
                            {doc.issuingAuthority}
                          </td>
                          <td className="p-3 text-slate-600 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {doc.category}
                            </span>
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                doc.accessLevel === 'public'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.accessLevel === 'internal'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {doc.accessLevel.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500 whitespace-nowrap">
                            {doc.fileFormat}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USERS & ROLES */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Feedback toast */}
              {feedbackToast && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feedbackToast}</span>
                  </div>
                  <button
                    onClick={() => setFeedbackToast(null)}
                    className="text-emerald-700 hover:text-emerald-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Danh sách tài khoản & Phân quyền vai trò</h4>
                  <p className="text-xs text-slate-500">
                    Admin có toàn quyền thêm mới, điều chỉnh thông tin cán bộ, phòng ban và cấp phát thẩm quyền
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMember({
                        id: `user-${Date.now()}`,
                        name: '',
                        email: '',
                        role: 'staff',
                        department: 'Ban Tuyên giáo Tỉnh ủy Cà Mau',
                        status: 'Đang hoạt động',
                        lastActive: 'Vừa tạo mới',
                        phone: '',
                        notes: ''
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                    title="Thêm tài khoản thành viên mới vào hệ thống"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                    <span>Thêm tài khoản</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaultMembers}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition flex items-center gap-1"
                    title="Khôi phục danh sách thành viên chuẩn ban đầu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Khôi phục</span>
                  </button>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm cán bộ..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-red-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {staffMembers
                  .filter((m) =>
                    userSearchTerm
                      ? m.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        m.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        m.department.toLowerCase().includes(userSearchTerm.toLowerCase())
                      : true
                  )
                  .map((member) => (
                    <div
                      key={member.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">{member.name}</p>
                            {member.id === 'user-01' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-extrabold uppercase">
                                Trưởng Ban
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                              member.role === 'admin'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : member.role === 'editor'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : member.role === 'staff'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {member.role === 'admin'
                              ? 'QUẢN TRỊ VIÊN'
                              : member.role === 'editor'
                              ? 'BIÊN TẬP VIÊN'
                              : member.role === 'staff'
                              ? 'CÁN BỘ CƠ QUAN'
                              : 'KHÁCH TRA CỨU'}
                          </span>
                        </div>

                        <div className="space-y-0.5 text-[11px] text-slate-600">
                          <p className="font-mono text-slate-500 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{member.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{member.department}</span>
                          </p>
                          {member.phone && (
                            <p className="flex items-center gap-1.5 text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{member.phone}</span>
                            </p>
                          )}
                          {member.notes && (
                            <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded mt-1 border border-slate-100">
                              {member.notes}
                            </p>
                          )}
                        </div>

                        <div className="pt-1 flex items-center gap-2 text-[10px]">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            member.status === 'Đang hoạt động' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                          <span className="text-emerald-700 font-medium">{member.status}</span>
                          <span className="text-slate-400">• {member.lastActive}</span>
                        </div>
                      </div>

                      {/* Action buttons on each member card */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Nút Điều chỉnh thông tin */}
                        <button
                          type="button"
                          onClick={() => setEditingMember(member)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition flex items-center gap-1 shadow-xs"
                          title="Admin bấm để điều chỉnh thông tin cán bộ (Họ tên, email, vai trò, đơn vị, trạng thái...)"
                        >
                          <Edit className="w-3 h-3 text-blue-600" />
                          <span>Điều chỉnh thông tin</span>
                        </button>

                        {/* Nút Thử nghiệm vai trò */}
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateRole(member.role);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition ${
                            currentUser.role === member.role
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                          title="Chuyển vai trò thử nghiệm"
                        >
                          {currentUser.role === member.role ? 'Đang kích hoạt' : 'Dùng vai trò'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Nhật ký kiểm toán an toàn thông tin</h4>
                  <p className="text-xs text-slate-500">Ghi lại toàn bộ hành động thêm, sửa, xóa, tải về văn bản</p>
                </div>
                <button
                  onClick={onOpenAuditLogs}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4" />
                  <span>Xem cửa sổ nhật ký mở rộng</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Thời gian</th>
                        <th className="p-3">Hành động</th>
                        <th className="p-3">Cán bộ thực hiện</th>
                        <th className="p-3">Tài liệu liên quan</th>
                        <th className="p-3">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.slice(0, 15).map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap font-medium text-slate-800">
                            {log.userName}
                          </td>
                          <td className="p-3 max-w-xs truncate text-slate-600" title={log.documentTitle}>
                            {log.documentTitle || '—'}
                          </td>
                          <td className="p-3 text-slate-500 max-w-xs truncate" title={log.details}>
                            {log.details || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer of Admin Modal */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hệ thống hoạt động bình thường • Ban Tuyên giáo Tỉnh ủy Cà Mau</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition"
          >
            Đóng
          </button>
        </div>

      </div>

      {/* Edit / Add Member Modal Dialog */}
      {editingMember && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-amber-500/40 my-6 overflow-hidden flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-900 via-[#831843] to-slate-900 text-white p-4 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide uppercase">
                    {staffMembers.some((m) => m.id === editingMember.id)
                      ? 'ĐIỀU CHỈNH THÔNG TIN THÀNH VIÊN'
                      : 'THÊM MỚI TÀI KHOẢN CÁN BỘ'}
                  </h3>
                  <p className="text-[11px] text-amber-200 font-light">
                    Ban Tuyên giáo Tỉnh ủy Cà Mau – Quản trị người dùng & Thẩm quyền
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingMember.name.trim()) {
                  alert('Vui lòng nhập họ và tên cán bộ');
                  return;
                }
                if (!editingMember.email.trim()) {
                  alert('Vui lòng nhập email công vụ');
                  return;
                }
                handleSaveMember(editingMember);
              }}
              className="p-5 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto text-xs"
            >
              {/* Họ tên */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên cán bộ <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  placeholder="Ví dụ: Trương Tuấn Linh"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 font-semibold"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email công vụ / Đăng nhập <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    placeholder="tuanlinhtgcm@gmail.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    placeholder="0912.xxx.xxx"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Phân quyền vai trò */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phân quyền vai trò hệ thống <span className="text-red-600">*</span>
                </label>
                <select
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as UserRole })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 font-bold bg-white text-slate-900"
                >
                  <option value="admin">Quản trị hệ thống (Admin) – Toàn quyền quản trị & phân quyền</option>
                  <option value="editor">Cán bộ biên tập (Editor) – Tải lên, biên tập, OCR và gắn nhãn</option>
                  <option value="staff">Cán bộ cơ quan (Staff) – Tra cứu tài liệu nội bộ và tải tệp</option>
                  <option value="guest">Khách tra cứu (Guest) – Chỉ xem tài liệu công khai</option>
                </select>
                <div className="mt-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950">
                  <span className="font-bold">Thẩm quyền áp dụng: </span>
                  {editingMember.role === 'admin' && 'Toàn quyền cấu hình hệ thống, sao lưu cơ sở dữ liệu, quản lý thành viên và xem tài liệu tuyệt mật.'}
                  {editingMember.role === 'editor' && 'Được thêm mới, cập nhật thông tin văn bản, trích xuất OCR toàn văn và duyệt xuất bản.'}
                  {editingMember.role === 'staff' && 'Được tra cứu tài liệu nội bộ, lưu bộ sưu tập yêu thích và tải bản gốc văn bản.'}
                  {editingMember.role === 'guest' && 'Chỉ được đọc tài liệu công khai, không có quyền sửa đổi hay xem tài liệu nội bộ.'}
                </div>
              </div>

              {/* Đơn vị / Phòng ban */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đơn vị / Phòng ban công tác <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.department}
                  onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                  placeholder="Ví dụ: Lãnh đạo Ban Tuyên giáo Tỉnh ủy Cà Mau"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <div className="flex gap-1 flex-wrap mt-1.5 text-[10px]">
                  <span className="text-slate-400 font-medium mr-0.5">Chọn nhanh:</span>
                  {[
                    'Lãnh đạo Ban Tuyên giáo Tỉnh ủy',
                    'Phòng Tuyên truyền - Báo chí - Xuất bản',
                    'Phòng Lý luận chính trị và Lịch sử Đảng',
                    'Văn phòng Ban Tuyên giáo',
                    'Phòng Thông tin - Tổng hợp',
                    'Cán bộ tra cứu ngoài',
                  ].map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setEditingMember({ ...editingMember, department: dept })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trạng thái tài khoản */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Trạng thái tài khoản
                </label>
                <select
                  value={editingMember.status}
                  onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                >
                  <option value="Đang hoạt động">Đang hoạt động (Bình thường)</option>
                  <option value="Tạm khóa quyền sửa">Tạm khóa quyền sửa (Chỉ đọc)</option>
                  <option value="Tạm dừng hoạt động">Tạm dừng hoạt động</option>
                  <option value="Chờ xác thực">Chờ xác thực danh tính</option>
                </select>
              </div>

              {/* Ghi chú chuyên môn */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú chuyên môn / Trách nhiệm phụ trách
                </label>
                <textarea
                  rows={2}
                  value={editingMember.notes || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                  placeholder="Ví dụ: Phụ trách quản lý số hóa tài liệu lịch sử Đảng bộ tỉnh..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                {editingMember.id !== 'user-01' && staffMembers.some((m) => m.id === editingMember.id) ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteMember(editingMember);
                      setEditingMember(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 font-semibold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa cán bộ</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold transition shadow flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>Lưu thông tin</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
