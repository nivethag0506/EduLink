const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getJobDetails,
    applyJob,
    getStudentApplications,
    getAlumniJobApplicants,
    updateApplicationStatus,
    deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/', protect, createJob);
router.get('/', protect, getJobs);
router.get('/applications', protect, getStudentApplications);
router.get('/alumni-applicants', protect, getAlumniJobApplicants);
router.put('/applications/:id', protect, updateApplicationStatus);
router.get('/:id', protect, getJobDetails);
router.post('/:id/apply', protect, upload.single('resume'), applyJob);
router.delete('/:id', protect, deleteJob);

module.exports = router;
