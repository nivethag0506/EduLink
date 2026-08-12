import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineBookmark, HiOutlineFolderOpen } from 'react-icons/hi2';

const ResourceBookmarks = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/resources/bookmarks');
            setBookmarks(data);
        } catch (error) {
            toast.error('Failed to load bookmarked resources');
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (e, id) => {
        e.stopPropagation();
        try {
            await API.delete(`/resources/${id}/bookmark`);
            setBookmarks(prev => prev.filter(b => b._id !== id));
            toast.success('Bookmark removed');
        } catch (error) {
            toast.error('Failed to remove bookmark');
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <HiOutlineArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                    <HiOutlineBookmark className="w-8 h-8 mr-2 text-indigo-500" /> Saved Resources
                </h1>
                <p className="text-slate-500 mt-1">Your bookmarked study materials, projects, and guides.</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white h-24 rounded-xl border border-slate-200"></div>
                    ))}
                </div>
            ) : bookmarks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <HiOutlineFolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No saved resources</h3>
                    <p className="text-slate-500 mt-1">Resources you bookmark will appear here.</p>
                    <Link to="/resources" className="mt-4 inline-block btn-primary px-6 py-2">
                        Browse Hub
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookmarks.map(res => (
                        <div key={res._id} onClick={() => navigate(`/resources/${res._id}`)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center group">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{res.title}</h3>
                                <p className="text-sm text-slate-500">{res.category} | {res.resourceType}</p>
                            </div>
                            <button 
                                onClick={(e) => removeBookmark(e, res._id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove Bookmark"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v14l-7-3.5L3 19V5z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResourceBookmarks;
