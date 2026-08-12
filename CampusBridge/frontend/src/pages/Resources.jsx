import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { 
    HiOutlineFolderOpen, HiOutlineSparkles, HiOutlineBookmark, 
    HiOutlineDocumentText, HiOutlineVideoCamera, HiOutlineCodeBracket,
    HiOutlineDocumentArrowDown, HiOutlinePhoto, HiOutlineLink,
    HiOutlineChevronLeft, HiOutlineChevronRight, HiStar
} from 'react-icons/hi2';

const Resources = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        resourceType: '',
        sort: 'recent'
    });

    const categories = ['Placement', 'Academics', 'Programming', 'Projects', 'Career'];
    
    useEffect(() => {
        fetchRecommended();
    }, []);

    useEffect(() => {
        fetchResources();
    }, [page, filters]);

    const fetchRecommended = async () => {
        try {
            const { data } = await API.get('/resources/recommendations');
            setRecommended(data);
        } catch (error) {
            console.error('Failed to fetch recommendations', error);
        }
    };

    const fetchResources = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10, ...filters };
            Object.keys(params).forEach(k => params[k] === '' && delete params[k]);
            
            const { data } = await API.get('/resources', { params });
            setResources(data.resources);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const getIconForType = (type) => {
        switch(type) {
            case 'PDF': return <HiOutlineDocumentText className="w-8 h-8 text-red-500" />;
            case 'DOC':
            case 'DOCX': return <HiOutlineDocumentText className="w-8 h-8 text-blue-500" />;
            case 'PPT':
            case 'PPTX': return <HiOutlineDocumentText className="w-8 h-8 text-orange-500" />;
            case 'YouTube Link': return <HiOutlineVideoCamera className="w-8 h-8 text-red-600" />;
            case 'GitHub Repository': return <HiOutlineCodeBracket className="w-8 h-8 text-slate-800" />;
            case 'Image': return <HiOutlinePhoto className="w-8 h-8 text-emerald-500" />;
            default: return <HiOutlineLink className="w-8 h-8 text-indigo-500" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                        <HiOutlineFolderOpen className="w-8 h-8 mr-3 text-primary" /> Resource Hub
                    </h1>
                    <p className="text-slate-500 mt-1">Discover, share, and manage academic and career resources.</p>
                </div>
                <div className="flex space-x-3">
                    <Link to="/resources/bookmarks" className="btn-secondary px-4 py-2 flex items-center bg-white border border-slate-200">
                        <HiOutlineBookmark className="w-5 h-5 mr-1.5" /> Saved
                    </Link>
                    <Link to="/resources/upload" className="btn-primary px-5 py-2 flex items-center shadow-md shadow-primary/20">
                        <HiOutlineSparkles className="w-5 h-5 mr-1.5" /> Upload Resource
                    </Link>
                </div>
            </div>

            {/* AI Recommendations */}
            {recommended.length > 0 && page === 1 && !filters.search && !filters.category && (
                <div className="mb-10">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <HiOutlineSparkles className="w-5 h-5 mr-1.5 text-amber-500" /> Recommended For You
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommended.map(res => (
                            <div key={res._id} onClick={() => navigate(`/resources/${res._id}`)} className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                        {getIconForType(res.resourceType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{res.title}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate">{res.category} • {res.subcategory}</p>
                                        <div className="flex items-center mt-2 space-x-3 text-xs font-medium text-slate-600">
                                            <span className="flex items-center"><HiStar className="w-3.5 h-3.5 mr-0.5 text-amber-400" /> {res.averageRating.toFixed(1)}</span>
                                            <span className="flex items-center"><HiOutlineDocumentArrowDown className="w-3.5 h-3.5 mr-0.5" /> {res.downloadCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3 items-center">
                <input 
                    type="text" 
                    name="search"
                    placeholder="Search titles, skills, tags..." 
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="input-field py-1.5 text-sm w-full md:w-auto flex-1 min-w-[200px]"
                />
                <select name="category" value={filters.category} onChange={handleFilterChange} className="input-field py-1.5 text-sm w-full md:w-auto bg-white min-w-[140px]">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select name="resourceType" value={filters.resourceType} onChange={handleFilterChange} className="input-field py-1.5 text-sm w-full md:w-auto bg-white min-w-[140px]">
                    <option value="">All Formats</option>
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOC/DOCX</option>
                    <option value="PPTX">PPT/PPTX</option>
                    <option value="YouTube Link">Video</option>
                    <option value="GitHub Repository">Code</option>
                </select>
                <select name="sort" value={filters.sort} onChange={handleFilterChange} className="input-field py-1.5 text-sm w-full md:w-auto bg-slate-50 font-medium">
                    <option value="recent">Most Recent</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="rating">Highest Rated</option>
                </select>
            </div>

            {/* Resource Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white h-32 rounded-xl border border-slate-200"></div>
                    ))}
                </div>
            ) : resources.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <HiOutlineFolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No resources found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your filters or upload a new resource!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {resources.map(res => (
                        <div key={res._id} onClick={() => navigate(`/resources/${res._id}`)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-start space-x-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
                                {getIconForType(res.resourceType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg font-bold text-slate-900 truncate pr-2">{res.title}</h3>
                                    {res.verificationBadge !== 'None' && (
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                                            {res.verificationBadge.replace(' Verified', '')} ✓
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-1 mb-2">{res.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{res.category}</span>
                                    {res.skills && res.skills.length > 0 && res.skills.slice(0, 2).map((s, i) => (
                                        <span key={i} className="text-[10px] font-medium border border-slate-200 text-slate-500 px-2 py-0.5 rounded">{s}</span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-2 border-t border-slate-50">
                                    <div className="flex items-center space-x-3">
                                        <span className="flex items-center"><HiStar className="w-3.5 h-3.5 mr-1 text-amber-400" /> {res.averageRating.toFixed(1)}</span>
                                        <span className="flex items-center"><HiOutlineDocumentArrowDown className="w-3.5 h-3.5 mr-1" /> {res.downloadCount}</span>
                                    </div>
                                    <span>By {res.uploadedBy?.name || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                        <HiOutlineChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                        <HiOutlineChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Resources;
