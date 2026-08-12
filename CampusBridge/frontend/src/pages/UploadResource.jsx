import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineLink } from 'react-icons/hi2';
import { HiOutlineCloudUpload } from 'react-icons/hi';

const UploadResource = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Academics',
        subcategory: '',
        resourceType: 'PDF',
        tags: '',
        skills: '',
        department: '',
        academicYear: '',
        company: '',
        externalUrl: ''
    });

    const [file, setFile] = useState(null);

    const categories = {
        'Placement': ['Aptitude', 'DSA', 'SQL', 'Technical Interview', 'HR Interview', 'Company Preparation'],
        'Academics': ['Notes', 'Question Papers', 'Lab Manuals', 'Study Materials', 'Important Questions'],
        'Programming': ['Python', 'Java', 'C/C++', 'JavaScript', 'React', 'Machine Learning'],
        'Projects': ['Project Ideas', 'Research Papers', 'Datasets', 'Tutorials', 'Documentation'],
        'Career': ['Resume', 'LinkedIn', 'Certifications', 'Career Roadmaps', 'Career Guides']
    };

    const fileTypes = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'Image'];
    const linkTypes = ['External Link', 'YouTube Link', 'GitHub Repository'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'category' ? { subcategory: categories[value][0] } : {})
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 10 * 1024 * 1024) {
                toast.error('File size must be under 10MB');
                e.target.value = null;
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            if (uploadType === 'file' && file) {
                data.append('resourceFile', file);
            }

            await API.post('/resources', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Resource uploaded successfully');
            navigate('/resources');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <HiOutlineArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </button>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-2xl font-bold text-slate-900">Upload Resource</h1>
                    <p className="text-slate-500 mt-1">Share useful materials with the campus community.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                    
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">1. Basic Information</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="input-field w-full" placeholder="e.g. Complete DSA Notes" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="input-field w-full" placeholder="Describe what this resource covers..." />
                        </div>
                    </div>

                    {/* Categorization */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">2. Categorization</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="input-field w-full bg-white">
                                    {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory *</label>
                                <select name="subcategory" value={formData.subcategory} onChange={handleChange} className="input-field w-full bg-white">
                                    <option value="">Select subcategory</option>
                                    {categories[formData.category].map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                                <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="input-field w-full" placeholder="e.g. algorithms, trees" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                                <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="input-field w-full" placeholder="e.g. C++, Python" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field w-full" placeholder="e.g. CSE" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                                <input type="text" name="academicYear" value={formData.academicYear} onChange={handleChange} className="input-field w-full" placeholder="e.g. 3rd Year" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Target Company</label>
                                <input type="text" name="company" value={formData.company} onChange={handleChange} className="input-field w-full" placeholder="e.g. Google" />
                            </div>
                        </div>
                    </div>

                    {/* File/Link Upload */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">3. Resource Attachment</h2>
                        
                        <div className="flex space-x-4 mb-4">
                            <button type="button" onClick={() => { setUploadType('file'); setFormData(prev => ({...prev, resourceType: 'PDF'})) }} className={`px-4 py-2 rounded-lg font-medium border flex items-center ${uploadType === 'file' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600'}`}>
                                <HiOutlineCloudUpload className="w-5 h-5 mr-2" /> Upload File
                            </button>
                            <button type="button" onClick={() => { setUploadType('link'); setFormData(prev => ({...prev, resourceType: 'External Link'})) }} className={`px-4 py-2 rounded-lg font-medium border flex items-center ${uploadType === 'link' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600'}`}>
                                <HiOutlineLink className="w-5 h-5 mr-2" /> Attach Link
                            </button>
                        </div>

                        {uploadType === 'file' ? (
                            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">File Type</label>
                                        <select name="resourceType" value={formData.resourceType} onChange={handleChange} className="input-field w-full bg-white">
                                            {fileTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Choose File (Max 10MB)</label>
                                        <input type="file" required onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Link Type</label>
                                        <select name="resourceType" value={formData.resourceType} onChange={handleChange} className="input-field w-full bg-white">
                                            {linkTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                                        <input type="url" name="externalUrl" required value={formData.externalUrl} onChange={handleChange} className="input-field w-full" placeholder="https://" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 shadow-md shadow-primary/20">
                            {loading ? 'Uploading...' : 'Submit Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadResource;
