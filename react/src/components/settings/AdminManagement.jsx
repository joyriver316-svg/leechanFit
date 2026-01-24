import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Shield, User } from 'lucide-react';
import Toast from '../common/Toast';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', name: '', role: 'admin' });
    const [toastMessage, setToastMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 관리자 목록 조회
    const fetchAdmins = async () => {
        try {
            const response = await fetch('/api/admins');
            if (response.ok) {
                const data = await response.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
            setToastMessage('❌ 관리자 목록을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleDelete = async (id, username) => {
        if (username === 'admin') {
            alert('기본 관리자 계정은 삭제할 수 없습니다.');
            return;
        }

        if (!confirm(`'${username}' 관리자를 정말 삭제하시겠습니까?`)) return;

        try {
            const response = await fetch(`/api/admins/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setToastMessage('✓ 관리자가 삭제되었습니다.');
                fetchAdmins();
            } else {
                setToastMessage('❌ 삭제 실패');
            }
        } catch (error) {
            console.error('Delete error:', error);
            setToastMessage('❌ 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleAdd = () => {
        setEditingAdmin(null);
        setFormData({ username: '', password: '', name: '', role: 'admin' });
        setIsModalOpen(true);
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setFormData({ username: admin.username, password: '', name: admin.name, role: admin.role });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            alert('이름을 입력해주세요.');
            return;
        }
        if (!editingAdmin && (!formData.username || !formData.password)) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            if (editingAdmin) {
                // 수정
                const updateData = { name: formData.name, role: formData.role };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                const response = await fetch(`/api/admins/${editingAdmin.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });
                if (response.ok) {
                    setToastMessage('✓ 사용자 정보가 수정되었습니다.');
                    fetchAdmins();
                    setIsModalOpen(false);
                } else {
                    const data = await response.json();
                    alert(data.detail || '수정 실패');
                }
            } else {
                // 추가
                const response = await fetch('/api/admins', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    setToastMessage('✓ 새 사용자가 등록되었습니다.');
                    fetchAdmins();
                    setIsModalOpen(false);
                    setFormData({ username: '', password: '', name: '', role: 'admin' });
                } else {
                    const data = await response.json();
                    alert(data.detail || '등록 실패');
                }
            }
        } catch (error) {
            console.error('Submit error:', error);
            setToastMessage('❌ 저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
                    <p className="text-sm text-gray-500 mt-1">시스템 접속이 가능한 관리자 계정을 관리합니다.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                    <Plus size={20} />
                    <span>사용자 추가</span>
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아이디</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">권한</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-8 text-center">로딩 중...</td></tr>
                            ) : admins.length > 0 ? (
                                admins.map(admin => (
                                    <tr key={admin.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-blue-100 p-2 rounded-full">
                                                    <User size={16} className="text-blue-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">{admin.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{admin.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {admin.role === 'super_admin' ? '최고 관리자' : '일반 관리자'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(admin)}
                                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-colors mr-1"
                                                title="수정"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {admin.username !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(admin.id, admin.username)}
                                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">등록된 관리자가 없습니다.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="bg-blue-900 text-white p-4 flex justify-between items-center rounded-t-xl">
                            <div className="flex items-center space-x-2">
                                <Shield size={20} />
                                <h3 className="text-lg font-bold">{editingAdmin ? '사용자 수정' : '새 사용자 추가'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="관리자 이름"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${editingAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    placeholder="사용할 아이디"
                                    disabled={!!editingAdmin}
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    비밀번호 {editingAdmin && <span className="text-gray-400 text-xs">(변경 시에만 입력)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder={editingAdmin ? "변경할 비밀번호" : "비밀번호"}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">권한</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="admin">일반 관리자</option>
                                    <option value="super_admin">최고 관리자</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">취소</button>
                            <button onClick={handleSubmit} className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold">
                                {editingAdmin ? '수정하기' : '추가하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage('')}
                />
            )}
        </div>
    );
}
