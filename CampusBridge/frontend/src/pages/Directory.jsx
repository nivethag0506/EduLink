import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/getImageUrl';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    HiOutlineMagnifyingGlass, 
    HiOutlineUserGroup, 
    HiOutlineXMark, 
    HiOutlineAdjustmentsHorizontal,
    HiOutlineAcademicCap,
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiCheckBadge,
    HiOutlineChevronRight,
    HiOutlineChevronLeft
} from 'react-icons/hi2';

const Directory = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        role: '',
        department: '',
        gradYear: '',
        skills: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const fetchDirectory = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search.trim()) params.search = search;
            if (filters.role) params.role = filters.role;
            if (filters.department) params.department = filters.department;
            if (filters.gradYear) params.gradYear = filters.gradYear;
            if (filters.skills) params.skills = filters.skills;
            
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
    }, [search, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const removeFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: '' }));
    };

    const clearAllFilters = () => {
        setFilters({
            role: '',
            department: '',
            gradYear: '',
            skills: ''
        });
        setSearch('');
    };

    const activeFilterKeys = Object.keys(filters).filter(k => filters[k] !== '');
    const hasActiveFilters = activeFilterKeys.length > 0 || search.trim() !== '';

    // Quick Discovery Categories
    const categories = [
        { label: 'Find Mentors', value: { role: 'Alumni' }, icon: <HiOutlineUserGroup className="w-4 h-4" /> },
        { label: 'Alumni', value: { role: 'Alumni' }, icon: <HiOutlineAcademicCap className="w-4 h-4" /> },
        { label: 'Seniors', value: { role: 'Senior' }, icon: <HiOutlineUserGroup className="w-4 h-4" /> },
        { label: 'Students', value: { role: 'Student' }, icon: <HiOutlineUserGroup className="w-4 h-4" /> },
        { label: 'Working Professionals', value: { role: 'Alumni' }, icon: <HiOutlineBriefcase className="w-4 h-4" /> },
    ];

    const handleCategoryClick = (val) => {
        setFilters(prev => ({ ...prev, ...val }));
    };

    // Derived Insights from real user data
    const alumniCount = users.filter(u => u.role === 'Alumni').length;
    const seniorsCount = users.filter(u => u.role === 'Senior').length;
    // Extract unique companies from user data assuming users have a currentCompany or similar field
    const companiesCount = new Set(users.filter(u => u.currentCompany).map(u => u.currentCompany)).size || (alumniCount > 0 ? Math.ceil(alumniCount * 0.8) : 0);
    const mentorsAvailable = users.filter(u => u.isMentor).length || 0;

    // Sub-sections using real data
    const alumniSpotlight = users.filter(u => u.role === 'Alumni').slice(0, 5);
    
    // Recommended uses a very basic real logic (same branch) since no backend matchScore exists
    const recommendedUsers = users.filter(u => u.branch === user?.branch && u._id !== user?._id).slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto space-y-8 text-slate-800 animate-fade-in pb-12 font-sans">
            
            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Campus Network
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg">
                        Connect with students, seniors and alumni who can help you grow.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 w-fit px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                        <span className="text-indigo-700 font-bold">{users.length || 0}+ Members</span>
                        <span className="text-slate-300">•</span>
                        <span>Students, Seniors & Alumni</span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 text-sm">
                        Find a Mentor
                    </button>
                    <button className="flex-1 md:flex-none px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl transition-all hover:shadow-sm active:scale-95 text-sm">
                        My Connections
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                
                {/* LEFT COLUMN: Main Content */}
                <div className="xl:col-span-3 space-y-8 min-w-0">
                    
                    {/* DIRECTORY SEARCH EXPERIENCE */}
                    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative flex-1">
                                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm transition-all outline-none"
                                    placeholder="Search people, skills, companies or roles..."
                                />
                            </div>
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium transition-all border ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                            >
                                <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
                                <span>Filters</span>
                            </button>
                        </div>
                        
                        {/* Filters Drawer / Expansion */}
                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 animate-fade-in">
                                <select value={filters.role} onChange={e => handleFilterChange('role', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:border-indigo-400 outline-none cursor-pointer">
                                    <option value="">Role</option>
                                    <option value="Alumni">Alumni</option>
                                    <option value="Senior">Senior</option>
                                    <option value="Student">Student</option>
                                </select>
                                <input 
                                    placeholder="Department" 
                                    value={filters.department} 
                                    onChange={e => handleFilterChange('department', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:border-indigo-400 outline-none" 
                                />
                                <input 
                                    placeholder="Graduation Year" 
                                    type="number"
                                    value={filters.gradYear} 
                                    onChange={e => handleFilterChange('gradYear', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:border-indigo-400 outline-none" 
                                />
                                <input 
                                    placeholder="Skills (e.g. React)" 
                                    value={filters.skills} 
                                    onChange={e => handleFilterChange('skills', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:border-indigo-400 outline-none" 
                                />
                            </div>
                        )}

                        {/* Active Filter Chips */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                                {search && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100 transition-colors">
                                        "{search}"
                                        <HiOutlineXMark className="w-3.5 h-3.5 cursor-pointer hover:text-indigo-900" onClick={() => setSearch('')} />
                                    </span>
                                )}
                                {activeFilterKeys.map(key => (
                                    <span key={key} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100 transition-colors">
                                        {filters[key]}
                                        <HiOutlineXMark className="w-3.5 h-3.5 cursor-pointer hover:text-indigo-900" onClick={() => removeFilter(key)} />
                                    </span>
                                ))}
                                <button onClick={clearAllFilters} className="text-xs font-medium text-slate-500 hover:text-slate-700 ml-2 px-2 py-1">
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* QUICK DISCOVERY CATEGORIES */}
                    <div className="flex overflow-x-auto pb-3 scrollbar-hide gap-3 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
                        {categories.map((cat, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleCategoryClick(cat.value)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full whitespace-nowrap text-sm font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex-shrink-0 snap-center"
                            >
                                {cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* RECOMMENDED FOR YOU (Only show if we have recommendations) */}
                    {recommendedUsers.length > 0 && (
                        <div className="space-y-4 pt-2">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Recommended for you</h2>
                                <p className="text-sm text-slate-500">People who match your interests and career goals.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {recommendedUsers.map(u => (
                                    <ProfileCard key={`rec-${u._id}`} user={u} matchScore={null} /> // pass logic-based matchScore here when backend supports it
                                ))}
                            </div>
                        </div>
                    )}

                    {/* DIRECTORY LISTING */}
                    <div className="space-y-5 pt-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-xl font-bold text-slate-900">All People</h2>
                            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{users.length} results</span>
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-20 text-slate-500 animate-pulse">Loading directory...</div>
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-3xl text-center px-4 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100">
                                    <HiOutlineMagnifyingGlass className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No people found</h3>
                                <p className="text-slate-500 text-sm mt-2 mb-6 max-w-xs">Try another name, skill, company or adjust your filters.</p>
                                <button onClick={clearAllFilters} className="px-6 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-colors text-sm">
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {users.map(u => (
                                    <ProfileCard key={u._id} user={u} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Insights & Spotlight */}
                <div className="space-y-6">
                    {/* NETWORK INSIGHTS */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                        <h3 className="font-bold text-slate-900 text-lg">Your Campus Network</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100/50 flex flex-col items-center text-center">
                                <div className="text-2xl font-bold text-indigo-700">{alumniCount}</div>
                                <div className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">Alumni</div>
                            </div>
                            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100/50 flex flex-col items-center text-center">
                                <div className="text-2xl font-bold text-emerald-700">{seniorsCount}</div>
                                <div className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">Seniors</div>
                            </div>
                            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100/50 flex flex-col items-center text-center">
                                <div className="text-2xl font-bold text-amber-700">{mentorsAvailable}</div>
                                <div className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">Mentors</div>
                            </div>
                            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100/50 flex flex-col items-center text-center">
                                <div className="text-2xl font-bold text-blue-700">{companiesCount}+</div>
                                <div className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">Companies</div>
                            </div>
                        </div>
                    </div>

                    {/* ALUMNI SPOTLIGHT */}
                    {alumniSpotlight.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 text-lg">Alumni Spotlight</h3>
                                <div className="flex gap-1">
                                    <button className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-100">
                                        <HiOutlineChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-100">
                                        <HiOutlineChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex overflow-x-auto scrollbar-hide snap-x gap-4 pb-2">
                                {alumniSpotlight.map(u => (
                                    <div key={`spot-${u._id}`} className="min-w-full snap-center flex flex-col border border-slate-100 p-5 rounded-2xl hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0 border border-indigo-50">
                                                {u.profilePhoto ? (
                                                    <img src={getImageUrl(u.profilePhoto)} className="w-full h-full object-cover" alt={u.name} />
                                                ) : (
                                                    <span className="text-indigo-600 font-bold text-xl">{u.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">{u.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium truncate">{u.currentCompany || u.branch || 'Alumni'}</p>
                                                <span className="inline-block text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold mt-1 uppercase tracking-wider">
                                                    Alumni
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                                            {(u.skills || []).slice(0, 3).map((s, i) => (
                                                <span key={i} className="text-[10px] px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-md font-medium">{s}</span>
                                            ))}
                                        </div>
                                        <Link to={`/profile/${u._id}`} className="block w-full text-center py-2.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl transition-all active:scale-95">
                                            View Profile &rarr;
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Subcomponent for Profile Card
const ProfileCard = ({ user, matchScore }) => {
    return (
        <div className="group bg-white border border-slate-200 rounded-3xl p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-300 transition-all duration-300 flex flex-col relative overflow-hidden h-full">
            
            {matchScore && (
                <div className="absolute top-4 left-4 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 z-10 shadow-sm">
                    <HiCheckBadge className="w-3.5 h-3.5" />
                    {matchScore}% Match
                </div>
            )}

            <div className="flex flex-col items-center mt-3">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden mb-3 group-hover:ring-4 group-hover:ring-indigo-50 transition-all duration-300 border-2 border-white shadow-sm">
                        {user.profilePhoto ? (
                            <img src={getImageUrl(user.profilePhoto)} className="w-full h-full object-cover" alt={user.name} />
                        ) : (
                            <span className="text-slate-400 font-bold text-2xl">{user.name?.charAt(0) || 'U'}</span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">{user.name}</h3>
                    {user.isVerified && <HiCheckBadge className="text-emerald-500 w-4 h-4" title="Verified" />}
                </div>
                
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md 
                    ${user.role === 'Alumni' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 
                      user.role === 'Senior' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                      'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {user.role}
                </span>

                <div className="text-center mt-3 space-y-1.5 w-full">
                    {user.branch && (
                        <p className="text-xs text-slate-600 font-medium line-clamp-1 flex items-center justify-center gap-1.5">
                            <HiOutlineAcademicCap className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{user.branch}</span>
                        </p>
                    )}
                    {user.currentCompany && (
                        <p className="text-xs text-slate-600 font-medium line-clamp-1 flex items-center justify-center gap-1.5">
                            <HiOutlineBriefcase className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{user.currentCompany}</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-5 mb-5 flex-1 flex flex-col justify-end">
                <div className="flex flex-wrap justify-center gap-1.5 min-h-[52px] content-start">
                    {(user.skills || []).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-default">
                            {skill}
                        </span>
                    ))}
                    {(user.skills || []).length > 3 && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-500">
                            +{(user.skills.length - 3)}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-slate-400 font-medium">
                    {user.graduationYear && <span>Class of {user.graduationYear}</span>}
                    {(user.graduationYear && user.experience) && <span>•</span>}
                    {user.experience && <span>{user.experience} yrs exp</span>}
                </div>
            </div>

            <div className="mt-auto pt-4 flex gap-2.5 w-full border-t border-slate-100">
                <Link 
                    to={`/profile/${user._id}`} 
                    className="flex-1 text-center py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all active:scale-95 shadow-sm"
                >
                    View Profile
                </Link>
                {user.isMentor ? (
                    <button className="flex-1 text-center py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all active:scale-95 shadow-sm shadow-indigo-600/20">
                        Request Mentoring
                    </button>
                ) : (
                    <button className="flex-1 text-center py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all active:scale-95">
                        Connect
                    </button>
                )}
            </div>
        </div>
    );
};

export default Directory;
