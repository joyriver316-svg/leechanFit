import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useMember } from '../../contexts/MemberContext';

export default function ScheduleHistory() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const { attendanceRecords } = useAttendance();
    const { members } = useMember();

    // Group attendance by time slot for the selected date
    const getScheduleForDate = () => {
        const schedule = {};

        // Filter records for selected date
        const dailyRecords = attendanceRecords.filter(r => r.date === selectedDate);

        dailyRecords.forEach(record => {
            // Group by hour (07:00, 08:00, etc.)
            const hour = record.time.split(':')[0] + ':00';

            if (!schedule[hour]) {
                schedule[hour] = {
                    freeWeights: [],
                    machineRoutine: {},
                    mainCoach: "이한민", // Default coach for now
                    subCoach: ""
                };
            }

            const memberName = members.find(m => m.id === record.userId)?.name || record.userName || 'Unknown';

            if (record.type === 'FW') {
                schedule[hour].freeWeights.push({
                    name: memberName,
                    routine: record.slot, // A-J
                    time: record.time.substring(0, 5)
                });
            } else if (record.type === 'Machine') {
                schedule[hour].machineRoutine[record.slot] = {
                    name: memberName,
                    time: record.time.substring(0, 5) // HH:mm
                };
            }
        });

        return schedule;
    };

    // State to track expanded slots, initializing with all slots expanded by default is tricky because we generate them on the fly.
    // Instead we can use a Set to track collapsed slots (so default is expanded).
    const [collapsedSlots, setCollapsedSlots] = useState(new Set());

    const toggleSlot = (time) => {
        const newCollapsed = new Set(collapsedSlots);
        if (newCollapsed.has(time)) {
            newCollapsed.delete(time);
        } else {
            newCollapsed.add(time);
        }
        setCollapsedSlots(newCollapsed);
    };

    const scheduleForDate = getScheduleForDate();
    const timeSlots = Object.keys(scheduleForDate).sort();

    const totalMembers = timeSlots.reduce((sum, time) => {
        const slot = scheduleForDate[time];
        const fwCount = slot.freeWeights?.length || 0;
        const machineCount = Object.values(slot.machineRoutine || {}).filter(v => v).length;
        return sum + fwCount + machineCount;
    }, 0);

    return (
        <div className="space-y-4">
            {/* Header - Compact */}
            <div className="flex justify-between items-end pb-2 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">스케줄 조회</h2>
                    <p className="text-xs text-gray-500">과거 수업 스케줄을 조회할 수 있습니다.</p>
                </div>
                <div className="text-right">

                </div>
            </div>

            {/* Date Selector - Compact */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                    <Calendar className="text-blue-600" size={20} />
                    <div className="flex-1 flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">조회 날짜</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        />
                    </div>
                    <div className="text-right flex items-center gap-2">
                        <span className="text-sm text-gray-500">총 인원</span>
                        <span className="text-xl font-bold text-blue-600">{totalMembers}명</span>
                    </div>
                </div>
            </div>

            {/* Schedule Cards */}
            {timeSlots.length > 0 ? (
                <div className="space-y-2">
                    {timeSlots.map(time => {
                        const slot = scheduleForDate[time];
                        const fwCount = slot.freeWeights?.length || 0;
                        const machineCount = Object.values(slot.machineRoutine || {}).filter(v => v).length;
                        const totalCount = fwCount + machineCount;
                        const isCollapsed = collapsedSlots.has(time);

                        return (
                            <div key={time} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                {/* Time Slot Header - Click to Toggle */}
                                <div
                                    className="bg-blue-50 px-4 py-2 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors flex justify-between items-center"
                                    onClick={() => toggleSlot(time)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-gray-900 w-16">{time}</h3>
                                        <div className="px-2 py-0.5 bg-white bg-opacity-60 rounded text-xs text-gray-600">
                                            메인: {slot.mainCoach} {slot.subCoach && `| 서브: ${slot.subCoach}`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-blue-600">{totalCount}명</span>
                                        </div>
                                        <div className={`transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`}>
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Content - Conditionally Rendered */}
                                {!isCollapsed && (
                                    <div className="p-3 grid grid-cols-1 gap-3 bg-white">
                                        {/* Free Weights */}
                                        <div className="flex items-start gap-4 border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                            <div className="w-24 shrink-0 pt-1">
                                                <h4 className="text-xs font-bold text-gray-500">프리웨이트</h4>
                                            </div>
                                            <div className="flex-1">
                                                {slot.freeWeights && slot.freeWeights.length > 0 ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                                                        {slot.freeWeights.map((member, idx) => (
                                                            <div key={idx} className="flex flex-col items-center p-1.5 bg-gray-50 rounded border border-gray-100">
                                                                <div className="flex items-center gap-1 mb-0.5">
                                                                    <span className="text-sm font-bold text-gray-900 truncate max-w-[4rem]">{member.name}</span>
                                                                    {member.routine && (
                                                                        <span className="bg-yellow-100 text-yellow-800 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                                                            {member.routine}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-gray-500">{member.time}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-300 py-1">없음</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Machine Routine */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-24 shrink-0 pt-1">
                                                <h4 className="text-xs font-bold text-gray-500">머신 루틴</h4>
                                            </div>
                                            <div className="flex-1">
                                                {slot.machineRoutine && Object.values(slot.machineRoutine).some(v => v) ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                                                        {Object.entries(slot.machineRoutine).map(([routine, data]) => {
                                                            if (!data) return null;
                                                            return (
                                                                <div key={routine} className="flex flex-col items-center p-1.5 bg-gray-50 rounded border border-gray-100">
                                                                    <div className="flex items-center gap-1 mb-0.5">
                                                                        <span className="bg-blue-100 text-blue-800 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                                                            {routine}
                                                                        </span>
                                                                        <span className="text-sm font-bold text-gray-900 truncate max-w-[4rem]">{data.name}</span>
                                                                    </div>
                                                                    {data.time && (
                                                                        <span className="text-[10px] text-gray-500">{data.time}</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-300 py-1">없음</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <Calendar className="mx-auto text-gray-300 mb-4" size={32} />
                    <p className="text-gray-500">선택한 날짜에 스케줄 기록이 없습니다.</p>
                </div>
            )}
        </div>
    );
}
