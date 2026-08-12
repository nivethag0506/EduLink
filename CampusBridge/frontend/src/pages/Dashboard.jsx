import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { 
    HiOutlineAcademicCap, HiOutlineCalendarDays, HiOutlineBriefcase, HiOutlineUserGroup,
    HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineChevronRight,
    HiOutlineChevronLeft, HiOutlineCheck
} from 'react-icons/hi2';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeMentors: 0,
        upcomingSessions: 0,
        appliedJobs: 0,
        referralsReceived: 0,
        studentsMentored: 0,
        activeSessions: 0,
        openJobs: 0,
        totalReferrals: 0
    });

    const [suggestedMentors, setSuggestedMentors] = useState([]);
    const [applications, setApplications] = useState([]);
    const [requests, setRequests] = useState([]);
    const [alumniJobs, setAlumniJobs] = useState([]);
    const [alumniApplicants, setAlumniApplicants] = useState([]);
    const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);

    const isAlumni = ['Alumni', 'Senior'].includes(user?.role);

    useEffect(() => {
        if (!isAlumni) {
            Promise.all([
                API.get('/users/college'),
                API.get('/jobs/applications'),
                API.get('/mentoring').catch(() => ({ data: [] }))
            ]).then(([usersRes, appsRes, mentRes]) => {
                const mentors = usersRes.data.filter(u => ['Alumni', 'Senior'].includes(u.role));
                setSuggestedMentors(mentors.slice(0, 5));
                
                const apps = appsRes.data;
                setApplications(apps);
                
                const reqs = mentRes.data;
                setRequests(reqs);

                setStats(prev => ({
                    ...prev,
                    activeMentors: mentors.length,
                    appliedJobs: apps.length,
                    referralsReceived: apps.filter(a => a.status === 'Referred').length,
                    upcomingSessions: reqs.filter(r => r.status === 'accepted').length
                }));
            }).catch(() => {});
        } else {
            Promise.all([
                API.get('/mentoring').catch(() => ({ data: [] })),
                API.get('/jobs').catch(() => ({ data: [] })),
                API.get('/jobs/alumni-applicants').catch(() => ({ data: [] }))
            ]).then(([mentRes, jobsRes, appsRes]) => {
                const reqs = mentRes.data;
                setRequests(reqs.filter(r => r.status === 'pending'));

                const myJobs = jobsRes.data.filter(j => j.postedBy?._id === user?._id);
                setAlumniJobs(myJobs);

                const apps = appsRes.data;
                setAlumniApplicants(apps);

                setStats(prev => ({
                    ...prev,
                    studentsMentored: reqs.filter(r => r.status === 'completed' || r.status === 'accepted').length,
                    activeSessions: reqs.filter(r => r.status === 'accepted').length,
                    openJobs: myJobs.length,
                    totalReferrals: apps.filter(a => a.status === 'Referred').length
                }));
            }).catch(() => {});
        }
    }, [isAlumni]);

    const handleAcceptRequest = async (reqId) => {
        const date = prompt('Enter session date (YYYY-MM-DD):');
        if (!date) return;
        const time = prompt('Enter session time (e.g., 5:00 PM):');
        if (!time) return;
        try {
            await API.put(`/mentoring/${reqId}/accept`, { scheduledDate: date, scheduledTime: time });
            toast.success('Session scheduled!');
            setRequests(requests.filter(r => r._id !== reqId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept');
        }
    };

    const handleRejectRequest = async (reqId) => {
        const reason = prompt('Enter reason for declining:');
        if (!reason) return;
        try {
            await API.put(`/mentoring/${reqId}/reject`, { reason });
            toast.success('Session declined.');
            setRequests(requests.filter(r => r._id !== reqId));
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        try {
            await API.put(`/jobs/applications/${appId}`, { status: newStatus });
            toast.success(`Applicant marked as ${newStatus}`);
            setAlumniApplicants(alumniApplicants.map(a => a._id === appId ? { ...a, status: newStatus } : a));
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteJob = async (jobId, e) => {
        e.stopPropagation(); // prevent clicking the job row
        if (!window.confirm('Are you sure you want to delete this job and all its applications?')) return;
        
        try {
            await API.delete(`/jobs/${jobId}`);
            toast.success('Job deleted successfully');
            setAlumniJobs(alumniJobs.filter(j => j._id !== jobId));
            if (selectedJobForApplicants === jobId) {
                setSelectedJobForApplicants(null);
            }
        } catch (err) {
            toast.error('Failed to delete job');
        }
    };

    const renderStudentView = () => {
        const primaryApp = applications[0];
        const steps = ['Applied', 'Shortlisted', 'Referred', 'Offer'];
        const activeIndex = primaryApp ? steps.indexOf(primaryApp.status) : 0;

        return (
            <div className="space-y-8 animate-fade-in text-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {user?.collegeName ? `${user.collegeName} Student Dashboard` : 'Student Dashboard'} 👑
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">Welcome back, {user?.name}! Let's achieve more today.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Mentors</span>
                            <HiOutlineUserGroup className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-3xl font-extrabold text-slate-900 mt-1">{stats.activeMentors}</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-1">Available in network</span>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Sessions</span>
                            <HiOutlineCalendarDays className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="text-3xl font-extrabold text-slate-900 mt-1">{stats.upcomingSessions}</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-1">Scheduled calls</span>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Jobs</span>
                            <HiOutlineBriefcase className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-3xl font-extrabold text-slate-900 mt-1">{stats.appliedJobs}</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-1">Total applications</span>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Referral Received</span>
                            <HiOutlineAcademicCap className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-3xl font-extrabold text-slate-900 mt-1">{stats.referralsReceived}</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-1">Approved referrals</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Suggested Alumni Mentors for You</h2>
                        <a href="/mentoring" className="text-xs font-bold text-primary hover:underline">View All</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {suggestedMentors.map((m, i) => (
                            <div key={i} className="card card-hover flex flex-col items-center text-center p-6 space-y-4 bg-white">
                                <img
                                    src={m.profilePhoto ? `/${m.profilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=6366f1&color=fff`}
                                    className="w-16 h-16 rounded-full object-cover border border-slate-100"
                                    alt=""
                                />
                                <div>
                                    <h3 className="font-bold text-slate-950 text-base">{m.name}</h3>
                                    <p className="text-xs text-slate-500">{m.branch} · Verified Mentor</p>
                                </div>
                                <span className="badge-success text-[10px]">🏢 Alumni Mentor</span>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {(m.skills || ['React', 'Node.js', 'System Design']).slice(0, 3).map((skill, si) => (
                                        <span key={si} className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card space-y-6 bg-white">
                    <h2 className="text-lg font-bold text-slate-950">Applied Referrals Tracker</h2>
                    {primaryApp ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                <div>
                                    <p className="text-slate-900 text-sm">{primaryApp.jobId?.title}</p>
                                    <p>{primaryApp.jobId?.company} · {primaryApp.jobId?.location}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary">Referrer</p>
                                    {primaryApp.jobId?.postedBy?._id ? (
                                        <a href={`/profile/${primaryApp.jobId.postedBy._id}`} className="text-slate-900 hover:text-primary hover:underline font-bold">
                                            {primaryApp.jobId.postedBy.name}
                                        </a>
                                    ) : (
                                        <p className="text-slate-900">{primaryApp.jobId?.postedBy?.name || 'Alumni Partner'}</p>
                                    )}
                                </div>
                            </div>

                            {primaryApp.status === 'Declined' ? (
                                <div className="py-6 text-center">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                                        <HiOutlineXCircle className="w-6 h-6 text-red-500" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">Application Declined</p>
                                    <p className="text-xs text-slate-500 mt-1">Unfortunately, you were not selected for a referral at this time.</p>
                                </div>
                            ) : (
                                <div className="relative pt-6">
                                    <div className="absolute top-[38px] left-0 right-0 h-1 bg-slate-200 -z-10" />
                                    <div className="flex justify-between">
                                        {steps.map((step, index) => {
                                            const done = index <= activeIndex;
                                            return (
                                                <div key={index} className="flex flex-col items-center space-y-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all ${done ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-300'}`}>
                                                        {done ? <HiOutlineCheck className="w-4 h-4" /> : index + 1}
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${done ? 'text-primary' : 'text-slate-400'}`}>{step}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">You haven't applied for any referrals yet. Go to Job Board to apply.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderAlumniView = () => {
        const activeApplicants = selectedJobForApplicants 
            ? alumniApplicants.filter(a => a.jobId?._id === selectedJobForApplicants)
            : alumniApplicants;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-slate-800">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {user?.collegeName ? `${user.collegeName} Alumni Dashboard` : 'Alumni Dashboard'} 🏢
                        </h1>
                        <p className="text-slate-500 text-xs mt-0.5">Welcome back, {user?.name}! Make an impact today.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="stat-card">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students Mentored</span>
                                <HiOutlineUserGroup className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-3xl font-extrabold text-slate-900 mt-1">{stats.studentsMentored}</span>
                            <span className="text-[10px] text-emerald-600 font-bold mt-1">+4 this month</span>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Sessions</span>
                                <HiOutlineCalendarDays className="w-5 h-5 text-secondary" />
                            </div>
                            <span className="text-3xl font-extrabold text-slate-900 mt-1">{stats.activeSessions}</span>
                            <span className="text-[10px] text-slate-500 font-bold mt-1">Today: 2 sessions</span>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Jobs</span>
                                <HiOutlineBriefcase className="w-5 h-5 text-accent" />
                            </div>
                            <span className="text-3xl font-extrabold text-slate-900 mt-1">{stats.openJobs}</span>
                            <span className="text-[10px] text-emerald-600 font-bold mt-1">2 active posts</span>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Referrals</span>
                                <HiOutlineAcademicCap className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalReferrals}</span>
                            <span className="text-[10px] text-emerald-600 font-bold mt-1">+3 this month</span>
                        </div>
                    </div>

                    <div className="card space-y-4 bg-white">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-950">Mentorship Requests Inbox</h2>
                            <a href="/mentoring" className="text-xs font-bold text-primary hover:underline">View All</a>
                        </div>
                        <div className="space-y-4">
                            {requests.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">No pending mentoring requests.</p>
                            ) : (
                                requests.map(r => (
                                    <div key={r._id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={r.studentId?.profilePhoto ? `/${r.studentId.profilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(r.studentId?.name || 'S')}&background=8b5cf6&color=fff`}
                                                className="w-10 h-10 rounded-xl object-cover"
                                                alt=""
                                            />
                                            <div>
                                                {r.studentId?._id ? (
                                                    <a href={`/profile/${r.studentId._id}`} className="text-xs font-bold text-slate-900 hover:text-primary hover:underline">
                                                        {r.studentId.name}
                                                    </a>
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-900">{r.studentId?.name}</p>
                                                )}
                                                <p className="text-[10px] text-slate-500">Topic: {r.topic}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAcceptRequest(r._id)} className="btn-primary text-xs py-1.5 px-4 bg-emerald-500 hover:bg-emerald-600 border-0 cursor-pointer">Accept</button>
                                            <button onClick={() => handleRejectRequest(r._id)} className="btn-secondary text-xs py-1.5 px-4 text-red-500 border-red-100 hover:bg-red-50 cursor-pointer">Reject</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card space-y-4 bg-white">
                        <h2 className="text-lg font-bold text-slate-950 font-sans">Job & Referral Board</h2>
                        <div className="space-y-4">
                            {alumniJobs.map(job => (
                                <div key={job._id} onClick={() => setSelectedJobForApplicants(job._id)} className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${selectedJobForApplicants === job._id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-950">{job.title}</h3>
                                        <p className="text-xs text-slate-500">{job.company} · {job.location}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="badge-primary text-[10px]">{alumniApplicants.filter(a => a.jobId?._id === job._id).length} Applicants</span>
                                        <button 
                                            onClick={(e) => handleDeleteJob(job._id, e)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Job"
                                        >
                                            <HiOutlineXCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card bg-white border border-slate-100 p-6 flex flex-col space-y-6">
                    <div>
                        <h2 className="text-base font-bold text-slate-950">Top Matched Applicants</h2>
                        <p className="text-[10px] text-slate-500">Review and refer candidates based on match scores.</p>
                    </div>

                    <div className="space-y-6 overflow-y-auto max-h-[600px] pr-1">
                        {activeApplicants.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-10">Select a job post to review applicants.</p>
                        ) : (
                            activeApplicants.map(app => (
                                <div key={app._id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={app.studentId?.profilePhoto ? `/${app.studentId.profilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.studentId?.name || 'S')}&background=6366f1&color=fff`}
                                                className="w-10 h-10 rounded-xl object-cover"
                                                alt=""
                                            />
                                            <div>
                                                {app.studentId?._id ? (
                                                    <a href={`/profile/${app.studentId._id}`} className="text-xs font-bold text-slate-950 hover:text-primary hover:underline">
                                                        {app.studentId.name}
                                                    </a>
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-950">{app.studentId?.name}</p>
                                                )}
                                                <p className="text-[9px] text-slate-500 font-semibold">{app.studentId?.branch || 'B.Tech CSE'}</p>
                                            </div>
                                        </div>
                                        <span className="badge-success text-[10px] font-bold">{app.matchScore}% Match</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {app.resumePath && (
                                            <a href={`/${app.resumePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-[10px] py-1 px-3 bg-slate-100 hover:bg-slate-200 border-0 text-slate-700">View Resume</a>
                                        )}
                                        {['Applied', 'Shortlisted'].includes(app.status) && (
                                            <>
                                                {app.status === 'Applied' && (
                                                    <button onClick={() => handleUpdateStatus(app._id, 'Shortlisted')} className="btn-secondary text-[10px] py-1 px-3 cursor-pointer">Shortlist</button>
                                                )}
                                                <button onClick={() => handleUpdateStatus(app._id, 'Referred')} className="btn-primary text-[10px] py-1 px-3 cursor-pointer bg-emerald-500 hover:bg-emerald-600 border-0">Refer</button>
                                                <button onClick={() => handleUpdateStatus(app._id, 'Declined')} className="btn-secondary text-[10px] py-1 px-3 cursor-pointer text-red-500 border-red-100 hover:bg-red-50">Decline</button>
                                            </>
                                        )}
                                        {!['Applied', 'Shortlisted'].includes(app.status) && (
                                            <span className="badge-primary text-[10px] uppercase font-bold tracking-wider">{app.status}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-2">
            {isAlumni ? renderAlumniView() : renderStudentView()}
        </div>
    );
};

export default Dashboard;
