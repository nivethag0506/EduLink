import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/getImageUrl';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchModal from './SearchModal';
import { HiOutlineMagnifyingGlass, HiOutlineBars3, HiOutlineBellAlert, HiOutlineChatBubbleLeftRight, HiOutlineUserCircle } from 'react-icons/hi2';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Layout = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { socket } = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
            }
            if (e.key === 'Escape') setShowSearch(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (!socket) return;
        
        socket.on('newReferral', (data) => {
            toast.success(`New referral from ${data.postedBy}: ${data.title} at ${data.company}`, {
                icon: '💼',
                duration: 5000,
            });
        });

        socket.on('referralStatusUpdate', (data) => {
            toast.success(data.message, {
                icon: '🎉',
                duration: 6000,
            });
        });

        return () => {
            socket.off('newReferral');
            socket.off('referralStatusUpdate');
        };
    }, [socket]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 md:ml-64 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden"
                    >
                        <HiOutlineBars3 className="w-6 h-6" />
                    </button>
                    
                    <div className="flex-1 flex justify-between items-center ml-2">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="flex items-center gap-2.5 text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-100 rounded-[14px] px-4 py-2 text-sm transition-all duration-300 shadow-sm cursor-pointer w-full max-w-md"
                            title="Search people (Ctrl+K)"
                        >
                            <HiOutlineMagnifyingGlass className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium flex-1 text-left">Search people, jobs, projects, resources...</span>
                            <kbd className="hidden sm:inline-block ml-2 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 font-mono text-slate-500">Ctrl K</kbd>
                        </button>
                        
                        <div className="flex items-center gap-2 md:gap-4 ml-4">
                            <Link to="/chat" className="relative p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
                                <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
                            </Link>
                            <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
                                <HiOutlineBellAlert className="w-6 h-6" />
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            </Link>
                            <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name || 'Student'}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{user?.role || 'User'}</p>
                                </div>
                                <img 
                                    src={user?.profilePhoto ? getImageUrl(user.profilePhoto) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'S')}&background=6366f1&color=fff`} 
                                    alt="Profile" 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    <div className="max-w-6xl mx-auto animate-fade-in w-full">
                        <Outlet />
                    </div>
                </main>
            </div>

            {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
        </div>
    );
};

export default Layout;
