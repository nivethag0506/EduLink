import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';

const SubmitInterviewExperience = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        companyName: '',
        role: '',
        department: '',
        graduationYear: new Date().getFullYear(),
        interviewYear: new Date().getFullYear(),
        interviewType: 'Campus Placement',
        result: 'Selected',
        overallDifficulty: 'Medium',
        preparationDuration: '',
        preparationResources: '',
        overallExperience: '',
        adviceForStudents: '',
        isAnonymous: false,
        rounds: []
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addRound = () => {
        setFormData(prev => ({
            ...prev,
            rounds: [
                ...prev.rounds,
                {
                    roundNumber: prev.rounds.length + 1,
                    roundType: 'Technical Interview',
                    duration: '',
                    difficulty: 'Medium',
                    topics: '',
                    questions: '',
                    description: '',
                    tips: ''
                }
            ]
        }));
    };

    const updateRound = (index, field, value) => {
        const newRounds = [...formData.rounds];
        newRounds[index][field] = value;
        setFormData(prev => ({ ...prev, rounds: newRounds }));
    };

    const removeRound = (index) => {
        const newRounds = formData.rounds.filter((_, i) => i !== index);
        // renumber
        newRounds.forEach((r, i) => r.roundNumber = i + 1);
        setFormData(prev => ({ ...prev, rounds: newRounds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Clean up arrays
            const payload = { ...formData };
            payload.preparationResources = payload.preparationResources.split(',').map(s => s.trim()).filter(Boolean);
            payload.rounds = payload.rounds.map(r => ({
                ...r,
                topics: r.topics.split(',').map(s => s.trim()).filter(Boolean),
                questions: r.questions.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
            }));

            await API.post('/interview-experiences', payload);
            toast.success('Interview experience published!');
            navigate('/interview-experiences');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit experience');
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
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-2xl font-bold text-slate-900">Share Interview Experience</h1>
                    <p className="text-slate-500 mt-1">Help your juniors prepare by sharing your interview journey.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                    
                    {/* Section 1: Company & Role */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">1. Company & Role</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                                <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className="input-field w-full" placeholder="e.g. Microsoft, Google, TCS" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                                <input type="text" name="role" required value={formData.role} onChange={handleChange} className="input-field w-full" placeholder="e.g. Software Engineer" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field w-full" placeholder="e.g. Engineering, Sales" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Graduation Year</label>
                                <input type="number" name="graduationYear" required value={formData.graduationYear} onChange={handleChange} className="input-field w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Interview Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">2. Interview Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Interview Year *</label>
                                <input type="number" name="interviewYear" required value={formData.interviewYear} onChange={handleChange} className="input-field w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Interview Type *</label>
                                <select name="interviewType" value={formData.interviewType} onChange={handleChange} className="input-field w-full bg-white">
                                    <option>Campus Placement</option>
                                    <option>Off Campus</option>
                                    <option>Internship</option>
                                    <option>Referral</option>
                                    <option>Hackathon / Competition</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Result *</label>
                                <select name="result" value={formData.result} onChange={handleChange} className="input-field w-full bg-white">
                                    <option>Selected</option>
                                    <option>Rejected</option>
                                    <option>Waitlisted</option>
                                    <option>Offer Received</option>
                                    <option>Not Disclosed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Rounds */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-lg font-semibold text-slate-800">3. Interview Rounds</h2>
                            <button type="button" onClick={addRound} className="text-sm flex items-center text-primary font-medium hover:text-primary-dark">
                                <HiOutlinePlus className="w-4 h-4 mr-1" /> Add Round
                            </button>
                        </div>
                        
                        {formData.rounds.length === 0 && (
                            <p className="text-sm text-slate-500 italic">No rounds added yet. Add rounds to detail your experience.</p>
                        )}

                        <div className="space-y-6">
                            {formData.rounds.map((round, idx) => (
                                <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative group">
                                    <button type="button" onClick={() => removeRound(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <HiOutlineTrash className="w-5 h-5" />
                                    </button>
                                    <h3 className="font-semibold text-slate-800 mb-3">Round {round.roundNumber}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Round Type *</label>
                                            <input type="text" required value={round.roundType} onChange={e => updateRound(idx, 'roundType', e.target.value)} className="input-field w-full py-1.5 text-sm" placeholder="e.g. Online Assessment" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Duration</label>
                                            <input type="text" value={round.duration} onChange={e => updateRound(idx, 'duration', e.target.value)} className="input-field w-full py-1.5 text-sm" placeholder="e.g. 45 mins" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Difficulty</label>
                                            <select value={round.difficulty} onChange={e => updateRound(idx, 'difficulty', e.target.value)} className="input-field w-full py-1.5 text-sm bg-white">
                                                <option>Easy</option>
                                                <option>Medium</option>
                                                <option>Hard</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Topics Covered (comma separated)</label>
                                            <input type="text" value={round.topics} onChange={e => updateRound(idx, 'topics', e.target.value)} className="input-field w-full py-1.5 text-sm" placeholder="e.g. Arrays, System Design" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Questions (one per line)</label>
                                            <textarea rows="3" value={round.questions} onChange={e => updateRound(idx, 'questions', e.target.value)} className="input-field w-full py-1.5 text-sm" placeholder="Describe specific questions asked..." />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Preparation */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">4. Preparation</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Preparation Duration</label>
                                <input type="text" name="preparationDuration" value={formData.preparationDuration} onChange={handleChange} className="input-field w-full" placeholder="e.g. 2 months" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Resources Used (comma separated)</label>
                                <input type="text" name="preparationResources" value={formData.preparationResources} onChange={handleChange} className="input-field w-full" placeholder="e.g. LeetCode, Striver's SDE Sheet" />
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Experience */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">5. Overall Experience</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Overall Difficulty *</label>
                            <select name="overallDifficulty" value={formData.overallDifficulty} onChange={handleChange} className="input-field w-full md:w-1/3 bg-white">
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Experience *</label>
                            <textarea name="overallExperience" required rows="4" value={formData.overallExperience} onChange={handleChange} className="input-field w-full" placeholder="Summarize your overall experience..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Advice for Juniors</label>
                            <textarea name="adviceForStudents" rows="3" value={formData.adviceForStudents} onChange={handleChange} className="input-field w-full" placeholder="What should juniors focus on?" />
                        </div>
                    </div>

                    {/* Section 6: Privacy */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">6. Privacy</h2>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="isAnonymous" checked={formData.isAnonymous} onChange={handleChange} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                            <span className="text-sm font-medium text-slate-700">Post Anonymously</span>
                        </label>
                        <p className="text-xs text-slate-500 pl-7">Your name and profile link will be hidden from other students.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5">
                            {loading ? 'Publishing...' : 'Publish Experience'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitInterviewExperience;
