import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMagnifyingGlass, HiOutlineUserGroup } from 'react-icons/hi2';

const Directory = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(''); // '' means All

    const fetchDirectory = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search.trim()) params.search = search;
            if (roleFilter) params.role = roleFilter;
            
            const { data } = await API.get('/users/college', { params });
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load directory');
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDirectory();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, roleFilter]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 text-slate-800 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {user?.collegeName ? `${user.collegeName} Directory` : 'Alumni & Student Directory'} 👥
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">Connect with alumni, seniors, and students in your college network.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative md:col-span-3">
                    <HiOutlineMagnifyingGlass className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field text-xs pl-10 bg-slate-50 w-full"
                        placeholder="Search by name..."
                    />
                </div>
                <select 
                    value={roleFilter} 
                    onChange={e => setRoleFilter(e.target.value)} 
                    className="input-field text-xs bg-slate-50 cursor-pointer w-full"
                >
                    <option value="">All Roles</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Senior">Senior</option>
                    <option value="Student">Student</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading directory...</div>
            ) : users.length === 0 ? (
                <div className="card text-center py-20 border border-slate-100 bg-white shadow-sm rounded-3xl">
                    <HiOutlineUserGroup className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-semibold text-base">No users found</p>
                    <p className="text-slate-400 text-xs mt-2">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users.map(u => (
                        <div key={u._id} className="card bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md hover:border-slate-200">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold shadow-md shadow-primary/20 mb-4 overflow-hidden">
                                {u.profilePhoto ? (
                                    <img src={`/${u.profilePhoto}`} className="w-full h-full object-cover" alt={u.name} />
                                ) : (
                                    u.name?.charAt(0) || 'U'
                                )}
                            </div>
                            
                            <h3 className="font-bold text-slate-900 text-base line-clamp-1">{u.name}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{u.role}</p>
                            
                            {u.branch && (
                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{u.branch}</p>
                            )}

                            <div className="flex flex-wrap justify-center gap-1.5 mt-4 min-h-[44px]">
                                {(u.skills || []).slice(0, 3).map((skill, idx) => (
                                    <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                        {skill}
                                    </span>
                                ))}
                                {(u.skills || []).length > 3 && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                        +{(u.skills.length - 3)}
                                    </span>
                                )}
                            </div>

                            <Link 
                                to={`/profile/${u._id}`} 
                                className="mt-5 w-full btn-secondary py-2 text-xs font-semibold cursor-pointer block"
                            >
                                View Profile
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Directory;
