/**
 * Calculate days since last attendance for a member
 */
export function getDaysSinceLastVisit(memberId, attendanceRecords) {
    const memberRecords = attendanceRecords
        .filter(record => record.userId === memberId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (memberRecords.length === 0) {
        return Infinity; // Never visited
    }

    const lastVisit = new Date(memberRecords[0].date);
    const today = new Date();
    const diffTime = Math.abs(today - lastVisit);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Calculate weekly average visits for a time period
 */
function getWeeklyAverage(memberId, attendanceRecords, weeksAgo, weekCount) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (weeksAgo + weekCount) * 7);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() - weeksAgo * 7);

    const visits = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return record.userId === memberId && recordDate >= startDate && recordDate <= endDate;
    });

    return visits.length / weekCount;
}

/**
 * Detect weekly attendance drop (주 평균 방문 50% 이하 감소)
 */
function detectWeeklyDrop(memberId, attendanceRecords) {
    const recentAvg = getWeeklyAverage(memberId, attendanceRecords, 0, 2); // Last 2 weeks
    const previousAvg = getWeeklyAverage(memberId, attendanceRecords, 2, 4); // Previous 4 weeks

    // If previously visited 3+ times per week, now 1 or less
    return previousAvg >= 3 && recentAvg <= 1;
}

/**
 * Get days until membership expiration
 */
function getDaysUntilExpiry(endDate) {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Detect expiration risk (회원권 만료 임박 + 저조한 방문)
 */
function detectExpirationRisk(member, attendanceRecords) {
    const daysUntilExpiry = getDaysUntilExpiry(member.endDate);

    // Less than 14 days until expiry
    if (daysUntilExpiry >= 14 || daysUntilExpiry < 0) return false;

    // Check recent visits (last 14 days)
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentVisits = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return record.userId === member.id && recordDate >= twoWeeksAgo;
    });

    // Less than 2 visits in last 2 weeks
    return recentVisits.length < 2;
}

/**
 * Calculate risk level for a member
 * Returns: { level: 'none'|'caution'|'warning'|'danger', reason: string }
 */
export function getMemberRiskLevel(member, attendanceRecords) {
    const daysSinceVisit = getDaysSinceLastVisit(member.id, attendanceRecords);
    const isExpired = new Date(member.endDate) < new Date();

    // Skip expired members
    if (isExpired) {
        return { level: 'none', reason: '만료된 회원' };
    }

    // RED: 14+ days consecutive absence
    if (daysSinceVisit >= 14) {
        return {
            level: 'danger',
            reason: `연속 ${daysSinceVisit}일 결석`,
            action: '파격적인 재등록 혜택 또는 휴면 방지 프로모션 제안'
        };
    }

    // ORANGE: Weekly drop
    if (detectWeeklyDrop(member.id, attendanceRecords)) {
        return {
            level: 'warning',
            reason: '주 평균 방문 50% 이하 감소',
            action: '코치가 직접 1:1 상담 또는 PT 체험 제안'
        };
    }

    // YELLOW: 7+ days absence
    if (daysSinceVisit >= 7) {
        return {
            level: 'caution',
            reason: `마지막 출석 ${daysSinceVisit}일 경과`,
            action: '"운동하고 오세요" 안부 알림톡 발송'
        };
    }

    return { level: 'none', reason: '정상' };
}

/**
 * Get members at risk with categorized risk levels
 */
export function getChurnRiskMembers(members, attendanceRecords) {
    const today = new Date();

    return members
        .filter(member => {
            // Only check active members (not expired)
            const endDate = new Date(member.endDate);
            return endDate >= today;
        })
        .map(member => {
            const riskLevel = getMemberRiskLevel(member, attendanceRecords);
            return {
                ...member,
                daysSinceVisit: getDaysSinceLastVisit(member.id, attendanceRecords),
                lastVisit: getLastVisitDate(member.id, attendanceRecords),
                riskLevel: riskLevel.level,
                riskReason: riskLevel.reason,
                recommendedAction: riskLevel.action
            };
        })
        .filter(member => member.riskLevel !== 'none')
        .sort((a, b) => {
            // Sort by risk level: danger > warning > caution
            const levelOrder = { danger: 3, warning: 2, caution: 1 };
            return levelOrder[b.riskLevel] - levelOrder[a.riskLevel];
        });
}

/**
 * Get categorized risk members
 */
export function getCategorizedRiskMembers(members, attendanceRecords) {
    const riskMembers = getChurnRiskMembers(members, attendanceRecords);

    return {
        caution: riskMembers.filter(m => m.riskLevel === 'caution'),
        warning: riskMembers.filter(m => m.riskLevel === 'warning'),
        danger: riskMembers.filter(m => m.riskLevel === 'danger')
    };
}

/**
 * Get last visit date for a member
 */
export function getLastVisitDate(memberId, attendanceRecords) {
    const memberRecords = attendanceRecords
        .filter(record => record.userId === memberId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return memberRecords.length > 0 ? memberRecords[0].date : null;
}

/**
 * Get engagement message templates based on risk level
 */
export function getMessageTemplates(memberName, daysSinceVisit, riskLevel = 'caution') {
    const templates = {
        caution: [
            {
                id: 1,
                title: '가벼운 격려',
                content: `안녕하세요 ${memberName}님! 요즘 바쁘신가요? 😊 ${daysSinceVisit}일째 뵙지 못했네요. 건강 관리는 꾸준함이 중요하니 시간 되실 때 꼭 들러주세요!`
            }
        ],
        warning: [
            {
                id: 1,
                title: '1:1 상담 제안',
                content: `${memberName}님, 안녕하세요! 최근 방문 횟수가 줄어든 것 같아 걱정되어 연락드렸어요. 혹시 운동 목표나 일정에 변화가 있으신가요? 편한 시간에 상담 한번 하시죠!`
            },
            {
                id: 2,
                title: 'PT 체험 제안',
                content: `${memberName}님께 특별히 무료 PT 체험권을 드리고 싶어요! 새로운 자극으로 다시 운동의 재미를 느껴보시는 건 어떨까요?`
            }
        ],
        danger: [
            {
                id: 1,
                title: '특별 혜택 제안',
                content: `${memberName}님, 오랜만입니다! 회원님만을 위한 특별 재등록 혜택을 준비했어요. 지금 등록하시면 [특별 할인/추가 개월] 혜택을 드립니다!`
            },
            {
                id: 2,
                title: '휴면 방지',
                content: `${memberName}님, 벌써 ${daysSinceVisit}일이 지났네요. 건강이 걱정됩니다. 다시 시작하시는 데 도움이 필요하시면 언제든 연락주세요. 함께 목표를 이뤄가요!`
            }
        ]
    };

    return templates[riskLevel] || templates.caution;
}
