import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineCalendarDays, HiOutlineLink, HiOutlineUserGroup, HiOutlinePlusCircle } from 'react-icons/hi2';

const Sessions = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ topic: '', description: '', meetLink: '', date: '' });

    useEffect(() => {
        API.get('/sessions').then(res => setSessions(res.data)).catch(() => { });
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/sessions', form);
            setSessions([data, ...sessions]);
            setForm({ topic: '', description: '', meetLink: '', date: '' });
            setShowForm(false);
            toast.success('Session created!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleRegister = async (id) => {
        try {
            const { data } = await API.put(`/sessions/${id}/register`);
            setSessions(sessions.map(s => s._id === id ? data : s));
            toast.success('Registered!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const isPast = (d) => new Date(d) < new Date();

    return (
        <div className="max-w-3xl mx-auto space-y-6 text-slate-800 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                        <HiOutlineCalendarDays className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Group Mentorship Sessions</h1>
                        <p className="text-slate-500 text-xs mt-0.5">Explore or schedule collective webinar sessions.</p>
                    </div>
                </div>
                {(user?.role === 'Alumni' || user?.role === 'Admin') && (
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs py-2.5 px-4 cursor-pointer">
                        <HiOutlinePlusCircle className="w-4 h-4" /> Create Session
                    </button>
                )}
            </div>
            {showForm && (
                <form onSubmit={handleCreate} className="card bg-white border border-slate-100 rounded-3xl space-y-4 p-6 animate-scale-up shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900">Create Group Session</h3>
                    <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="input-field text-xs bg-white" placeholder="Topic / Title" required />
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field min-h-[90px] resize-none text-xs bg-white" placeholder="What will this session cover?" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={form.meetLink} onChange={e => setForm({ ...form, meetLink: e.target.value })} className="input-field text-xs bg-white" placeholder="Meeting Link (e.g. Jitsi, Zoom)" required />
                        <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field text-xs bg-white cursor-pointer text-slate-500" required />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary text-xs py-2 px-5 cursor-pointer">Create</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-xs py-2 px-5 cursor-pointer">Cancel</button>
                    </div>
                </form>
            )}
            {sessions.length === 0 ? (
                <div className="card border border-slate-100 rounded-3xl text-center py-16 text-slate-400 bg-white shadow-sm">
                    No sessions scheduled yet.
                </div>
            ) : sessions.map(s => (
                <div key={s._id} className={`card border border-slate-100 bg-white rounded-3xl space-y-4 p-6 animate-slide-up shadow-sm ${isPast(s.date) ? 'opacity-50' : 'card-hover'}`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 leading-tight">{s.topic}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">by {s.alumniId?.name || 'Alumni'}</p>
                        </div>
                        {isPast(s.date) ? <span className="badge-danger uppercase tracking-wider text-[9px] font-bold">Past</span> : <span className="badge-success uppercase tracking-wider text-[9px] font-bold">Upcoming</span>}
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{s.description}</p>
                    <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
                        <span className="flex items-center gap-1.5"><HiOutlineCalendarDays className="w-4 h-4 text-primary" />{new Date(s.date).toLocaleString()}</span>
                        <span className="flex items-center gap-1.5"><HiOutlineUserGroup className="w-4 h-4 text-secondary" />{s.registeredStudents?.length || 0} registered</span>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                        {!isPast(s.date) && s.meetLink && <a href={s.meetLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-2 px-4 cursor-pointer"><HiOutlineLink className="w-4 h-4 text-primary" /> Join Webinar</a>}
                        {!isPast(s.date) && user?.role !== 'Alumni' && !s.registeredStudents?.includes(user?._id) && <button onClick={() => handleRegister(s._id)} className="btn-primary text-xs py-2 px-5 cursor-pointer">Register Now</button>}
                        {s.registeredStudents?.includes(user?._id) && <span className="badge-success uppercase tracking-wider text-[9px] font-bold">✓ Registered</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Sessions;
