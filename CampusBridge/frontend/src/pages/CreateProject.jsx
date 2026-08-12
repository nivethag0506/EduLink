import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi2';

const CreateProject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        problemStatement: '',
        proposedSolution: '',
        projectType: 'Academic Project',
        domain: 'Web Development',
        status: 'In Development',
        technologies: '',
        skills: '',
        features: '',
        githubUrl: '',
        liveDemoUrl: '',
        visibility: 'Public',
        collaborationSettings: {
            lookingForCollaborators: false,
            requirements: []
        },
        architectureDetails: {
            frontend: '',
            backend: '',
            database: ''
        }
    });

    const [files, setFiles] = useState({
        screenshots: [],
        demoVideo: null,
        architectureImage: null
    });

    const projectTypes = ['Academic Project', 'Mini Project', 'Final Year Project', 'Personal Project', 'Hackathon Project', 'Research Project', 'Open Source Project'];
    const domains = ['Web Development', 'Mobile App', 'Machine Learning', 'Data Science', 'IoT', 'Cybersecurity', 'Blockchain', 'Other'];
    const statuses = ['Idea', 'In Development', 'Completed', 'Published'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name } = e.target;
        if (name === 'screenshots') {
            setFiles(prev => ({ ...prev, screenshots: Array.from(e.target.files) }));
        } else {
            setFiles(prev => ({ ...prev, [name]: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = new FormData();
            
            // Append scalar fields
            Object.keys(formData).forEach(key => {
                if (typeof formData[key] === 'object' && formData[key] !== null) {
                    data.append(key, JSON.stringify(formData[key]));
                } else if (['technologies', 'skills', 'features'].includes(key)) {
                    // Split comma-separated strings into arrays
                    const arr = formData[key].split(',').map(s => s.trim()).filter(Boolean);
                    data.append(key, JSON.stringify(arr));
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append files
            files.screenshots.forEach(file => data.append('screenshots', file));
            if (files.demoVideo) data.append('demoVideo', files.demoVideo);
            if (files.architectureImage) data.append('architectureImage', files.architectureImage);

            await API.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Project created successfully!');
            navigate('/projects');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <HiOutlineArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Publish Project</h1>
                        <p className="text-slate-500 mt-1">Showcase your technical work to the community.</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-medium text-slate-500">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200'}`}>1</span>
                        <div className="w-4 h-0.5 bg-slate-200"></div>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200'}`}>2</span>
                        <div className="w-4 h-0.5 bg-slate-200"></div>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200'}`}>3</span>
                    </div>
                </div>

                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1); }} className="p-6 md:p-8 space-y-8">
                    
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Basic Information</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Project Title *</label>
                                    <input type="text" name="title" required value={formData.title} onChange={handleChange} className="input-field w-full" placeholder="e.g. CampusBridge Platform" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Short Description *</label>
                                    <textarea name="shortDescription" required rows="2" value={formData.shortDescription} onChange={handleChange} className="input-field w-full" placeholder="A one-line pitch..." />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Project Type *</label>
                                    <select name="projectType" value={formData.projectType} onChange={handleChange} className="input-field w-full bg-white">
                                        {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Domain *</label>
                                    <select name="domain" value={formData.domain} onChange={handleChange} className="input-field w-full bg-white">
                                        {domains.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="input-field w-full bg-white">
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Problem Statement</label>
                                    <textarea name="problemStatement" rows="4" value={formData.problemStatement} onChange={handleChange} className="input-field w-full" placeholder="What problem does this solve?" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Proposed Solution</label>
                                    <textarea name="proposedSolution" rows="4" value={formData.proposedSolution} onChange={handleChange} className="input-field w-full" placeholder="How does it solve it?" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Technical Details</h2>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Technologies Used (comma separated) *</label>
                                <input type="text" name="technologies" required value={formData.technologies} onChange={handleChange} className="input-field w-full" placeholder="React, Node.js, MongoDB" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Skills Demonstrated (comma separated)</label>
                                <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="input-field w-full" placeholder="API Design, Authentication, UI/UX" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Key Features (comma separated)</label>
                                <input type="text" name="features" value={formData.features} onChange={handleChange} className="input-field w-full" placeholder="Real-time chat, Role-based access, Analytics" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">GitHub Repository URL</label>
                                    <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="input-field w-full" placeholder="https://github.com/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Live Demo URL</label>
                                    <input type="url" name="liveDemoUrl" value={formData.liveDemoUrl} onChange={handleChange} className="input-field w-full" placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Media & Publishing</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Screenshots (Up to 5 images)</label>
                                    <input type="file" name="screenshots" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Demo Video (.mp4)</label>
                                    <input type="file" name="demoVideo" accept="video/mp4" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
                                <label className="flex items-center space-x-3">
                                    <input type="checkbox" checked={formData.collaborationSettings.lookingForCollaborators} onChange={(e) => setFormData(prev => ({...prev, collaborationSettings: { ...prev.collaborationSettings, lookingForCollaborators: e.target.checked }}))} className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary" />
                                    <span className="font-medium text-slate-800">I am looking for collaborators</span>
                                </label>
                                {formData.collaborationSettings.lookingForCollaborators && (
                                    <p className="text-sm text-slate-500 mt-2 ml-8">Students will be able to request to join your project team.</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep(s => s - 1)} className="px-6 py-2 rounded-lg font-medium border border-slate-200 text-slate-600 hover:bg-slate-50">Back</button>
                        ) : <div></div>}
                        
                        {step < 3 ? (
                            <button type="submit" className="btn-primary px-8 py-2.5">Continue</button>
                        ) : (
                            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 shadow-md shadow-primary/20 flex items-center">
                                {loading ? 'Publishing...' : <><HiOutlineCheck className="w-5 h-5 mr-2" /> Publish Project</>}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;
