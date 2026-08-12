import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowLeft, HiOutlineCodeBracket, HiOutlineUserGroup, 
    HiOutlineGlobeAlt, HiOutlineFolderOpen, HiOutlineHeart, HiOutlineBookmark,
    HiHeart, HiBookmark, HiOutlineFlag, HiOutlineSparkles, HiOutlineCheckBadge
} from 'react-icons/hi2';

const ProjectDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [project, setProject] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    
    const [activeTab, setActiveTab] = useState('overview'); // overview, technical, community

    useEffect(() => {
        fetchProject();
    }, [slug]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/projects/${slug}`);
            setProject(data);
        } catch (error) {
            toast.error('Project not found');
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true);
            const { data } = await API.get(`/projects/${project._id}/analyze`);
            setAiAnalysis(data);
            setActiveTab('ai');
            toast.success('AI Analysis complete');
        } catch (error) {
            toast.error('Failed to generate analysis');
        } finally {
            setAnalyzing(false);
        }
    };

    const toggleLike = async () => {
        try {
            await API.post(`/projects/${project._id}/like`);
            setProject(prev => ({ 
                ...prev, 
                hasLiked: !prev.hasLiked, 
                likeCount: prev.hasLiked ? prev.likeCount - 1 : prev.likeCount + 1 
            }));
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const toggleBookmark = async () => {
        try {
            await API.post(`/projects/${project._id}/bookmark`);
            setProject(prev => ({ 
                ...prev, 
                hasBookmarked: !prev.hasBookmarked, 
                bookmarkCount: prev.hasBookmarked ? prev.bookmarkCount - 1 : prev.bookmarkCount + 1 
            }));
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleReport = async () => {
        const reason = window.prompt("Reason for reporting:");
        if (!reason) return;
        try {
            await API.post(`/projects/${project._id}/report`, { reason });
            toast.success('Report submitted');
        } catch (error) {
            toast.error('Failed to report');
        }
    };

    const handleCollabRequest = async () => {
        const role = window.prompt("Which role are you applying for?");
        if (!role) return;
        const msg = window.prompt("Add a short message to the owner:");
        try {
            await API.post(`/projects/${project._id}/collaborate`, { requestedRole: role, message: msg });
            toast.success('Collaboration request sent!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    
    if (!project) return null;

    const isOwner = user?._id === project.ownerId?._id;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <button onClick={() => navigate('/projects')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <HiOutlineArrowLeft className="w-4 h-4 mr-1.5" /> Back to Showcase
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">{project.domain}</span>
                            {project.verificationStatus !== 'Not Verified' && (
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center">
                                    <HiOutlineCheckBadge className="w-4 h-4 mr-1" /> {project.verificationStatus}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">{project.title}</h1>
                        <p className="text-lg text-slate-600 mb-6">{project.shortDescription}</p>
                        
                        <div className="flex flex-wrap gap-4">
                            {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                                    <HiOutlineCodeBracket className="w-5 h-5 mr-2" /> GitHub
                                </a>
                            )}
                            {project.liveDemoUrl && (
                                <a href={project.liveDemoUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm font-medium text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg transition-colors shadow-md shadow-primary/20">
                                    <HiOutlineGlobeAlt className="w-5 h-5 mr-2" /> Live Demo
                                </a>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-3 shrink-0">
                        <button onClick={toggleLike} className={`flex items-center justify-center px-4 py-2.5 rounded-xl border font-medium transition-colors ${project.hasLiked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                            {project.hasLiked ? <HiHeart className="w-5 h-5 mr-2 text-red-500" /> : <HiOutlineHeart className="w-5 h-5 mr-2" />}
                            {project.likeCount} Likes
                        </button>
                        <button onClick={toggleBookmark} className={`flex items-center justify-center px-4 py-2.5 rounded-xl border font-medium transition-colors ${project.hasBookmarked ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                            {project.hasBookmarked ? <HiBookmark className="w-5 h-5 mr-2 text-amber-500" /> : <HiOutlineBookmark className="w-5 h-5 mr-2" />}
                            Save Project
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex space-x-1 border-b border-slate-200">
                        {['overview', 'technical', 'community', 'ai'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[400px]">
                        
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-fadeIn">
                                {project.screenshots && project.screenshots.length > 0 && (
                                    <div className="rounded-xl overflow-hidden border border-slate-200">
                                        <img src={`/${project.screenshots[0]}`} className="w-full h-auto" alt="Project Screenshot" />
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">Problem Statement</h3>
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{project.problemStatement || 'Not provided.'}</p>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">Proposed Solution</h3>
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{project.proposedSolution || 'Not provided.'}</p>
                                </div>

                                {project.features && project.features.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">Key Features</h3>
                                        <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                            {project.features.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'technical' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Technology Stack</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.technologies?.map((tech, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg">{tech}</span>
                                        ))}
                                    </div>
                                </div>

                                {project.skills && project.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Skills Demonstrated</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-sm rounded-full">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {Object.keys(project.architectureDetails || {}).length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Architecture</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.entries(project.architectureDetails).map(([key, value]) => {
                                                if(!value) return null;
                                                return (
                                                    <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <h4 className="font-bold text-slate-800 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                                        <p className="text-sm text-slate-600">{value}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'community' && (
                            <div className="space-y-8 animate-fadeIn">
                                {project.collaborationSettings?.lookingForCollaborators && !isOwner && (
                                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
                                        <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center">
                                            <HiOutlineUserGroup className="w-5 h-5 mr-2" /> Looking for Collaborators!
                                        </h3>
                                        <p className="text-indigo-700 text-sm mb-4">This project is actively seeking students to join the team.</p>
                                        <button onClick={handleCollabRequest} className="btn-primary bg-indigo-600 hover:bg-indigo-700 px-6 py-2">
                                            Request to Join
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Alumni Feedback</h3>
                                    {project.feedback && project.feedback.length > 0 ? (
                                        <div className="space-y-4">
                                            {project.feedback.map(fb => (
                                                <div key={fb._id} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                                            {fb.alumniId?.profilePhoto && <img src={`/${fb.alumniId.profilePhoto}`} className="w-full h-full object-cover" alt="" />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900">{fb.alumniId?.name}</h4>
                                                            <p className="text-xs text-slate-500">{fb.alumniId?.company} • {fb.alumniId?.jobRole}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-700 text-sm italic">"{fb.feedback}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-sm">No feedback from alumni yet.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="space-y-8 animate-fadeIn">
                                {!aiAnalysis && !analyzing && (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <HiOutlineSparkles className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">AI Project Analyzer</h3>
                                        <p className="text-slate-500 mb-6 max-w-md mx-auto">Generate automated insights, resume bullet points, and potential interview questions based on this project's architecture.</p>
                                        <button onClick={handleAnalyze} className="btn-primary px-6 py-2">Generate Analysis</button>
                                    </div>
                                )}

                                {analyzing && (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-slate-600 font-medium">AI is analyzing the project...</p>
                                    </div>
                                )}

                                {aiAnalysis && (
                                    <div className="space-y-8">
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                                            <h3 className="font-bold text-indigo-900 mb-2">Suggested Resume Description</h3>
                                            <p className="text-indigo-800 italic">"{aiAnalysis.suggestedResumeDescription}"</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white p-5 rounded-xl border border-slate-200">
                                                <h4 className="font-bold text-slate-900 mb-3 text-green-700">Strengths</h4>
                                                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                                                    {aiAnalysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                            <div className="bg-white p-5 rounded-xl border border-slate-200">
                                                <h4 className="font-bold text-slate-900 mb-3 text-amber-700">Areas for Improvement</h4>
                                                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                                                    {aiAnalysis.recommendedImprovements?.map((s, i) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Potential Interview Questions</h3>
                                            <div className="space-y-4">
                                                {aiAnalysis.potentialInterviewQuestions?.map((q, i) => (
                                                    <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                        <p className="font-bold text-slate-800 mb-1">Q: {q.question}</p>
                                                        <p className="text-sm text-slate-500"><span className="font-semibold">Context:</span> {q.context}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Author Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Project Owner</h3>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                                {project.ownerId?.profilePhoto ? (
                                    <img src={`/${project.ownerId.profilePhoto}`} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{project.ownerId?.name?.charAt(0)}</div>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{project.ownerId?.name}</p>
                                <p className="text-xs text-slate-500">{project.ownerId?.role} • {project.ownerId?.department}</p>
                            </div>
                        </div>
                        <Link to={`/profile/${project.ownerId?._id}`} className="block w-full text-center py-2 bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                            View Profile
                        </Link>
                    </div>

                    {/* Meta Data */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Project Details</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between">
                                <span className="text-slate-500">Status</span>
                                <span className="font-medium text-slate-800">{project.status}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-slate-500">Type</span>
                                <span className="font-medium text-slate-800">{project.projectType}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-slate-500">Visibility</span>
                                <span className="font-medium text-slate-800">{project.visibility}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-slate-500">Views</span>
                                <span className="font-medium text-slate-800">{project.viewCount}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Report */}
                    <button onClick={handleReport} className="flex items-center text-sm text-slate-400 hover:text-red-500 mx-auto transition-colors">
                        <HiOutlineFlag className="w-4 h-4 mr-1.5" /> Report Project
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
