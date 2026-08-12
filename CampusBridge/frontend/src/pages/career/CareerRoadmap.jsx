import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineMap, HiCheckCircle, HiOutlineClock } from 'react-icons/hi2';

const CareerRoadmap = () => {
    const navigate = useNavigate();
    const [roadmap, setRoadmap] = useState(null);
    const [recommendations, setRecommendations] = useState({ resources: [], projects: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/career/dashboard');
            if (data && data.roadmap) {
                setRoadmap(data.roadmap);
                
                // Fetch resources and projects based on roadmap
                const [resRes, projRes] = await Promise.all([
                    API.get('/career/recommendations/resources'),
                    API.get('/career/recommendations/projects')
                ]);
                setRecommendations({ resources: resRes.data, projects: projRes.data });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (milestoneId, newStatus) => {
        try {
            const { data } = await API.put('/career/roadmap/progress', { milestoneId, status: newStatus });
            setRoadmap(data);
            toast.success('Progress updated!');
        } catch (error) {
            toast.error('Failed to update progress');
        }
    };

    if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

    if (!roadmap) return (
        <div className="max-w-4xl mx-auto text-center p-12 bg-white rounded-xl">
            <p className="text-slate-500 mb-4">No roadmap generated yet.</p>
            <Link to="/career" className="btn-primary px-6 py-2">Go to Career Planner</Link>
        </div>
    );

    // Group milestones by phase
    const phases = {};
    roadmap.milestones.forEach(m => {
        if (!phases[m.phase]) phases[m.phase] = { name: m.phaseName, milestones: [] };
        phases[m.phase].milestones.push(m);
    });

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <button onClick={() => navigate('/career')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <HiOutlineArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </button>

            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                        <HiOutlineMap className="w-8 h-8 mr-2 text-purple-600" /> Career Roadmap
                    </h1>
                    <p className="text-slate-500 mt-1">Your step-by-step path to achieving your career goals.</p>
                </div>
                
                <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-32 bg-slate-100 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${roadmap.completionPercentage}%` }}></div>
                    </div>
                    <span className="font-bold text-slate-800">{roadmap.completionPercentage}% Complete</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline */}
                <div className="lg:col-span-2 space-y-8 relative">
                    <div className="absolute left-6 top-4 bottom-4 w-1 bg-slate-200 rounded-full"></div>
                    
                    {Object.keys(phases).map((phaseKey) => (
                        <div key={phaseKey} className="relative z-10">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center font-bold text-slate-500 z-10 shrink-0">
                                    {phaseKey}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 ml-4">{phases[phaseKey].name}</h2>
                            </div>
                            
                            <div className="ml-16 space-y-4">
                                {phases[phaseKey].milestones.map((milestone) => (
                                    <div key={milestone._id} className={`p-5 rounded-2xl border transition-colors ${milestone.status === 'Completed' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`text-lg font-bold ${milestone.status === 'Completed' ? 'text-green-800 line-through opacity-70' : 'text-slate-900'}`}>
                                                {milestone.skillName}
                                            </h3>
                                            
                                            <select 
                                                value={milestone.status}
                                                onChange={(e) => handleUpdateStatus(milestone._id, e.target.value)}
                                                className={`text-xs font-bold px-2 py-1 rounded-md border cursor-pointer outline-none ${
                                                    milestone.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Skipped">Skipped</option>
                                            </select>
                                        </div>
                                        
                                        <p className="text-sm text-slate-600 mb-3">{milestone.learningObjective}</p>
                                        
                                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                            <span className="flex items-center"><HiOutlineClock className="w-4 h-4 mr-1" /> {milestone.estimatedEffort}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendations Sidebar */}
                <div className="space-y-6">
                    {/* Recommended Resources */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Recommended Resources</h3>
                        {recommendations.resources.length > 0 ? (
                            <div className="space-y-3">
                                {recommendations.resources.map(res => (
                                    <Link key={res._id} to={`/resources/${res._id}`} className="block p-3 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-100 hover:border-indigo-100">
                                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{res.title}</h4>
                                        <p className="text-xs text-slate-500">{res.category}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No specific resources found for your gaps.</p>
                        )}
                        <Link to="/resources" className="block text-center text-sm font-medium text-indigo-600 mt-4 hover:underline">Browse Hub</Link>
                    </div>

                    {/* Recommended Projects */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Projects to Build</h3>
                        {recommendations.projects.length > 0 ? (
                            <div className="space-y-3">
                                {recommendations.projects.map(proj => (
                                    <Link key={proj._id} to={`/projects/${proj.slug}`} className="block p-3 bg-slate-50 hover:bg-purple-50 rounded-lg transition-colors border border-slate-100 hover:border-purple-100">
                                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{proj.title}</h4>
                                        <p className="text-xs text-slate-500">{proj.domain}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No specific projects found for your gaps.</p>
                        )}
                        <Link to="/projects" className="block text-center text-sm font-medium text-purple-600 mt-4 hover:underline">Explore Projects</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerRoadmap;
