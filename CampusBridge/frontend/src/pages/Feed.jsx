import { getImageUrl } from "../utils/getImageUrl";
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineHeart, HiHeart, HiOutlineChatBubbleLeft, HiOutlinePaperClip, HiOutlinePhoto, HiOutlineTrash, HiOutlinePencilSquare, HiOutlineXMark } from 'react-icons/hi2';

const POST_TYPES = ['All', 'Doubt', 'Project', 'Internship', 'Event', 'Announcement'];
const POST_TYPE_COLORS = {
    Doubt: 'badge-warning', Project: 'badge-primary', Internship: 'badge-success',
    Event: 'badge-danger', Announcement: 'badge-primary'
};

const Feed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('Doubt');
    const [filterType, setFilterType] = useState('All');
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

    const fetchPosts = async () => {
        try {
            const params = filterType !== 'All' ? { type: filterType } : {};
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
        <div className="max-w-2xl mx-auto space-y-6 text-slate-800 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {user?.collegeName ? `${user.collegeName} Feed` : 'College Feed'}
            </h1>

            {/* Create Post */}
            <form onSubmit={handleCreatePost} className="card bg-white border border-slate-100 rounded-3xl space-y-4 p-6 shadow-sm">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                        {user?.name?.charAt(0)}
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="input-field min-h-[90px] resize-none bg-slate-50"
                        placeholder="Share something with your college..."
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-3 gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <select value={postType} onChange={(e) => setPostType(e.target.value)} className="input-field text-xs py-2 w-auto bg-slate-50 cursor-pointer">
                            {POST_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <label className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <HiOutlinePhoto className="w-4 h-4 text-secondary" />
                            <input type="file" accept="image/*" multiple onChange={(e) => setMediaFiles(e.target.files)} className="hidden" />
                            <span className="hidden sm:inline">Photo</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <HiOutlinePaperClip className="w-4 h-4 text-accent" />
                            <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="hidden" />
                            <span className="hidden sm:inline">PDF</span>
                        </label>
                    </div>
                    <button type="submit" className="btn-primary text-xs py-2 px-5 cursor-pointer w-full sm:w-auto">Post</button>
                </div>
            </form>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {POST_TYPES.map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${filterType === t ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-slate-800'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Posts */}
            {loading ? (
                <div className="text-center py-12 text-slate-500 font-medium">Loading feed...</div>
            ) : posts.length === 0 ? (
                <div className="card border border-slate-100 rounded-3xl text-center py-16 text-slate-400 bg-white">
                    No posts yet. Be the first to share!
                </div>
            ) : (
                posts.map(post => (
                    <div key={post._id} className="card border border-slate-100 bg-white rounded-3xl space-y-4 p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <a href={`/profile/${post.authorId?._id}`} className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer">
                                {post.authorId?.name?.charAt(0)}
                            </a>
                            <div className="flex-1 min-w-0">
                                <a href={`/profile/${post.authorId?._id}`} className="text-slate-900 font-semibold text-sm hover:text-primary transition-colors cursor-pointer block truncate">{post.authorId?.name}</a>
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">{post.authorId?.role} · {timeAgo(post.createdAt)}</p>
                            </div>
                            {post.authorId?._id === user?._id && (
                                <div className="flex items-center gap-2 mr-2">
                                    <button onClick={() => startEditing(post)} className="p-1 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer" title="Edit Post">
                                        <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeletePost(post._id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete Post">
                                        <HiOutlineTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                            <span className={POST_TYPE_COLORS[post.type] || 'badge-primary'}>{post.type}</span>
                        </div>

                        {editingPostId === post._id ? (
                            <div className="space-y-3">
                                <textarea 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="input-field min-h-[100px] resize-none text-sm bg-white"
                                />
                                <div className="flex items-center justify-between">
                                    <select 
                                        value={editType} 
                                        onChange={(e) => setEditType(e.target.value)}
                                        className="input-field text-xs py-1.5 w-32 bg-white"
                                    >
                                        {POST_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditingPostId(null)} className="btn-secondary text-xs py-1.5 px-4 cursor-pointer">Cancel</button>
                                        <button onClick={() => handleUpdatePost(post._id)} className="btn-primary text-xs py-1.5 px-4 cursor-pointer">Save</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-700 leading-relaxed text-sm">{post.content}</p>
                        )}

                        {post.media?.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden border border-slate-100">
                                {post.media.map((m, i) => (
                                    <img key={i} src={getImageUrl(m)} alt="" className="w-full h-48 object-cover hover:scale-102 transition-transform duration-500" />
                                ))}
                            </div>
                        )}

                        {post.fileAttachment && (
                            <a href={getImageUrl(post.fileAttachment)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary text-xs font-semibold hover:underline bg-primary/5 border border-primary/10 rounded-xl py-2 px-3.5">
                                <HiOutlinePaperClip className="w-4 h-4" /> View Attachment (PDF)
                            </a>
                        )}

                        <div className="flex items-center gap-6 pt-3.5 border-t border-slate-100">
                            <div className="relative flex items-center">
                                <button onClick={() => handleLike(post._id)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-pink-500 transition-colors cursor-pointer">
                                    {post.likes?.includes(user?._id) ? <HiHeart className="w-5 h-5 text-pink-500" /> : <HiOutlineHeart className="w-5 h-5" />}
                                </button>
                                <span
                                    onClick={() => handleShowLikers(post._id)}
                                    className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline ml-2">
                                    {post.likes?.length || 0}
                                </span>

                                {showLikers[post._id] && likersMap[post._id] && (
                                    <div className="absolute top-8 left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 max-h-48 overflow-y-auto">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Liked by</h4>
                                        {likersMap[post._id].length === 0 ? (
                                            <p className="text-xs text-slate-400 px-3">No likes yet</p>
                                        ) : (
                                            likersMap[post._id].map(liker => (
                                                <a key={liker._id} href={`/profile/${liker._id}`} className="block px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">
                                                    <img src={liker.profilePhoto ? getImageUrl(liker.profilePhoto) : `https://ui-avatars.com/api/?name=${liker.name}&size=24`} className="w-6 h-6 rounded-full" alt="" />
                                                    <div className="flex-1 truncate">
                                                        <p className="text-slate-900 text-xs whitespace-nowrap overflow-hidden text-ellipsis">{liker.name}</p>
                                                    </div>
                                                </a>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors cursor-pointer">
                                <HiOutlineChatBubbleLeft className="w-5 h-5" />
                                <span className="text-xs font-semibold">{post.comments?.length || 0}</span>
                            </button>
                        </div>

                        {showComments[post._id] && (
                            <div className="space-y-3 pt-3.5 border-t border-slate-100">
                                {post.comments?.map((c, i) => (
                                    <div key={i} className="flex gap-2.5 items-start">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold shrink-0">
                                            {c.userId?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl px-4 py-2.5 flex-1 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-900">{c.userId?.name}</p>
                                            <p className="text-xs text-slate-600 mt-1">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-2 pt-2">
                                    <input
                                        value={commentText[post._id] || ''}
                                        onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                                        className="input-field text-xs py-2 bg-white"
                                        placeholder="Write a comment..."
                                    />
                                    <button onClick={() => handleComment(post._id)} className="btn-primary text-xs py-2 px-4 cursor-pointer">Send</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default Feed;
