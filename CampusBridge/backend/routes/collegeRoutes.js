const express = require('express');
const router = express.Router();
const College = require('../models/College');

// Public route — colleges list for signup dropdown
router.get('/', async (req, res) => {
    try {
        const colleges = await College.find().select('name code domain logo');
        res.json(colleges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
