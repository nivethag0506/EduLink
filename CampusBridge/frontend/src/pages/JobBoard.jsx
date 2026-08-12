import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineBriefcase, HiOutlinePlusCircle, HiOutlineMagnifyingGlass, HiOutlineFunnel } from 'react-icons/hi2';

const JobBoard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [workMode, setWorkMode] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [newJob, setNewJob] = useState({
        title: '', company: '', location: '', type: 'Full-time',
        workMode: 'Onsite', description: '', requiredSkills: '', experienceRequired: 0
    });

    const isAlumni = ['Alumni', 'Senior'].includes(user?.role);

    const fetchJobs = async () => {
        try {
            const { data } = await API.get('/jobs');
            setJobs(data);
        } catch {
            toast.error('Failed to load job listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await API.post('/jobs', newJob);
            toast.success('Job referral posted successfully!');
            setShowPostModal(false);
            setNewJob({
                title: '', company: '', location: '', type: 'Full-time',
                workMode: 'Onsite', description: '', requiredSkills: '', experienceRequired: 0
            });
            fetchJobs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post job');
        }
    };

    const handleDeleteJob = async (jobId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this job and all its applications?')) return;
        
        try {
            await API.delete(`/jobs/${jobId}`);
            toast.success('Job deleted successfully');
            setJobs(jobs.filter(j => j._id !== jobId));
            if (selectedJob?._id === jobId) {
                setSelectedJob(null);
            }
        } catch (err) {
            toast.error('Failed to delete job');
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!selectedResume || !selectedJob) return;

        const formData = new FormData();
        formData.append('resume', selectedResume);

        try {
            await API.post(`/jobs/${selectedJob._id}/apply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Application and resume submitted successfully!');
            setShowApplyModal(false);
            setSelectedResume(null);
            fetchJobs();
            setSelectedJob(prev => ({ ...prev, applied: true }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply');
        }
    };

    const filtered = jobs.filter(j => {
        const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.company.toLowerCase().includes(search.toLowerCase()) ||
            j.requiredSkills.some(s => s.toLowerCase().includes(search.toLowerCase()));
        const matchesType = type ? j.type === type : true;
        const matchesMode = workMode ? j.workMode === workMode : true;
        return matchesSearch && matchesType && matchesMode;
    });

    if (loading) return <div className="text-center py-20 text-slate-500">Loading job postings...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6 text-slate-800 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {user?.collegeName ? `${user.collegeName} Job & Referral Board` : 'Job & Referral Board'} 💼
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">Explore referral opportunities posted by your college alumni.</p>
                </div>
                {isAlumni && (
                    <button onClick={() => setShowPostModal(true)} className="btn-primary text-xs py-2.5 px-5 cursor-pointer">
                        <HiOutlinePlusCircle className="w-4 h-4" /> Post a Job
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative md:col-span-2">
                    <HiOutlineMagnifyingGlass className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field text-xs pl-10 bg-slate-50"
                        placeholder="Search by title, skills, or company..."
                    />
                </div>
                <select value={type} onChange={e => setType(e.target.value)} className="input-field text-xs bg-slate-50 cursor-pointer">
                    <option value="">All Job Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                </select>
                <select value={workMode} onChange={e => setWorkMode(e.target.value)} className="input-field text-xs bg-slate-50 cursor-pointer">
                    <option value="">All Work Modes</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {filtered.length === 0 ? (
                        <div className="card text-center py-20 border border-slate-100 bg-white">
                            <HiOutlineBriefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-semibold text-base">No job postings found</p>
                        </div>
                    ) : (
                        filtered.map(job => (
                            <div key={job._id} onClick={() => setSelectedJob(job)} className={`card card-hover flex justify-between items-center cursor-pointer p-6 border ${selectedJob?._id === job._id ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'}`}>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-slate-950 text-base">{job.title}</h3>
                                    <p className="text-xs text-slate-600 font-medium">{job.company} · {job.location}</p>
                                    <div className="flex gap-2">
                                        <span className="badge-primary text-[10px]">{job.type}</span>
                                        <span className="badge-primary text-[10px] bg-purple-50 text-purple-600 border-purple-100">{job.workMode}</span>
                                        <span className="text-[10px] text-slate-500 font-semibold flex items-center">Exp: {job.experienceRequired}+ years</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {job.requiredSkills.map((s, si) => (
                                            <span key={si} className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                {!isAlumni && (
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <span className="badge-success text-[10px] font-bold">🟢 {job.matchScore || 0}% Match</span>
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setShowApplyModal(true); }} className="btn-primary text-xs py-1.5 px-4 cursor-pointer">Apply</button>
                                    </div>
                                )}
                                {isAlumni && user?._id === job.postedBy?._id && (
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <button onClick={(e) => handleDeleteJob(job._id, e)} className="btn-secondary text-xs py-1.5 px-4 cursor-pointer text-red-500 border-red-100 hover:bg-red-50">Delete</button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="card bg-white border border-slate-100 p-6 space-y-6">
                    {selectedJob ? (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-955">{selectedJob.title}</h2>
                                <p className="text-xs text-slate-500 mt-1">{selectedJob.company} · {selectedJob.location}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-2">
                                    Posted by:{' '}
                                    {selectedJob.postedBy?._id ? (
                                        <a href={`/profile/${selectedJob.postedBy._id}`} className="text-primary hover:underline font-bold">
                                            {selectedJob.postedBy.name}
                                        </a>
                                    ) : (
                                        selectedJob.postedBy?.name || 'Alumni Partner'
                                    )}
                                </p>
                            </div>

                            <div className="border-t border-slate-100 pt-4 space-y-2">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Required Skills</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedJob.requiredSkills.map((s, si) => (
                                        <span key={si} className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Description</h4>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                            </div>

                            {!isAlumni && (
                                <button onClick={() => setShowApplyModal(true)} className="btn-primary w-full text-xs py-2.5 cursor-pointer">Apply Referral</button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <HiOutlineFunnel className="w-10 h-10 mx-auto mb-3" />
                            <p className="text-xs font-medium">Select a job post to view full requirements and skills match details.</p>
                        </div>
                    )}
                </div>
            </div>

            {showPostModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleCreateJob} className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-lg space-y-4 animate-scale-up shadow-2xl">
                        <h3 className="font-bold text-slate-950 text-base">Post a New Job/Referral</h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job Title</label>
                                <input value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="input-field text-xs mt-1" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Company</label>
                                <input value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="input-field text-xs mt-1" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Location</label>
                                <input value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="input-field text-xs mt-1" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Experience (Years)</label>
                                <input type="number" value={newJob.experienceRequired} onChange={e => setNewJob({...newJob, experienceRequired: e.target.value})} className="input-field text-xs mt-1" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job Type</label>
                                <select value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})} className="input-field text-xs mt-1 bg-slate-50 cursor-pointer">
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Work Mode</label>
                                <select value={newJob.workMode} onChange={e => setNewJob({...newJob, workMode: e.target.value})} className="input-field text-xs mt-1 bg-slate-50 cursor-pointer">
                                    <option value="Onsite">Onsite</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Required Skills (Comma separated)</label>
                            <input value={newJob.requiredSkills} onChange={e => setNewJob({...newJob, requiredSkills: e.target.value})} className="input-field text-xs mt-1" placeholder="e.g. React, Node.js, AWS" required />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job Description</label>
                            <textarea value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="input-field text-xs mt-1 h-24" required />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <button type="button" onClick={() => setShowPostModal(false)} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
                            <button type="submit" className="btn-primary text-xs py-2 px-5 cursor-pointer">Submit Post</button>
                        </div>
                    </form>
                </div>
            )}

            {showApplyModal && selectedJob && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleApply} className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-sm space-y-5 animate-scale-up shadow-2xl">
                        <div>
                            <h3 className="font-bold text-slate-950 text-base">Apply for {selectedJob.title}</h3>
                            <p className="text-xs text-slate-500 mt-1">Upload your resume. Our AI will analyze your skills against the job requirements.</p>
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Upload Resume (PDF only)</label>
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={e => setSelectedResume(e.target.files[0])} 
                                className="input-field text-xs mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                                required 
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <button type="button" onClick={() => { setShowApplyModal(false); setSelectedResume(null); }} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
                            <button type="submit" className="btn-primary text-xs py-2 px-5 cursor-pointer">Submit Application</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default JobBoard;
