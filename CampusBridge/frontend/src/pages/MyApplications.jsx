import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineBriefcase, HiOutlineCheck } from 'react-icons/hi2';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const { data } = await API.get('/jobs/applications');
            setApplications(data);
        } catch {
            toast.error('Failed to load application history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    if (loading) return <div className="text-center py-20 text-slate-500">Loading applications...</div>;

    const steps = ['Applied', 'Shortlisted', 'Referred', 'Offer'];

    return (
        <div className="max-w-3xl mx-auto space-y-6 text-slate-800 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Job Applications 📁</h1>
                <p className="text-slate-500 text-xs mt-0.5">Track the real-time referral status of your applications.</p>
            </div>

            {applications.length === 0 ? (
                <div className="card text-center py-20 border border-slate-100 bg-white">
                    <HiOutlineBriefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-semibold text-base">No applications submitted yet</p>
                    <a href="/job-board" className="btn-primary inline-flex text-xs py-2 px-5 mt-4 cursor-pointer">Browse Jobs</a>
                </div>
            ) : (
                <div className="space-y-6">
                    {applications.map(app => {
                        const activeIndex = steps.indexOf(app.status);
                        return (
                            <div key={app._id} className="card bg-white border border-slate-100 p-6 space-y-6 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-950">{app.jobId?.title}</h3>
                                        <p className="text-xs text-slate-600 font-medium">{app.jobId?.company} · {app.jobId?.location}</p>
                                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Referred by: {app.jobId?.postedBy?.name || 'Alumni Partner'}</p>
                                    </div>
                                    <span className="badge-success text-[10px] font-bold">🟢 Match: {app.matchScore}%</span>
                                </div>

                                {app.status === 'Declined' ? (
                                    <div className="py-6 text-center border-t border-slate-100 mt-4">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                                            <span className="text-red-500 font-bold text-lg">×</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">Application Declined</p>
                                        <p className="text-xs text-slate-500 mt-1">Unfortunately, you were not selected for a referral at this time.</p>
                                    </div>
                                ) : (
                                    <div className="relative pt-6">
                                        <div className="absolute top-[38px] left-0 right-0 h-1 bg-slate-100 -z-10" />
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
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyApplications;
