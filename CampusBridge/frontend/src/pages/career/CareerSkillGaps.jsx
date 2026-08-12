import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineBolt, HiOutlineCheckCircle } from 'react-icons/hi2';

const CareerSkillGaps = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/career/dashboard');
            if (data && data.profile) {
                setProfile(data.profile);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

    if (!profile) return (
        <div className="max-w-4xl mx-auto text-center p-12 bg-white rounded-xl">
            <p className="text-slate-500 mb-4">You need to select a target career and analyze your profile first.</p>
            <Link to="/career" className="btn-primary px-6 py-2">Go to Career Planner</Link>
        </div>
    );

    const gaps = profile.topSkillGaps || [];

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <button onClick={() => navigate('/career')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <HiOutlineArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                    <HiOutlineBolt className="w-8 h-8 mr-2 text-indigo-500" /> Skill Gap Analysis
                </h1>
                <p className="text-slate-500 mt-1">Detailed breakdown of skills you need to improve for a <strong>{profile.targetRoleId.name}</strong> role.</p>
            </div>

            {gaps.length === 0 ? (
                <div className="bg-green-50 p-12 rounded-2xl border border-green-200 text-center">
                    <HiOutlineCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-900 mb-2">You have no major skill gaps!</h2>
                    <p className="text-green-700 max-w-md mx-auto">Your current skill profile meets all the expected requirements for your target career. Start applying for jobs!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {gaps.map((gap, index) => (
                        <div key={index} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${gap.priority === 'Critical' ? 'bg-red-500' : gap.priority === 'High' ? 'bg-orange-500' : gap.priority === 'Medium' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                            
                            <div className="pl-4">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                    <h3 className="text-2xl font-bold text-slate-900">{gap.skillName}</h3>
                                    <span className={`inline-block px-3 py-1 text-sm font-bold uppercase rounded-md ${gap.priority === 'Critical' ? 'bg-red-100 text-red-700' : gap.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {gap.priority} Priority
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Your Current Level</p>
                                        <p className="text-lg font-bold text-slate-800">Level {gap.currentLevel} <span className="text-sm font-normal text-slate-500">/ 4</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Required Level</p>
                                        <p className="text-lg font-bold text-slate-800">Level {gap.requiredLevel} <span className="text-sm font-normal text-slate-500">/ 4</span></p>
                                    </div>
                                </div>

                                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                    <h4 className="font-bold text-indigo-900 mb-2">Why It Matters</h4>
                                    <p className="text-indigo-800 text-sm leading-relaxed">{gap.reason}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CareerSkillGaps;
