import React, { useState } from 'react';
import { Calendar, Download, Filter, ArrowUpDown, List, Grid } from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useMember } from '../../contexts/MemberContext';
import { getDaysSinceLastVisit } from '../../utils/churnDetection';
import MonthlyAttendanceGrid from './MonthlyAttendanceGrid';

export default function AttendanceList() {
    const { attendanceRecords } = useAttendance();
    const { members } = useMember();
    const [filterType, setFilterType] = useState('All'); // All, PT, General
    const [sortBy, setSortBy] = useState('recent'); // recent, absence
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const filteredData = attendanceRecords.filter(log =>
        filterType === 'All' ? true : log.userType === filterType
    );

    // Get unique members from attendance records
    const getMembersWithAbsence = () => {
        const memberMap = new Map();

        members.forEach(member => {
            const daysSinceVisit = getDaysSinceLastVisit(member.id, attendanceRecords);
            memberMap.set(member.id, {
                ...member,
                daysSinceVisit,
                lastVisit: attendanceRecords
                    .filter(r => r.userId === member.id)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || 'Never'
            });
        });

        return Array.from(memberMap.values());
    };

    const membersWithAbsence = getMembersWithAbsence();
    const sortedMembers = sortBy === 'absence'
        ? [...membersWithAbsence].sort((a, b) => b.daysSinceVisit - a.daysSinceVisit)
        : membersWithAbsence;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">출석부</h2>
                    <p className="text-gray-500">전체 방문 이력을 확인하고 관리하세요.</p>
                </div>

                {/* View Mode Tabs */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <List size={18} />
                        <span>일별 목록</span>
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'grid'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Grid size={18} />
                        <span>월별 그리드</span>
                    </button>
                </div>
            </div>

            {/* Conditional Rendering */}
            {viewMode === 'grid' ? (
                <MonthlyAttendanceGrid />
            ) : (
                <>
                    <div className="flex space-x-2">
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="recent">최신순</option>
                                <option value="absence">장기 미방문자순</option>
                            </select>
                            <ArrowUpDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                        </div>
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="All">전체 보기</option>
                                <option value="PT">PT 회원</option>
                                <option value="General">일반 회원</option>
                                <option value="Group">그룹 수업</option>
                            </select>
                            <Filter className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                        </div>
                        <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download size={18} />
                            <span className="hidden md:inline">엑셀 다운로드</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-4 text-sm font-semibold text-gray-600">회원명</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600">
                                            {sortBy === 'absence' ? '마지막 방문' : '방문 날짜'}
                                        </th>
                                        <th className="p-4 text-sm font-semibold text-gray-600">
                                            {sortBy === 'absence' ? '미방문 일수' : '방문 시간'}
                                        </th>
                                        <th className="p-4 text-sm font-semibold text-gray-600">
                                            {sortBy === 'absence' ? '전화번호' : '수업 종류'}
                                        </th>
                                        <th className="p-4 text-sm font-semibold text-gray-600">상태</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sortBy === 'absence' ? (
                                        // Long-term absence view
                                        sortedMembers.map((member) => {
                                            const isExpired = new Date(member.endDate) < new Date();
                                            const isAtRisk = member.daysSinceVisit >= 7 && !isExpired;

                                            return (
                                                <tr key={member.id} className={`hover:bg-gray-50 ${isAtRisk ? 'bg-orange-50/30' : ''}`}>
                                                    <td className="p-4 font-medium text-gray-900">{member.name}</td>
                                                    <td className="p-4 text-gray-600 text-sm">
                                                        {member.lastVisit === 'Never' ? '방문 기록 없음' : member.lastVisit}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`font-bold ${member.daysSinceVisit >= 14 ? 'text-red-600' :
                                                            member.daysSinceVisit >= 7 ? 'text-orange-600' :
                                                                'text-gray-600'
                                                            }`}>
                                                            {member.daysSinceVisit === Infinity ? '∞' : `${member.daysSinceVisit}일`}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-600 text-sm">{member.phone}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${isExpired ? 'bg-gray-100 text-gray-600' :
                                                            isAtRisk ? 'bg-orange-100 text-orange-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                            {isExpired ? '만료' : isAtRisk ? '이탈 위험' : '정상'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        // Recent attendance view
                                        filteredData.map((log, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{log.userName}</td>
                                                <td className="p-4 text-gray-600 text-sm">{log.date}</td>
                                                <td className="p-4 text-gray-600 text-sm">{log.time}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.userType === 'PT' ? 'bg-blue-100 text-blue-700' :
                                                        log.userType === 'Group' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {log.userType}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                                                        출석
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
