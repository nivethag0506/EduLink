import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { 
    HiOutlineBriefcase, HiOutlineChartBar, HiOutlineCheckCircle, 
    HiOutlineSparkles, HiOutlineArrowRight, HiOutlineMap
} from 'react-icons/hi2';

const CareerDashboard = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchDashboard();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const { data } = await API.get('/career/roles');
            setRoles(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/career/dashboard');
            setDashboardData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetRole = async (e) => {
        const roleId = e.target.value;
        if (!roleId) return;
        try {
            await API.post('/career/target', { roleId });
            toast.success('Target career updated');
            fetchDashboard();
        } catch (error) {
            toast.error('Failed to update target career');
        }
    };

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true);
            await API.post('/career/analyze');
            toast.success('Profile analyzed successfully!');
            fetchDashboard();
        } catch (error) {
            toast.error('Failed to analyze profile');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

    const profile = dashboardData?.profile;
    const roadmap = dashboardData?.roadmap;
    const hasAnalysis = profile && profile.readinessScore > 0;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                        <HiOutlineChartBar className="w-8 h-8 mr-3 text-indigo-600" /> AI Career Planner
                    </h1>
                    <p className="text-slate-500 mt-1">Plan your career path, identify skill gaps, and get personalized recommendations.</p>
                </div>
                
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">Target Role:</span>
                    <select 
                        value={profile?.targetRoleId?._id || ''} 
                        onChange={handleSetRole}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 font-bold"
                    >
                        <option value="">Select a career...</option>
                        {roles.map(r => (
                            <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {!profile?.targetRoleId ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlineBriefcase className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Career Planner</h2>
                    <p className="text-slate-600 max-w-md mx-auto mb-8">Select your dream job title above to get started. Our AI will analyze your current profile and build a personalized roadmap to get you hired.</p>
                </div>
            ) : !hasAnalysis ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlineSparkles className="w-10 h-10 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to analyze your profile</h2>
                    <p className="text-slate-600 max-w-md mx-auto mb-8">We'll scan your resume, verified skills, and projects to determine your readiness for <strong>{profile.targetRoleId.name}</strong>.</p>
                    <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg flex items-center mx-auto shadow-lg shadow-purple-600/30">
                        {analyzing ? (
                            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div> Analyzing...</>
                        ) : (
                            <><HiOutlineSparkles className="w-6 h-6 mr-2" /> Analyze My Profile</>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Readiness Score */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Career Readiness</h3>
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="none" />
                                    <circle cx="64" cy="64" r="56" className={`${profile.readinessScore > 70 ? 'text-green-500' : profile.readinessScore > 40 ? 'text-amber-500' : 'text-red-500'}`} strokeWidth="12" strokeDasharray={351.86} strokeDashoffset={351.86 - (351.86 * profile.readinessScore) / 100} strokeLinecap="round" stroke="currentColor" fill="none" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-3xl font-extrabold text-slate-900">{profile.readinessScore}</span>
                                    <span className="text-xs font-medium text-slate-500">/ 100</span>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between w-full text-xs text-slate-500 px-4">
                                <span>Tech: {profile.scoreBreakdown.technicalSkills}</span>
                                <span>Projects: {profile.scoreBreakdown.projects}</span>
                            </div>
                        </div>

                        {/* Top Gaps Summary */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Priority Skill Gaps</h3>
                                <Link to="/career/skill-gaps" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">View Details <HiOutlineArrowRight className="w-4 h-4 ml-1" /></Link>
                            </div>
                            
                            {profile.topSkillGaps.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-slate-500">
                                    <HiOutlineCheckCircle className="w-6 h-6 mr-2 text-green-500" /> You meet all required skills!
                                </div>
                            ) : (
                                <div className="space-y-3 flex-1 overflow-y-auto">
                                    {profile.topSkillGaps.slice(0, 3).map((gap, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div>
                                                <p className="font-bold text-slate-800">{gap.skillName}</p>
                                                <p className="text-xs text-slate-500">Current: L{gap.currentLevel} → Required: L{gap.requiredLevel}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${gap.priority === 'Critical' ? 'bg-red-100 text-red-700' : gap.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {gap.priority}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Roadmap Promo */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden group cursor-pointer" onClick={() => navigate('/career/roadmap')}>
                            <div className="absolute -right-10 -top-10 text-white/10 group-hover:scale-110 transition-transform duration-500">
                                <HiOutlineMap className="w-48 h-48" />
                            </div>
                            <div className="relative z-10">
                                <span className="bg-white/20 px-3 py-1 text-xs font-bold rounded-full mb-4 inline-block">Learning Path</span>
                                <h3 className="text-2xl font-bold mb-2">View Your Roadmap</h3>
                                <p className="text-indigo-100 mb-6 max-w-sm">We've generated a step-by-step path to help you master missing skills and become job-ready.</p>
                                
                                <div className="flex items-center">
                                    <div className="w-full bg-white/20 rounded-full h-2.5 mr-4 max-w-[200px]">
                                        <div className="bg-white h-2.5 rounded-full" style={{ width: `${roadmap?.completionPercentage || 0}%` }}></div>
                                    </div>
                                    <span className="font-bold text-sm">{roadmap?.completionPercentage || 0}% Done</span>
                                </div>
                            </div>
                        </div>

                        {/* Re-analyze Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                            <HiOutlineSparkles className="w-12 h-12 text-indigo-400 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Updated your profile?</h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-xs">If you recently uploaded a new project or learned a new skill, re-run the analyzer to update your score.</p>
                            <button onClick={handleAnalyze} disabled={analyzing} className="btn-secondary px-6 py-2 w-full md:w-auto">
                                {analyzing ? 'Re-analyzing...' : 'Re-analyze Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerDashboard;
