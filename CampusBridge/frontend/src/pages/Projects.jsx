import { getImageUrl } from "../utils/getImageUrl";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { 
    HiOutlineFolderOpen, HiOutlineSparkles, HiOutlineBookmark, 
    HiOutlineCodeBracket, HiOutlineGlobeAlt, HiStar,
    HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineHeart, HiOutlineEye
} from 'react-icons/hi2';

const Projects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        projectType: '',
        domain: '',
        sort: 'recent'
    });

    const projectTypes = ['Academic Project', 'Mini Project', 'Final Year Project', 'Personal Project', 'Hackathon Project', 'Research Project', 'Open Source Project'];
    const domains = ['Web Development', 'Mobile App', 'Machine Learning', 'Data Science', 'IoT', 'Cybersecurity', 'Blockchain', 'Other'];

    useEffect(() => {
        fetchProjects();
    }, [page, filters]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 12, ...filters };
            Object.keys(params).forEach(k => params[k] === '' && delete params[k]);
            
            const { data } = await API.get('/projects', { params });
            setProjects(data.projects);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                        <HiOutlineCodeBracket className="w-8 h-8 mr-3 text-primary" /> Project Showcase
                    </h1>
                    <p className="text-slate-500 mt-1">Discover technical portfolios, research, and hackathon projects built by students.</p>
                </div>
                <div className="flex space-x-3">
                    <Link to="/projects/bookmarks" className="btn-secondary px-4 py-2 flex items-center bg-white border border-slate-200">
                        <HiOutlineBookmark className="w-5 h-5 mr-1.5" /> Saved
                    </Link>
                    <Link to="/projects/create" className="btn-primary px-5 py-2 flex items-center shadow-md shadow-primary/20">
                        <HiOutlineSparkles className="w-5 h-5 mr-1.5" /> Publish Project
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3 items-center">
                <input 
                    type="text" 
                    name="search"
                    placeholder="Search projects, skills, tech..." 
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="input-field py-1.5 text-sm w-full md:w-auto flex-1 min-w-[200px]"
                />
                <select name="projectType" value={filters.projectType} onChange={handleFilterChange} className="input-field py-1.5 text-sm w-full md:w-auto bg-white min-w-[150px]">
                    <option value="">All Types</option>
                    {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select name="domain" value={filters.domain} onChange={handleFilterChange} className="input-field py-1.5 text-sm w-full md:w-auto bg-white min-w-[150px]">
                    <option value="">All Domains</option>
                    {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select name="sort" value={filters.sort} onChange={handleFilterChange} className="input-field py-1.5 text-sm w-full md:w-auto bg-slate-50 font-medium">
                    <option value="recent">Most Recent</option>
                    <option value="mostViewed">Most Viewed</option>
                    <option value="mostLiked">Most Liked</option>
                </select>
            </div>

            {/* Project Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white h-64 rounded-xl border border-slate-200"></div>
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <HiOutlineFolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No projects found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your filters or publish the first project!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project._id} onClick={() => navigate(`/projects/${project.slug}`)} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group overflow-hidden">
                            {/* Thumbnail */}
                            <div className="h-40 bg-slate-100 border-b border-slate-100 overflow-hidden relative">
                                {project.screenshots && project.screenshots.length > 0 ? (
                                    <img src={getImageUrl(project.screenshots[0])} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <HiOutlineGlobeAlt className="w-12 h-12 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                        {project.domain}
                                    </span>
                                </div>
                                {project.verificationStatus !== 'Not Verified' && (
                                    <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center">
                                        <HiOutlineSparkles className="w-3 h-3 mr-1" /> Verified
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{project.shortDescription}</p>
                                
                                {/* Technologies */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {project.technologies && project.technologies.slice(0, 3).map((tech, i) => (
                                        <span key={i} className="text-[10px] font-medium border border-slate-200 bg-slate-50 text-slate-600 px-2 py-0.5 rounded">{tech}</span>
                                    ))}
                                    {project.technologies?.length > 3 && (
                                        <span className="text-[10px] font-medium border border-slate-200 bg-slate-50 text-slate-400 px-2 py-0.5 rounded">+{project.technologies.length - 3}</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-3 border-t border-slate-50">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                            {project.ownerId?.profilePhoto ? (
                                                <img src={getImageUrl(project.ownerId.profilePhoto)} className="w-full h-full object-cover" alt="Author" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-slate-500">{project.ownerId?.name?.charAt(0)}</div>
                                            )}
                                        </div>
                                        <span className="font-medium text-slate-700">{project.ownerId?.name?.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="flex items-center"><HiOutlineEye className="w-3.5 h-3.5 mr-1" /> {project.viewCount}</span>
                                        <span className="flex items-center"><HiOutlineHeart className="w-3.5 h-3.5 mr-1" /> {project.likeCount}</span>
                                    </div>
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

export default Projects;
