import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineHome, HiOutlineUser, HiOutlineChatBubbleLeftRight,
    HiOutlineCalendarDays, HiOutlineBell, HiOutlineShieldCheck,
    HiOutlineArrowRightOnRectangle, HiOutlineNewspaper, HiOutlineAcademicCap,
    HiOutlineBriefcase, HiOutlineUsers, HiOutlineBookOpen, HiOutlineFolderOpen, HiOutlineCodeBracket,
    HiOutlineChartBar
} from 'react-icons/hi2';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderLinks = () => {
        if (user?.role === 'Admin') {
            const adminLinks = [
                { to: '/admin', icon: HiOutlineShieldCheck, label: 'Admin Dashboard' },
                { to: '/directory', icon: HiOutlineUsers, label: 'Directory' },
                { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' }
            ];
            return (
                <div className="space-y-1">
                    {adminLinks.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                            <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                            <span className="text-sm font-medium">{label}</span>
                        </NavLink>
                    ))}
                </div>
            );
        }

        const groups = [
            {
                title: 'MAIN',
                links: [
                    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
                    { to: '/mentoring', icon: HiOutlineAcademicCap, label: 'Mentorship' },
                    { to: '/sessions', icon: HiOutlineCalendarDays, label: 'Sessions' },
                    { to: '/directory', icon: HiOutlineUsers, label: 'Directory' },
                    { to: '/feed', icon: HiOutlineNewspaper, label: 'Social Feed' },
                    { to: '/chat', icon: HiOutlineChatBubbleLeftRight, label: 'Messages' }
                ]
            },
            {
                title: 'CAREER',
                links: [
                    { to: '/job-board', icon: HiOutlineBriefcase, label: 'Job Board' },
                    ...(user?.role === 'Student' ? [
                        { to: '/my-applications', icon: HiOutlineNewspaper, label: 'My Applications' },
                        { to: '/career', icon: HiOutlineChartBar, label: 'Career Planner' }
                    ] : [])
                ]
            },
            {
                title: 'COMMUNITY',
                links: [
                    { to: '/projects', icon: HiOutlineCodeBracket, label: 'Project Showcase' },
                    { to: '/interview-experiences', icon: HiOutlineBookOpen, label: 'Interview Experiences' },
                    { to: '/resources', icon: HiOutlineFolderOpen, label: 'Resource Hub' }
                ]
            },
            {
                title: 'ACCOUNT',
                links: [
                    { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
                    { to: '/profile', icon: HiOutlineUser, label: 'Profile' }
                ]
            }
        ];

        return groups.map((group, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">{group.title}</h3>
                <div className="space-y-0.5">
                    {group.links.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                            <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                            <span className="text-sm font-medium">{label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setIsOpen(false)} />}
            <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-50 shadow-sm transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-20 flex items-center justify-center">
                            <img src="/kongu-logo-v2.svg" alt="Logo" className="w-full h-auto object-contain" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight line-clamp-2">CampusBridge</h1>
                            <p className="text-[10px] text-primary font-bold tracking-wide uppercase mt-0.5">Connect • Learn • Grow</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    {renderLinks()}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-white">
                    <button onClick={handleLogout} className="sidebar-link w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 mt-auto cursor-pointer">
                        <HiOutlineArrowRightOnRectangle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
export default Sidebar;
