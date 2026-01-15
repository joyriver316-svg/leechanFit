import React, { useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { useMember } from '../../contexts/MemberContext';

export default function AddScheduleModal({ isOpen, onClose, onConfirm, initialType = 'FW', initialSlot = null }) {
    if (!isOpen) return null;

    const { members } = useMember();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoutine, setSelectedRoutine] = useState(initialSlot || '');
    const [startTime, setStartTime] = useState('');
    // Auto-check skipFreeWeight if initialType is 'Machine'
    const [skipFreeWeight, setSkipFreeWeight] = useState(initialType === 'Machine');

    const filteredUsers = members.filter(user =>
        user.name.includes(searchTerm) || user.phone.includes(searchTerm)
    );

    const handleSubmit = () => {
        if (!selectedUser) return;

        // If Machine type, routine is required
        if (initialType === 'Machine' && !selectedRoutine) {
            alert('머신 루틴을 선택해주세요.');
            return;
        }

        onConfirm({
            user: selectedUser,
            routine: selectedRoutine,
            time: startTime,
            skipFreeWeight: initialType === 'Machine' ? true : skipFreeWeight
        });
        onClose();
    };

    const routines = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold">
                        {initialType === 'FW' ? '프리웨이트 회원 배정' : `머신 ${initialSlot} 회원 배정`}
                    </h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-6">
                    {/* 1. Search User - Always shown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">회원 검색</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="이름 또는 전화번호 뒷자리"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        {/* Search Results Dropdown */}
                        {searchTerm && (
                            <div className="mt-2 border border-gray-200 rounded-lg max-h-32 overflow-y-auto bg-gray-50">
                                {filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`p-2 text-sm cursor-pointer flex justify-between items-center hover:bg-white ${selectedUser?.id === user.id ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}
                                    >
                                        <span>{user.name}</span>
                                        <span className="text-gray-500 text-xs">{user.phone}</span>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && <div className="p-2 text-sm text-gray-400 text-center">검색 결과 없음</div>}
                            </div>
                        )}
                        {selectedUser && !searchTerm && (
                            <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded-lg text-sm font-bold flex justify-between">
                                {selectedUser.name} <Check size={16} />
                            </div>
                        )}
                    </div>

                    {/* 2. Routine Selection - Only for Machine type */}
                    {initialType === 'Machine' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                머신 루틴 <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {routines.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setSelectedRoutine(r)}
                                        className={`w-8 h-8 rounded-full text-sm font-bold border transition-colors ${selectedRoutine === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            {selectedRoutine && (
                                <p className="text-xs text-blue-600 mt-2 font-bold">선택된 루틴: {selectedRoutine}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">취소</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedUser}
                        className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        배정하기
                    </button>
                </div>
            </div>
        </div>
    );
}
