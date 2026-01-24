import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import AddScheduleModal from './AddScheduleModal';
import Toast from '../common/Toast';
import { useAttendance } from '../../contexts/AttendanceContext';

export default function TimeSlotCard({ time, date, initialData = {} }) {
    const { attendanceRecords, addAttendance, deleteAttendance, refreshAttendance } = useAttendance();
    const currentDate = date || new Date().toISOString().split('T')[0];

    // 코치 목록과 출석 데이터를 시간/날짜 변경 시마다 갱신
    const [coaches, setCoaches] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 코치 목록 가져오기
                const coachResponse = await fetch('/api/coaches');
                if (coachResponse.ok) {
                    const data = await coachResponse.json();
                    setCoaches(data);
                }
                // 출석 데이터 새로고침
                refreshAttendance();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [time, currentDate]);

    // Initialize state (will be populated by useEffect)
    const [freeWeights, setFreeWeights] = useState({});
    const [machineRoutine, setMachineRoutine] = useState({});

    useEffect(() => {
        if (!attendanceRecords) return;

        // Filter records for this time slot (Hourly match)
        // If card time is "20:00", we want to show all records starting with "20:"
        const targetHour = time.split(':')[0];

        const records = attendanceRecords.filter(r => {
            if (r.date !== currentDate) return false;
            const recordHour = r.time.split(':')[0];
            return recordHour === targetHour;
        });

        const newFreeWeights = {};
        const newMachineRoutine = {};

        records.forEach(record => {
            const memberData = {
                name: record.userName,
                userId: record.userId,
                // Assuming userType is returned or we default. Router returns 'userType': 'General'.
                userType: record.userType || 'FPT',
                time: record.time,
                attendanceId: record.id
            };

            if (record.type === 'FW' && record.slot) {
                newFreeWeights[record.slot] = memberData;
            } else if (record.type === 'Machine' && record.slot) {
                newMachineRoutine[record.slot] = memberData;
            }
        });

        setFreeWeights(newFreeWeights);
        setMachineRoutine(newMachineRoutine);
    }, [attendanceRecords, time, currentDate]);

    const [mainCoach, setMainCoach] = useState(initialData.mainCoach || 'C001');
    const [subCoach, setSubCoach] = useState(initialData.subCoach || '');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('FW');
    const [targetSlot, setTargetSlot] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const activeCoaches = coaches.filter(c => c.status === 'active');

    const openFWModal = (slot) => {
        if (freeWeights[slot]) {
            if (confirm(`${freeWeights[slot].name} 님을 삭제하시겠습니까?`)) {
                removeFreeWeight(slot);
            }
            return;
        }
        setModalType('FW');
        setTargetSlot(slot);
        setModalOpen(true);
    };

    const openMachineModal = async (slot) => {
        if (machineRoutine[slot]) {
            if (confirm(`${machineRoutine[slot].name || machineRoutine[slot]} 님을 삭제하시겠습니까?`)) {
                // If there's an attendance ID, delete it
                if (machineRoutine[slot].attendanceId) {
                    try {
                        await deleteAttendance(machineRoutine[slot].attendanceId);
                    } catch (error) {
                        console.error("Failed to delete attendance", error);
                    }
                }
                setMachineRoutine({ ...machineRoutine, [slot]: null });
            }
            return;
        }
        setModalType('Machine');
        setTargetSlot(slot);
        setModalOpen(true);
    };

    const moveToMachine = async (slot) => {
        const member = freeWeights[slot];
        if (!member) return;

        const targetSlot = slot; // Routine A moves to Machine A

        if (machineRoutine[targetSlot]) {
            if (!confirm(`${targetSlot} 슬롯에 이미 ${machineRoutine[targetSlot].name}님이 있습니다. 교체하시겠습니까?`)) {
                return;
            }
        }

        const now = new Date();
        const currentRealTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // If viewing past/future date, stick to the slot time if necessary? 
        // Or keep logic: "Move" action usually implies "Now". 
        // But if I am editing yesterday's schedule, I probably want to keep the time or just move slot.
        // Let's keep currentRealTime for simplicity unless requested otherwise for moves.
        // User said: "Even if I select past time, it enters DB as current time." -> He wants to FIX this.
        // So moves should probably respect the date.

        try {
            // 1. Delete old FW attendance
            if (member.attendanceId) {
                await deleteAttendance(member.attendanceId);
            }

            // 2. Add new Machine attendance
            const record = await addAttendance({
                userId: member.userId,
                userName: member.name,
                userType: member.userType || 'FPT',
                date: currentDate, // Use selected date
                time: currentRealTime, // Use real time for move action? Or preserve original time? 
                // Preserving original time makes sense for "History correction".
                // Let's use member.time or currentRealTime if null
                slot: targetSlot,
                type: 'Machine'
            });

            setMachineRoutine({
                ...machineRoutine,
                [targetSlot]: {
                    name: member.name,
                    userId: member.userId,
                    userType: member.userType,
                    time: currentRealTime,
                    attendanceId: record.id
                }
            });

            // Remove from FreeWeights
            const newFw = { ...freeWeights };
            delete newFw[slot];
            setFreeWeights(newFw);

        } catch (error) {
            console.error("Failed to move assignment", error);
            alert("이동 중 오류가 발생했습니다.");
            return;
        }
    };
    const handleModalConfirm = async (data) => {
        const now = new Date();
        const currentRealTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Use data.time if provided (manual select), else default logic from modal, else real time
        const timeToUse = data.time || currentRealTime;

        if (modalType === 'FW') {
            try {
                const isSkipping = data.skipFreeWeight && data.routine;
                const slot = data.routine;
                const type = isSkipping ? 'Machine' : 'FW';

                // Check conflicts before adding
                if (isSkipping) {
                    if (machineRoutine[slot]) {
                        if (!confirm(`${slot} 슬롯에 이미 ${machineRoutine[slot].name}님이 있습니다. 교체하시겠습니까?`)) {
                            return;
                        }
                    }
                }

                const record = await addAttendance({
                    userId: data.user.id,
                    userName: data.user.name,
                    userType: data.user.type || 'FPT',
                    date: currentDate, // Use selected date
                    time: timeToUse,
                    slot: slot,
                    type: type
                });

                // Check if user wants to skip free weight and go directly to machine
                if (isSkipping) {
                    // Assign directly to machine with Attendance ID
                    setMachineRoutine({
                        ...machineRoutine,
                        [slot]: {
                            name: data.user.name,
                            userId: data.user.id,
                            userType: data.user.type || 'FPT',
                            time: timeToUse,
                            attendanceId: record.id
                        }
                    });

                    setToastMessage(`✓ ${data.user.name}님 머신 ${slot} 배정 완료 (${timeToUse})`);
                } else {
                    // Normal flow: Add to Free Weight slot with Attendance ID
                    setFreeWeights({
                        ...freeWeights,
                        [slot]: {
                            name: data.user.name,
                            userId: data.user.id,
                            userType: data.user.type || 'FPT',
                            time: timeToUse,
                            attendanceId: record.id
                        }
                    });

                    setToastMessage(`✓ ${data.user.name}님 프리웨이트(${slot}) 배정 완료 (${timeToUse})`);
                }
            } catch (error) {
                console.error("Failed to add attendance", error);
                alert("출석 등록에 실패했습니다.");
            }

        } else if (modalType === 'Machine' && targetSlot) {
            try {
                const record = await addAttendance({
                    userId: data.user.id,
                    userName: data.user.name,
                    userType: data.user.type || 'FPT',
                    date: currentDate, // Use selected date
                    time: timeToUse,
                    slot: targetSlot,
                    type: 'Machine'
                });

                setMachineRoutine({
                    ...machineRoutine,
                    [targetSlot]: {
                        name: data.user.name,
                        userId: data.user.id,
                        userType: data.user.type || 'FPT',
                        time: timeToUse,
                        attendanceId: record.id
                    }
                });

                setToastMessage(`✓ ${data.user.name}님 머신 ${targetSlot} 배정 완료 (${timeToUse})`);
            } catch (error) {
                console.error("Failed to add attendance", error);
                alert("출석 등록에 실패했습니다.");
            }
        }
    };

    const removeFreeWeight = async (slot) => {
        const item = freeWeights[slot];
        if (item && item.attendanceId) {
            try {
                await deleteAttendance(item.attendanceId);
            } catch (error) {
                console.error("Failed to delete attendance", error);
            }
        }
        const newFw = { ...freeWeights };
        delete newFw[slot];
        setFreeWeights(newFw);
    };

    const removeMachineMember = async (slot) => {
        const item = machineRoutine[slot];
        if (item) {
            if (confirm(`${item.name || item} 님을 삭제하시겠습니까?`)) {
                if (item.attendanceId) {
                    try {
                        await deleteAttendance(item.attendanceId);
                    } catch (error) {
                        console.error("Failed to delete attendance", error);
                    }
                }
                setMachineRoutine({ ...machineRoutine, [slot]: null });
            }
        }
    };


    const totalCount = Object.keys(freeWeights).length + Object.keys(machineRoutine).length;

    return (
        <>
            <div className="min-w-[400px] bg-white border border-gray-300 shadow-sm flex flex-col h-[600px] shrink-0">
                {/* Header */}
                <div className="border-b border-gray-300 p-2 bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-1">
                            <span className="font-bold text-gray-700 text-xs">메인:</span>
                            <select
                                value={mainCoach}
                                onChange={(e) => setMainCoach(e.target.value)}
                                className="text-gray-700 text-xs border-b border-gray-400 bg-transparent focus:outline-none focus:border-blue-500 px-1"
                            >
                                {activeCoaches.map(coach => (
                                    <option key={coach.id} value={coach.id}>{coach.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="font-bold text-gray-700 text-xs">서브:</span>
                            <select
                                value={subCoach}
                                onChange={(e) => setSubCoach(e.target.value)}
                                className="text-gray-700 text-xs border-b border-gray-400 bg-transparent focus:outline-none focus:border-blue-500 px-1"
                            >
                                <option value="">없음</option>
                                {activeCoaches.filter(c => c.id !== mainCoach).map(coach => (
                                    <option key={coach.id} value={coach.id}>{coach.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <h3 className="text-2xl font-bold text-gray-900">{time}</h3>
                        <span className="text-sm font-medium text-gray-600">총 인원: <span className="text-blue-600 font-bold text-lg">{totalCount}</span>명</span>
                    </div>
                </div>

                {/* 3-Column Layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Column 1: 프리웨이트 시작 (1/3) */}
                    <div className="flex flex-col border-r border-gray-300" style={{ width: '33.33%' }}>
                        <div className="bg-gray-100 p-2 border-b border-gray-300 text-center font-bold text-xs text-gray-700">
                            프리웨이트 시작
                        </div>
                        <div className="flex-1 overflow-y-auto bg-white">
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((slot) => {
                                const data = freeWeights[slot];
                                const name = data?.name;
                                const time = data?.time;

                                return (
                                    <div
                                        key={slot}
                                        onClick={() => openFWModal(slot)}
                                        className={`h-10 border-b border-gray-200 group relative flex items-center justify-center cursor-pointer hover:bg-green-50/50 transition-colors ${name ? 'bg-green-50/30' : ''}`}
                                    >
                                        {name ? (
                                            <>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-green-800 leading-none">{name}</span>
                                                    {time && <span className="text-[9px] text-gray-500 leading-none mt-0.5">{time}</span>}
                                                </div>
                                                <div className="absolute top-0 right-0 h-full flex items-center pr-1 space-x-0.5 opacity-0 group-hover:opacity-100">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('삭제하시겠습니까?')) removeFreeWeight(slot);
                                                        }}
                                                        className="text-red-400 hover:text-red-600 p-1 bg-white/80 rounded-full shadow-sm"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-gray-300 text-xs">-</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Column 2: 머신 루틴 (1/3) */}
                    <div className="flex flex-col border-r border-gray-300" style={{ width: '33.33%' }}>
                        <div className="bg-gray-100 p-2 border-b border-gray-300 text-center font-bold text-xs text-gray-700">
                            머신 루틴
                        </div>
                        <div className="flex-1 overflow-y-auto bg-white">
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((slot) => (
                                <div key={slot} className="h-10 flex items-center justify-center border-b border-gray-200 bg-gray-50">
                                    <span className="font-bold text-gray-400 text-sm">{slot}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 3: 머신 시작 (1/3) */}
                    <div className="flex flex-col" style={{ width: '33.33%' }}>
                        <div className="bg-gray-100 p-2 border-b border-gray-300 text-center font-bold text-xs text-gray-700">
                            머신 시작
                        </div>
                        <div className="flex-1 overflow-y-auto bg-white">
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((slot) => {
                                const data = machineRoutine[slot];
                                const name = data?.name || data;
                                const slotTime = data?.time;

                                return (
                                    <div
                                        key={slot}
                                        onClick={() => openMachineModal(slot)}
                                        className={`h-10 border-b border-gray-200 group relative flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors ${name ? 'bg-blue-50/30' : ''}`}
                                    >
                                        {name ? (
                                            <>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-blue-800 leading-none">{name}</span>
                                                    {slotTime && <span className="text-[9px] text-gray-500 leading-none mt-0.5">{slotTime}</span>}
                                                </div>
                                                <div className="absolute top-0 right-0 h-full flex items-center pr-1 space-x-0.5 opacity-0 group-hover:opacity-100">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeMachineMember(slot);
                                                        }}
                                                        className="text-red-400 hover:text-red-600 p-1 bg-white/80 rounded-full shadow-sm"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-gray-300 text-sm">-</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <AddScheduleModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleModalConfirm}
                initialType={modalType}
                initialSlot={targetSlot}
                timeSlot={time}
                date={currentDate}
            />

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage('')}
                />
            )}
        </>
    );
}
