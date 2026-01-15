import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TimeSlotCard from './TimeSlotCard';

export default function ScheduleBoard() {
    const timeSlots = [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00'
    ];

    // Get current time slot based on current hour
    const getCurrentTimeSlot = () => {
        const now = new Date();
        const currentHour = now.getHours();

        // Find the closest time slot
        if (currentHour < 7) return 0; // Before 7am, show 7am
        if (currentHour >= 21) return timeSlots.length - 1; // After 9pm, show 9pm

        // Find index for current hour
        const index = timeSlots.findIndex(slot => {
            const slotHour = parseInt(slot.split(':')[0]);
            return slotHour === currentHour;
        });

        return index >= 0 ? index : 0;
    };

    const [currentIndex, setCurrentIndex] = useState(getCurrentTimeSlot());

    // Auto-update current time slot every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(getCurrentTimeSlot());
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goToNext = () => {
        if (currentIndex < timeSlots.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const currentTime = timeSlots[currentIndex];
    const isFirstSlot = currentIndex === 0;
    const isLastSlot = currentIndex === timeSlots.length - 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">수업 스케줄</h2>
                <p className="text-gray-500">실시간 수업 운영 및 회원 배정</p>
            </div>

            {/* Time Navigation */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <button
                        onClick={goToPrevious}
                        disabled={isFirstSlot}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isFirstSlot
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                    >
                        <ChevronLeft size={20} />
                        <span>{isFirstSlot ? '이전 없음' : timeSlots[currentIndex - 1]}</span>
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">현재 시간대</p>
                        <p className="text-3xl font-bold text-blue-600">{currentTime}</p>
                    </div>

                    <button
                        onClick={goToNext}
                        disabled={isLastSlot}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isLastSlot
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                    >
                        <span>{isLastSlot ? '다음 없음' : timeSlots[currentIndex + 1]}</span>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Single Time Slot Card */}
            <div className="flex justify-center">
                <TimeSlotCard
                    time={currentTime}
                    initialData={{}}
                />
            </div>
        </div>
    );
}
