import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useMember } from '../../contexts/MemberContext';

export default function MonthlyAttendanceGrid() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { attendanceRecords } = useAttendance();
    const { members } = useMember();

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const formatMonth = (date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    };

    // Get days in month
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Get day of week for each day
    const getDayOfWeek = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date.getDay(); // 0 = Sunday, 6 = Saturday
    };

    // Get attendance for a specific member on a specific day
    const getAttendanceTime = (memberId, day) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const records = attendanceRecords.filter(r => r.userId === memberId && r.date === dateStr);

        if (records.length === 0) return null;

        // Return first attendance time
        const time = records[0].time;
        const hour = parseInt(time.split(':')[0]);
        return `${hour}시`;
    };

    // Calculate attendance rate for a member
    const getAttendanceRate = (memberId) => {
        let attendedDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            if (getAttendanceTime(memberId, day)) {
                attendedDays++;
            }
        }
        return { attended: attendedDays, total: daysInMonth };
    };

    // Filter members
    const filteredMembers = members.filter(member =>
        member.name.includes(searchTerm) || member.phone.includes(searchTerm)
    );

    // Pagination
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Check if today
    const isToday = (day) => {
        const today = new Date();
        return today.getFullYear() === currentMonth.getFullYear() &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getDate() === day;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 w-40 text-center">
                        {formatMonth(currentMonth)}
                    </h2>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronRight size={24} className="text-gray-600" />
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="회원 검색..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-[10px] border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                <th className="sticky left-0 z-20 bg-gradient-to-r from-blue-600 to-blue-700 px-2 py-1.5 text-left text-[11px] font-bold border-r border-blue-800 min-w-[70px]">
                                    회원명
                                </th>
                                <th className="px-1.5 py-1.5 text-center text-[11px] font-bold border-r border-blue-800 min-w-[40px]">
                                    성별
                                </th>
                                <th className="px-1.5 py-1.5 text-center text-[11px] font-bold border-r border-blue-800 min-w-[50px]">
                                    출석률
                                </th>
                                {days.map(day => {
                                    const dayOfWeek = getDayOfWeek(day);
                                    const isSunday = dayOfWeek === 0;
                                    const isSaturday = dayOfWeek === 6;
                                    const todayHighlight = isToday(day);

                                    return (
                                        <th
                                            key={day}
                                            className={`px-1 py-1.5 text-center font-semibold border-r border-blue-800 min-w-[32px] ${todayHighlight ? 'bg-yellow-400 text-gray-900' :
                                                isSunday ? 'bg-red-500' :
                                                    isSaturday ? 'bg-blue-500' : ''
                                                }`}
                                        >
                                            <div className="text-[11px]">{day}</div>
                                            <div className="text-[9px] font-normal mt-0.5">
                                                {['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMembers.length > 0 ? paginatedMembers.map((member, idx) => {
                                const { attended, total } = getAttendanceRate(member.id);
                                const rate = ((attended / total) * 100).toFixed(0);

                                return (
                                    <tr key={member.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                        <td className="sticky left-0 z-10 px-2 py-1.5 font-medium text-gray-900 border-r border-gray-200 bg-inherit text-[11px]">
                                            {member.name}
                                        </td>
                                        <td className="px-1.5 py-1.5 text-center border-r border-gray-200">
                                            <span className={`text-[10px] font-medium ${member.gender === '남' ? 'text-blue-600' : 'text-pink-600'
                                                }`}>
                                                {member.gender}
                                            </span>
                                        </td>
                                        <td className="px-1.5 py-1.5 text-center border-r border-gray-200">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] font-bold text-blue-600">{rate}%</span>
                                                <span className="text-[9px] text-gray-500">{attended}/{total}</span>
                                            </div>
                                        </td>
                                        {days.map(day => {
                                            const time = getAttendanceTime(member.id, day);
                                            const dayOfWeek = getDayOfWeek(day);
                                            const isSunday = dayOfWeek === 0;
                                            const isSaturday = dayOfWeek === 6;
                                            const todayHighlight = isToday(day);

                                            return (
                                                <td
                                                    key={day}
                                                    className={`px-1 py-1.5 text-center border-r border-gray-100 ${todayHighlight ? 'bg-yellow-50' :
                                                        isSunday ? 'bg-red-50' :
                                                            isSaturday ? 'bg-blue-50' : ''
                                                        }`}
                                                >
                                                    {time ? (
                                                        <span className="inline-block px-1 py-0.5 bg-green-100 text-green-700 rounded font-medium text-[10px]">
                                                            {time}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 text-[10px]">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={daysInMonth + 3} className="p-8 text-center text-gray-500">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        전체 {filteredMembers.length}명 중 {startIndex + 1}-{Math.min(endIndex, filteredMembers.length)}명 표시
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 rounded-lg transition-colors ${currentPage === page
                                        ? 'bg-blue-600 text-white font-medium'
                                        : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
                    <span>오늘</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                    <span>토요일</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                    <span>일요일</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">9시</div>
                    <span>출석</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-300">-</span>
                    <span>미출석</span>
                </div>
            </div>
        </div>
    );
}
