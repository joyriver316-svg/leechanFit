import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import StatCard from './components/dashboard/StatCard';
import CheckInForm from './components/attendance/CheckInForm';
import AttendanceList from './components/attendance/AttendanceList';
import MemberManagement from './components/members/MemberManagement';
import ScheduleBoard from './components/schedule/ScheduleBoard';
import ScheduleHistory from './components/schedule/ScheduleHistory';
import CoachManagement from './components/settings/CoachManagement';
import MembershipProductManagement from './components/settings/MembershipProductManagement';
import AdminManagement from './components/settings/AdminManagement';
import Login from './components/auth/Login';
import { AttendanceProvider, useAttendance } from './contexts/AttendanceContext';
import { MemberProvider, useMember } from './contexts/MemberContext';
import { MembershipProductProvider } from './contexts/MembershipProductContext';
import { Users, UserCheck, CalendarDays, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCategorizedRiskMembers } from './utils/churnDetection';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [chartView, setChartView] = useState('weekly'); // weekly, hourly, daily, monthly
  const [selectedWeek, setSelectedWeek] = useState(null); // null means current week
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const { attendanceRecords, getTodayAttendance } = useAttendance();
  const { members } = useMember();

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('로그아웃 하시겠습니까?');
    if (confirmLogout) {
      setIsLoggedIn(false);
      setUser(null);
      setCurrentPage('dashboard');
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = getTodayAttendance();
  const weeklyData = processWeeklyData(attendanceRecords, members);
  const hourlyData = processHourlyData(attendanceRecords, members);
  const dailyData = processDailyData(attendanceRecords, members);
  const monthlyData = processMonthlyData(attendanceRecords, members);

  // Get current week label
  const getCurrentWeekLabel = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    let weekStart = new Date(firstDay);
    let weekNum = 1;

    while (weekStart <= lastDay) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime());
      }

      if (today >= weekStart && today <= weekEnd) {
        return `${weekNum}주차`;
      }

      weekStart.setDate(weekEnd.getDate() + 1);
      weekNum++;
    }

    return '1주차';
  };

  // Get weekly date range for display
  const getWeeklyDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 9); // 9 days ago (1/5)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 4); // 4 days ago (1/10)

    const formatDate = (date) => {
      const year = String(date.getFullYear()).slice(2);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}.${month}.${day}`;
    };

    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  // Get today's date for display
  const getTodayDate = () => {
    const today = new Date();
    const year = String(today.getFullYear()).slice(2);
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${year}.${month}.${day}`;
  };

  // Calculate member statistics
  const calculateMemberStats = () => {
    const now = new Date();
    const activeMembers = members.filter(m => new Date(m.endDate) >= now);
    const expiredMembers = members.filter(m => new Date(m.endDate) < now);

    return {
      active: {
        total: activeMembers.length,
        male: activeMembers.filter(m => m.gender === '남').length,
        female: activeMembers.filter(m => m.gender === '여').length
      },
      expired: {
        total: expiredMembers.length,
        male: expiredMembers.filter(m => m.gender === '남').length,
        female: expiredMembers.filter(m => m.gender === '여').length
      }
    };
  };

  const memberStats = calculateMemberStats();
  const riskCategories = getCategorizedRiskMembers(members, attendanceRecords);

  const renderContent = () => {
    switch (currentPage) {
      case 'checkin':
        return <CheckInForm />;
      case 'attendance':
        return <AttendanceList />;
      case 'users':
        return <MemberManagement />;
      case 'schedule':
        return <ScheduleBoard />;
      case 'schedule-history':
        return <ScheduleHistory />;
      case 'settings':
        return <CoachManagement />;
      case 'products':
        return <MembershipProductManagement />;
      case 'admins':
        return <AdminManagement />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Today's Visits with Gender Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">오늘 방문</h3>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <UserCheck className="text-blue-600" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-end space-x-2">
                    <span className="text-3xl font-bold text-blue-600">{todayAttendance.length}</span>
                    <span className="text-gray-500 text-sm mb-1">명</span>
                  </div>
                  <div className="flex space-x-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">남:</span>
                      <span className="font-bold text-blue-600">{todayAttendance.filter(a => members.find(m => m.id === a.userId)?.gender === '남').length}명</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">여:</span>
                      <span className="font-bold text-pink-600">{todayAttendance.filter(a => members.find(m => m.id === a.userId)?.gender === '여').length}명</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Members with Gender Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">유효 회원</h3>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="text-green-600" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-end space-x-2">
                    <span className="text-3xl font-bold text-green-600">{memberStats.active.total}</span>
                    <span className="text-gray-500 text-sm mb-1">명</span>
                  </div>
                  <div className="flex space-x-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">남:</span>
                      <span className="font-bold text-blue-600">{memberStats.active.male}명</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">여:</span>
                      <span className="font-bold text-pink-600">{memberStats.active.female}명</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expired Members */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">만료 회원</h3>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Users className="text-red-600" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-end space-x-2">
                    <span className="text-3xl font-bold text-red-600">{memberStats.expired.total}</span>
                    <span className="text-gray-500 text-sm mb-1">명</span>
                  </div>
                  <div className="flex space-x-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">남:</span>
                      <span className="font-bold text-blue-600">{memberStats.expired.male}명</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">여:</span>
                      <span className="font-bold text-pink-600">{memberStats.expired.female}명</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Horizontal Risk Card */}
              <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">이탈 위험</h3>
                  <AlertTriangle className="text-orange-600" size={18} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-700 font-medium">주의</span>
                    </div>
                    <span className="font-bold text-yellow-600">{riskCategories.caution.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-gray-700 font-medium">경고</span>
                    </div>
                    <span className="font-bold text-orange-600">{riskCategories.warning.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-gray-700 font-medium">위험</span>
                    </div>
                    <span className="font-bold text-red-600">{riskCategories.danger.length}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">총 인원</span>
                      <span className="text-lg font-bold text-gray-900">
                        {riskCategories.caution.length + riskCategories.warning.length + riskCategories.danger.length}명
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Multi-View Analytics Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">방문 추이 분석</h3>
                  {chartView === 'weekly' && (
                    <p className="text-sm text-gray-500 mt-1">{getWeeklyDateRange()}</p>
                  )}
                  {chartView === 'hourly' && (
                    <p className="text-sm text-gray-500 mt-1">{getTodayDate()}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartView('hourly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartView === 'hourly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    시간대별 추이
                  </button>
                  <button
                    onClick={() => setChartView('weekly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartView === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    주간 추이
                  </button>
                  <button
                    onClick={() => setChartView('daily')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartView === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    월별 추이
                  </button>
                  <button
                    onClick={() => setChartView('monthly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartView === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    년도추이
                  </button>
                </div>
              </div>

              {/* Weekly View */}
              {chartView === 'weekly' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2563eb" name="전체" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="male" fill="#3b82f6" name="남" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="female" fill="#ec4899" name="여" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Hourly View */}
              {chartView === 'hourly' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData} barSize={15}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2563eb" name="전체" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="male" fill="#3b82f6" name="남" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="female" fill="#ec4899" name="여" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Daily View (1-30 days of current month) */}
              {chartView === 'daily' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2563eb" name="전체" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="male" fill="#3b82f6" name="남" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="female" fill="#ec4899" name="여" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Monthly View */}
              {chartView === 'monthly' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2563eb" name="전체" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="male" fill="#3b82f6" name="남" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="female" fill="#ec4899" name="여" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Attendance Statistics Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Statistics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    주차별 출석 통계 <span className="text-sm font-normal text-gray-400">({new Date().getFullYear()}년 {new Date().getMonth() + 1}월)</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-50 border-b border-yellow-200">
                        <th className="p-3 text-left font-semibold text-gray-700">주차</th>
                        <th className="p-3 text-right font-semibold text-gray-700">총 출석</th>
                        <th className="p-3 text-right font-semibold text-gray-700">일수</th>
                        <th className="p-3 text-right font-semibold text-gray-700">일평균</th>
                        <th className="p-3 text-right font-semibold text-gray-700">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processWeeklyStats(attendanceRecords).map((stat) => (
                        <tr
                          key={stat.week}
                          className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${selectedWeek === stat.weekNum ? 'bg-blue-100' : ''
                            }`}
                          onClick={() => setSelectedWeek(stat.weekNum)}
                        >
                          <td className="p-3 font-medium text-gray-900">{stat.week}</td>
                          <td className="p-3 text-right text-gray-700">{stat.total}</td>
                          <td className="p-3 text-right text-gray-600">{stat.days}</td>
                          <td className="p-3 text-right text-gray-700">{stat.average}</td>
                          <td className="p-3 text-right text-blue-600 font-medium">{stat.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hourly Statistics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    시간대별 출석 통계 <span className="text-sm font-normal text-gray-400">({selectedWeek ? `${selectedWeek}주차` : getCurrentWeekLabel()})</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-2 py-2 text-left font-semibold text-gray-700">시간</th>
                        <th className="px-2 py-2 text-right font-semibold text-gray-700">총 출석인원</th>
                        <th className="px-2 py-2 text-right font-semibold text-gray-700">%</th>
                        <th className="px-2 py-2 text-right font-semibold text-gray-700">평균</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {processHourlyStatsForWeek(attendanceRecords, selectedWeek).map((stat) => (
                        <tr key={stat.hour} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 font-medium text-gray-900">{stat.hour}</td>
                          <td className="px-2 py-1.5 text-right text-gray-700">{stat.total}</td>
                          <td className="px-2 py-1.5 text-right text-blue-600 font-medium">{stat.percentage}%</td>
                          <td className="px-2 py-1.5 text-right text-gray-700">{stat.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout onNavigate={setCurrentPage} currentPage={currentPage} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
}

function processWeeklyData(attendanceData, members) {
  const weekData = {};
  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    weekData[dateStr] = { total: 0, male: 0, female: 0, dayName: dayNames[date.getDay()] };
  }

  // Count attendance for each day with gender breakdown
  attendanceData.forEach(log => {
    if (weekData.hasOwnProperty(log.date)) {
      weekData[log.date].total++;

      const member = members.find(m => m.id === log.userId);
      if (member) {
        if (member.gender === '남') {
          weekData[log.date].male++;
        } else if (member.gender === '여') {
          weekData[log.date].female++;
        }
      }
    }
  });

  return Object.entries(weekData).map(([date, data]) => ({
    day: data.dayName,
    total: data.total,
    male: data.male,
    female: data.female
  }));
}

function processHourlyData(attendanceData, members) {
  const hourlyStats = {};

  // Initialize hourly buckets (7-22시, 1시간 단위)
  const timeSlots = [
    { label: '07시', start: 7, end: 8 },
    { label: '08시', start: 8, end: 9 },
    { label: '09시', start: 9, end: 10 },
    { label: '10시', start: 10, end: 11 },
    { label: '11시', start: 11, end: 12 },
    { label: '12시', start: 12, end: 13 },
    { label: '13시', start: 13, end: 14 },
    { label: '14시', start: 14, end: 15 },
    { label: '15시', start: 15, end: 16 },
    { label: '16시', start: 16, end: 17 },
    { label: '17시', start: 17, end: 18 },
    { label: '18시', start: 18, end: 19 },
    { label: '19시', start: 19, end: 20 },
    { label: '20시', start: 20, end: 21 },
    { label: '21시', start: 21, end: 22 },
    { label: '22시', start: 22, end: 23 }
  ];

  timeSlots.forEach(slot => {
    hourlyStats[slot.label] = { total: 0, male: 0, female: 0 };
  });

  // Process attendance records
  attendanceData.forEach(record => {
    const hour = parseInt(record.time.split(':')[0]);
    const member = members.find(m => m.id === record.userId);

    timeSlots.forEach(slot => {
      if (hour >= slot.start && hour < slot.end) {
        hourlyStats[slot.label].total++;
        if (member) {
          if (member.gender === '남') {
            hourlyStats[slot.label].male++;
          } else if (member.gender === '여') {
            hourlyStats[slot.label].female++;
          }
        }
      }
    });
  });

  return timeSlots.map(slot => ({
    hour: slot.label,
    total: hourlyStats[slot.label].total,
    male: hourlyStats[slot.label].male,
    female: hourlyStats[slot.label].female
  }));
}

function processDailyData(attendanceData, members) {
  const dailyStats = {};
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Initialize all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    dailyStats[day] = { total: 0, male: 0, female: 0 };
  }

  // Count attendance for each day of current month
  attendanceData.forEach(record => {
    const recordDate = new Date(record.date);
    if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
      const day = recordDate.getDate();
      dailyStats[day].total++;

      const member = members.find(m => m.id === record.userId);
      if (member) {
        if (member.gender === '남') {
          dailyStats[day].male++;
        } else if (member.gender === '여') {
          dailyStats[day].female++;
        }
      }
    }
  });

  return Object.entries(dailyStats).map(([day, data]) => ({
    day: `${day}일`,
    total: data.total,
    male: data.male,
    female: data.female
  }));
}

function processMonthlyData(attendanceData, members) {
  const monthlyStats = {};
  const today = new Date();

  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyStats[monthKey] = { total: 0, male: 0, female: 0 };
  }

  // Count attendance for each month
  attendanceData.forEach(record => {
    const recordDate = new Date(record.date);
    const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyStats.hasOwnProperty(monthKey)) {
      monthlyStats[monthKey].total++;

      const member = members.find(m => m.id === record.userId);
      if (member) {
        if (member.gender === '남') {
          monthlyStats[monthKey].male++;
        } else if (member.gender === '여') {
          monthlyStats[monthKey].female++;
        }
      }
    }
  });

  return Object.entries(monthlyStats).map(([month, data]) => {
    const [year, monthNum] = month.split('-');
    return {
      month: `${monthNum}월`,
      total: data.total,
      male: data.male,
      female: data.female
    };
  });
}

function processHourlyStatsForWeek(attendanceData, selectedWeekNum) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get week date range
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // Calculate weeks
  const weeks = [];
  let weekStart = new Date(firstDay);
  let weekNum = 1;

  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    if (weekEnd > lastDay) {
      weekEnd.setTime(lastDay.getTime());
    }

    weeks.push({
      weekNum,
      start: new Date(weekStart),
      end: new Date(weekEnd),
      days: Math.ceil((weekEnd - weekStart) / (1000 * 60 * 60 * 24)) + 1
    });

    weekStart.setDate(weekEnd.getDate() + 1);
    weekNum++;
  }

  // Determine which week to show
  let targetWeek;
  if (selectedWeekNum === null) {
    // Find current week
    const todayDate = new Date();
    targetWeek = weeks.find(w => todayDate >= w.start && todayDate <= w.end) || weeks[weeks.length - 1];
  } else {
    targetWeek = weeks.find(w => w.weekNum === selectedWeekNum) || weeks[0];
  }

  // Count attendance by hour for selected week
  const hourlyCount = {};
  attendanceData.forEach(record => {
    const recordDate = new Date(record.date);
    if (recordDate >= targetWeek.start && recordDate <= targetWeek.end) {
      const hour = parseInt(record.time.split(':')[0]);
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    }
  });

  const totalAttendance = Object.values(hourlyCount).reduce((sum, count) => sum + count, 0);

  // Show hours from 7 to 21 continuously
  const activeHours = [];
  for (let hour = 7; hour <= 21; hour++) {
    activeHours.push(hour);
  }

  const stats = activeHours.map(hour => {
    const count = hourlyCount[hour] || 0;
    const percentage = totalAttendance > 0 ? ((count / totalAttendance) * 100).toFixed(1) : '0.0';
    const average = (count / targetWeek.days).toFixed(1);

    return {
      hour: `${hour}시`,
      total: count,
      percentage,
      average
    };
  });

  return stats;
}

function processHourlyStats(attendanceData) {
  const hourlyCount = {};
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Count attendance by hour for current month
  attendanceData.forEach(record => {
    const recordDate = new Date(record.date);
    if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
      const hour = parseInt(record.time.split(':')[0]);
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    }
  });

  const totalAttendance = Object.values(hourlyCount).reduce((sum, count) => sum + count, 0);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create stats for each hour (6-23)
  const stats = [];
  for (let hour = 6; hour <= 23; hour++) {
    const count = hourlyCount[hour] || 0;
    const percentage = totalAttendance > 0 ? ((count / totalAttendance) * 100).toFixed(1) : '0.0';
    const average = (count / daysInMonth).toFixed(1);

    stats.push({
      hour: `${hour}시`,
      total: count,
      percentage,
      average
    });
  }

  return stats;
}

function processWeeklyStats(attendanceData) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get first and last day of current month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // Calculate weeks
  const weeks = [];
  let weekStart = new Date(firstDay);
  let weekNum = 1;

  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    if (weekEnd > lastDay) {
      weekEnd.setTime(lastDay.getTime());
    }

    // Count weekdays (Mon-Fri) only
    let weekdayCount = 0;
    let currentDate = new Date(weekStart);
    while (currentDate <= weekEnd) {
      const dayOfWeek = currentDate.getDay();
      // 0 = Sunday (exclude), 1-6 = Monday-Saturday (include)
      if (dayOfWeek !== 0) {
        weekdayCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    weeks.push({
      weekNum,
      start: new Date(weekStart),
      end: new Date(weekEnd),
      days: weekdayCount // Exclude only Sundays (Mon-Sat)
    });

    weekStart.setDate(weekEnd.getDate() + 1);
    weekNum++;
  }

  // Count attendance for each week
  const weekStats = weeks.map(week => {
    const count = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= week.start && recordDate <= week.end;
    }).length;

    return {
      ...week,
      total: count,
      average: (count / week.days).toFixed(1)
    };
  });

  const totalAttendance = weekStats.reduce((sum, week) => sum + week.total, 0);

  return weekStats.map(week => ({
    weekNum: week.weekNum,
    week: `${week.weekNum}주차`,
    total: week.total,
    days: week.days,
    average: week.average,
    percentage: totalAttendance > 0 ? ((week.total / totalAttendance) * 100).toFixed(1) : '0.0'
  }));
}

export default function App() {
  return (
    <MembershipProductProvider>
      <MemberProvider>
        <AttendanceProvider>
          <AppContent />
        </AttendanceProvider>
      </MemberProvider>
    </MembershipProductProvider>
  );
}
