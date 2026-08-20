import { getImageUrl } from "../utils/getImageUrl";
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    HiOutlineHeart, HiHeart, HiOutlineChatBubbleLeft, 
    HiOutlinePaperClip, HiOutlinePhoto, HiOutlineTrash, 
    HiOutlinePencilSquare, HiOutlineVideoCamera,
    HiOutlineChartBar, HiOutlineTrophy, HiOutlineAdjustmentsHorizontal,
    HiOutlineBars4, HiOutlineSquares2X2, HiOutlineShare,
    HiOutlineBookmark, HiOutlineFire, HiOutlineBriefcase,
    HiOutlineDocumentText, HiOutlineGlobeAlt, HiOutlineCalendar,
    HiOutlineGift, HiOutlineUserPlus, HiOutlineSparkles
} from 'react-icons/hi2';

const POST_TYPES = ['Doubt', 'Project', 'Internship', 'Event', 'Announcement'];
const FEED_FILTERS = ['All Posts', 'Following', 'Connections', 'My College', 'Mentorship', 'Opportunities'];

const POST_TYPE_COLORS = {
    Doubt: 'bg-amber-100 text-amber-700 border-amber-200', 
    Project: 'bg-primary/10 text-primary border-primary/20', 
    Internship: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Event: 'bg-rose-100 text-rose-700 border-rose-200', 
    Announcement: 'bg-blue-100 text-blue-700 border-blue-200'
};

const Feed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('Doubt');
    const [filterType, setFilterType] = useState('All Posts');
    const [mediaFiles, setMediaFiles] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [commentText, setCommentText] = useState({});
    const [showComments, setShowComments] = useState({});
    const [showLikers, setShowLikers] = useState({});
    const [likersMap, setLikersMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editType, setEditType] = useState('Doubt');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const fetchPosts = async () => {
        try {
            setLoading(true);
            // Map visual filters to actual backend behavior if possible, or just fetch all
            // For now, if it's not a known backend type, we don't pass type filter
            const validBackendTypes = ['Doubt', 'Project', 'Internship', 'Event', 'Announcement'];
            const params = validBackendTypes.includes(filterType) ? { type: filterType } : {};
            const { data } = await API.get('/posts', { params });
            setPosts(data.posts || []);
        } catch (err) {
            toast.error('Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, [filterType]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        const formData = new FormData();
        formData.append('content', content);
        formData.append('type', postType);
        if (mediaFiles) {
            for (let f of mediaFiles) formData.append('media', f);
        }
        if (pdfFile) formData.append('fileAttachment', pdfFile);
        try {
            const { data } = await API.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setPosts([data, ...posts]);
            setContent(''); setMediaFiles(null); setPdfFile(null);
            toast.success('Post created!');
        } catch (err) {
            toast.error('Failed to create post');
        }
    };

    const handleLike = async (postId) => {
        try {
            const { data } = await API.put(`/posts/${postId}/like`);
            setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
        } catch (err) {
            toast.error('Failed to like post');
        }
    };

    const handleShowLikers = async (postId) => {
        if (showLikers[postId]) {
            setShowLikers({ ...showLikers, [postId]: false });
            return;
        }
        try {
            const { data } = await API.get(`/posts/${postId}/likes`);
            setLikersMap({ ...likersMap, [postId]: data });
            setShowLikers({ ...showLikers, [postId]: true });
        } catch (err) {
            toast.error('Failed to load likers');
        }
    };

    const handleComment = async (postId) => {
        if (!commentText[postId]?.trim()) return;
        try {
            const { data } = await API.post(`/posts/${postId}/comment`, { content: commentText[postId] });
            setPosts(posts.map(p => p._id === postId ? data : p));
            setCommentText({ ...commentText, [postId]: '' });
        } catch (err) {
            toast.error('Failed to add comment');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await API.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            toast.success('Post deleted');
        } catch (err) {
            toast.error('Failed to delete post');
        }
    };

    const startEditing = (post) => {
        setEditingPostId(post._id);
        setEditContent(post.content);
        setEditType(post.type);
    };

    const handleUpdatePost = async (postId) => {
        if (!editContent.trim()) return;
        try {
            const { data } = await API.put(`/posts/${postId}`, { content: editContent, type: editType });
            setPosts(posts.map(p => p._id === postId ? data : p));
            setEditingPostId(null);
            toast.success('Post updated');
        } catch (err) {
            toast.error('Failed to update post');
        }
    };

    const timeAgo = (date) => {
        const s = Math.floor((Date.now() - new Date(date)) / 1000);
        if (s < 60) return 'just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in w-full max-w-7xl mx-auto pb-12">
            
            {/* Main Feed Column */}
            <div className="xl:col-span-8 space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Campus Feed
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            Stay connected with what's happening across your campus network.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 py-2 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]">
                        <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
                        <span className="hidden sm:inline">Customize Feed</span>
                    </button>
                </div>

                {/* Create Post */}
                <form onSubmit={handleCreatePost} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow duration-300">
                    <div className="flex gap-4">
                        <img 
                            src={user?.profilePhoto ? getImageUrl(user.profilePhoto) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'S')}&background=6366f1&color=fff`} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-50 shadow-sm shrink-0"
                        />
                        <div className="flex-1">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full text-slate-700 bg-slate-50/50 border border-slate-100 hover:border-slate-200 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-xl p-4 text-sm resize-none min-h-[100px] transition-all placeholder:text-slate-400 font-medium"
                                placeholder="Share your thoughts, updates or opportunities..."
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 flex-wrap">
                            <button type="button" onClick={() => document.querySelector('textarea').focus()} className="flex items-center gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors active:scale-95 text-sm font-semibold">
                                <HiOutlineDocumentText className="w-5 h-5 text-indigo-500" />
                                <span>Text</span>
                            </button>
                            
                            <label className="flex items-center gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors active:scale-95 text-sm font-semibold cursor-pointer">
                                <HiOutlinePhoto className="w-5 h-5 text-emerald-500" />
                                <input type="file" accept="image/*" multiple onChange={(e) => setMediaFiles(e.target.files)} className="hidden" />
                                <span>Image</span>
                            </label>
                            
                            <label className="flex items-center gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors active:scale-95 text-sm font-semibold cursor-pointer">
                                <HiOutlineVideoCamera className="w-5 h-5 text-rose-500" />
                                <input type="file" accept="video/*" onChange={(e) => setMediaFiles(e.target.files)} className="hidden" />
                                <span>Video</span>
                            </label>

                            <button type="button" className="flex items-center gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors active:scale-95 text-sm font-semibold">
                                <HiOutlineChartBar className="w-5 h-5 text-amber-500" />
                                <span>Poll</span>
                            </button>

                            <button type="button" className="flex items-center gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors active:scale-95 text-sm font-semibold">
                                <HiOutlineTrophy className="w-5 h-5 text-blue-500" />
                                <span>Achievement</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <select value={postType} onChange={(e) => setPostType(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-primary font-medium w-full sm:w-32 cursor-pointer transition-colors hover:bg-slate-100">
                                {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button type="submit" className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.97] w-full sm:w-auto whitespace-nowrap">
                                Post
                            </button>
                        </div>
                    </div>
                </form>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 sticky top-[72px] z-20 bg-slate-50/80 backdrop-blur-md">
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar flex-1">
                        {FEED_FILTERS.map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 active:scale-95 border ${filterType === t ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                            <span>Sort by:</span>
                            <select className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer">
                                <option>Recent</option>
                                <option>Most Relevant</option>
                            </select>
                        </div>
                        <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                                <HiOutlineBars4 className="w-5 h-5" />
                            </button>
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                                <HiOutlineSquares2X2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Posts */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl text-center py-24 px-4 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <HiOutlineSparkles className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Your campus feed is waiting for its first story.</h3>
                        <p className="text-slate-500 text-sm mb-6 max-w-sm">Share an achievement, opportunity, project or useful resource with your campus.</p>
                        <button onClick={() => document.querySelector('textarea').focus()} className="bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2">
                            <HiOutlinePencilSquare className="w-5 h-5" />
                            Create First Post
                        </button>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                        {posts.map(post => (
                            <div key={post._id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col group">
                                
                                {/* Post Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    <a href={`/profile/${post.authorId?._id}`} className="shrink-0 active:scale-95 transition-transform">
                                        <img 
                                            src={post.authorId?.profilePhoto ? getImageUrl(post.authorId.profilePhoto) : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorId?.name || '?')}&background=random&color=fff`} 
                                            className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
                                            alt=""
                                        />
                                    </a>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <a href={`/profile/${post.authorId?._id}`} className="text-slate-900 font-bold text-[15px] hover:text-primary transition-colors block truncate">{post.authorId?.name}</a>
                                            {post.authorId?._id === user?._id && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEditing(post)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors active:scale-90" title="Edit Post">
                                                        <HiOutlinePencilSquare className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeletePost(post._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-90" title="Delete Post">
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{post.authorId?.role || 'STUDENT'}</span>
                                            <span className="text-slate-300 text-xs">•</span>
                                            <span className="text-slate-500 text-xs font-medium truncate">{post.authorId?.department || 'Engineering'} · {post.authorId?.batch || '2024'} Batch</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-slate-400 text-[11px] font-semibold">{timeAgo(post.createdAt)}</span>
                                            <span className="text-slate-300 text-[11px]">•</span>
                                            <HiOutlineGlobeAlt className="w-3.5 h-3.5 text-slate-400" title="Public" />
                                        </div>
                                    </div>
                                </div>

                                {/* Post Content */}
                                {editingPostId === post._id ? (
                                    <div className="space-y-3 mb-4 flex-1">
                                        <textarea 
                                            value={editContent} 
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full text-slate-700 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl p-3 text-sm resize-none min-h-[100px] outline-none"
                                        />
                                        <div className="flex items-center justify-between">
                                            <select 
                                                value={editType} 
                                                onChange={(e) => setEditType(e.target.value)}
                                                className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg px-3 py-2 outline-none font-medium"
                                            >
                                                {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setEditingPostId(null)} className="text-slate-500 font-semibold text-xs py-2 px-4 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                                <button onClick={() => handleUpdatePost(post._id)} className="bg-primary text-white font-semibold text-xs py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">Save</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4 flex-1">
                                        <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                        <div className="mt-3 flex gap-2">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${POST_TYPE_COLORS[post.type] || POST_TYPE_COLORS.Announcement}`}>{post.type}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Media Gallery */}
                                {post.media?.length > 0 && (
                                    <div className={`mt-2 mb-4 rounded-xl overflow-hidden border border-slate-100 grid gap-1 ${post.media.length === 1 ? 'grid-cols-1' : post.media.length === 2 ? 'grid-cols-2' : post.media.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                        {post.media.slice(0, 4).map((m, i) => (
                                            <div key={i} className={`relative group cursor-pointer ${post.media.length === 3 && i === 0 ? 'col-span-2' : ''}`}>
                                                <img src={getImageUrl(m)} alt="" className="w-full h-48 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
                                                {i === 3 && post.media.length > 4 && (
                                                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
                                                        <span className="text-white font-bold text-2xl">+{post.media.length - 4}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {post.fileAttachment && (
                                    <div className="mb-4">
                                        <a href={getImageUrl(post.fileAttachment)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 transition-colors w-full sm:w-auto">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                                <HiOutlinePaperClip className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <span className="truncate">View Document (PDF)</span>
                                        </a>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1 sm:gap-4">
                                        <div className="relative flex items-center">
                                            <button onClick={() => handleLike(post._id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 active:scale-[0.95] ${post.likes?.includes(user?._id) ? 'text-rose-500 bg-rose-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                                                {post.likes?.includes(user?._id) ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                                                <span className="text-sm font-bold">{post.likes?.length || 0}</span>
                                            </button>
                                            
                                            {showLikers[post._id] && likersMap[post._id] && (
                                                <div className="absolute bottom-12 left-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 py-2 max-h-56 overflow-y-auto animate-fade-in">
                                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2">Liked by</h4>
                                                    {likersMap[post._id].length === 0 ? (
                                                        <p className="text-xs text-slate-400 px-4 pb-2 font-medium">No likes yet</p>
                                                    ) : (
                                                        likersMap[post._id].map(liker => (
                                                            <a key={liker._id} href={`/profile/${liker._id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors">
                                                                <img src={liker.profilePhoto ? getImageUrl(liker.profilePhoto) : `https://ui-avatars.com/api/?name=${encodeURIComponent(liker.name)}&background=random&color=fff`} className="w-7 h-7 rounded-full object-cover border border-slate-200" alt="" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-slate-900 text-xs font-bold truncate">{liker.name}</p>
                                                                    <p className="text-slate-500 text-[10px] font-medium truncate">{liker.role}</p>
                                                                </div>
                                                            </a>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })} className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 px-3 py-2 rounded-lg transition-all duration-300 active:scale-[0.95]">
                                            <HiOutlineChatBubbleLeft className="w-5 h-5" />
                                            <span className="text-sm font-bold">{post.comments?.length || 0}</span>
                                        </button>
                                        
                                        <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 px-3 py-2 rounded-lg transition-all duration-300 active:scale-[0.95] hidden sm:flex">
                                            <HiOutlineShare className="w-5 h-5" />
                                            <span className="text-sm font-bold">Share</span>
                                        </button>
                                    </div>
                                    
                                    <button className="text-slate-400 hover:text-primary hover:bg-primary/5 p-2 rounded-lg transition-all duration-300 active:scale-95">
                                        <HiOutlineBookmark className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {showComments[post._id] && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fade-in">
                                        {post.comments?.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center font-medium">Be the first to comment.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {post.comments?.map((c, i) => (
                                                    <div key={i} className="flex gap-3 items-start group/comment">
                                                        <a href={`/profile/${c.userId?._id}`} className="shrink-0 mt-1">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 text-xs font-bold border border-indigo-200">
                                                                {c.userId?.name?.charAt(0) || '?'}
                                                            </div>
                                                        </a>
                                                        <div className="flex-1">
                                                            <div className="bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3 inline-block max-w-full border border-slate-100">
                                                                <a href={`/profile/${c.userId?._id}`} className="text-[13px] font-bold text-slate-900 hover:underline">{c.userId?.name}</a>
                                                                <p className="text-slate-700 text-[13px] mt-0.5 leading-relaxed">{c.content}</p>
                                                            </div>
                                                            <div className="flex gap-3 mt-1 ml-2">
                                                                <button className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Like</button>
                                                                <button className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Reply</button>
                                                                <span className="text-[10px] text-slate-300 font-medium">Just now</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-3 items-start mt-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0 mt-1">
                                                {user?.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    value={commentText[post._id] || ''}
                                                    onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400"
                                                    placeholder="Write a professional comment..."
                                                />
                                                <button onClick={() => handleComment(post._id)} disabled={!commentText[post._id]?.trim()} className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm active:scale-95 shrink-0">
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:block xl:col-span-4 space-y-6">
                
                {/* Campus Pulse */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <HiOutlineFire className="w-5 h-5 text-yellow-300" />
                            <h3 className="font-bold text-lg tracking-tight">Campus Pulse</h3>
                        </div>
                        <p className="text-indigo-100 text-sm font-medium mb-4">What students are focusing on right now.</p>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>Placement Preparation</span>
                                    <span className="text-yellow-300">85%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-300 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>Hackathons & Projects</span>
                                    <span className="text-emerald-300">62%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-300 rounded-full" style={{ width: '62%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>Higher Studies (GRE/GATE)</span>
                                    <span className="text-blue-300">40%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-300 rounded-full" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trending on Campus */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Trending on Campus</h3>
                        <HiOutlineChartBar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-4">
                        {[
                            { tag: 'Hackathon2024', posts: 23, color: 'text-orange-500', bg: 'bg-orange-50' },
                            { tag: 'PlacementPrep', posts: 18, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            { tag: 'ResumeTips', posts: 15, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { tag: 'AIForGood', posts: 12, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { tag: 'CampusEvents', posts: 11, color: 'text-purple-500', bg: 'bg-purple-50' },
                        ].map((trend, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${trend.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                        <span className={`font-bold text-sm ${trend.color}`}>#</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{trend.tag}</p>
                                        <p className="text-xs text-slate-400 font-medium">{trend.posts} posts</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Upcoming Events</h3>
                        <a href="#" className="text-xs font-bold text-primary hover:underline">View All</a>
                    </div>
                    <div className="space-y-4">
                        {[
                            { date: '24', month: 'MAY', title: 'CodeSprint 3.0', type: 'Coding Competition', time: '10:00 AM - 5:00 PM', color: 'text-primary' },
                            { date: '28', month: 'MAY', title: 'Alumni Interaction', type: 'Career Guidance Session', time: '2:00 PM - 4:00 PM', color: 'text-orange-500' },
                            { date: '02', month: 'JUN', title: 'Web Dev Workshop', type: 'Hands-on Workshop', time: '11:00 AM - 1:00 PM', color: 'text-emerald-500' }
                        ].map((event, i) => (
                            <div key={i} className="flex gap-3 group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:border-slate-200 transition-colors">
                                    <span className={`text-[15px] font-black leading-none ${event.color}`}>{event.date}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{event.month}</span>
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{event.title}</h4>
                                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{event.type}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                                        <HiOutlineCalendar className="w-3 h-3" />
                                        <span>{event.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* People You May Know */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">People You May Know</h3>
                        <a href="#" className="text-xs font-bold text-primary hover:underline">View All</a>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Karthik R', role: 'Alumni', detail: '2022 Batch', extra: 'AI Engineer @ Zoho' },
                            { name: 'Divya S', role: 'Senior', detail: '2024 Batch', extra: 'SDE Intern @ Microsoft' },
                            { name: 'Gokul P', role: 'Student', detail: '3rd Year', extra: 'AI & DS • KEC' }
                        ].map((person, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0 border border-indigo-50">
                                    {person.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">{person.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">{person.role} • {person.detail}</p>
                                    <p className="text-[11px] text-slate-600 font-medium truncate">{person.extra}</p>
                                </div>
                                <button className="shrink-0 bg-white border border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary text-xs font-bold py-1.5 px-3 rounded-full transition-all active:scale-95">
                                    Connect
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Birthdays This Week */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            Birthdays This Week
                            <span className="text-xl">🎉</span>
                        </h3>
                        <a href="#" className="text-xs font-bold text-primary hover:underline">View All</a>
                    </div>
                    <div className="space-y-3">
                        {[
                            { name: 'Nivetha G', date: 'May 18' },
                            { name: 'Vikram R', date: 'May 20' },
                            { name: 'Sneha R', date: 'May 22' }
                        ].map((bday, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                                        {bday.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{bday.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{bday.date}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-primary bg-primary/5 hover:bg-primary hover:text-white rounded-lg transition-colors active:scale-95">
                                    <HiOutlineGift className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Feed;
