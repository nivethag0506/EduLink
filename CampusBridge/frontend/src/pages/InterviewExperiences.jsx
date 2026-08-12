import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineBuildingOffice2, HiOutlineAcademicCap, HiOutlineFunnel, HiOutlineSparkles, HiOutlineBriefcase, HiOutlineBookmark, HiOutlineClock, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const InterviewExperiences = () => {
    const navigate = useNavigate();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        companyName: '',
        role: '',
        difficulty: '',
        result: '',
        sort: 'recent'
    });

    useEffect(() => {
        fetchExperiences();
    }, [page, filters]);

    const fetchExperiences = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10, ...filters };
            // clean up empty string filters
            Object.keys(params).forEach(k => params[k] === '' && delete params[k]);
            
            const { data } = await API.get('/interview-experiences', { params });
            setExperiences(data.experiences);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load experiences');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to first page on filter change
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                        Interview Experiences
                    </h1>
                    <p className="text-slate-500 mt-1">Learn from your peers' interview journeys and prepare better.</p>
                </div>
                <div className="flex space-x-3">
                    <Link to="/interview-experiences/bookmarks" className="btn-secondary px-4 py-2 flex items-center bg-white border border-slate-200">
                        <HiOutlineBookmark className="w-5 h-5 mr-1.5" /> Bookmarks
                    </Link>
                    <Link to="/interview-experiences/submit" className="btn-primary px-5 py-2 flex items-center shadow-md shadow-primary/20">
                        <HiOutlineSparkles className="w-5 h-5 mr-1.5" /> Share Experience
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3 items-center">
                <HiOutlineFunnel className="w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    name="companyName"
                    placeholder="Search company..." 
                    value={filters.companyName}
                    onChange={handleFilterChange}
                    className="input-field py-1.5 text-sm w-full md:w-auto flex-1 min-w-[150px]"
                />
                <input 
                    type="text" 
                    name="role"
                    placeholder="Search role..." 
                    value={filters.role}
                    onChange={handleFilterChange}
                    className="input-field py-1.5 text-sm w-full md:w-auto flex-1 min-w-[150px]"
                />
                <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="input-field py-1.5 text-sm w-full md:w-auto bg-white min-w-[120px]">
                    <option value="">Any Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
                <select name="result" value={filters.result} onChange={handleFilterChange} className="input-field py-1.5 text-sm w-full md:w-auto bg-white min-w-[120px]">
                    <option value="">Any Result</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offer Received">Offer Received</option>
                </select>
                <select name="sort" value={filters.sort} onChange={handleFilterChange} className="input-field py-1.5 text-sm w-full md:w-auto bg-slate-50 font-medium">
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                </select>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white h-32 rounded-xl border border-slate-200"></div>
                    ))}
                </div>
            ) : experiences.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <HiOutlineBriefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No experiences found</h3>
                    <p className="text-slate-500 mt-1">Be the first to share an interview experience!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {experiences.map(exp => (
                        <div key={exp._id} onClick={() => navigate(`/interview-experiences/${exp._id}`)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row gap-4 justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="text-lg font-bold text-slate-900">{exp.companyName}</h3>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-600 font-medium">{exp.role}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                                    <span className="flex items-center"><HiOutlineBuildingOffice2 className="w-3.5 h-3.5 mr-1" /> {exp.interviewType}</span>
                                    <span className="flex items-center"><HiOutlineClock className="w-3.5 h-3.5 mr-1" /> {exp.interviewYear}</span>
                                    {exp.department && <span className="flex items-center"><HiOutlineAcademicCap className="w-3.5 h-3.5 mr-1" /> {exp.department}</span>}
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2">{exp.overallExperience}</p>
                            </div>
                            
                            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        exp.result === 'Selected' || exp.result === 'Offer Received' ? 'bg-green-100 text-green-700' :
                                        exp.result === 'Rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {exp.result}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        exp.overallDifficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                                        exp.overallDifficulty === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                        'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {exp.overallDifficulty}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center md:mt-2">
                                    <span className="font-medium text-slate-700">{exp.helpfulCount}</span> <span className="ml-1">found helpful</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <HiOutlineChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <HiOutlineChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default InterviewExperiences;
