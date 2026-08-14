import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/getImageUrl';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowLeft, HiOutlineFolderOpen, HiOutlineAcademicCap, 
    HiOutlineBriefcase, HiOutlineHandThumbUp, HiOutlineBookmark, 
    HiOutlineFlag, HiOutlineTrash, HiHandThumbUp, HiBookmark,
    HiStar, HiOutlineDocumentArrowDown, HiOutlineLink,
    HiOutlineDocumentText, HiOutlineVideoCamera, HiOutlineCodeBracket, HiOutlinePhoto
} from 'react-icons/hi2';

const ResourceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [resData, setResData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResource();
    }, [id]);

    const fetchResource = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/resources/${id}`);
            setResData(data);
        } catch (error) {
            toast.error('Resource not found');
            navigate('/resources');
        } finally {
            setLoading(false);
        }
    };

    const toggleVote = async () => {
        try {
            if (resData.hasVoted) {
                await API.delete(`/resources/${id}/vote`);
                setResData(prev => ({ ...prev, hasVoted: false, helpfulCount: prev.helpfulCount - 1 }));
            } else {
                await API.post(`/resources/${id}/vote`);
                setResData(prev => ({ ...prev, hasVoted: true, helpfulCount: prev.helpfulCount + 1 }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const toggleBookmark = async () => {
        try {
            if (resData.hasBookmarked) {
                await API.delete(`/resources/${id}/bookmark`);
                setResData(prev => ({ ...prev, hasBookmarked: false, bookmarkCount: prev.bookmarkCount - 1 }));
            } else {
                await API.post(`/resources/${id}/bookmark`);
                setResData(prev => ({ ...prev, hasBookmarked: true, bookmarkCount: prev.bookmarkCount + 1 }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleRate = async (rating) => {
        try {
            const { data } = await API.post(`/resources/${id}/rate`, { rating });
            setResData(prev => ({ ...prev, userRating: rating, averageRating: data.averageRating, ratingCount: data.ratingCount }));
            toast.success('Rating saved');
        } catch (error) {
            toast.error('Failed to rate');
        }
    };

    const handleReport = async () => {
        const reason = window.prompt("Reason for reporting (e.g. Spam, Copyright):");
        if (!reason) return;
        try {
            await API.post(`/resources/${id}/report`, { reason });
            toast.success('Report submitted to admins');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to report');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        try {
            await API.delete(`/resources/${id}`);
            toast.success('Resource deleted');
            navigate('/resources');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleAccess = async () => {
        try {
            // Track download/access
            await API.post(`/resources/${id}/download`);
            setResData(prev => ({ ...prev, downloadCount: prev.downloadCount + 1 }));

            // Open URL
            if (resData.externalUrl) {
                window.open(resData.externalUrl, '_blank');
            } else if (resData.fileUrl) {
                // In production, build full URL if needed based on API config
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const fullUrl = resData.fileUrl.startsWith('http') ? resData.fileUrl : `${backendUrl}/${resData.fileUrl}`;
                window.open(fullUrl, '_blank');
            }
        } catch (error) {
            console.error('Failed to track download', error);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    
    if (!resData) return null;

    const isAuthor = user?._id === resData.uploadedBy?._id;

    const getIconForType = (type) => {
        switch(type) {
            case 'PDF': return <HiOutlineDocumentText className="w-10 h-10 text-red-500" />;
            case 'DOC':
            case 'DOCX': return <HiOutlineDocumentText className="w-10 h-10 text-blue-500" />;
            case 'PPT':
            case 'PPTX': return <HiOutlineDocumentText className="w-10 h-10 text-orange-500" />;
            case 'YouTube Link': return <HiOutlineVideoCamera className="w-10 h-10 text-red-600" />;
            case 'GitHub Repository': return <HiOutlineCodeBracket className="w-10 h-10 text-slate-800" />;
            case 'Image': return <HiOutlinePhoto className="w-10 h-10 text-emerald-500" />;
            default: return <HiOutlineLink className="w-10 h-10 text-indigo-500" />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <HiOutlineArrowLeft className="w-4 h-4 mr-1.5" /> Back to Resources
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
                                    {getIconForType(resData.resourceType)}
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{resData.title}</h1>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">{resData.category}</span>
                                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">{resData.subcategory}</span>
                                        {resData.verificationBadge !== 'None' && (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                                                {resData.verificationBadge} ✓
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {(isAuthor || user?.role === 'Admin') && (
                                <button onClick={handleDelete} className="text-red-500 hover:text-red-600 p-2 bg-red-50 rounded-lg shrink-0">
                                    <HiOutlineTrash className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 border-y border-slate-100 py-4 mb-4">
                            <div className="flex items-center text-sm text-slate-600">
                                <HiOutlineFolderOpen className="w-5 h-5 text-slate-400 mr-2" />
                                <span>{resData.resourceType}</span>
                            </div>
                            {resData.department && (
                                <div className="flex items-center text-sm text-slate-600">
                                    <HiOutlineAcademicCap className="w-5 h-5 text-slate-400 mr-2" />
                                    <span>{resData.department}</span>
                                </div>
                            )}
                            {resData.company && (
                                <div className="flex items-center text-sm text-slate-600">
                                    <HiOutlineBriefcase className="w-5 h-5 text-slate-400 mr-2" />
                                    <span>{resData.company}</span>
                                </div>
                            )}
                        </div>

                        <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-6">{resData.description}</p>

                        {(resData.skills?.length > 0 || resData.tags?.length > 0) && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-2">Tags & Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {[...(resData.skills || []), ...(resData.tags || [])].map((t, i) => (
                                        <span key={i} className="text-xs font-medium border border-slate-200 text-slate-600 px-3 py-1 rounded-full">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Action Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <button onClick={handleAccess} className="w-full flex justify-center items-center py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 mb-4">
                            {resData.externalUrl ? <HiOutlineLink className="w-5 h-5 mr-2" /> : <HiOutlineDocumentArrowDown className="w-5 h-5 mr-2" />}
                            {resData.externalUrl ? 'Open Link' : 'Download File'}
                            {resData.fileSize > 0 && <span className="ml-1 text-primary-light font-normal">({(resData.fileSize / 1024 / 1024).toFixed(1)} MB)</span>}
                        </button>

                        <div className="flex space-x-3 mb-6">
                            <button onClick={toggleVote} className={`flex-1 flex justify-center items-center py-2 rounded-lg border font-medium transition-colors ${resData.hasVoted ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                                {resData.hasVoted ? <HiHandThumbUp className="w-5 h-5 mr-1" /> : <HiOutlineHandThumbUp className="w-5 h-5 mr-1" />}
                                {resData.helpfulCount}
                            </button>
                            
                            <button onClick={toggleBookmark} className={`flex-1 flex justify-center items-center py-2 rounded-lg border font-medium transition-colors ${resData.hasBookmarked ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                                {resData.hasBookmarked ? <HiBookmark className="w-5 h-5 mr-1" /> : <HiOutlineBookmark className="w-5 h-5 mr-1" />}
                                Save
                            </button>
                        </div>

                        {/* Ratings */}
                        <div className="border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-800">Rate this resource</span>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center">
                                    <HiStar className="w-3 h-3 text-amber-400 mr-1" /> 
                                    {resData.averageRating.toFixed(1)} ({resData.ratingCount})
                                </span>
                            </div>
                            <div className="flex justify-between mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => handleRate(star)}
                                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                                    >
                                        <HiStar className={`w-8 h-8 ${resData.userRating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Uploader Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Contributed By</h3>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                {resData.uploadedBy?.profilePhoto ? (
                                    <img src={getImageUrl(resData.uploadedBy.profilePhoto)} className="w-full h-full object-cover" alt="Uploader" />
                                ) : (
                                    <span className="text-slate-500 font-bold">{resData.uploadedBy?.name?.charAt(0) || '?'}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{resData.uploadedBy?.name}</p>
                                <p className="text-xs text-slate-500">{resData.uploadedBy?.role}</p>
                            </div>
                        </div>
                        
                        {resData.uploadedBy?._id !== user?._id && (
                            <Link to={`/profile/${resData.uploadedBy?._id}`} className="mt-4 block text-center text-sm text-primary font-medium hover:underline">
                                View Profile
                            </Link>
                        )}
                    </div>

                    {/* Report */}
                    <button onClick={handleReport} className="flex items-center text-sm text-slate-400 hover:text-red-500 mx-auto transition-colors">
                        <HiOutlineFlag className="w-4 h-4 mr-1.5" /> Report resource
                    </button>
                </div>
            </div>

            {/* Related Resources */}
            {resData.relatedResources && resData.relatedResources.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Similar Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {resData.relatedResources.map(related => (
                            <div key={related._id} onClick={() => { navigate(`/resources/${related._id}`); window.scrollTo(0, 0); }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{related.title}</h3>
                                <p className="text-xs text-slate-500 mb-3">{related.subcategory}</p>
                                <div className="flex items-center space-x-3 text-xs text-slate-600 font-medium">
                                    <span className="flex items-center"><HiStar className="w-3.5 h-3.5 mr-0.5 text-amber-400" /> {related.averageRating.toFixed(1)}</span>
                                    <span className="flex items-center"><HiOutlineDocumentArrowDown className="w-3.5 h-3.5 mr-0.5" /> {related.downloadCount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceDetail;
