import { useState, useEffect } from 'react';
import API from '../api/axios';
import { HiOutlineBell } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Notifications = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ notifications: [], unreadCount: 0 });
    const [followRequests, setFollowRequests] = useState([]);
    const [mentoringRequests, setMentoringRequests] = useState([]);

    useEffect(() => {
        API.get('/notifications').then(res => setData(res.data)).catch(() => { });
        API.get('/users/profile').then(res => setFollowRequests(res.data.followRequests || [])).catch(() => { });
        if (['Senior', 'Alumni'].includes(user?.role)) {
            API.get('/mentoring').then(res => {
                setMentoringRequests(res.data.filter(r => r.status === 'pending' && r.mentorId._id === user._id));
            }).catch(() => { });
        }
    }, [user]);

    const markRead = async () => {
        await API.put('/notifications/read');
        setData({ ...data, unreadCount: 0, notifications: data.notifications.map(n => ({ ...n, isRead: true })) });
    };

    const handleAcceptFollow = async (id) => {
        try {
            await API.post(`/users/${id}/accept-follow`);
            setFollowRequests(followRequests.filter(f => f._id !== id));
            toast.success("Connection Accepted");
        } catch (err) { toast.error("Error accepting"); }
    };

    const handleRejectFollow = async (id) => {
        try {
            await API.post(`/users/${id}/reject-follow`);
            setFollowRequests(followRequests.filter(f => f._id !== id));
            toast.success("Connection Rejected");
        } catch (err) { toast.error("Error rejecting"); }
    };

    const handleAcceptMentoring = async (reqId) => {
        const date = prompt("Enter Date for Session (YYYY-MM-DD):");
        if (!date) return;
        const time = prompt("Enter Time for Session (HH:MM AM/PM):");
        if (!time) return;

        try {
            await API.put(`/mentoring/${reqId}/accept`, { scheduledDate: date, scheduledTime: time });
            setMentoringRequests(mentoringRequests.filter(m => m._id !== reqId));
            toast.success("Mentoring Session Scheduled! Link Generated.");
        } catch (err) { toast.error("Failed to schedule"); }
    };

    const handleRejectMentoring = async (reqId) => {
        const reason = prompt("Enter reason for declining:");
        if (!reason) return;
        try {
            await API.put(`/mentoring/${reqId}/reject`, { reason });
            setMentoringRequests(mentoringRequests.filter(m => m._id !== reqId));
            toast.success("Mentoring Request Declined.");
        } catch (err) { toast.error("Failed to decline"); }
    };

    const timeAgo = (d) => {
        const s = Math.floor((Date.now() - new Date(d)) / 1000);
        if (s < 60) return 'now';
        if (s < 3600) return `${Math.floor(s / 60)}m`;
        if (s < 86400) return `${Math.floor(s / 3600)}h`;
        return `${Math.floor(s / 86400)}d`;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 text-slate-800 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications & Requests</h1>
                {data.unreadCount > 0 && (
                    <button onClick={markRead} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Mark all read ({data.unreadCount})</button>
                )}
            </div>

            {/* Pending Connection Requests */}
            {followRequests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Connection Requests</h2>
                    {followRequests.map(r => (
                        <div key={r._id} className="card bg-white border border-slate-100 rounded-3xl flex items-center justify-between p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <img src={r.profilePhoto ? `/${r.profilePhoto}` : `https://ui-avatars.com/api/?name=${r.name}&background=6366f1&color=fff`} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt="" />
                                <div>
                                    <p className="text-slate-900 font-semibold text-sm">{r.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{r.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAcceptFollow(r._id)} className="btn-primary text-xs py-1.5 px-4 bg-emerald-500 hover:bg-emerald-600 border-0 cursor-pointer">Accept</button>
                                <button onClick={() => handleRejectFollow(r._id)} className="btn-secondary text-xs py-1.5 px-4 text-red-500 border-red-100 hover:bg-red-50 cursor-pointer">Decline</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pending Mentoring Requests */}
            {mentoringRequests.length > 0 && (
                <div className="space-y-4 mt-6">
                    <h2 className="text-lg font-bold text-slate-900">Mentoring Requests</h2>
                    {mentoringRequests.map(m => (
                        <div key={m._id} className="card bg-white border border-primary/20 rounded-3xl p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <img src={m.studentId?.profilePhoto ? `/${m.studentId.profilePhoto}` : `https://ui-avatars.com/api/?name=${m.studentId?.name}&background=6366f1&color=fff`} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt="" />
                                    <div>
                                        <p className="text-slate-900 font-semibold text-sm">{m.studentId?.name} requested a session</p>
                                        <p className="text-xs text-slate-500">Topic: {m.topic}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-4 bg-slate-50 border border-slate-100 rounded-2xl p-3">"{m.message}"</p>
                            <div className="flex gap-2">
                                <button onClick={() => handleAcceptMentoring(m._id)} className="btn-primary text-xs py-1.5 px-4 bg-emerald-500 hover:bg-emerald-600 border-0 cursor-pointer">Accept & Schedule</button>
                                <button onClick={() => handleRejectMentoring(m._id)} className="btn-secondary text-xs py-1.5 px-4 text-red-500 border-red-100 hover:bg-red-50 cursor-pointer">Decline Session</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-4 mt-6">
                <h2 className="text-lg font-bold text-slate-900">Activity</h2>
                {data.notifications.length === 0 ? (
                    <div className="card bg-white border border-slate-100 rounded-3xl text-center py-16 text-slate-400 shadow-sm">No recent activity.</div>
                ) : (
                    data.notifications.map(n => (
                        <div key={n._id} className={`card bg-white border rounded-3xl flex items-start gap-4 p-5 shadow-sm ${!n.isRead ? 'border-primary/20' : 'border-slate-100'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-primary/10 border border-primary/20' : 'bg-slate-100 border border-slate-200'}`}>
                                <HiOutlineBell className={`w-5 h-5 ${!n.isRead ? 'text-primary' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm ${!n.isRead ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{n.content}</p>
                                {n.type === 'MENTORING_ACCEPTED' && n.link?.includes('/call/') && (
                                    <a href={n.link} className="inline-block mt-2 text-primary text-xs font-semibold hover:underline bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl">
                                        Join Video Call
                                    </a>
                                )}
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">{timeAgo(n.createdAt)} ago</p>
                            </div>
                            {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" />}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
