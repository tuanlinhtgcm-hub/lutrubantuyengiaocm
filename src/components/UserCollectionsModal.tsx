import React, { useState } from 'react';
import { Bookmark, FolderPlus, Trash2, X, Plus, FileText, ExternalLink, Check } from 'lucide-react';
import { DocumentItem, UserCollection } from '../types';
import { ArchiveService } from '../services/archiveService';

interface UserCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  bookmarks: string[];
  onSelectDocument: (doc: DocumentItem) => void;
  onRemoveBookmark: (docId: string) => void;
}

export const UserCollectionsModal: React.FC<UserCollectionsModalProps> = ({
  isOpen,
  onClose,
  documents,
  bookmarks,
  onSelectDocument,
  onRemoveBookmark,
}) => {
  const [collections, setCollections] = useState<UserCollection[]>(
    ArchiveService.getUserCollections()
  );
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'collections'>('bookmarks');
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const bookmarkedDocs = documents.filter((d) => bookmarks.includes(d.id));

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const newCol: UserCollection = {
      id: `col-${Date.now()}`,
      name: newColName.trim(),
      description: newColDesc.trim(),
      documentIds: bookmarks.slice(0, 3), // seed with current favorites
      createdAt: new Date().toISOString().split('T')[0],
    };

    ArchiveService.saveUserCollection(newCol);
    setCollections(ArchiveService.getUserCollections());
    setNewColName('');
    setNewColDesc('');
    setShowAddForm(false);
  };

  const handleDeleteCollection = (id: string) => {
    if (confirm('Đồng chí có chắc chắn muốn xóa bộ sưu tập này không?')) {
      ArchiveService.deleteUserCollection(id);
      setCollections(ArchiveService.getUserCollections());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              BỘ SƯU TẬP & TÀI LIỆU CÁ NHÂN
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Tài liệu yêu thích ({bookmarkedDocs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'collections'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Bộ sưu tập theo chuyên đề ({collections.length})</span>
          </button>
        </div>

        {/* Tab 1: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            {bookmarkedDocs.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                Đồng chí chưa đánh dấu yêu thích tài liệu nào. Hãy bấm biểu tượng Bookmark tại danh sách tài liệu để lưu vào đây.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {bookmarkedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition"
                  >
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        onSelectDocument(doc);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-bold text-red-700">{doc.codeNumber}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{doc.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 hover:text-red-700 mt-0.5">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{doc.summary}</p>
                    </div>

                    <button
                      onClick={() => onRemoveBookmark(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Bỏ khỏi yêu thích"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Collections */}
        {activeTab === 'collections' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Quản lý các nhóm hồ sơ công việc chuyên biệt
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo bộ sưu tập mới</span>
              </button>
            </div>

            {/* Create new collection form */}
            {showAddForm && (
              <form
                onSubmit={handleCreateCollection}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5 animate-in fade-in"
              >
                <h5 className="font-bold text-slate-800">Thêm mới bộ sưu tập:</h5>
                <input
                  type="text"
                  required
                  placeholder="Tên bộ sưu tập (VD: Nghiên cứu Tư tưởng Bác Hồ 2026)..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Mô tả tóm tắt mục đích thu thập..."
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-red-700 text-white font-bold"
                  >
                    Lưu bộ sưu tập
                  </button>
                </div>
              </form>
            )}

            {/* Collections list */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {collections.map((col) => {
                const count = col.documentIds.length;
                return (
                  <div
                    key={col.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{col.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{col.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            {count} tài liệu liên kết
                          </span>
                          <span>Tạo ngày: {col.createdAt}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCollection(col.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                        title="Xóa bộ sưu tập"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
