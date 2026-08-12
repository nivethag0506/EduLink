const express = require('express');
const router = express.Router();
const { createPost, getFeed, toggleLike, addComment, deletePost, getLikes } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.fields([
    { name: 'media', maxCount: 5 },
    { name: 'fileAttachment', maxCount: 1 }
]), createPost);
router.get('/', protect, getFeed);
router.put('/:id/like', protect, toggleLike);
router.get('/:id/likes', protect, getLikes);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;
