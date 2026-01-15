// Helper to calculate end date
const addMonths = (dateStr, months) => {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
};

// Coach Data
export const COACHES = [
    { id: 'C001', name: '이한민', phone: '010-1234-5678', status: 'active', specialty: 'FPT' },
    { id: 'C002', name: '김태훈', phone: '010-2345-6789', status: 'active', specialty: 'PT' },
    { id: 'C003', name: '박서연', phone: '010-3456-7890', status: 'active', specialty: 'Group' },
    { id: 'C004', name: '최민수', phone: '010-4567-8901', status: 'inactive', specialty: 'FPT' },
];

export const USERS = [
    // 1. Existing sample data (preserved/updated)
    // 2. Transcribed data from screenshot (Representative sample)
    { id: '101', name: '이동준', gender: '남', phone: '010-7197-0310', type: 'FPT', regMonths: 6, regDate: '2023-06-25', startDate: '2023-06-26', endDate: '2023-12-25', remaining: 0 },
    { id: '102', name: '심희섭', gender: '남', phone: '010-6405-1779', type: 'FPT', regMonths: 6, regDate: '2023-06-26', startDate: '2023-11-21', endDate: '2024-05-19', remaining: 20 },
    { id: '103', name: '최지우', gender: '남', phone: '010-4703-7598', type: 'FPT', regMonths: 12, regDate: '2023-06-26', startDate: '2023-11-01', endDate: '2024-09-15', remaining: 45 },
    { id: '104', name: '하민우', gender: '남', phone: '010-5873-5847', type: 'FPT', regMonths: 6, regDate: '2023-06-27', startDate: '2023-07-21', endDate: '2024-01-20', remaining: 12 },
    { id: '105', name: '임유린', gender: '남', phone: '010-5238-4621', type: 'FPT', regMonths: 12, regDate: '2023-06-27', startDate: '2023-07-21', endDate: '2024-07-20', remaining: 100 },
    { id: '106', 'name': '이소영', 'gender': '여', 'phone': '010-5873-5484', 'type': 'FPT', 'regMonths': 0, 'regDate': '2023-06-30', 'startDate': '2023-07-21', 'endDate': '2024-04-30', 'remaining': 5 },
    { id: '107', 'name': '이지민', 'gender': '여', 'phone': '010-8977-8644', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-06-30', 'startDate': '2023-09-01', 'endDate': '2024-08-31', 'remaining': 80 },
    { id: '108', 'name': '박원호', 'gender': '남', 'phone': '010-8973-2761', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-01', 'startDate': '2023-07-21', 'endDate': '2024-02-01', 'remaining': 15 },
    { id: '109', 'name': '정용원', 'gender': '남', 'phone': '010-9885-5271', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-01', 'startDate': '2023-07-21', 'endDate': '2024-01-20', 'remaining': 22 },
    { id: '110', 'name': '임채린', 'gender': '여', 'phone': '010-2553-1381', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-01', 'startDate': '2023-09-05', 'endDate': '2024-09-05', 'remaining': 110 },
    { id: '111', 'name': '황수니', 'gender': '여', 'phone': '010-5457-6451', 'type': 'FPT', 'regMonths': 10, 'regDate': '2023-07-02', 'startDate': '2023-07-21', 'endDate': '2024-05-15', 'remaining': 30 },
    { id: '112', 'name': '박지니', 'gender': '여', 'phone': '010-2940-0341', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-03', 'startDate': '2023-07-21', 'endDate': '2024-09-30', 'remaining': 90 },
    { id: '113', 'name': '지재훈', 'gender': '남', 'phone': '010-4932-6076', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-03', 'startDate': '2023-07-21', 'endDate': '2024-10-30', 'remaining': 365 }, // Assuming year
    { id: '114', 'name': '오현준', 'gender': '남', 'phone': '010-4849-6592', 'type': 'FPT', 'regMonths': 0, 'regDate': '2023-07-04', 'startDate': '2023-07-21', 'endDate': '2023-12-30', 'remaining': 20 },
    { id: '115', 'name': '정동혁', 'gender': '남', 'phone': '010-3496-9164', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-04', 'startDate': '2023-07-21', 'endDate': '2024-01-31', 'remaining': 40 },
    { id: '116', 'name': '박원선', 'gender': '여', 'phone': '010-4539-8566', 'type': 'FPT', 'regMonths': 0, 'regDate': '2023-07-04', 'startDate': '2023-11-08', 'endDate': '2024-05-07', 'remaining': 10 },
    { id: '117', 'name': '이유림', 'gender': '여', 'phone': '010-7523-1381', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-05', 'startDate': '2023-07-21', 'endDate': '2024-07-21', 'remaining': 150 },
    { id: '118', 'name': '박유진', 'gender': '여', 'phone': '010-2821-5590', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-06', 'startDate': '2023-07-21', 'endDate': '2027-07-20', 'remaining': 300 }, // Long term?
    { id: '119', 'name': '김수진', 'gender': '여', 'phone': '010-8509-6469', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-06', 'startDate': '2023-07-21', 'endDate': '2024-07-20', 'remaining': 95 },
    { id: '120', 'name': '설동훈', 'gender': '남', 'phone': '010-2859-6100', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-10', 'startDate': '2023-09-05', 'endDate': '2024-03-04', 'remaining': 30 },
    { id: '121', 'name': '강세준', 'gender': '남', 'phone': '010-4099-5246', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-12', 'startDate': '2023-11-28', 'endDate': '2024-05-27', 'remaining': 45 },
    { id: '122', 'name': '정진우', 'gender': '남', 'phone': '010-3731-0495', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-13', 'startDate': '2023-07-23', 'endDate': '2024-11-30', 'remaining': 200 },
    { id: '123', 'name': '전다솜', 'gender': '여', 'phone': '010-8208-5178', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-14', 'startDate': '2023-07-23', 'endDate': '2024-01-31', 'remaining': 0 },
    { id: '124', 'name': '최민지', 'gender': '여', 'phone': '010-4541-0260', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-14', 'startDate': '2023-07-28', 'endDate': '2024-01-21', 'remaining': 10 },
    { id: '125', 'name': '차혜진', 'gender': '여', 'phone': '010-4154-0350', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-15', 'startDate': '2023-07-21', 'endDate': '2024-04-17', 'remaining': 30 },
    { id: '126', 'name': '권원진', 'gender': '남', 'phone': '010-8098-5353', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-16', 'startDate': '2023-11-04', 'endDate': '2024-11-03', 'remaining': 180 },
    { id: '127', 'name': '손영식', 'gender': '남', 'phone': '010-2387-6300', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-16', 'startDate': '2023-07-21', 'endDate': '2024-07-24', 'remaining': 240 },
    { id: '128', 'name': '구본준', 'gender': '남', 'phone': '010-9551-3261', 'type': 'FPT', 'regMonths': 12, 'regDate': '2023-07-18', 'startDate': '2023-07-21', 'endDate': '2024-09-03', 'remaining': 150 },
    { id: '129', 'name': '허성훈', 'gender': '남', 'phone': '010-7463-5004', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-18', 'startDate': '2023-07-21', 'endDate': '2024-01-22', 'remaining': 20 },
    { id: '130', 'name': '최승우', 'gender': '남', 'phone': '010-2710-5155', 'type': 'FPT', 'regMonths': 6, 'regDate': '2023-07-21', 'startDate': '2023-08-21', 'endDate': '2024-02-20', 'remaining': 40 },
    // Adding more recent ones to ensure "This Month" views have data if testing with current date
    { id: '201', 'name': '김현재', 'gender': '남', 'phone': '010-1111-2222', 'type': 'PT', 'regMonths': 3, 'regDate': '2026-01-10', 'startDate': '2026-01-10', 'endDate': '2026-04-10', 'remaining': 30 },
    { id: '202', 'name': '이미래', 'gender': '여', 'phone': '010-3333-4444', 'type': 'General', 'regMonths': 1, 'regDate': '2026-01-05', 'startDate': '2026-01-05', 'endDate': '2026-02-05', 'remaining': 15 },
    { id: '203', 'name': '박과거', 'gender': '남', 'phone': '010-5555-6666', 'type': 'Group', 'regMonths': 12, 'regDate': '2025-02-01', 'startDate': '2025-02-01', 'endDate': '2026-01-31', 'remaining': 5 }, // Expiring this month
];

const generateRecentAttendance = () => {
    const logs = [];
    const today = new Date();
    const sampleUsers = USERS.slice(0, 20); // Use first 20 for attendance

    // Generate logs for the last 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Random number of attendees per day (10 to 20)
        const count = Math.floor(Math.random() * 11) + 10;

        for (let j = 0; j < count; j++) {
            const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
            logs.push({
                id: `${dateStr}-${j}`,
                userId: user.id,
                userName: user.name,
                userType: user.type,
                date: dateStr,
                time: `${Math.floor(Math.random() * 14) + 7}:00`,
                status: 'Present'
            });
        }
    }
    return logs.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
};

export const MOCK_ATTENDANCE = generateRecentAttendance();
