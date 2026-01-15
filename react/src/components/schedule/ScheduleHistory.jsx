import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function ScheduleHistory() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Mock data for demonstration - in real app this would come from ScheduleContext
    const mockScheduleData = {
        "2026-01-14": {
            "07:00": {
                freeWeights: [
                    { name: "박유진", routine: "A" },
                    { name: "김철수", routine: "B" }
                ],
                machineRoutine: {
                    'A': { name: "이영희", time: "07:15" },
                    'B': { name: "최민수", time: "07:20" }
                },
                mainCoach: "이한민",
                subCoach: "김태훈"
            },
            "08:00": {
                freeWeights: [
                    { name: "정수진", routine: "C" }
                ],
                machineRoutine: {
                    'C': { name: "강민호", time: "08:10" }
                },
                mainCoach: "이한민",
                subCoach: ""
            }
        }
    };

    const scheduleForDate = mockScheduleData[selectedDate] || {};
    const timeSlots = Object.keys(scheduleForDate).sort();

    const totalMembers = timeSlots.reduce((sum, time) => {
        const slot = scheduleForDate[time];
        const fwCount = slot.freeWeights?.length || 0;
        const machineCount = Object.values(slot.machineRoutine || {}).filter(v => v).length;
        return sum + fwCount + machineCount;
    }, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">스케줄 조회</h2>
                <p className="text-gray-500">과거 수업 스케줄을 조회할 수 있습니다.</p>
            </div>

            {/* Date Selector */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <Calendar className="text-blue-600" size={24} />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">조회 날짜</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">총 인원</p>
                        <p className="text-2xl font-bold text-blue-600">{totalMembers}명</p>
                    </div>
                </div>
            </div>

            {/* Schedule Cards */}
            {timeSlots.length > 0 ? (
                <div className="space-y-4">
                    {timeSlots.map(time => {
                        const slot = scheduleForDate[time];
                        const fwCount = slot.freeWeights?.length || 0;
                        const machineCount = Object.values(slot.machineRoutine || {}).filter(v => v).length;
                        const totalCount = fwCount + machineCount;

                        return (
                            <div key={time} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Time Slot Header */}
                                <div className="bg-blue-50 p-4 border-b border-blue-100">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{time}</h3>
                                            <p className="text-sm text-gray-600">
                                                메인: {slot.mainCoach} {slot.subCoach && `| 서브: ${slot.subCoach}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">총 인원</p>
                                            <p className="text-2xl font-bold text-blue-600">{totalCount}명</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Free Weights */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-700 mb-2">프리웨이트 시작</h4>
                                        {slot.freeWeights && slot.freeWeights.length > 0 ? (
                                            <div className="space-y-1">
                                                {slot.freeWeights.map((member, idx) => (
                                                    <div key={idx} className="flex items-center space-x-2 text-sm">
                                                        <span className="text-gray-800">{member.name}</span>
                                                        {member.routine && (
                                                            <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded font-bold">
                                                                {member.routine}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">없음</p>
                                        )}
                                    </div>

                                    {/* Machine Routine */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-700 mb-2">머신 루틴</h4>
                                        {slot.machineRoutine && Object.values(slot.machineRoutine).some(v => v) ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(slot.machineRoutine).map(([routine, data]) => {
                                                    if (!data) return null;
                                                    return (
                                                        <div key={routine} className="text-sm">
                                                            <span className="font-bold text-gray-500">{routine}:</span>{' '}
                                                            <span className="text-gray-800">{data.name}</span>
                                                            {data.time && (
                                                                <span className="text-xs text-gray-500 ml-1">({data.time})</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">없음</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">선택한 날짜에 스케줄 기록이 없습니다.</p>
                </div>
            )}
        </div>
    );
}
