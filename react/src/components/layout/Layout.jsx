import React, { useState } from 'react';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Menu, Dumbbell, UserCog, CreditCard, MessageSquare, Zap } from 'lucide-react';



export default function Layout({ children, onNavigate, currentPage, onLogout }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigate = (page) => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 1. Global Header */}
            <header className="h-14 bg-blue-900 text-white fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 shadow-md">
                <div className="flex items-center space-x-3">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-1 hover:bg-blue-800 rounded"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu size={24} />
                    </button>
                    {/* Brand / Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="bg-white p-1 rounded-full text-blue-900">
                            <Dumbbell size={20} />
                        </div>
                        <div className="flex flex-col leading-none justify-center">
                            <h1 className="text-lg font-bold tracking-tight">리찬 핏</h1>
                            <span className="text-[10px] font-medium text-blue-200 tracking-wider">Lee-Chan Fit</span>
                        </div>
                    </div>
                </div>

                {/* Right Side Header Items */}
                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-2 text-sm">
                        <span className="text-blue-200">Coach Mode</span>
                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center font-bold">
                            C
                        </div>
                    </div>
                    {/* Mobile Settings simplified */}
                    <button className="md:hidden p-1" onClick={() => handleNavigate('settings')}><Settings size={20} /></button>
                </div>
            </header>

            <div className="flex flex-1 pt-14">
                {/* 2. Sidebar */}
                <aside className={`
                    fixed md:sticky top-14 left-0 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 overflow-y-auto
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
                        <nav className="space-y-1">
                            <NavItem
                                icon={<LayoutDashboard size={20} />}
                                label="대시보드"
                                active={currentPage === 'dashboard'}
                                onClick={() => handleNavigate('dashboard')}
                            />
                            <NavItem
                                icon={<Users size={20} />}
                                label="회원 관리"
                                active={currentPage === 'users'}
                                onClick={() => handleNavigate('users')}
                            />
                            <NavItem
                                icon={<Calendar size={20} />}
                                label="출석부"
                                active={currentPage === 'attendance'}
                                onClick={() => handleNavigate('attendance')}
                            />
                            <NavItem
                                icon={<LayoutDashboard size={20} />}
                                label="수업 스케줄"
                                active={currentPage === 'schedule'}
                                onClick={() => handleNavigate('schedule')}
                            />
                            <NavItem
                                icon={<Calendar size={20} />}
                                label="스케줄 조회"
                                active={currentPage === 'schedule-history'}
                                onClick={() => handleNavigate('schedule-history')}
                            />
                        </nav>
                    </div>

                    {/* Settings Section */}
                    <div className="p-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">설정</p>
                        <nav className="space-y-1">
                            <NavItem
                                icon={<UserCog size={20} />}
                                label="코치 관리"
                                active={currentPage === 'settings'}
                                onClick={() => handleNavigate('settings')}
                            />
                            <NavItem
                                icon={<Users size={20} />}
                                label="사용자 관리"
                                active={currentPage === 'admins'}
                                onClick={() => handleNavigate('admins')}
                            />
                            <NavItem
                                icon={<CreditCard size={20} />}
                                label="회원권 상품"
                                active={currentPage === 'products'}
                                onClick={() => handleNavigate('products')}
                            />
                            <NavItem
                                icon={<MessageSquare size={20} />}
                                label="메시지 템플릿"
                                active={currentPage === 'message-templates'}
                                onClick={() => handleNavigate('message-templates')}
                            />


                        </nav>
                    </div>

                    <div className="mt-auto p-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
                        <nav className="space-y-1">
                            <NavItem
                                icon={<Settings size={20} />}
                                label="설정"
                                active={currentPage === 'settings'}
                                onClick={() => handleNavigate('settings')}
                            />
                            <button
                                onClick={onLogout}
                                className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium text-sm">로그아웃</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* 3. Main Content Area */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50 min-h-[calc(100vh-3.5rem)] mb-20 md:mb-0">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Bottom Nav (Mobile Only) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <MobileNavItem
                    icon={<LayoutDashboard size={24} />}
                    label="홈"
                    active={currentPage === 'dashboard'}
                    onClick={() => onNavigate('dashboard')}
                />
                <MobileNavItem
                    icon={<Calendar size={24} />}
                    label="출석부"
                    active={currentPage === 'attendance' || currentPage === 'checkin'}
                    onClick={() => onNavigate('attendance')}
                />
                <MobileNavItem
                    icon={<Users size={24} />}
                    label="회원"
                    active={currentPage === 'users'}
                    onClick={() => onNavigate('users')}
                />
            </nav>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                ${active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
            `}
        >
            <span className={active ? 'text-blue-700' : 'text-gray-500'}>{icon}</span>
            <span>{label}</span>
        </button>
    );
}

function MobileNavItem({ icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center space-y-1 ${active ? 'text-blue-900 font-bold transform scale-105' : 'text-gray-400'}`}>
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}
