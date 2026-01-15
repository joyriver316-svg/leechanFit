import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, User, ArrowLeft } from 'lucide-react';
import { useMember } from '../../contexts/MemberContext';

export default function CheckInForm({ onBack, onSubmit }) {
    const { members } = useMember();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedType, setSelectedType] = useState('General');
    const [checkInTime, setCheckInTime] = useState('');

    // Set default time to now
    useEffect(() => {
        const now = new Date();
        // Format: YYYY-MM-DDTHH:mm
        const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // KST approximation for display if needed, but input datetime-local works with local time usually.
        // Actually input datetime-local expects YYYY-MM-DDTHH:mm. 
        // new Date().toISOString() returns UTC.
        // Let's use local formatted string.
        const localNow = new Date();
        const isoString = new Date(localNow.getTime() - (localNow.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setCheckInTime(isoString);
    }, []);

    const filteredUsers = members.filter(user =>
        user.name.includes(searchTerm) || user.phone.includes(searchTerm)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        // In a real app, send API request here.
        const newLog = {
            id: Date.now().toString(),
            userId: selectedUser.id,
            userName: selectedUser.name,
            userType: selectedUser.type,
            date: checkInTime.split('T')[0],
            time: checkInTime.split('T')[1],
            type: selectedType,
            status: 'Present'
        };

        onSubmit(newLog);
    };

    return (
        <div className="max-w-xl mx-auto">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                돌아가기
            </button>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-blue-900 p-6 text-white text-center">
                    <h2 className="text-2xl font-bold">출석 체크</h2>
                    <p className="text-blue-200 mt-1">회원을 검색하고 방문을 기록하세요.</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* User Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">회원 검색</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="이름 또는 전화번호 뒷자리"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Search Results */}
                        {searchTerm && !selectedUser && (
                            <div className="mt-2 border border-gray-100 rounded-lg shadow-sm max-h-48 overflow-y-auto divide-y">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => { setSelectedUser(user); setSearchTerm(''); }}
                                        className="w-full text-left p-3 hover:bg-blue-50 flex justify-between items-center transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.phone}</p>
                                        </div>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{user.type}</span>
                                    </button>
                                )) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">검색 결과가 없습니다.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected User Badge */}
                    {selectedUser && (
                        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                    {selectedUser.name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-blue-900">{selectedUser.name}</p>
                                    <p className="text-xs text-blue-600">{selectedUser.phone} • 잔여 {selectedUser.remaining}회</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-blue-400 hover:text-blue-600 text-sm underline"
                            >
                                변경
                            </button>
                        </div>
                    )}

                    {/* Time & Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">방문 시간</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="datetime-local"
                                    value={checkInTime}
                                    onChange={(e) => setCheckInTime(e.target.value)}
                                    className="w-full pl-10 pr-2 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">수업 종류</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white appearance-none"
                                >
                                    <option value="General">일반 이용</option>
                                    <option value="PT">PT (1:1)</option>
                                    <option value="Group">그룹 수업</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedUser}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2
              ${selectedUser
                                ? 'bg-blue-700 text-white hover:bg-blue-800 hover:shadow-blue-500/30'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <CheckCircle size={24} />
                        <span>출석 완료</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
