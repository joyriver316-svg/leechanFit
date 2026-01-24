import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, UserCircle, Loader2 } from 'lucide-react';

export default function CoachManagement() {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoach, setEditingCoach] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', specialty: 'FPT', status: 'active' });

    // Fetch coaches from API
    const fetchCoaches = async () => {
        try {
            const response = await fetch('/api/coaches/');
            if (response.ok) {
                const data = await response.json();
                setCoaches(data);
            }
        } catch (error) {
            console.error('코치 목록 조회 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoaches();
    }, []);

    const handleAdd = () => {
        setEditingCoach(null);
        setFormData({ name: '', phone: '', specialty: 'FPT', status: 'active' });
        setIsModalOpen(true);
    };

    const handleEdit = (coach) => {
        setEditingCoach(coach);
        setFormData({ name: coach.name, phone: coach.phone, specialty: coach.specialty, status: coach.status });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`/api/coaches/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchCoaches();
                } else {
                    alert('삭제 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('삭제 오류:', error);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            alert('이름과 전화번호를 입력해주세요.');
            return;
        }

        try {
            if (editingCoach) {
                // Edit existing
                const response = await fetch(`/api/coaches/${editingCoach.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (!response.ok) throw new Error('수정 실패');
            } else {
                // Add new
                const response = await fetch('/api/coaches/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (!response.ok) throw new Error('추가 실패');
            }
            fetchCoaches();
            setIsModalOpen(false);
        } catch (error) {
            console.error('저장 오류:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const toggleStatus = async (id) => {
        const coach = coaches.find(c => c.id === id);
        const newStatus = coach.status === 'active' ? 'inactive' : 'active';
        try {
            const response = await fetch(`/api/coaches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                fetchCoaches();
            }
        } catch (error) {
            console.error('상태 변경 오류:', error);
        }
    };

    const activeCoaches = coaches.filter(c => c.status === 'active');
    const inactiveCoaches = coaches.filter(c => c.status === 'inactive');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">코치 관리</h2>
                    <p className="text-sm text-gray-500 mt-1">코치 정보를 추가하고 관리합니다.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                    <Plus size={20} />
                    <span>코치 추가</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">전체 코치</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">{coaches.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">활성 코치</div>
                    <div className="text-3xl font-bold text-green-600 mt-1">{activeCoaches.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">비활성 코치</div>
                    <div className="text-3xl font-bold text-gray-400 mt-1">{inactiveCoaches.length}</div>
                </div>
            </div>

            {/* Active Coaches Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">활성 코치</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전문분야</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {activeCoaches.map(coach => (
                                <tr key={coach.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <UserCircle size={20} className="text-gray-400" />
                                            <span className="font-medium text-gray-900">{coach.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{coach.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{coach.specialty}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleStatus(coach.id)}
                                            className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                                        >
                                            활성
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(coach)} className="text-blue-600 hover:text-blue-800 mr-3">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(coach.id)} className="text-red-600 hover:text-red-800">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {activeCoaches.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">활성 코치가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inactive Coaches (if any) */}
            {inactiveCoaches.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <h3 className="font-bold text-gray-500">비활성 코치</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전문분야</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {inactiveCoaches.map(coach => (
                                    <tr key={coach.id} className="hover:bg-gray-50 opacity-60">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <UserCircle size={20} className="text-gray-300" />
                                                <span className="font-medium text-gray-500">{coach.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{coach.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">{coach.specialty}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleStatus(coach.id)}
                                                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                                            >
                                                비활성
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(coach)} className="text-blue-400 hover:text-blue-600 mr-3">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(coach.id)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="bg-blue-900 text-white p-4 flex justify-between items-center rounded-t-xl">
                            <h3 className="text-lg font-bold">{editingCoach ? '코치 수정' : '코치 추가'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="코치 이름"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="010-0000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">전문분야</label>
                                <select
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="FPT">FPT</option>
                                    <option value="PT">PT</option>
                                    <option value="Group">Group</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="active">활성</option>
                                    <option value="inactive">비활성</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">취소</button>
                            <button onClick={handleSubmit} className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold">
                                {editingCoach ? '수정' : '추가'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
