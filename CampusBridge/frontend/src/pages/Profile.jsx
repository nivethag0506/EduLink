import { getImageUrl } from "../utils/getImageUrl";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlinePencilSquare, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight, HiOutlinePlusCircle, HiOutlineXMark } from 'react-icons/hi2';

const Profile = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [newSkill, setNewSkill] = useState('');
    const [newExp, setNewExp] = useState({ title: '', company: '', current: false, startDate: '' });
    const [showExpForm, setShowExpForm] = useState(false);
    const [showMentoringModal, setShowMentoringModal] = useState(false);
    const [mentoringTopic, setMentoringTopic] = useState('');
    const [mentoringMessage, setMentoringMessage] = useState('');
    const isOwn = !id || id === user?._id;

    const fetchProfile = async () => {
        try {
            const endpoint = isOwn ? '/users/profile' : `/users/${id}`;
            const { data } = await API.get(endpoint);
            setProfile(data);
            setForm({ name: data.name, bio: data.bio || '', branch: data.branch || '', skills: data.skills || [] });
        } catch (err) {
            toast.error('Failed to load profile');
        }
    };

    useEffect(() => { fetchProfile(); }, [id]);

    const handleSave = async () => {
        try {
            const { data } = await API.put('/users/profile', form);
            setProfile(data);
            setEditing(false);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error('Failed to update profile');
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
            setForm({ ...form, skills: [...form.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter(sk => sk !== s) });

    const addExperience = async () => {
        if (!newExp.title || !newExp.company) return;
        const exp = [...(profile.experience || []), newExp];
        try {
            const { data } = await API.put('/users/profile', { experience: exp });
            setProfile(data);
            setNewExp({ title: '', company: '', current: false, startDate: '' });
            setShowExpForm(false);
            toast.success('Experience added!');
        } catch (err) {
            toast.error('Failed to add experience');
        }
    };

    const handleFileUpload = async (field, file) => {
        const formData = new FormData();
        formData.append(field, file);
        try {
            const { data } = await API.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProfile(data);
            toast.success(`${field === 'profilePhoto' ? 'Photo' : 'Resume'} uploaded!`);
        } catch (err) {
            toast.error('Upload failed');
        }
    };

    const handleMentoringRequest = async () => {
        if (!mentoringTopic.trim() || !mentoringMessage.trim()) return toast.error('Please fill in all fields');
        try {
            await API.post('/mentoring', { mentorId: profile._id, topic: mentoringTopic, message: mentoringMessage });
            toast.success('Session request sent to Mentor!');
            setShowMentoringModal(false);
            setMentoringTopic('');
            setMentoringMessage('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to request');
        }
    };

    if (!profile) return <div className="text-center py-12 text-slate-500">Loading profile...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 text-slate-800">
            {/* Cover & Photo */}
            <div className="card border border-slate-100 rounded-3xl p-0 overflow-hidden bg-white shadow-sm">
                <div className="h-48 bg-gradient-to-r from-primary via-secondary to-accent relative">
                    <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="px-6 pb-6 relative flex flex-col md:flex-row gap-5">
                    <div className="relative group shrink-0 -mt-14 mx-auto md:mx-0">
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-extrabold border-4 border-white overflow-hidden shadow-md">
                            {profile.profilePhoto ? (
                                <img src={getImageUrl(profile.profilePhoto)} className="w-full h-full object-cover" alt="" />
                            ) : profile.name?.charAt(0)}
                        </div>
                        {isOwn && (
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity">
                                <HiOutlinePencilSquare className="w-6 h-6 text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])} />
                            </label>
                        )}
                    </div>
                    <div className="flex-1 pt-2 text-center md:text-left">
                            {editing ? (
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-lg font-bold bg-white" />
                            ) : (
                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{profile.name}</h1>
                            )}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1.5">
                                <span className="badge-primary uppercase text-[9px] tracking-wider font-bold">{profile.role}</span>
                                <span className="text-slate-500 text-xs font-semibold">{profile.branch}</span>
                            </div>
                            <p className="text-slate-400 text-xs mt-1.5 font-medium">{profile.collegeId?.name}</p>
                            <div className="flex justify-center md:justify-start gap-4 mt-3">
                                <span className="text-slate-500 text-xs"><strong className="text-slate-900 font-bold">{profile.followers?.length || 0}</strong> Followers</span>
                                <span className="text-slate-500 text-xs"><strong className="text-slate-900 font-bold">{profile.following?.length || 0}</strong> Following</span>
                            </div>
                        </div>
                        {isOwn && (
                            <div className="flex gap-2 pt-2 self-stretch md:self-auto justify-center">
                                {editing ? (
                                    <>
                                        <button onClick={handleSave} className="btn-primary text-xs py-2 px-4 cursor-pointer">Save</button>
                                        <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
                                    </>
                                ) : (
                                    <button onClick={() => setEditing(true)} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer">
                                        <HiOutlinePencilSquare className="w-4 h-4 text-primary" /> Edit Profile
                                    </button>
                                )}
                            </div>
                        )}
                        {!isOwn && (
                            <div className="flex gap-2 pt-2 flex-wrap items-center justify-center md:justify-end">
                                <a href={`/chat?userId=${profile._id}`} className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 cursor-pointer">
                                    <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> Message
                                </a>
                                {(() => {
                                    const myId = user?._id?.toString();
                                    const isFollower = profile.followers?.some(f => (f._id || f).toString() === myId);
                                    const isRequested = profile.followRequests?.some(f => (f._id || f).toString() === myId);

                                    if (isFollower) {
                                        return <button className="btn-secondary text-xs py-2.5 px-4 cursor-pointer" style={{ borderColor: '#6366f1', color: '#6366f1' }}>✓ Connected</button>;
                                    } else if (isRequested) {
                                        return <button className="btn-secondary text-xs py-2.5 px-4 opacity-60 cursor-not-allowed">Requested</button>;
                                    } else {
                                        return (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await API.post(`/users/${profile._id}/follow`);
                                                        toast.success('Connection Request Sent!');
                                                        await fetchProfile();
                                                    } catch (err) { toast.error(err.response?.data?.message || 'Failed to connect'); }
                                                }}
                                                className="btn-secondary text-xs py-2.5 px-4 cursor-pointer">
                                                + Connect
                                            </button>
                                        );
                                    }
                                })()}

                                {['Senior', 'Alumni'].includes(profile.role) && profile.followers?.some(f => (f._id || f).toString() === user?._id?.toString()) && (
                                    <button
                                        onClick={() => setShowMentoringModal(true)}
                                        className="btn-primary text-xs py-2.5 px-4 bg-secondary hover:bg-secondary/80 border-none cursor-pointer">
                                        Request Mentoring
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            {/* Bio */}
            <div className="card border border-slate-100 rounded-3xl p-6 bg-white shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-3">About</h2>
                {editing ? (
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field min-h-[100px] resize-none text-xs bg-white" placeholder="Tell us about yourself..." />
                ) : (
                    <p className="text-slate-600 leading-relaxed text-xs">{profile.bio || 'No bio added yet.'}</p>
                )}
            </div>

            {/* Skills */}
            <div className="card border border-slate-100 rounded-3xl p-6 bg-white shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {(editing ? form.skills : profile.skills)?.map((s, i) => (
                        <span key={i} className="badge-primary flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-xl">
                            {s}
                            {editing && <button onClick={() => removeSkill(s)} className="cursor-pointer text-slate-400 hover:text-slate-600"><HiOutlineXMark className="w-3 h-3" /></button>}
                        </span>
                    ))}
                    {editing && (
                        <div className="flex items-center gap-2">
                            <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} className="input-field text-xs py-1 px-3 w-32 bg-white" placeholder="Add skill" />
                            <button onClick={addSkill} className="text-primary cursor-pointer"><HiOutlinePlusCircle className="w-5 h-5" /></button>
                        </div>
                    )}
                    {!editing && profile.skills?.length === 0 && <p className="text-slate-500 text-xs">No skills added.</p>}
                </div>
            </div>

            {/* Experience */}
            <div className="card border border-slate-100 rounded-3xl p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <HiOutlineBriefcase className="w-5 h-5 text-primary" /> Experience
                    </h2>
                    {isOwn && (
                        <button onClick={() => setShowExpForm(!showExpForm)} className="text-primary hover:text-primary-dark text-xs font-bold cursor-pointer">
                            + Add
                        </button>
                    )}
                </div>
                {showExpForm && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 mb-4 space-y-3">
                        <input value={newExp.title} onChange={(e) => setNewExp({ ...newExp, title: e.target.value })} className="input-field text-xs bg-white" placeholder="Job Title" />
                        <input value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} className="input-field text-xs bg-white" placeholder="Company" />
                        <div className="flex items-center gap-4">
                            <input type="date" value={newExp.startDate} onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })} className="input-field text-xs text-slate-500 bg-white" />
                            <label className="flex items-center gap-2 text-slate-500 text-xs cursor-pointer select-none">
                                <input type="checkbox" checked={newExp.current} onChange={(e) => setNewExp({ ...newExp, current: e.target.checked })} />
                                Current
                            </label>
                        </div>
                        <button onClick={addExperience} className="btn-primary text-xs py-2 px-4 cursor-pointer">Add Experience</button>
                    </div>
                )}
                {profile.experience?.length > 0 ? (
                    <div className="space-y-4">
                        {profile.experience.map((exp, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                    <HiOutlineBriefcase className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">{exp.title}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{exp.company}</p>
                                    {exp.current && <span className="badge-success text-[9px] font-bold uppercase tracking-wider mt-1.5 inline-block">Current</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-slate-500 text-xs">No experience added.</p>}
            </div>

            {/* Education */}
            <div className="card border border-slate-100 rounded-3xl p-6 bg-white shadow-sm">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <HiOutlineAcademicCap className="w-5 h-5 text-secondary" /> Education
                </h2>
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20">
                        <HiOutlineAcademicCap className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 text-sm">{profile.collegeId?.name || 'College'}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{profile.branch}</p>
                        {profile.role === 'Student' && <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1.5">Year {profile.year}</p>}
                        {profile.role === 'Alumni' && <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1.5">Graduated {profile.graduationYear}</p>}
                    </div>
                </div>
            </div>

            {/* Resume */}
            <div className="card border border-slate-100 rounded-3xl p-6 bg-white shadow-sm">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <HiOutlineDocumentText className="w-5 h-5 text-accent" /> Resume
                </h2>
                {profile.resumePDF ? (
                    <a href={getImageUrl(profile.resumePDF)} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs font-semibold bg-primary/5 border border-primary/10 rounded-xl py-2 px-4 inline-flex">View Resume (PDF)</a>
                ) : (
                    <p className="text-slate-500 text-xs">No resume uploaded.</p>
                )}
                {isOwn && (
                    <label className="inline-block mt-4 btn-secondary text-xs cursor-pointer py-2 px-4 select-none bg-white">
                        Upload Resume
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload('resumePDF', e.target.files[0])} />
                    </label>
                )}
            </div>

            {/* Mentoring Request Modal */}
            {showMentoringModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Request Mentoring Session</h3>
                        <p className="text-xs text-slate-500 mb-4">Send a request to {profile.name} to schedule a mentoring session.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                                <input 
                                    value={mentoringTopic} 
                                    onChange={e => setMentoringTopic(e.target.value)} 
                                    className="input-field text-xs bg-slate-50 w-full" 
                                    placeholder="e.g. Resume Review, Career Advice" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                                <textarea 
                                    value={mentoringMessage} 
                                    onChange={e => setMentoringMessage(e.target.value)} 
                                    className="input-field text-xs bg-slate-50 w-full min-h-[100px] resize-none" 
                                    placeholder="Briefly describe what you'd like to discuss..." 
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button onClick={() => setShowMentoringModal(false)} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
                            <button onClick={handleMentoringRequest} className="btn-primary text-xs py-2 px-4 bg-secondary border-none hover:bg-secondary/90 cursor-pointer">Send Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
