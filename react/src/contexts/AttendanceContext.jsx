import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAttendance = useCallback(async () => {
        console.log('🔍 fetchAttendance called');
        setIsLoading(true);
        try {
            console.log('📡 Fetching from /api/attendance/');
            const response = await fetch('/api/attendance/');
            console.log('📥 Response received:', response.status);
            if (!response.ok) throw new Error('출석 기록을 불러오는데 실패했습니다.');
            const data = await response.json();
            console.log('✅ Attendance data received:', data.length, 'records');
            setAttendanceRecords(data);
        } catch (err) {
            console.error('❌ Error fetching attendance:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        console.log('🚀 AttendanceProvider mounted, calling fetchAttendance');
        fetchAttendance();
    }, [fetchAttendance]);

    const addAttendance = async (record) => {
        try {
            const response = await fetch('/api/attendance/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(record),
            });
            if (!response.ok) throw new Error('출석 등록에 실패했습니다.');
            const newRecord = await response.json();
            setAttendanceRecords(prev => [newRecord, ...prev]);
            return newRecord;
        } catch (err) {
            console.error('Error adding attendance:', err);
            throw err;
        }
    };

    const getAttendance = () => {
        return attendanceRecords;
    };

    const getTodayAttendance = () => {
        const today = new Date().toISOString().split('T')[0];
        return attendanceRecords.filter(r => r.date === today);
    };

    const refreshAttendance = () => {
        fetchAttendance();
    };

    return (
        <AttendanceContext.Provider value={{
            attendanceRecords,
            isLoading,
            error,
            addAttendance,
            getAttendance,
            getTodayAttendance,
            refreshAttendance
        }}>
            {children}
        </AttendanceContext.Provider>
    );
}

export function useAttendance() {
    const context = useContext(AttendanceContext);
    if (!context) {
        throw new Error('useAttendance must be used within AttendanceProvider');
    }
    return context;
}
