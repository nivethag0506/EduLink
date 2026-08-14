import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/getImageUrl';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowLeft, HiOutlineBuildingOffice2, HiOutlineAcademicCap, 
    HiOutlineClock, HiOutlineHandThumbUp, HiOutlineBookmark, 
    HiOutlineFlag, HiOutlineTrash, HiOutlineSparkles, HiHandThumbUp, HiBookmark
} from 'react-icons/hi2';

const InterviewExperienceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [exp, setExp] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(false);

    useEffect(() => {
        fetchExperience();
    }, [id]);

    const fetchExperience = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/interview-experiences/${id}`);
            setExp(data);
            
            // Fetch AI insights asynchronously
            fetchInsights(data.companyName, data.role);
        } catch (error) {
            toast.error('Experience not found');
            navigate('/interview-experiences');
        } finally {
            setLoading(false);
        }
    };

    const fetchInsights = async (companyName, role) => {
        try {
            setInsightsLoading(true);
            const { data } = await API.get(`/interview-experiences/insights`, { 
                params: { companyName, role } 
            });
            setInsights(data);
        } catch (error) {
            console.error('Failed to fetch AI insights', error);
        } finally {
            setInsightsLoading(false);
        }
    };

    const toggleVote = async () => {
        try {
            if (exp.hasVoted) {
                await API.delete(`/interview-experiences/${id}/vote`);
                setExp(prev => ({ ...prev, hasVoted: false, helpfulCount: prev.helpfulCount - 1 }));
            } else {
                await API.post(`/interview-experiences/${id}/vote`);
                setExp(prev => ({ ...prev, hasVoted: true, helpfulCount: prev.helpfulCount + 1 }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const toggleBookmark = async () => {
        try {
            if (exp.hasBookmarked) {
                await API.delete(`/interview-experiences/${id}/bookmark`);
                setExp(prev => ({ ...prev, hasBookmarked: false, bookmarkCount: prev.bookmarkCount - 1 }));
            } else {
                await API.post(`/interview-experiences/${id}/bookmark`);
                setExp(prev => ({ ...prev, hasBookmarked: true, bookmarkCount: prev.bookmarkCount + 1 }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleReport = async () => {
        const reason = window.prompt("Reason for reporting (e.g. Spam, Fake info):");
        if (!reason) return;
        try {
            await API.post(`/interview-experiences/${id}/report`, { reason });
            toast.success('Report submitted to admins');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to report');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this experience?")) return;
        try {
            await API.delete(`/interview-experiences/${id}`);
            toast.success('Experience deleted');
            navigate('/interview-experiences');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (!exp) return null;

    const isAuthor = user?._id === exp.authorId?._id;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <HiOutlineArrowLeft className="w-4 h-4 mr-1.5" /> Back to experiences
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{exp.companyName}</h1>
                                <p className="text-lg font-medium text-slate-600">{exp.role}</p>
                            </div>
                            {isAuthor && (
                                <button onClick={handleDelete} className="text-red-500 hover:text-red-600 p-2 bg-red-50 rounded-lg">
                                    <HiOutlineTrash className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6 border-y border-slate-100 py-4">
                            <div className="flex items-center text-sm text-slate-600">
                                <HiOutlineBuildingOffice2 className="w-5 h-5 text-slate-400 mr-2" />
                                <span>{exp.interviewType}</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <HiOutlineClock className="w-5 h-5 text-slate-400 mr-2" />
                                <span>{exp.interviewYear}</span>
                            </div>
                            {exp.department && (
                                <div className="flex items-center text-sm text-slate-600">
                                    <HiOutlineAcademicCap className="w-5 h-5 text-slate-400 mr-2" />
                                    <span>{exp.department}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                exp.result === 'Selected' || exp.result === 'Offer Received' ? 'bg-green-100 text-green-700' :
                                exp.result === 'Rejected' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                                {exp.result}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                exp.overallDifficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                                exp.overallDifficulty === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                'bg-emerald-100 text-emerald-700'
                            }`}>
                                {exp.overallDifficulty} Difficulty
                            </span>
                        </div>
                    </div>

                    {/* Overall Experience */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Overall Experience</h2>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{exp.overallExperience}</p>
                    </div>

                    {/* Timeline of Rounds */}
                    {exp.rounds && exp.rounds.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Interview Rounds</h2>
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {exp.rounds.map((round, idx) => (
                                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                                            {round.roundNumber}
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-slate-900">{round.roundType}</h3>
                                                {round.duration && <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">{round.duration}</span>}
                                            </div>
                                            {round.topics && round.topics.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {round.topics.map((t, i) => <span key={i} className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{t}</span>)}
                                                </div>
                                            )}
                                            {round.questions && round.questions.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs font-semibold text-slate-700 mb-1">Questions Asked:</p>
                                                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                                        {round.questions.map((q, i) => <li key={i}>{q}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Advice */}
                    {exp.adviceForStudents && (
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 md:p-8 text-white relative overflow-hidden">
                            <HiOutlineSparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/10" />
                            <h2 className="text-xl font-bold mb-3 relative z-10">Advice for Juniors</h2>
                            <p className="whitespace-pre-wrap leading-relaxed opacity-90 relative z-10">{exp.adviceForStudents}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Action Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex flex-col space-y-3">
                            <button onClick={toggleVote} className={`w-full flex justify-center items-center py-2.5 rounded-lg border font-medium transition-colors ${exp.hasVoted ? 'bg-primary text-white border-primary hover:bg-primary-dark' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                                {exp.hasVoted ? <HiHandThumbUp className="w-5 h-5 mr-2" /> : <HiOutlineHandThumbUp className="w-5 h-5 mr-2" />}
                                {exp.hasVoted ? 'Helpful' : 'Mark as Helpful'} ({exp.helpfulCount})
                            </button>
                            
                            <button onClick={toggleBookmark} className={`w-full flex justify-center items-center py-2.5 rounded-lg border font-medium transition-colors ${exp.hasBookmarked ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                                {exp.hasBookmarked ? <HiBookmark className="w-5 h-5 mr-2" /> : <HiOutlineBookmark className="w-5 h-5 mr-2" />}
                                {exp.hasBookmarked ? 'Bookmarked' : 'Save for Later'}
                            </button>
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    {insightsLoading ? (
                        <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6 animate-pulse">
                            <div className="h-6 bg-indigo-200 rounded w-1/2 mb-4"></div>
                            <div className="h-20 bg-indigo-100 rounded mb-4"></div>
                        </div>
                    ) : insights ? (
                        <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text font-black italic text-sm flex items-center">
                                    <HiOutlineSparkles className="w-4 h-4 mr-1 text-indigo-600" /> AI Insight
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-slate-900 mb-4 pt-4">Pattern Summary</h3>
                            <p className="text-xs text-slate-500 mb-4">Based on {insights.basedOnExperienceCount} submitted experiences for this role.</p>
                            
                            <div className="space-y-4">
                                {insights.frequentlyMentionedSkills?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Top Skills</p>
                                        <div className="flex flex-wrap gap-1">
                                            {insights.frequentlyMentionedSkills.map((s,i) => <span key={i} className="text-[10px] bg-white border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {insights.generalRecommendations && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">AI Recommendation</p>
                                        <p className="text-sm text-slate-700 bg-white/60 p-3 rounded-lg border border-indigo-50 leading-relaxed">{insights.generalRecommendations}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Author Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Shared By</h3>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                {exp.authorId?.profilePhoto ? (
                                    <img src={getImageUrl(exp.authorId.profilePhoto)} className="w-full h-full object-cover" alt="Author" />
                                ) : (
                                    <span className="text-slate-500 font-bold">{exp.authorId?.name?.charAt(0) || '?'}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{exp.authorId?.name}</p>
                                <p className="text-xs text-slate-500">{exp.authorId?.role}</p>
                            </div>
                        </div>
                        
                        {!exp.isAnonymous && exp.authorId?._id !== user?._id && exp.authorId?.name !== 'Anonymous' && (
                            <Link to={`/profile/${exp.authorId._id}`} className="mt-4 block text-center text-sm text-primary font-medium hover:underline">
                                View Full Profile
                            </Link>
                        )}
                    </div>

                    {/* Report */}
                    <button onClick={handleReport} className="flex items-center text-sm text-slate-400 hover:text-red-500 mx-auto transition-colors">
                        <HiOutlineFlag className="w-4 h-4 mr-1.5" /> Report this experience
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewExperienceDetail;
