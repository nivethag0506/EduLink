import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    HiOutlineAcademicCap, HiOutlineVideoCamera, HiOutlineMicrophone, 
    HiOutlineClock, HiOutlineCalendar, HiOutlineXCircle, HiOutlineCheckCircle,
    HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineBan, HiOutlinePlus,
    HiOutlineSearch, HiOutlineAdjustmentsHorizontal, HiOutlineChevronRight,
    HiCheckBadge, HiEllipsisVertical, HiOutlineCalendarDays
} from 'react-icons/hi2';
import { format } from 'date-fns';

const STATUS_COLORS = {
    pending: 'text-amber-600 bg-amber-50 border-amber-100',
    accepted: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rejected: 'text-rose-600 bg-rose-50 border-rose-100',
    completed: 'text-purple-600 bg-purple-50 border-purple-100',
};

const Mentoring = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [acceptModalId, setAcceptModalId] = useState(null);
    const [acceptDate, setAcceptDate] = useState('');
    const [acceptTime, setAcceptTime] = useState('');

    const [rejectModalId, setRejectModalId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const isMentor = ['Senior', 'Alumni'].includes(user?.role);

    const fetchRequests = async () => {
        try {
            const { data } = await API.get('/mentoring');
            setRequests(data);
        } catch {
            toast.error('Failed to load mentoring sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const openAcceptModal = (reqId) => {
        setAcceptDate('');
        setAcceptTime('');
        setAcceptModalId(reqId);
    };

    const submitAccept = async () => {
        if (!acceptDate || !acceptTime) return toast.error('Please enter both date and time');
        try {
            await API.put(`/mentoring/${acceptModalId}/accept`, { scheduledDate: acceptDate, scheduledTime: acceptTime });
            toast.success('Session scheduled! Meeting link generated.');
            setAcceptModalId(null);
            fetchRequests();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const openRejectModal = (reqId) => {
        setRejectReason('');
        setRejectModalId(reqId);
    };

    const submitReject = async () => {
        if (!rejectReason.trim()) return toast.error('Please enter a reason');
        try {
            await API.put(`/mentoring/${rejectModalId}/reject`, { reason: rejectReason });
            toast.success('Session declined.');
            setRejectModalId(null);
            fetchRequests();
        } catch (err) { toast.error('Failed to decline'); }
    };

    const handleComplete = async (reqId) => {
        if (!window.confirm('Mark this session as completed?')) return;
        try {
            await API.put(`/mentoring/${reqId}/complete`);
            toast.success('Session marked as completed.');
            fetchRequests();
        } catch (err) { toast.error('Failed to complete session'); }
    };

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const acceptedCount = requests.filter(r => r.status === 'accepted').length;
    const completedCount = requests.filter(r => r.status === 'completed').length;
    const rejectedCount = requests.filter(r => r.status === 'rejected').length;
    const upcomingCount = acceptedCount; // For now, we consider accepted as upcoming

    const upcomingSessions = requests.filter(r => r.status === 'accepted' && r.scheduledDate).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    const filtered = requests.filter(r => {
        if (tab === 'pending') return r.status === 'pending';
        if (tab === 'accepted') return r.status === 'accepted';
        if (tab === 'rejected') return r.status === 'rejected';
        if (tab === 'completed') return r.status === 'completed';
        if (tab === 'upcoming') return r.status === 'accepted';
        if (tab === 'as_student') return r.studentId?._id === user?._id;
        return true;
    }).filter(r => {
        if (!searchQuery) return true;
        const other = r.mentorId?._id === user?._id ? r.studentId : r.mentorId;
        const searchLower = searchQuery.toLowerCase();
        return other?.name?.toLowerCase().includes(searchLower) || r.topic?.toLowerCase().includes(searchLower);
    });

    if (loading) return <div className="text-center py-20 text-slate-500">Loading sessions...</div>;

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 space-y-8 text-slate-800 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mentorship</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your mentoring requests and sessions all in one place.</p>
                </div>
                <button className="btn-primary bg-primary hover:bg-[#5b21b6] transition-all hover:-translate-y-0.5 active:scale-[0.98] text-sm py-2.5 px-6 rounded-xl shadow-lg shadow-primary/25 flex items-center gap-2 border-0 cursor-pointer text-white font-medium">
                    <HiOutlinePlus className="w-4 h-4" /> Request Mentoring
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { title: 'Pending Requests', count: pendingCount, desc: 'Waiting for response', icon: HiOutlineUserGroup, color: 'text-primary' },
                    { title: 'Accepted', count: acceptedCount, desc: 'Mentors connected', icon: HiOutlineShieldCheck, color: 'text-emerald-500' },
                    { title: 'Upcoming Sessions', count: upcomingCount, desc: 'Scheduled sessions', icon: HiOutlineCalendarDays, color: 'text-blue-500' },
                    { title: 'Completed', count: completedCount, desc: 'Sessions completed', icon: HiOutlineAcademicCap, color: 'text-purple-600' },
                    { title: 'Rejected', count: rejectedCount, desc: 'Requests declined', icon: HiOutlineBan, color: 'text-rose-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-500">{stat.title}</p>
                                <h3 className="text-3xl font-extrabold text-slate-900">{stat.count}</h3>
                            </div>
                            <stat.icon className={`w-6 h-6 ${stat.color} opacity-80`} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-3 flex items-center gap-1"><HiOutlineClock className="w-3 h-3" /> {stat.desc}</p>
                    </div>
                ))}
            </div>

            {/* Main Layout */}
            <div className="flex flex-col xl:flex-row gap-8 items-start">
                
                {/* Left Column: List */}
                <div className="flex-1 w-full space-y-6">
                    {/* Controls Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex gap-1 overflow-x-auto w-full md:w-auto hide-scrollbar p-1">
                            {['all', 'pending', 'accepted', 'upcoming', 'completed', 'rejected', 'as_student'].map(t => (
                                <button key={t} onClick={() => setTab(t)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 capitalize cursor-pointer whitespace-nowrap ${tab === t ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                                    {t.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto px-2 pb-2 md:pb-0 md:pr-2">
                            <div className="relative w-full md:w-64">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input type="text" placeholder="Search people, topics..." 
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400" />
                            </div>
                            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all hover:scale-[0.98] cursor-pointer">
                                Sort by: Recent <HiOutlineChevronRight className="w-3 h-3 rotate-90" />
                            </button>
                            <button className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all hover:scale-[0.98] cursor-pointer shrink-0">
                                <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-900">Mentoring Requests & Sessions</h2>
                        </div>
                        
                        <div className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <div className="text-center py-20 px-6">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <HiOutlineUserGroup className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-slate-800 font-bold mb-2">No mentoring sessions yet</h3>
                                    <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">Connect with experienced alumni and start your mentoring journey to achieve your goals.</p>
                                    <button className="btn-primary bg-primary hover:bg-[#5b21b6] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-primary/20 cursor-pointer">
                                        Find a Mentor
                                    </button>
                                </div>
                            ) : (
                                filtered.map(r => {
                                    const isMyRequest = r.mentorId?._id === user?._id;
                                    const other = isMyRequest ? r.studentId : r.mentorId;
                                    const skills = other?.skills || [];
                                    
                                    return (
                                        <div key={r._id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center gap-6">
                                            {/* User Info */}
                                            <div className="flex items-center gap-4 min-w-[240px]">
                                                <div className="relative">
                                                    <img
                                                        src={other?.profilePhoto ? `/${other.profilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6366f1&color=fff`}
                                                        className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-100"
                                                        alt=""
                                                    />
                                                    {other?.role !== 'Student' && (
                                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                            <HiCheckBadge className="w-4 h-4 text-blue-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                                        {other?.name || 'Unknown User'}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{other?.currentJob || other?.role || 'Member'}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                                                        Alumni • {other?.graduationYear || '2024'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Expertise */}
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 font-semibold mb-2">EXPERTISE / TOPIC</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {skills.slice(0, 3).map((s, i) => (
                                                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold">
                                                            {s}
                                                        </span>
                                                    ))}
                                                    {skills.length === 0 && (
                                                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold truncate max-w-[150px]">
                                                            {r.topic}
                                                        </span>
                                                    )}
                                                    {skills.length > 3 && (
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold">
                                                            +{skills.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Request Date */}
                                            <div className="min-w-[120px]">
                                                <p className="text-[10px] text-slate-400 font-semibold mb-1">REQUESTED ON</p>
                                                <p className="text-xs font-semibold text-slate-700">
                                                    {new Date(r.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <div className="min-w-[100px]">
                                                <p className="text-[10px] text-slate-400 font-semibold mb-1">STATUS</p>
                                                <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[r.status]}`}>
                                                    {r.status}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 min-w-[130px] items-end">
                                                {r.status === 'pending' && r.mentorId?._id === user?._id ? (
                                                    <>
                                                        <button onClick={() => openAcceptModal(r._id)} className="w-full text-center px-4 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-emerald-100 hover:border-emerald-500">
                                                            Accept
                                                        </button>
                                                        <button onClick={() => openRejectModal(r._id)} className="w-full text-center px-4 py-1.5 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200">
                                                            Decline
                                                        </button>
                                                    </>
                                                ) : r.status === 'accepted' ? (
                                                    <>
                                                        <a href={`/call/${r.meetLink?.split('/').pop()}`} className="w-full text-center px-4 py-1.5 bg-primary text-white hover:bg-primary-dark rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm">
                                                            Join Call
                                                        </a>
                                                        {r.mentorId?._id === user?._id && (
                                                            <button onClick={() => handleComplete(r._id)} className="w-full text-center px-4 py-1.5 bg-white text-slate-500 hover:bg-slate-50 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border border-slate-200">
                                                                Mark Complete
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <a href={`/profile/${other?._id}`} className="w-full text-center px-4 py-1.5 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                                                        View Profile
                                                    </a>
                                                )}
                                                {r.status === 'rejected' && r.rejectionReason && (
                                                    <button onClick={() => toast(r.rejectionReason, { icon: 'ℹ️' })} className="w-full text-center px-4 py-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-lg text-[10px] font-bold transition-colors cursor-pointer">
                                                        View Reason
                                                    </button>
                                                )}
                                            </div>

                                            {/* Menu */}
                                            <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                                                <HiEllipsisVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full xl:w-[320px] shrink-0 space-y-6">
                    {/* Upcoming Sessions Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400"></div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <HiOutlineCalendarDays className="w-5 h-5 text-primary" /> Upcoming Sessions
                            </h3>
                            <button className="text-[10px] font-bold text-primary hover:underline cursor-pointer">View Calendar</button>
                        </div>

                        {upcomingSessions.length === 0 ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <HiOutlineCalendar className="w-8 h-8 text-blue-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-800">No upcoming sessions</p>
                                <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">You don't have any sessions scheduled right now.</p>
                                <button className="w-full btn-primary bg-primary hover:bg-[#5b21b6] text-white py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-transform hover:-translate-y-0.5 border-0">
                                    Find a Mentor
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingSessions.slice(0, 2).map((session, idx) => {
                                    const other = session.mentorId?._id === user?._id ? session.studentId : session.mentorId;
                                    const roomName = session.meetLink?.split('/').pop();
                                    return (
                                        <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-primary/30 transition-colors">
                                            <div className="flex items-center gap-3 mb-3">
                                                <img src={other?.profilePhoto ? `/${other.profilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6366f1&color=fff`} alt="" className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{other?.name}</p>
                                                    <p className="text-[10px] font-semibold text-slate-500">{session.topic}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-3 bg-white p-2 rounded-lg border border-slate-100">
                                                <span className="flex items-center gap-1 text-primary"><HiOutlineCalendar className="w-3.5 h-3.5" /> {session.scheduledDate ? format(new Date(session.scheduledDate), 'MMM dd, yyyy') : 'TBD'}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" /> {session.scheduledTime || 'TBD'}</span>
                                            </div>
                                            <a href={`/call/${roomName}`} className="block text-center w-full bg-primary hover:bg-[#5b21b6] text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                                                Join Video Call
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Mentoring Journey */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                        <h3 className="text-sm font-bold text-slate-900 mb-6">Mentoring Journey</h3>
                        
                        <div className="space-y-0 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {[
                                { num: 1, title: 'Connect', desc: 'Send a mentoring request', active: true },
                                { num: 2, title: 'Accept', desc: 'Mentor accepts your request', active: false },
                                { num: 3, title: 'Schedule', desc: 'Plan your mentoring session', active: false },
                                { num: 4, title: 'Meet & Learn', desc: 'Have meaningful discussions', active: false },
                                { num: 5, title: 'Grow Together', desc: 'Achieve your goals', active: false },
                            ].map((step, idx) => (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-2">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-500 text-xs font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                        {step.active ? (
                                            <div className="w-full h-full bg-primary rounded-full flex items-center justify-center text-white">{step.num}</div>
                                        ) : (
                                            step.num
                                        )}
                                    </div>
                                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-2xl hover:bg-slate-50 transition-colors ml-4 md:ml-0">
                                        <h4 className={`text-xs font-bold ${step.active ? 'text-primary' : 'text-slate-700'}`}>{step.title}</h4>
                                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors text-xs font-bold cursor-pointer">
                            <HiOutlineAcademicCap className="w-4 h-4" /> How it works?
                        </button>
                    </div>

                </div>
            </div>

            {/* Accept Modal */}
            {acceptModalId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-fade-in-up">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Schedule Session</h3>
                        <p className="text-xs text-slate-500 mb-4">Set the date and time for this mentoring session. A private meeting link will be generated automatically.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    value={acceptDate} 
                                    onChange={e => setAcceptDate(e.target.value)} 
                                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                                <input 
                                    type="time" 
                                    value={acceptTime} 
                                    onChange={e => setAcceptTime(e.target.value)} 
                                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button onClick={() => setAcceptModalId(null)} className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent">Cancel</button>
                            <button onClick={submitAccept} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer border-none">Schedule</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-fade-in-up">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Decline Request</h3>
                        <p className="text-xs text-slate-500 mb-4">Please provide a brief reason for declining this mentoring request.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
                                <textarea 
                                    value={rejectReason} 
                                    onChange={e => setRejectReason(e.target.value)} 
                                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px] resize-none" 
                                    placeholder="e.g. Currently booked, topic out of scope..." 
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button onClick={() => setRejectModalId(null)} className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent">Cancel</button>
                            <button onClick={submitReject} className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer border-none">Decline Session</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mentoring;
