import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineHome, HiOutlineUser, HiOutlineChatBubbleLeftRight,
    HiOutlineCalendarDays, HiOutlineBell, HiOutlineShieldCheck,
    HiOutlineArrowRightOnRectangle, HiOutlineNewspaper, HiOutlineAcademicCap,
    HiOutlineBriefcase, HiOutlineUsers, HiOutlineBookOpen, HiOutlineFolderOpen, HiOutlineCodeBracket,
    HiOutlineChartBar
} from 'react-icons/hi2';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    let links = [];

    if (user?.role === 'Admin') {
        links = [
            { to: '/admin', icon: HiOutlineShieldCheck, label: 'Admin Dashboard' },
            { to: '/directory', icon: HiOutlineUsers, label: 'Directory' },
            { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' }
        ];
    } else {
        links = [
            { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
            { to: '/mentoring', icon: HiOutlineAcademicCap, label: 'Mentorship' },
            { to: '/directory', icon: HiOutlineUsers, label: 'Directory' },
            { to: '/feed', icon: HiOutlineNewspaper, label: 'Social Feed' },
            { to: '/chat', icon: HiOutlineChatBubbleLeftRight, label: 'Messages' },
            { to: '/job-board', icon: HiOutlineBriefcase, label: 'Job Board' },
            ...(user?.role === 'Student' ? [
                { to: '/my-applications', icon: HiOutlineNewspaper, label: 'My Applications' },
                { to: '/career', icon: HiOutlineChartBar, label: 'Career Planner' }
            ] : []),
            { to: '/projects', icon: HiOutlineCodeBracket, label: 'Project Showcase' },
            { to: '/interview-experiences', icon: HiOutlineBookOpen, label: 'Interview Experiences' },
            { to: '/resources', icon: HiOutlineFolderOpen, label: 'Resource Hub' },
            { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
            { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
        ];
    }

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-50 shadow-sm">
            {/* Logo */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight line-clamp-2" title={user?.collegeName || 'CampusBridge'}>
                            {user?.role === 'Admin' ? 'CampusBridge Admin' : (user?.collegeName || 'CampusBridge')}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                            {user?.role === 'Admin' ? 'Platform Control' : 'CampusBridge Network'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            isActive ? 'sidebar-link-active' : 'sidebar-link'
                        }
                    >
                        <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-sm font-medium">{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/10">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">{user?.role}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer">
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
