const Post = require('../models/Post');
const Notification = require('../models/Notification');

// POST /api/posts
const createPost = async (req, res) => {
    try {
        const { content, type } = req.body;
        const post = await Post.create({
            authorId: req.user._id,
            collegeId: req.user.collegeId,
            content,
            type: type || 'Doubt',
            media: req.files?.media ? req.files.media.map(f => f.path) : [],
            fileAttachment: req.files?.fileAttachment ? req.files.fileAttachment[0].path : null,
        });
        const populated = await post.populate('authorId', 'name profilePhoto role');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/posts/:id
const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        if (post.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }

        const { content, type } = req.body;
        post.content = content || post.content;
        post.type = type || post.type;
        
        await post.save();
        
        const populated = await post.populate('authorId', 'name profilePhoto role');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/posts  — college-scoped feed
const getFeed = async (req, res) => {
    try {
        const { type, page = 1 } = req.query;
        const filter = { collegeId: req.user.collegeId };
        if (type) filter.type = type;
        const limit = 20;
        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('authorId', 'name profilePhoto role')
            .populate('comments.userId', 'name profilePhoto');
        const total = await Post.countDocuments(filter);
        res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/posts/:id/like
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.collegeId.toString() !== req.user.collegeId.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const idx = post.likes.indexOf(req.user._id);
        if (idx === -1) {
            post.likes.push(req.user._id);
            // Notify author
            if (post.authorId.toString() !== req.user._id.toString()) {
                await Notification.create({
                    userId: post.authorId,
                    type: 'POST_LIKED',
                    content: `${req.user.name} liked your post`,
                    link: `/feed`
                });
            }
        } else {
            post.likes.splice(idx, 1);
        }
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/posts/:id/comment
const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.collegeId.toString() !== req.user.collegeId.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        post.comments.push({ userId: req.user._id, content: req.body.content });
        await post.save();
        if (post.authorId.toString() !== req.user._id.toString()) {
            await Notification.create({
                userId: post.authorId,
                type: 'COMMENT_ADDED',
                content: `${req.user.name} commented on your post`,
                link: `/feed`
            });
        }
        const updated = await Post.findById(post._id)
            .populate('authorId', 'name profilePhoto role')
            .populate('comments.userId', 'name profilePhoto');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/posts/:id
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/posts/:id/likes
const getLikes = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('likes', 'name profilePhoto role');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post.likes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPost, getFeed, toggleLike, addComment, deletePost, getLikes, updatePost };
