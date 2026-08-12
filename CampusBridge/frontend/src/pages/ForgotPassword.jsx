import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email');
        setLoading(true);
        try {
            await API.post('/auth/forgot-password', { email });
            setStep(2);
            toast.success('OTP sent to your email address');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword) return toast.error('Please enter OTP and new password');
        setLoading(true);
        try {
            await API.post('/auth/reset-password', { email, otp, newPassword });
            toast.success('Password reset successfully! You can now login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
            {/* Ambient background glows */}
            <div className="absolute top-20 left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-slide-up text-slate-800">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                            <span className="text-white font-black text-xl">C</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
                    <p className="text-slate-500 mt-2 text-sm">Recover access to your CampusBridge account</p>
                </div>

                <div className="card bg-white space-y-5 border border-slate-100 rounded-3xl p-8 shadow-sm">
                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Registered Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field bg-slate-50"
                                    placeholder="you@college.ac.in"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 cursor-pointer">
                                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Verification OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="input-field bg-slate-50"
                                    placeholder="Enter 6-digit OTP"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input-field bg-slate-50"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 cursor-pointer">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                    <p className="text-center text-slate-500 text-sm mt-4">
                        Remember your password?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
