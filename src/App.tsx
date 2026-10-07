import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar, NavItemKey } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { DocumentArchive } from './components/DocumentArchive';
import { AdvancedSearchView } from './components/AdvancedSearchView';
import { AboutView } from './components/AboutView';
import { UserGuideView } from './components/UserGuideView';
import { ContactView } from './components/ContactView';
import { Footer } from './components/Footer';
import { UploadModal } from './components/UploadModal';
import { EditDocumentModal } from './components/EditDocumentModal';
import { UserCollectionsModal } from './components/UserCollectionsModal';
import { AuditLogModal } from './components/AuditLogModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AdminManagementModal } from './components/AdminManagementModal';
import { DocumentItem, FilterCriteria, UserProfile, UserRole, NotificationItem, AuditLog } from './types';
import { ArchiveService } from './services/archiveService';
import { formatDate } from './utils/dateUtils';
import { auth, testFirestoreConnection } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Test Firestore connection on mount per skill requirement
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'user-01',
    name: 'Trương Tuấn Linh',
    email: 'tuanlinhtgcm@gmail.com',
    role: 'admin',
    department: 'Ban Tuyên giáo Tỉnh ủy Cà Mau',
  });

  // Main navigation tab
  const [activeTab, setActiveTab] = useState<NavItemKey>('home');

  // Core Data States
  const [documents, setDocuments] = useState<DocumentItem[]>(() => ArchiveService.getDocuments());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    ArchiveService.getNotifications()
  );
  const [bookmarks, setBookmarks] = useState<string[]>(() => ArchiveService.getBookmarks());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => ArchiveService.getAuditLogs());

  // Filter criteria state
  const defaultFilters: FilterCriteria = {
    keyword: '',
    documentType: '',
    category: '',
    issuingAuthority: '',
    year: '',
    accessLevel: '',
    fileFormat: '',
    dateFrom: '',
    dateTo: '',
  };
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(defaultFilters);

  // Selected document for Zone C detail view
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Push Notification / In-App Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  const showToast = (title: string, message: string) => {
    setToastMessage({ title, message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Firebase auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser((prev) => ({
          ...prev,
          id: user.uid,
          name:
            user.displayName ||
            (user.email === 'tuanlinhtgcm@gmail.com' ? 'Trương Tuấn Linh' : user.email?.split('@')[0]) ||
            'Trương Tuấn Linh',
          email: user.email || 'tuanlinhtgcm@gmail.com',
          role: 'admin', // default logged-in user with admin capabilities for evaluation
        }));
        showToast('Đăng nhập thành công', `Chào mừng ${user.displayName || 'Trương Tuấn Linh'} vào Kho lưu trữ số`);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle Tab Navigation with Smart Preset Filters
  const handleSelectTab = (key: NavItemKey) => {
    setActiveTab(key);
    setSelectedDocument(null);

    // Apply relevant preset filters when navigating directly from top navbar
    if (key === 'directives') {
      setFilterCriteria({
        ...defaultFilters,
        documentType: 'Kế hoạch',
      });
    } else if (key === 'political-theory') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Lý luận chính trị',
      });
    } else if (key === 'ho-chi-minh-thought') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Thực thành tư tưởng Hồ Chí Minh',
      });
    } else if (key === 'party-history') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Lịch sử Đảng',
      });
    } else if (key === 'rapporteur') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Báo cáo viên, tuyên truyền viên',
      });
    } else if (key === 'social-opinion') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Dư luận xã hội',
      });
    } else if (key === 'digital-transformation') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Chuyển đổi số',
      });
    } else if (key === 'propaganda') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Tuyên truyền - báo chí - xuất bản',
      });
    } else if (key === 'science-education') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Khoa giáo',
      });
    } else if (key === 'science-technology') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Khoa học và Công nghệ',
      });
    } else if (key === 'foreign-information') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Thông tin đối ngoại',
      });
    } else if (key === 'islands-seas') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Tuyên truyền biển đảo',
      });
    } else if (key === 'coordination-work') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Công tác phối hợp',
      });
    } else if (key === 'other-categories') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Danh mục khác',
      });
    } else if (key === 'culture-arts') {
      setFilterCriteria({
        ...defaultFilters,
        category: 'Văn hóa - văn nghệ',
      });
    } else if (key === 'multimedia') {
      setFilterCriteria({
        ...defaultFilters,
        fileFormat: 'JPG',
      });
    } else if (key === 'reports-forms') {
      setFilterCriteria({
        ...defaultFilters,
        documentType: 'Báo cáo',
      });
    }
  };

  // Quick Filter Handler from Dashboard
  const handleQuickFilter = (type: 'recent' | 'category' | 'archive' | 'authority' | 'digitized') => {
    setActiveTab('archive');
    if (type === 'recent') {
      setFilterCriteria({ ...defaultFilters, year: '2026' });
    } else if (type === 'category') {
      setFilterCriteria({ ...defaultFilters, category: 'Lý luận chính trị' });
    } else if (type === 'archive') {
      setFilterCriteria({ ...defaultFilters, documentType: 'Đề án' });
    } else if (type === 'authority') {
      setFilterCriteria({ ...defaultFilters, issuingAuthority: 'Tỉnh ủy Cà Mau' });
    } else if (type === 'digitized') {
      setFilterCriteria({ ...defaultFilters, keyword: 'OCR' });
    }
  };

  // Handle Search Submission from Hero
  const handleSearchSubmit = (keyword: string) => {
    setFilterCriteria({ ...defaultFilters, keyword });
    setActiveTab('archive');
  };

  // Document Operations
  const handleSaveDocument = (doc: DocumentItem) => {
    const saved = ArchiveService.saveDocument(doc, currentUser);
    setDocuments(ArchiveService.getDocuments());
    setAuditLogs(ArchiveService.getAuditLogs());
    showToast('Lưu trữ thành công', `Tài liệu "${saved.codeNumber} - ${saved.title}" đã được lưu vào kho số.`);

    // Also push a system notification
    ArchiveService.addNotification({
      title: `Văn bản mới: ${saved.codeNumber}`,
      content: saved.title,
      date: new Date().toISOString().split('T')[0],
      type: 'document',
      documentId: saved.id,
    });
    setNotifications(ArchiveService.getNotifications());
  };

  const handleDeleteDocument = (docId: string, reason: string) => {
    const success = ArchiveService.deleteDocument(docId, reason, currentUser);
    if (success) {
      setDocuments(ArchiveService.getDocuments());
      setAuditLogs(ArchiveService.getAuditLogs());
      if (selectedDocument?.id === docId) {
        setSelectedDocument(null);
      }
      showToast('Đã xóa tài liệu', 'Hồ sơ đã được loại bỏ và ghi vết vào nhật ký.');
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    ArchiveService.incrementDownload(doc.id, currentUser);
    setDocuments(ArchiveService.getDocuments());
    setAuditLogs(ArchiveService.getAuditLogs());

    // Simulated file download
    const element = document.createElement('a');
    const file = new Blob([
      `KHO LƯU TRỮ SỐ - BAN TUYÊN GIÁO TỈNH ỦY CÀ MAU\n` +
      `Số ký hiệu: ${doc.codeNumber}\n` +
      `Tiêu đề: ${doc.title}\n` +
      `Cơ quan ban hành: ${doc.issuingAuthority}\n` +
      `Ngày ban hành: ${formatDate(doc.issueDate)}\n` +
      `Mức độ bảo mật: ${doc.accessLevel}\n` +
      `Người ký: ${doc.signatory || 'Lãnh đạo Ban'}\n\n` +
      `NỘI DUNG TÓM TẮT:\n${doc.summary}\n\n` +
      `NỘI DUNG VĂN BẢN (QUÉT OCR TOÀN PHẦN):\n${doc.ocrContent || doc.summary}\n`
    ], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.codeNumber.replace(/[/]/g, '_')}_${doc.title.substring(0, 30)}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();

    showToast('Tải về hoàn tất', `Đã tải văn bản số: ${doc.codeNumber}`);
  };

  const handleToggleBookmark = (docId: string) => {
    const isNowBookmarked = ArchiveService.toggleBookmark(docId);
    setBookmarks(ArchiveService.getBookmarks());
    showToast(
      isNowBookmarked ? 'Đã lưu yêu thích' : 'Đã bỏ yêu thích',
      isNowBookmarked
        ? 'Tài liệu đã được thêm vào Bộ sưu tập cá nhân của đồng chí'
        : 'Đã xóa tài liệu khỏi danh mục yêu thích'
    );
  };

  const handleSelectDocument = (doc: DocumentItem) => {
    // Check access permission
    if (!ArchiveService.canAccessDocument(doc, currentUser.role)) {
      alert(
        `CẢNH BÁO BẢO MẬT:\nTài liệu số [${doc.codeNumber}] thuộc mức độ "${doc.accessLevel.toUpperCase()}".\nChỉ cán bộ cơ quan có thẩm quyền hoặc Quản trị hệ thống mới được phép xem nội dung này.`
      );
      return;
    }

    ArchiveService.incrementView(doc.id, currentUser);
    setDocuments(ArchiveService.getDocuments());
    setSelectedDocument(doc);
  };

  const handleUpdateRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
      name:
        role === 'admin'
          ? 'Trương Tuấn Linh (Lãnh đạo Ban)'
          : role === 'editor'
          ? 'Lê Văn An (Cán bộ Biên tập)'
          : role === 'staff'
          ? 'Nguyễn Thị Mai (Cán bộ Cơ quan)'
          : 'Đồng chí Đảng viên (Khách tra cứu)',
    }));
    showToast('Chuyển vai trò', `Đã chuyển sang vai trò: ${role.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Be_Vietnam_Pro',sans-serif] text-slate-800">
      {/* 1. Header with Agency Identification, Party emblem, User profile, Role Switcher */}
      <Header
        currentUser={currentUser}
        onUpdateRole={handleUpdateRole}
        notifications={notifications}
        onMarkNotificationRead={(id) => {
          ArchiveService.markNotificationAsRead(id);
          setNotifications(ArchiveService.getNotifications());
        }}
        onMarkAllNotificationsRead={() => {
          ArchiveService.markAllNotificationsRead();
          setNotifications(ArchiveService.getNotifications());
        }}
        onOpenCollections={() => setIsCollectionsOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onSelectDocumentById={(docId) => {
          const doc = documents.find((d) => d.id === docId);
          if (doc) {
            setActiveTab('archive');
            handleSelectDocument(doc);
          }
        }}
      />

      {/* 2. Primary Horizontal Navigation Bar */}
      <Navbar activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* 3. Main Dynamic Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomeDashboard
            documents={documents}
            notifications={notifications}
            userRole={currentUser.role}
            onSearchSubmit={handleSearchSubmit}
            onQuickFilter={handleQuickFilter}
            onSelectDocument={(doc) => {
              setActiveTab('archive');
              handleSelectDocument(doc);
            }}
            onDownloadDocument={handleDownload}
            onNavigateToArchive={() => {
              setFilterCriteria(defaultFilters);
              setActiveTab('archive');
            }}
            onOpenAdvancedSearch={() => setActiveTab('advanced-search')}
          />
        )}

        {activeTab === 'advanced-search' && (
          <AdvancedSearchView
            documents={documents}
            userRole={currentUser.role}
            bookmarks={bookmarks}
            onSelectDocument={(doc) => {
              setActiveTab('archive');
              handleSelectDocument(doc);
            }}
            onDownload={handleDownload}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {([
          'archive',
          'directives',
          'political-theory',
          'ho-chi-minh-thought',
          'party-history',
          'rapporteur',
          'social-opinion',
          'digital-transformation',
          'propaganda',
          'culture-arts',
          'science-education',
          'science-technology',
          'foreign-information',
          'islands-seas',
          'coordination-work',
          'other-categories',
          'multimedia',
          'reports-forms',
        ] as NavItemKey[]).includes(activeTab) && (
          <DocumentArchive
            documents={documents}
            userRole={currentUser.role}
            currentUserId={currentUser.id}
            bookmarks={bookmarks}
            filterCriteria={filterCriteria}
            onFilterChange={setFilterCriteria}
            onResetFilters={() => setFilterCriteria(defaultFilters)}
            onSelectDocument={handleSelectDocument}
            selectedDocument={selectedDocument}
            onCloseDetail={() => setSelectedDocument(null)}
            onDownload={handleDownload}
            onToggleBookmark={handleToggleBookmark}
            onOpenUploadModal={() => setIsUploadOpen(true)}
            onOpenEditModal={(doc) => setEditingDoc(doc)}
            onDeleteDocument={(doc) => setDeletingDoc(doc)}
            onOpenAdvancedSearch={() => setActiveTab('advanced-search')}
          />
        )}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'guide' && <UserGuideView />}

        {activeTab === 'contact' && <ContactView />}
      </main>

      {/* 4. Footer with Balanced Layout & Administrator Color Customizer */}
      <Footer currentUser={currentUser} onSelectTab={handleSelectTab} />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSaveDocument={handleSaveDocument}
        currentUser={currentUser}
      />

      {/* Edit Document Modal */}
      <EditDocumentModal
        isOpen={!!editingDoc}
        document={editingDoc}
        onClose={() => setEditingDoc(null)}
        onSave={handleSaveDocument}
        currentUser={currentUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingDoc}
        document={deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDeleteDocument}
      />

      {/* User Personal Collections & Bookmarks Modal */}
      <UserCollectionsModal
        isOpen={isCollectionsOpen}
        onClose={() => setIsCollectionsOpen(false)}
        documents={documents}
        bookmarks={bookmarks}
        onSelectDocument={(doc) => {
          setActiveTab('archive');
          handleSelectDocument(doc);
        }}
        onRemoveBookmark={(id) => handleToggleBookmark(id)}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        logs={auditLogs}
      />

      {/* Admin Management Modal - Shows directly on top, never hidden under other tabs */}
      <AdminManagementModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        currentUser={currentUser}
        documents={documents}
        auditLogs={auditLogs}
        onOpenUploadModal={() => {
          setIsAdminPanelOpen(false);
          setIsUploadOpen(true);
        }}
        onOpenAuditLogs={() => {
          setIsAdminPanelOpen(false);
          setIsAuditLogsOpen(true);
        }}
        onUpdateRole={handleUpdateRole}
        onUpdateCurrentUser={(updated) => {
          setCurrentUser((prev) => ({ ...prev, ...updated }));
          showToast('Cập nhật tài khoản', 'Thông tin cán bộ đã được cập nhật thành công');
        }}
      />

      {/* Push Notification In-App Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-400/40 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow">
            <Bell className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-xs text-amber-300">{toastMessage.title}</h5>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              {toastMessage.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
