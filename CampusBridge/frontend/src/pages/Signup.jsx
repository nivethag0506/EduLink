import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Signup = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Student', collegeId: '', branch: '', year: '', graduationYear: '', otp: '' });
    const [idCardFile, setIdCardFile] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [colleges, setColleges] = useState([]);
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        API.get('/colleges').then(res => {
            setColleges(res.data);
            if (res.data && res.data.length > 0) {
                setForm(prev => ({ ...prev, collegeId: res.data[0]._id }));
            }
        }).catch(() => { });
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSendOtp = async () => {
        if (!form.email) return toast.error('Please enter your email first');
        setSendingOtp(true);
        try {
            await API.post('/auth/send-otp', { email: form.email });
            setOtpSent(true);
            toast.success('OTP sent! Check your inbox (or backend logs if running locally)');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idCardFile) return toast.error('Please upload your college ID card');

        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
        formData.append('idCardImage', idCardFile);
        if (!form.otp) return toast.error('Please enter the OTP sent to your email');
        try {
            await register(formData);
            toast.success('Account created successfully! Please wait for admin verification.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden py-12 px-4 text-slate-800">
            {/* Ambient background glows */}
            <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-lg relative z-10 animate-slide-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img src="/kongu-logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
                    <p className="text-slate-500 mt-2 text-sm">Join your college's exclusive network</p>
                </div>
                <form onSubmit={handleSubmit} className="card bg-white space-y-4 border border-slate-100 rounded-3xl p-8 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input name="name" value={form.name} onChange={handleChange} className="input-field bg-slate-50" required />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                            <div className="flex gap-2">
                                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field bg-slate-50 flex-1" required disabled={otpSent} />
                                {!otpSent && (
                                    <button type="button" onClick={handleSendOtp} disabled={sendingOtp} className="btn-secondary px-4 py-2 text-xs font-semibold shrink-0 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                        {sendingOtp ? 'Sending...' : 'Verify'}
                                    </button>
                                )}
                            </div>
                        </div>
                        {otpSent && (
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 text-primary">Verification OTP</label>
                                <input name="otp" type="text" value={form.otp} onChange={handleChange} className="input-field bg-indigo-50 border-indigo-200" placeholder="Enter 6-digit OTP" required />
                            </div>
                        )}
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                            <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field bg-slate-50" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
                            <select name="role" value={form.role} onChange={handleChange} className="input-field bg-slate-50 cursor-pointer">
                                <option value="Student">Student</option>
                                <option value="Senior">Senior</option>
                                <option value="Alumni">Alumni</option>
                            </select>
                        </div>
                        {/* College field removed from UI but auto-set in background */}
                        <div className="hidden">
                            <select name="collegeId" value={form.collegeId} onChange={handleChange} className="input-field bg-slate-50 cursor-pointer" required>
                                <option value="">Select College</option>
                                {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Branch</label>
                            <input name="branch" value={form.branch} onChange={handleChange} className="input-field bg-slate-50" placeholder="e.g. CS" />
                        </div>
                        {(form.role === 'Student' || form.role === 'Senior') && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Year</label>
                                <input name="year" type="number" value={form.year} onChange={handleChange} className="input-field bg-slate-50" placeholder="e.g. 3" />
                            </div>
                        )}
                        {form.role === 'Alumni' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Graduation Year</label>
                                <input name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange} className="input-field bg-slate-50" placeholder="e.g. 2022" />
                            </div>
                        )}
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">College ID Card</label>
                            <input type="file" accept="image/*" onChange={(e) => setIdCardFile(e.target.files[0])}
                                className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:cursor-pointer hover:file:bg-primary/20 transition-all text-xs border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50" required />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 mt-4 cursor-pointer">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                    <p className="text-center text-slate-500 text-sm mt-2">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
