import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { 
    HiOutlineAcademicCap, HiOutlineCalendarDays, HiOutlineBriefcase, HiOutlineUserGroup,
    HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineChevronRight,
    HiOutlineChevronLeft, HiOutlineCheck, HiOutlineSparkles, HiOutlineUserPlus,
    HiOutlinePencilSquare, HiOutlineArrowUpRight, HiOutlineMapPin, HiOutlineBookmark,
    HiOutlineChartBar, HiOutlineNewspaper, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight,
    HiOutlineStar
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
        return (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in text-slate-800 pb-10">
                {/* Left/Main Column - spans 2 cols on xl screens */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    
                    {/* Hero Section */}
                    <div className="card border-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-white p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 right-32 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -mb-10"></div>
                        
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                    Good morning, {user?.name?.split(' ')[0] || 'Student'}! <span className="text-3xl">👋</span>
                                </h1>
                                <p className="text-slate-500 font-medium mt-2">Here's what's happening in your CampusBridge network today.</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <a href="/mentoring" className="card card-hover flex flex-col items-start gap-3 p-4 group cursor-pointer btn-active-scale">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                    <HiOutlineUserGroup className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Find a Mentor</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Connect with alumni mentors <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span></p>
                                </div>
                            </a>
                            <a href="/job-board" className="card card-hover flex flex-col items-start gap-3 p-4 group cursor-pointer btn-active-scale">
                                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <HiOutlineBriefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Explore Jobs</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Discover internship & roles <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span></p>
                                </div>
                            </a>
                            <a href="/directory" className="card card-hover flex flex-col items-start gap-3 p-4 group cursor-pointer btn-active-scale">
                                <div className="p-2 bg-teal-500/10 text-teal-600 rounded-lg group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                    <HiOutlineUserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">Connect Alumni</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Expand your network <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span></p>
                                </div>
                            </a>
                            <a href="/feed" className="card card-hover flex flex-col items-start gap-3 p-4 group cursor-pointer btn-active-scale">
                                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <HiOutlinePencilSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Share a Post</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Ask questions or share <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span></p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="stat-card">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-md"><HiOutlineUserGroup className="w-4 h-4" /></div>
                                <span className="text-[11px] font-bold text-slate-700">Active Mentors</span>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <span className="text-3xl font-extrabold text-slate-900 leading-none">{stats.activeMentors}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                <HiOutlineArrowUpRight className="w-3 h-3 text-emerald-500" />
                                <span className="text-[10px] text-emerald-600 font-bold">1 this month</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-secondary/10 text-secondary rounded-md"><HiOutlineCalendarDays className="w-4 h-4" /></div>
                                <span className="text-[11px] font-bold text-slate-700">Upcoming Sessions</span>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <span className="text-3xl font-extrabold text-slate-900 leading-none">{stats.upcomingSessions}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">No sessions scheduled</p>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-md"><HiOutlineBriefcase className="w-4 h-4" /></div>
                                <span className="text-[11px] font-bold text-slate-700">Applied Jobs</span>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <span className="text-3xl font-extrabold text-slate-900 leading-none">{stats.appliedJobs}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">Keep exploring!</p>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-md"><HiOutlineCheckCircle className="w-4 h-4" /></div>
                                <span className="text-[11px] font-bold text-slate-700">Referrals Received</span>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <span className="text-3xl font-extrabold text-slate-900 leading-none">{stats.referralsReceived}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">Connect with alumni</p>
                        </div>
                    </div>

                    {/* Mentor Discovery Carousel */}
                    <div className="card flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-bold text-slate-900">Recommended Alumni Mentors for You</h2>
                            <a href="/mentoring" className="text-xs font-bold text-primary hover:underline">View All</a>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors hidden md:block">
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                            
                            <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar">
                                {suggestedMentors.length > 0 ? suggestedMentors.map((m, i) => (
                                    <div key={i} className="min-w-[260px] md:min-w-0 md:flex-1 snap-start border border-slate-100 rounded-2xl p-5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <img src={m.profilePhoto ? `/${m.profilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=6b21a8&color=fff`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                                                        {m.name} 
                                                        <HiOutlineCheckCircle className="w-3.5 h-3.5 text-primary" title="Verified Mentor" />
                                                    </h3>
                                                    <p className="text-[10px] text-slate-500 line-clamp-1">{m.currentRole || 'Alumni Mentor'} · {m.company || 'Tech Industry'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-1.5 mt-4">
                                            {(m.skills || ['React', 'Node.js', 'Mentorship']).slice(0, 3).map((skill, si) => (
                                                <span key={si} className="text-[9px] font-bold px-2 py-0.5 rounded text-primary bg-primary/5">{skill}</span>
                                            ))}
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-slate-500">
                                            <span className="flex items-center gap-1 text-amber-500"><HiOutlineStar className="w-3.5 h-3.5" /> 4.8 (24)</span>
                                            <span className="flex items-center gap-1"><HiOutlineCalendarDays className="w-3.5 h-3.5" /> 12 sessions</span>
                                        </div>
                                        
                                        <button className="w-full mt-4 btn-secondary py-2 text-xs border-slate-200">View Profile</button>
                                    </div>
                                )) : (
                                    <div className="w-full py-8 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-slate-300 shadow-sm"><HiOutlineUserGroup className="w-6 h-6" /></div>
                                        <p className="text-sm font-bold text-slate-900">No mentors available yet</p>
                                        <p className="text-xs text-slate-500 mt-1">Check back later for personalized recommendations.</p>
                                    </div>
                                )}
                            </div>
                            
                            <button className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors hidden md:block">
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex justify-center gap-1.5 mt-1">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
                                <a href="/feed" className="text-xs font-bold text-primary hover:underline">View All</a>
                            </div>
                            <div className="space-y-6 relative">
                                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-100 z-0"></div>
                                
                                <div className="flex gap-4 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                                        <HiOutlineBriefcase className="w-4 h-4" />
                                    </div>
                                    <div className="pt-1.5">
                                        <p className="text-xs font-bold text-slate-900">Rahul shared a new job opportunity at Google</p>
                                        <p className="text-[10px] text-slate-400 mt-1">2h ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-primary shrink-0 shadow-sm">
                                        <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                                    </div>
                                    <div className="pt-1.5">
                                        <p className="text-xs font-bold text-slate-900">Priya commented on your project</p>
                                        <p className="text-[10px] text-slate-400 mt-1">5h ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
                                        <HiOutlineDocumentText className="w-4 h-4" />
                                    </div>
                                    <div className="pt-1.5">
                                        <p className="text-xs font-bold text-slate-900">New resource added: DSA Roadmap 2024</p>
                                        <p className="text-[10px] text-slate-400 mt-1">1d ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-white flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
                                        <HiOutlineUserGroup className="w-4 h-4" />
                                    </div>
                                    <div className="pt-1.5">
                                        <p className="text-xs font-bold text-slate-900">Arjun requested a mentoring session</p>
                                        <p className="text-[10px] text-slate-400 mt-1">2d ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Opportunities */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-base font-bold text-slate-900">Top Opportunities for You</h2>
                                <a href="/job-board" className="text-xs font-bold text-primary hover:underline">View All</a>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                        <span className="font-bold text-lg text-slate-800">G</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-primary transition-colors">SDE Intern</h3>
                                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">Google · Bangalore · Hybrid · On-site</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-emerald-500">92%</span>
                                        <span className="text-[9px] text-slate-400">Match</span>
                                    </div>
                                    <button className="text-slate-300 hover:text-primary ml-2"><HiOutlineBookmark className="w-4 h-4" /></button>
                                </div>
                                
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                        <span className="font-bold text-lg text-slate-800">D</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-primary transition-colors">Data Analyst</h3>
                                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">Deloitte · Hyderabad · Full-time</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-emerald-500">88%</span>
                                        <span className="text-[9px] text-slate-400">Match</span>
                                    </div>
                                    <button className="text-slate-300 hover:text-primary ml-2"><HiOutlineBookmark className="w-4 h-4" /></button>
                                </div>
                                
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                        <div className="flex gap-0.5">
                                            <span className="w-1.5 h-1.5 rounded-sm bg-red-500"></span>
                                            <span className="w-1.5 h-1.5 rounded-sm bg-green-500"></span>
                                            <span className="w-1.5 h-1.5 rounded-sm bg-yellow-500"></span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-primary transition-colors">Frontend Developer</h3>
                                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">Zoho · Chennai · Full-time</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-emerald-500">85%</span>
                                        <span className="text-[9px] text-slate-400">Match</span>
                                    </div>
                                    <button className="text-slate-300 hover:text-primary ml-2"><HiOutlineBookmark className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    {/* Upcoming Events */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-bold text-slate-900">Upcoming Events</h2>
                            <a href="#" className="text-xs font-bold text-primary hover:underline">View All</a>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-xl text-primary shrink-0">
                                    <span className="text-sm font-black">15</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider">May</span>
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">Hackathon 2024</h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Campus Hackathon</p>
                                    <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                                        <HiOutlineClock className="w-3 h-3" /> 10:00 AM - 5:00 PM
                                    </div>
                                </div>
                                <button className="text-slate-300 hover:text-primary self-center"><HiOutlineBookmark className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-orange-500/10 rounded-xl text-orange-600 shrink-0">
                                    <span className="text-sm font-black">18</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider">May</span>
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">Alumni Talk</h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Career Guidance Session</p>
                                    <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                                        <HiOutlineClock className="w-3 h-3" /> 2:00 PM - 4:00 PM
                                    </div>
                                </div>
                                <button className="text-slate-300 hover:text-primary self-center"><HiOutlineBookmark className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-xl text-emerald-600 shrink-0">
                                    <span className="text-sm font-black">20</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider">May</span>
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">Resume Workshop</h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Placement Cell</p>
                                    <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                                        <HiOutlineClock className="w-3 h-3" /> 11:00 AM - 1:00 PM
                                    </div>
                                </div>
                                <button className="text-slate-300 hover:text-primary self-center"><HiOutlineBookmark className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <button className="text-[11px] font-bold text-primary mt-4 flex items-center gap-1 hover:underline">View All Events <HiOutlineArrowUpRight className="w-3 h-3" /></button>
                    </div>

                    {/* Career Streak */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><span className="text-orange-500">🔥</span> Career Streak</h2>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-black text-slate-900">7</span>
                                <span className="text-xs font-bold text-slate-500 ml-1">Days</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">Keep it up! 🔥</span>
                        </div>
                        <div className="flex justify-between mt-4">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                                <div key={idx} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${idx < 5 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="card flex flex-col items-center text-center">
                        <h2 className="text-sm font-bold text-slate-900 w-full text-left mb-6">Your Progress</h2>
                        <div className="flex items-center gap-6 w-full">
                            <div className="relative w-24 h-24 shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-slate-100" strokeWidth="3"></circle>
                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-primary" strokeWidth="3" strokeDasharray="100" strokeDashoffset="22" strokeLinecap="round"></circle>
                                </svg>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <span className="text-xl font-black text-slate-900">78%</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 w-full text-left">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-primary/10 rounded flex items-center justify-center"><HiOutlineCheck className="w-2 h-2 text-primary" /></div> Add Skills</span>
                                    <HiOutlineCheck className="w-3 h-3 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-primary/10 rounded flex items-center justify-center"><HiOutlineCheck className="w-2 h-2 text-primary" /></div> Add Projects</span>
                                    <HiOutlineCheck className="w-3 h-3 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-primary/10 rounded flex items-center justify-center"><HiOutlineCheck className="w-2 h-2 text-primary" /></div> Add Experience</span>
                                    <HiOutlineCheck className="w-3 h-3 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 border border-slate-300 rounded"></div> Add Certifications</span>
                                </div>
                            </div>
                        </div>
                        <a href="/profile" className="text-[11px] font-bold text-primary mt-6 w-full text-left hover:underline">Improve Profile →</a>
                    </div>

                    {/* Campus Pulse */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-slate-900">Campus Pulse</h2>
                            <a href="#" className="text-[10px] font-bold text-primary hover:underline">View All</a>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-orange-500"><HiOutlineBriefcase className="w-4 h-4" /></span>
                                <span className="text-xs font-bold text-slate-700">23 new job opportunities</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-blue-500"><HiOutlineNewspaper className="w-4 h-4" /></span>
                                <span className="text-xs font-bold text-slate-700">12 new posts in Social Feed</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-primary"><HiOutlineUserPlus className="w-4 h-4" /></span>
                                <span className="text-xs font-bold text-slate-700">5 new alumni joined today</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Card */}
                    <div className="card bg-gradient-to-br from-primary to-primary-dark text-white border-0 shadow-lg shadow-primary/20 relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -left-10 -top-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <h2 className="text-base font-bold mb-1">Complete Your Profile</h2>
                            <p className="text-[10px] text-white/80 mb-4 leading-relaxed">Get more visibility from mentors and recruiters.</p>
                            <div className="flex items-center justify-between">
                                <a href="/profile" className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-xs font-bold backdrop-blur-md">Complete Now →</a>
                                <span className="text-2xl font-black opacity-50">82%</span>
                            </div>
                        </div>
                    </div>
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
