import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, UserPlus, UserMinus, Filter, Download, Upload, AlertTriangle, MessageCircle, Edit2, Trash2 } from 'lucide-react';
import MemberRegistrationModal from './MemberRegistrationModal';
import EngagementMessageModal from './EngagementMessageModal';
import Toast from '../common/Toast';
import { useMember } from '../../contexts/MemberContext';
import { useAttendance } from '../../contexts/AttendanceContext';
import { getDaysSinceLastVisit, getMemberRiskLevel } from '../../utils/churnDetection';

export default function MemberManagement() {
    const { members, addMember, updateMember, deleteMember, refreshMembers } = useMember();
    const { attendanceRecords } = useAttendance();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [engagementModal, setEngagementModal] = useState({ isOpen: false, member: null, daysSinceVisit: 0, riskLevel: 'caution' });
    const [isUploading, setIsUploading] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'new', 'expiring', 'caution', 'warning', 'danger'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const fileInputRef = useRef(null);

    // Excel upload handler
    const handleExcelUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload/upload-users', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                setToastMessage(`✓ ${result.success}명 업로드 성공! (실패: ${result.failed}명)`);
                // Refresh member list
                refreshMembers();
            } else {
                setToastMessage(`❌ 업로드 실패: ${result.detail || result.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            setToastMessage('❌ 업로드 중 오류가 발생했습니다.');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Excel download handler
    const handleExcelDownload = async () => {
        try {
            const response = await fetch('/api/users/export');

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `회원목록_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setToastMessage('✓ 엑셀 다운로드 완료!');
            } else {
                setToastMessage('❌ 다운로드 실패');
            }
        } catch (error) {
            setToastMessage('❌ 다운로드 중 오류가 발생했습니다.');
            console.error('Download error:', error);
        }
    };

    // Excel template download handler
    const handleTemplateDownload = async () => {
        try {
            const response = await fetch('/api/users/template');

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '회원등록양식.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setToastMessage('✓ 양식 다운로드 완료!');
            } else {
                setToastMessage('❌ 양식 다운로드 실패');
            }
        } catch (error) {
            setToastMessage('❌ 양식 다운로드 중 오류가 발생했습니다.');
            console.error('Template download error:', error);
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleDelete = async (member) => {
        if (!confirm(`"${member.name}" 회원을 삭제하시겠습니까?`)) return;

        try {
            await deleteMember(member.id);
            setToastMessage(`✓ ${member.name}님 삭제 완료`);
        } catch (error) {
            console.error('Delete error:', error);
            setToastMessage('❌ 삭제 중 오류가 발생했습니다.');
        }
    };



    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
    };

    const formatMonth = (date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    };

    // Helper to check if a date falls within the current month
    const isDateInMonth = (dateStr) => {
        const d = new Date(dateStr);
        return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    };

    // Filter Logic
    // Show members who are ACTIVE in this month OR Registered in this month OR Expiring in this month
    // Ideally, for "Management", we usually want to see everyone, but highlighted differently.
    // For this request "Monthly Member Management", let's filter by StartDate matching month (New) OR EndDate matching month (Expiring).
    // The user asked for "Monthly Member Management". Let's show all Active members for that month.
    // Active = startDate <= EndOfCurrentMonth AND endDate >= StartOfCurrentMonth

    const getReviewStatus = (user) => {
        if (isDateInMonth(user.regDate)) return { label: '신규', color: 'bg-green-100 text-green-700' };
        if (isDateInMonth(user.endDate)) return { label: '만료예정', color: 'bg-red-100 text-red-700' };
        return { label: '이용중', color: 'bg-blue-50 text-blue-700' };
    };

    const filteredUsers = members.filter(user => {
        const matchesSearch = user.name.includes(searchTerm) || user.phone.includes(searchTerm);

        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        // Parse user dates
        const userStart = new Date(user.startDate);
        const userEnd = new Date(user.endDate);

        const isActive = userStart <= endOfMonth && userEnd >= startOfMonth;

        // Apply status filter
        let matchesStatus = true;
        if (statusFilter === 'new') {
            matchesStatus = isDateInMonth(user.regDate);
        } else if (statusFilter === 'expiring') {
            matchesStatus = isDateInMonth(user.endDate);
        } else if (statusFilter === 'caution' || statusFilter === 'warning' || statusFilter === 'danger') {
            const riskLevel = getMemberRiskLevel(user, attendanceRecords);
            matchesStatus = riskLevel.level === statusFilter;
        }

        return matchesSearch && isActive && matchesStatus;
    });

    // Calculate stats for the summary cards
    const newMembersCount = filteredUsers.filter(u => isDateInMonth(u.regDate)).length;
    const expiringMembersCount = filteredUsers.filter(u => isDateInMonth(u.endDate)).length;

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, currentMonth]);

    return (
        <div className="space-y-6">
            {/* Month Selector & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 w-32 text-center">{formatMonth(currentMonth)}</h2>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronRight size={24} className="text-gray-600" />
                    </button>
                </div>

                <div className="flex space-x-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="이름/전화번호 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 md:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleExcelUpload}
                        accept=".xlsx,.xls"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        title="엑셀 파일로 회원 일괄 등록"
                        className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Upload size={18} />
                    </button>
                    <button
                        onClick={handleTemplateDownload}
                        title="회원 등록 양식 다운로드"
                        className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={handleExcelDownload}
                        title="현재 회원 목록 엑셀 다운로드"
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        title="새 회원 등록"
                        className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <UserPlus size={18} />
                    </button>
                </div>
            </div>

            {/* Status Cards Row */}
            <div className="grid grid-cols-5 gap-3 mb-6">
                {/* New Members */}
                <button
                    onClick={() => setStatusFilter(statusFilter === 'new' ? 'all' : 'new')}
                    className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${statusFilter === 'new' ? 'border-green-500 ring-2 ring-green-200' : 'border-green-200'
                        }`}
                >
                    <div className="flex items-center justify-center mb-2">
                        <UserPlus className="text-green-600" size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">이번 달 신규 회원</p>
                        <p className="text-2xl font-bold text-green-600">
                            {members.filter(u => {
                                const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                                const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                                const userStart = new Date(u.startDate);
                                const userEnd = new Date(u.endDate);
                                const isActive = userStart <= endOfMonth && userEnd >= startOfMonth;
                                return isActive && isDateInMonth(u.regDate);
                            }).length}
                        </p>
                    </div>
                </button>

                {/* Expiring Members */}
                <button
                    onClick={() => setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring')}
                    className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${statusFilter === 'expiring' ? 'border-red-500 ring-2 ring-red-200' : 'border-red-200'
                        }`}
                >
                    <div className="flex items-center justify-center mb-2">
                        <UserMinus className="text-red-600" size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">만료 예정 회원</p>
                        <p className="text-2xl font-bold text-red-600">
                            {members.filter(u => {
                                const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                                const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                                const userStart = new Date(u.startDate);
                                const userEnd = new Date(u.endDate);
                                const isActive = userStart <= endOfMonth && userEnd >= startOfMonth;
                                return isActive && isDateInMonth(u.endDate);
                            }).length}
                        </p>
                    </div>
                </button>

                {/* Caution Risk */}
                <button
                    onClick={() => setStatusFilter(statusFilter === 'caution' ? 'all' : 'caution')}
                    title="7일 이상 14일 미만 결석"
                    className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${statusFilter === 'caution' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-yellow-200'
                        }`}
                >
                    <div className="flex items-center justify-center mb-2">
                        <AlertTriangle className="text-yellow-600" size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">주의 회원</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {members.filter(u => {
                                const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                                const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                                const userStart = new Date(u.startDate);
                                const userEnd = new Date(u.endDate);
                                const isActive = userStart <= endOfMonth && userEnd >= startOfMonth;
                                return isActive && getMemberRiskLevel(u, attendanceRecords).level === 'caution';
                            }).length}
                        </p>
                    </div>
                </button>

                {/* Warning Risk */}
                <button
                    onClick={() => setStatusFilter(statusFilter === 'warning' ? 'all' : 'warning')}
                    title={"이전 4주: 주 3회 이상 방문\n최근 2주: 주 1회 이하 방문"}
                    className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${statusFilter === 'warning' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-orange-200'
                        }`}
                >
                    <div className="flex items-center justify-center mb-2">
                        <AlertTriangle className="text-orange-600" size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">경고 회원</p>
                        <p className="text-2xl font-bold text-orange-600">
                            {members.filter(u => {
                                const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                                const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                                const userStart = new Date(u.startDate);
                                const userEnd = new Date(u.endDate);
                                const isActive = userStart <= endOfMonth && userEnd >= startOfMonth;
                                return isActive && getMemberRiskLevel(u, attendanceRecords).level === 'warning';
                            }).length}
                        </p>
                    </div>
                </button>

                {/* Danger Risk */}
                <button
                    onClick={() => setStatusFilter(statusFilter === 'danger' ? 'all' : 'danger')}
                    title="연속 14일 이상 결석"
                    className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${statusFilter === 'danger' ? 'border-red-500 ring-2 ring-red-300' : 'border-red-300'
                        }`}
                >
                    <div className="flex items-center justify-center mb-2">
                        <AlertTriangle className="text-red-700" size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">위험 회원</p>
                        <p className="text-2xl font-bold text-red-700">
                            {members.filter(u => {
                                const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                                const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                                const userStart = new Date(u.startDate);
                                const userEnd = new Date(u.endDate);
                                const isActive = userStart <= endOfMonth && userEnd >= startOfMonth;
                                return isActive && getMemberRiskLevel(u, attendanceRecords).level === 'danger';
                            }).length}
                        </p>
                    </div>
                </button>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 text-white">
                                <th className="px-2 py-2 text-xs font-bold">이름</th>
                                <th className="px-2 py-2 text-xs font-bold">성별</th>
                                <th className="px-2 py-2 text-xs font-bold">전화번호</th>
                                <th className="px-2 py-2 text-xs font-bold">등록 개월</th>
                                <th className="px-2 py-2 text-xs font-bold">접수일</th>
                                <th className="px-2 py-2 text-xs font-bold">시작일</th>
                                <th className="px-2 py-2 text-xs font-bold">종료일</th>
                                <th className="px-2 py-2 text-xs font-bold">상태</th>
                                <th className="px-2 py-2 text-xs font-bold">액션</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedUsers.length > 0 ? paginatedUsers.map((user) => {
                                const status = getReviewStatus(user);
                                const daysSinceVisit = getDaysSinceLastVisit(user.id, attendanceRecords);
                                const riskLevel = getMemberRiskLevel(user, attendanceRecords);
                                const isAtRisk = riskLevel.level !== 'none';

                                // Color mapping for risk levels
                                const riskColors = {
                                    caution: 'text-yellow-500',
                                    warning: 'text-orange-500',
                                    danger: 'text-red-500'
                                };

                                return (
                                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-3 font-medium text-gray-900">
                                            <div className="flex items-center space-x-2">
                                                <span>{user.name}</span>
                                                {isAtRisk && (
                                                    <div className="group relative">
                                                        <AlertTriangle className={riskColors[riskLevel.level]} size={16} />
                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                            {riskLevel.reason}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 text-gray-600">{user.gender}</td>
                                        <td className="p-3 text-gray-600 text-sm">{user.phone}</td>
                                        <td className="p-3 text-gray-600">{user.regMonths}개월</td>
                                        <td className="p-3 text-gray-600 text-sm">{user.regDate}</td>
                                        <td className="p-3 text-gray-600 text-sm">{user.startDate}</td>
                                        <td className={`p-3 text-sm font-medium ${isDateInMonth(user.endDate) ? 'text-red-600' : 'text-gray-600'}`}>
                                            {user.endDate}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    title="수정"
                                                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    title="삭제"
                                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                {isAtRisk && (
                                                    <button
                                                        onClick={() => setEngagementModal({
                                                            isOpen: true,
                                                            member: user,
                                                            daysSinceVisit,
                                                            riskLevel: riskLevel.level
                                                        })}
                                                        className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${riskLevel.level === 'danger' ? 'bg-red-100 hover:bg-red-200 text-red-700' :
                                                            riskLevel.level === 'warning' ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' :
                                                                'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                                                            }`}
                                                    >
                                                        <MessageCircle size={12} />
                                                        <span>격려</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-gray-500">
                                        해당 월에 활동 중인 회원이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-600">
                        전체 {filteredUsers.length}명 중 {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}명 표시
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

            <MemberRegistrationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingMember(null);
                }}
                editingMember={editingMember}
                onSubmit={async (memberData) => {
                    try {
                        if (editingMember) {
                            await updateMember(editingMember.id, memberData);
                            setToastMessage(`✓ ${memberData.name}님 수정 완료`);
                        } else {
                            await addMember(memberData);
                            setToastMessage(`✓ ${memberData.name}님 등록 완료`);
                        }
                        setIsModalOpen(false);
                        setEditingMember(null);
                    } catch (error) {
                        console.error('Submit error:', error);
                        setToastMessage('❌ 저장 중 오류가 발생했습니다.');
                    }
                }}
            />

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage('')}
                />
            )}

            <EngagementMessageModal
                isOpen={engagementModal.isOpen}
                onClose={() => setEngagementModal({ isOpen: false, member: null, daysSinceVisit: 0, riskLevel: 'caution' })}
                member={engagementModal.member}
                daysSinceVisit={engagementModal.daysSinceVisit}
                riskLevel={engagementModal.riskLevel}
            />
        </div>
    );
}
