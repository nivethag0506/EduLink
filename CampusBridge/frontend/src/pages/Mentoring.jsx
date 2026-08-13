import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineAcademicCap, HiOutlineVideoCamera, HiOutlineMicrophone, HiOutlineClock, HiOutlineCalendar, HiOutlineXCircle, HiOutlineCheckCircle } from 'react-icons/hi2';

const STATUS_COLORS = {
    pending: 'text-amber-600 bg-amber-50 border-amber-100',
    accepted: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rejected: 'text-rose-600 bg-rose-50 border-rose-100',
    completed: 'text-blue-600 bg-blue-50 border-blue-100',
};

const Mentoring = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');

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

    const filtered = requests.filter(r => {
        if (tab === 'all') return true;
        if (tab === 'pending') return r.status === 'pending';
        if (tab === 'accepted') return r.status === 'accepted';
        if (tab === 'rejected') return r.status === 'rejected';
        if (tab === 'completed') return r.status === 'completed';
        if (tab === 'as_mentor') return r.mentorId?._id === user?._id;
        if (tab === 'as_student') return r.studentId?._id === user?._id;
        return true;
    });

    if (loading) return <div className="text-center py-20 text-slate-500">Loading sessions...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 text-slate-800 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                    <HiOutlineAcademicCap className="w-7 h-7 text-primary animate-pulse" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mentoring Sessions</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage all your mentoring requests and scheduled sessions.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
                {['all', 'pending', 'accepted', 'completed', 'rejected', ...(isMentor ? ['as_mentor'] : []), 'as_student'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 capitalize cursor-pointer ${tab === t ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                        {t.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
                <div className="card border border-slate-100 rounded-3xl text-center py-20 bg-white shadow-sm">
                    <HiOutlineAcademicCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold text-base">No sessions found</p>
                    <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                        {isMentor
                            ? 'Sessions requested by students will appear here.'
                            : 'Go to a Senior or Alumni\'s profile and click "Request Mentoring" to get started.'}
                    </p>
                </div>
            )}

            {/* Session cards */}
            <div className="space-y-4">
                {filtered.map(r => {
                    const isMyRequest = r.mentorId?._id === user?._id;
                    const other = isMyRequest ? r.studentId : r.mentorId;
                    return (
                        <div key={r._id} className="card border border-slate-100 rounded-3xl space-y-4 p-6 bg-white shadow-sm">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3.5">
                                    <img
                                        src={other?.profilePhoto ? `/${other.profilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6366f1&color=fff`}
                                        className="w-11 h-11 rounded-xl object-cover shadow-sm border border-slate-100"
                                        alt=""
                                    />
                                    <div>
                                        <p className="text-slate-900 font-semibold text-sm">{other?.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{other?.role} · {isMyRequest ? 'Requested by them' : 'Your request'}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border capitalize ${STATUS_COLORS[r.status]}`}>
                                    {r.status}
                                </span>
                            </div>

                            {/* Topic & message */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-1">
                                <p className="text-xs font-bold text-primary">Topic: {r.topic}</p>
                                <p className="text-xs text-slate-600 leading-relaxed mt-1">{r.message}</p>
                            </div>

                            {/* Accepted details */}
                            {r.status === 'accepted' && (() => {
                                const roomName = r.meetLink?.split('/').pop();
                                return (
                                    <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-5 space-y-4">
                                        <div className="flex gap-6 text-xs font-semibold text-slate-500">
                                            <span className="flex items-center gap-2"><HiOutlineCalendar className="w-4 h-4 text-emerald-500" />{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : '—'}</span>
                                            <span className="flex items-center gap-2"><HiOutlineClock className="w-4 h-4 text-emerald-500" />{r.scheduledTime || '—'}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <a
                                                href={`/call/${roomName}`}
                                                className="btn-primary text-xs py-2 px-5 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 border-0 cursor-pointer"
                                                style={{ boxShadow: '0 4px 18px rgba(16, 185, 129, 0.2)' }}>
                                                <HiOutlineVideoCamera className="w-4 h-4" /> Join Video Call
                                            </a>
                                            <a
                                                href={`/call/${roomName}?audioOnly=true`}
                                                className="btn-secondary text-xs py-2 px-5 flex items-center gap-2 cursor-pointer bg-white">
                                                <HiOutlineMicrophone className="w-4 h-4 text-slate-500" /> Audio Only
                                            </a>
                                            {isMentor && r.mentorId?._id === user?._id && (
                                                <button
                                                    onClick={() => handleComplete(r._id)}
                                                    className="btn-secondary text-xs py-2 px-5 flex items-center gap-2 border-primary/45 border text-primary hover:bg-primary hover:text-white transition-all ml-auto cursor-pointer bg-white">
                                                    <HiOutlineCheckCircle className="w-4 h-4" /> Mark as Completed
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium">🔒 Private room — only you and the other person can join.</p>
                                    </div>
                                );
                            })()}

                            {/* Rejected reason */}
                            {r.status === 'rejected' && r.rejectionReason && (
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 flex items-start gap-2">
                                    <HiOutlineXCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-rose-700 font-medium">Reason: {r.rejectionReason}</p>
                                </div>
                            )}

                            {/* Completed state */}
                            {r.status === 'completed' && (
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5 flex items-start gap-3">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-700">Session Completed</p>
                                        <p className="text-[10px] text-blue-500/70 mt-0.5">This mentoring session has successfully concluded.</p>
                                    </div>
                                </div>
                            )}

                            {/* Mentor actions for pending */}
                            {r.status === 'pending' && r.mentorId?._id === user?._id && (
                                <div className="flex gap-3 pt-1">
                                    <button onClick={() => openAcceptModal(r._id)}
                                        className="btn-primary text-xs py-2 px-5 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 border-0 cursor-pointer"
                                        style={{ boxShadow: '0 4px 18px rgba(16, 185, 129, 0.2)' }}>
                                        <HiOutlineCheckCircle className="w-4 h-4" /> Accept & Schedule
                                    </button>
                                    <button onClick={() => openRejectModal(r._id)}
                                        className="btn-secondary text-xs py-2 px-5 flex items-center gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 cursor-pointer bg-white">
                                        <HiOutlineXCircle className="w-4 h-4" /> Decline
                                    </button>
                                </div>
                            )}

                            {r.status === 'pending' && r.studentId?._id === user?._id && (
                                <p className="text-xs text-amber-600 flex items-center gap-1.5 font-semibold"><HiOutlineClock className="w-4 h-4" /> Waiting for mentor to respond...</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Accept Modal */}
            {acceptModalId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Schedule Session</h3>
                        <p className="text-xs text-slate-500 mb-4">Set the date and time for this mentoring session. A private meeting link will be generated automatically.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    value={acceptDate} 
                                    onChange={e => setAcceptDate(e.target.value)} 
                                    className="input-field text-xs bg-slate-50 w-full" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                                <input 
                                    type="time" 
                                    value={acceptTime} 
                                    onChange={e => setAcceptTime(e.target.value)} 
                                    className="input-field text-xs bg-slate-50 w-full" 
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button onClick={() => setAcceptModalId(null)} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
                            <button onClick={submitAccept} className="btn-primary text-xs py-2 px-4 bg-emerald-500 hover:bg-emerald-600 border-none cursor-pointer">Schedule</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Decline Request</h3>
                        <p className="text-xs text-slate-500 mb-4">Please provide a brief reason for declining this mentoring request.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                                <textarea 
                                    value={rejectReason} 
                                    onChange={e => setRejectReason(e.target.value)} 
                                    className="input-field text-xs bg-slate-50 w-full min-h-[80px] resize-none" 
                                    placeholder="e.g. Currently booked, topic out of scope..." 
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button onClick={() => setRejectModalId(null)} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
                            <button onClick={submitReject} className="btn-primary text-xs py-2 px-4 bg-rose-500 hover:bg-rose-600 border-none cursor-pointer">Decline Session</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mentoring;
