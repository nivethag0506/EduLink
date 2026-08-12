import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
    HiOutlineUsers, HiOutlineAcademicCap, HiOutlineNewspaper,
    HiOutlineShieldCheck, HiOutlineCheckCircle, HiOutlineXCircle,
    HiOutlineNoSymbol, HiOutlinePlusCircle, HiOutlineBuildingLibrary
} from 'react-icons/hi2';

const Admin = () => {
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [activity, setActivity] = useState({});
    const [search, setSearch] = useState('');
    const [filterVerified, setFilterVerified] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [newCollege, setNewCollege] = useState({ name: '', domain: '' });
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        API.get('/admin/stats').then(r => setStats(r.data)).catch(() => { });
        API.get('/admin/activity').then(r => setActivity(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        const params = {};
        if (search) params.search = search;
        if (filterVerified) params.verified = filterVerified;
        if (filterRole) params.role = filterRole;
        API.get('/admin/users', { params }).then(r => setUsers(r.data)).catch(() => { });
    }, [search, filterVerified, filterRole]);

    useEffect(() => {
        if (tab === 'colleges') API.get('/admin/colleges').then(r => setColleges(r.data)).catch(() => { });
    }, [tab]);

    const verify = async (id) => {
        await API.put(`/admin/users/${id}/verify`);
        setUsers(users.map(u => u._id === id ? { ...u, isVerified: true } : u));
        toast.success('User verified');
    };

    const reject = async (id) => {
        await API.put(`/admin/users/${id}/reject`);
        setUsers(users.filter(u => u._id !== id));
        toast.success('User rejected');
    };

    const ban = async (id) => {
        await API.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        toast.success('User removed');
    };

    const addCollege = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/colleges', newCollege);
            setNewCollege({ name: '', domain: '' });
            API.get('/admin/colleges').then(r => setColleges(r.data));
            toast.success('College added');
        } catch (err) {
            toast.error('Failed');
        }
    };

    const deleteCollege = async (id) => {
        try {
            await API.delete(`/admin/colleges/${id}`);
            setColleges(colleges.filter(c => c._id !== id));
            toast.success('College removed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove college');
        }
    };

    const statCards = [
        { label: 'Total Users', val: stats.totalUsers, icon: HiOutlineUsers, color: 'text-primary' },
        { label: 'Students', val: stats.totalStudents, icon: HiOutlineAcademicCap, color: 'text-secondary' },
        { label: 'Alumni', val: stats.totalAlumni, icon: HiOutlineShieldCheck, color: 'text-emerald-500' },
        { label: 'Colleges', val: stats.totalColleges, icon: HiOutlineBuildingLibrary, color: 'text-accent' },
        { label: 'Posts', val: stats.totalPosts, icon: HiOutlineNewspaper, color: 'text-pink-500' },
        { label: 'Active (7d)', val: stats.activeUsers, icon: HiOutlineUsers, color: 'text-purple-500' },
    ];

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'users', label: 'Users' },
        { key: 'colleges', label: 'Colleges' },
        { key: 'activity', label: 'Activity' },
    ];

    return (
        <div className="space-y-6 text-slate-800 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${tab === t.key ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:text-slate-800'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Overview & Analytics */}
            {tab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {statCards.map((s, i) => (
                            <div key={i} className="stat-card">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                                    <s.icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                                <span className="text-3xl font-extrabold text-slate-900 mt-1">{s.val ?? '—'}</span>
                            </div>
                        ))}
                    </div>
                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Registrations */}
                        <div className="card bg-white border border-slate-100 rounded-3xl h-80 flex flex-col p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Monthly Registrations</h3>
                            <div className="w-full h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.monthlyRegistrations || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                        <Line type="monotone" dataKey="users" name="New Users" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Department Wise Count */}
                        <div className="card bg-white border border-slate-100 rounded-3xl h-80 flex flex-col p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Department-wise Count</h3>
                            <div className="w-full h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.departmentStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                                        <XAxis dataKey="branch" stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: 'rgba(99,102,241,0.04)' }} contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                        <Bar dataKey="count" name="Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Chart Row 2 */}
                    <div className="card bg-white border border-slate-100 rounded-3xl h-96 flex flex-col p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">College-wise Role Distribution</h3>
                        <div className="w-full h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.collegeStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(99,102,241,0.04)' }} contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 600 }} />
                                    <Bar dataKey="Student" stackId="a" fill="#6366f1" name="Students" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="Senior" stackId="a" fill="#f59e0b" name="Seniors" />
                                    <Bar dataKey="Alumni" stackId="a" fill="#22c55e" name="Alumni" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Users */}
            {tab === 'users' && (
                <div className="space-y-4">
                    {/* User Categories */}
                    <div className="flex gap-2 flex-wrap">
                        {['', 'Student', 'Senior', 'Alumni'].map(role => (
                            <button key={role || 'All'} onClick={() => setFilterRole(role)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterRole === role ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white border border-slate-100 text-slate-500 hover:text-slate-900'}`}>
                                {role || 'All Users'}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <input value={search} onChange={e => setSearch(e.target.value)} className="input-field text-xs bg-white" placeholder="Search users by name..." />
                        <select value={filterVerified} onChange={e => setFilterVerified(e.target.value)} className="input-field text-xs w-auto bg-white cursor-pointer">
                            <option value="">All Statuses</option>
                            <option value="true">Verified</option>
                            <option value="false">Pending</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className={`${selectedUser ? 'lg:col-span-2' : 'lg:col-span-3'} card border border-slate-100 rounded-3xl p-0 overflow-hidden shadow-sm bg-white`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-bold tracking-wider">
                                            <th className="text-left p-4">User</th>
                                            <th className="text-left p-4">Role</th>
                                            <th className="text-left p-4">College</th>
                                            <th className="text-left p-4">Status</th>
                                            <th className="text-right p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map(u => (
                                            <tr key={u._id} onClick={() => setSelectedUser(u)} className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedUser?._id === u._id ? 'bg-primary/5' : ''}`}>
                                                <td className="p-4">
                                                    <span className="font-semibold text-slate-900 text-sm">{u.name}</span>
                                                    <br />
                                                    <span className="text-slate-500 font-medium">{u.email}</span>
                                                </td>
                                                <td className="p-4"><span className="badge-primary">{u.role}</span></td>
                                                <td className="p-4 text-slate-600 font-medium">{u.collegeId?.name || '—'}</td>
                                                <td className="p-4">{u.isVerified ? <span className="badge-success">Verified</span> : <span className="badge-warning">Pending</span>}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                        {!u.isVerified && <button onClick={() => { verify(u._id); if(selectedUser?._id === u._id) setSelectedUser({...u, isVerified:true}); }} className="text-emerald-500 hover:bg-emerald-50 p-2 rounded-xl cursor-pointer" title="Verify"><HiOutlineCheckCircle className="w-5 h-5" /></button>}
                                                        {!u.isVerified && <button onClick={() => { reject(u._id); if(selectedUser?._id === u._id) setSelectedUser(null); }} className="text-red-500 hover:bg-red-50 p-2 rounded-xl cursor-pointer" title="Reject"><HiOutlineXCircle className="w-5 h-5" /></button>}
                                                        {u.isVerified && <button onClick={() => { ban(u._id); if(selectedUser?._id === u._id) setSelectedUser(null); }} className="text-amber-500 hover:bg-amber-50 p-2 rounded-xl cursor-pointer" title="Remove"><HiOutlineNoSymbol className="w-5 h-5" /></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {selectedUser && (
                            <div className="card border border-slate-100 bg-white p-6 rounded-3xl space-y-6 flex flex-col justify-between shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 text-sm">ID Card Preview</h3>
                                    <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><HiOutlineXCircle className="w-5 h-5" /></button>
                                </div>

                                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-4">
                                    <div className="text-center font-bold text-[10px] text-slate-600 border-b border-slate-200 pb-2">
                                        {selectedUser.collegeId?.name || 'COLLEGE VERIFICATION CARD'}
                                    </div>
                                    <div className="flex justify-center">
                                        <a 
                                            href={selectedUser.idCardImage ? `/${selectedUser.idCardImage.replace(/\\/g, '/')}` : '#'} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block hover:opacity-80 transition-opacity"
                                            title="Click to view full size"
                                        >
                                            <img
                                                src={selectedUser.idCardImage ? `/${selectedUser.idCardImage.replace(/\\/g, '/')}` : 'https://placehold.co/150x150/e2e8f0/64748b?text=ID+Card'}
                                                className="w-32 h-32 object-contain bg-white border border-slate-200 rounded-xl"
                                                alt="ID Card"
                                            />
                                        </a>
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                        <p><span className="font-bold text-slate-500">Name:</span> <span className="text-slate-800 font-semibold">{selectedUser.name}</span></p>
                                        <p><span className="font-bold text-slate-500">Role:</span> <span className="badge-primary">{selectedUser.role}</span></p>
                                        <p><span className="font-bold text-slate-500">Email:</span> <span className="text-slate-800">{selectedUser.email}</span></p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {!selectedUser.isVerified ? (
                                        <>
                                            <button onClick={async () => { await verify(selectedUser._id); setSelectedUser(prev => ({ ...prev, isVerified: true })); }} className="btn-primary flex-1 text-xs py-2 bg-emerald-500 hover:bg-emerald-600 border-0 cursor-pointer">Verify</button>
                                            <button onClick={async () => { await reject(selectedUser._id); setSelectedUser(null); }} className="btn-secondary flex-1 text-xs py-2 text-red-500 border-red-100 hover:bg-red-50 cursor-pointer">Decline</button>
                                        </>
                                    ) : (
                                        <button onClick={async () => { await ban(selectedUser._id); setSelectedUser(null); }} className="btn-secondary w-full text-xs py-2 text-red-600 border-red-100 hover:bg-red-50 cursor-pointer">Remove User</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Colleges */}
            {tab === 'colleges' && (
                <div className="space-y-4">
                    <form onSubmit={addCollege} className="card bg-white border border-slate-100 rounded-3xl flex flex-col md:flex-row gap-3 items-end p-6 shadow-sm">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Name</label>
                            <input value={newCollege.name} onChange={e => setNewCollege({ ...newCollege, name: e.target.value })} className="input-field text-xs bg-white" required />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Domain</label>
                            <input value={newCollege.domain} onChange={e => setNewCollege({ ...newCollege, domain: e.target.value })} className="input-field text-xs bg-white" required />
                        </div>
                        <button type="submit" className="btn-primary text-xs py-2.5 px-5 cursor-pointer w-full md:w-auto"><HiOutlinePlusCircle className="w-4 h-4" /> Add</button>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {colleges.map(c => (
                            <div key={c._id} className="card bg-white border border-slate-100 rounded-3xl p-6 card-hover shadow-sm relative group">
                                <button onClick={() => deleteCollege(c._id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100" title="Remove College">
                                    <HiOutlineNoSymbol className="w-5 h-5" />
                                </button>
                                <h3 className="font-bold text-slate-900 text-base leading-tight pr-10">{c.name}</h3>
                                <p className="text-xs text-slate-500 mt-1 font-semibold">{c.domain}</p>
                                <div className="flex items-center justify-between mt-5 border-t border-slate-100 pt-3">
                                    <span className="badge-primary uppercase text-[9px] font-bold tracking-wider">Code: {c.code}</span>
                                    <span className="text-xs text-slate-500 font-semibold">{c.userCount} users</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Activity */}
            {tab === 'activity' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight">Recent Signups</h3>
                        <div className="divide-y divide-slate-100">
                            {activity.recentUsers?.map(u => (
                                <div key={u._id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                                    </div>
                                    <span className="badge-primary uppercase text-[9px] font-bold tracking-wider">{u.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight">Recent Posts</h3>
                        <div className="divide-y divide-slate-100">
                            {activity.recentPosts?.map(p => (
                                <div key={p._id} className="py-3.5 first:pt-0 last:pb-0">
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed truncate">{p.content?.substring(0, 60)}...</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">by {p.authorId?.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
