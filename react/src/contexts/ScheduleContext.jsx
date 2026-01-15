import React, { createContext, useContext, useState } from 'react';

const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
    // Store schedule data by date
    // Structure: { "2026-01-14": { "07:00": {...}, "08:00": {...} } }
    const [scheduleData, setScheduleData] = useState({});

    const saveSchedule = (date, time, data) => {
        setScheduleData(prev => ({
            ...prev,
            [date]: {
                ...(prev[date] || {}),
                [time]: data
            }
        }));
    };

    const getScheduleByDate = (date) => {
        return scheduleData[date] || {};
    };

    const getAllDates = () => {
        return Object.keys(scheduleData).sort().reverse();
    };

    return (
        <ScheduleContext.Provider value={{
            scheduleData,
            saveSchedule,
            getScheduleByDate,
            getAllDates
        }}>
            {children}
        </ScheduleContext.Provider>
    );
}

export function useSchedule() {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error('useSchedule must be used within ScheduleProvider');
    }
    return context;
}
