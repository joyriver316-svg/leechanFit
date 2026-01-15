import React, { useState } from 'react';
import { Plus, X, ArrowRight } from 'lucide-react';
import AddScheduleModal from './AddScheduleModal';
import Toast from '../common/Toast';
import { COACHES } from '../../data/mockData';
import { useAttendance } from '../../contexts/AttendanceContext';

export default function TimeSlotCard({ time, initialData = {} }) {
    const [freeWeights, setFreeWeights] = useState(
        initialData.freeWeights
            ? initialData.freeWeights.map(name => ({ name, routine: '' }))
            : []
    );

    const [machineRoutine, setMachineRoutine] = useState(initialData.machineRoutine || {
        'A': null, 'B': null, 'C': null, 'D': null, 'E': null,
        'F': null, 'G': null, 'H': null, 'I': null, 'J': null
    });

    const [mainCoach, setMainCoach] = useState(initialData.mainCoach || 'C001');
    const [subCoach, setSubCoach] = useState(initialData.subCoach || '');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('FW');
    const [targetSlot, setTargetSlot] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const activeCoaches = COACHES.filter(c => c.status === 'active');
    const { addAttendance } = useAttendance();

    const openFWModal = () => {
        setModalType('FW');
        setTargetSlot(null);
        setModalOpen(true);
    };

    const openMachineModal = (slot) => {
        if (machineRoutine[slot]) {
            if (confirm(`${machineRoutine[slot].name || machineRoutine[slot]} 님을 삭제하시겠습니까?`)) {
                setMachineRoutine({ ...machineRoutine, [slot]: null });
            }
            return;
        }
        setModalType('Machine');
        setTargetSlot(slot);
        setModalOpen(true);
    };

    const handleModalConfirm = (data) => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (modalType === 'FW') {
            // Check if user wants to skip free weight and go directly to machine
            if (data.skipFreeWeight && data.routine) {
                // Direct assignment to machine slot
                const targetSlot = data.routine;

                // Check if slot is occupied
                if (machineRoutine[targetSlot]) {
                    if (!confirm(`${targetSlot} 슬롯에 이미 ${machineRoutine[targetSlot].name}님이 있습니다. 교체하시겠습니까?`)) {
                        return;
                    }
                }

                // Assign directly to machine
                setMachineRoutine({
                    ...machineRoutine,
                    [targetSlot]: { name: data.user.name, time: currentTime }
                });

                // Show toast notification
                setToastMessage(`✓ ${data.user.name}님 머신 ${targetSlot} 배정 완료 (${currentTime})`);
            } else {
                // Normal flow: Add to Free Weight list
                setFreeWeights([...freeWeights, {
                    name: data.user.name,
                    routine: data.routine
                }]);

                // Show toast notification
                setToastMessage(`✓ ${data.user.name}님 프리웨이트 배정 완료 (${currentTime})`);
            }

            // Always add attendance record
            addAttendance({
                userId: data.user.id,
                userName: data.user.name,
                userType: data.user.type || 'FPT',
                date: now.toISOString().split('T')[0],
                time: currentTime
            });
        } else if (modalType === 'Machine' && targetSlot) {
            setMachineRoutine({
                ...machineRoutine,
                [targetSlot]: { name: data.user.name, time: data.time }
            });

            // Show toast notification
            setToastMessage(`✓ ${data.user.name}님 머신 ${targetSlot} 배정 완료 (${data.time})`);
        }
    };

    const removeFreeWeight = (idx) => {
        if (confirm('삭제하시겠습니까?')) {
            setFreeWeights(freeWeights.filter((_, i) => i !== idx));
        }
    };

    const moveToMachine = (idx) => {
        const member = freeWeights[idx];
        if (!member.routine) {
            alert('머신 루틴을 먼저 선택해주세요.');
            return;
        }

        const targetSlot = member.routine;

        if (machineRoutine[targetSlot]) {
            if (!confirm(`${targetSlot} 슬롯에 이미 ${machineRoutine[targetSlot].name}님이 있습니다. 교체하시겠습니까?`)) {
                return;
            }
        }

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        setMachineRoutine({
            ...machineRoutine,
            [targetSlot]: { name: member.name, time: currentTime }
        });

        setFreeWeights(freeWeights.filter((_, i) => i !== idx));
    };

    const totalCount = freeWeights.length + Object.values(machineRoutine).filter(n => n).length;

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
                            {freeWeights.map((item, idx) => (
                                <div key={idx} className="h-10 border-b border-gray-200 group hover:bg-gray-50 relative flex items-center justify-center px-2">
                                    <div className="flex items-center space-x-1">
                                        <span className="text-sm font-medium text-gray-800">{item.name || item}</span>
                                        {item.routine && (
                                            <span className="bg-yellow-200 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                {item.routine}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute top-2 right-1 flex space-x-1 opacity-0 group-hover:opacity-100">
                                        {item.routine && (
                                            <button
                                                onClick={() => moveToMachine(idx)}
                                                className="text-blue-500 hover:text-blue-700 p-0.5"
                                                title="머신으로 이동"
                                            >
                                                <ArrowRight size={12} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeFreeWeight(idx)}
                                            className="text-red-400 hover:text-red-600 p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={openFWModal}
                                className="w-full h-10 text-blue-500 hover:bg-blue-50 text-xs flex justify-center items-center border-b border-dashed border-gray-200"
                            >
                                <Plus size={14} /> 추가
                            </button>
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
                                        className={`h-10 flex flex-col items-center justify-center border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${name ? 'bg-blue-50/30' : ''}`}
                                    >
                                        {name ? (
                                            <>
                                                <span className="text-xs font-bold text-blue-800 leading-none">{name}</span>
                                                {slotTime && <span className="text-[9px] text-gray-500 leading-none mt-0.5">{slotTime}</span>}
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
