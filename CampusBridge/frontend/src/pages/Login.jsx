import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            toast.success(`Welcome back, ${data.name}!`);
            navigate(data.role === 'Admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
            {/* Ambient background glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-slide-up text-slate-800">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                            <span className="text-white font-black text-xl">C</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 mt-2 text-sm">Sign in to your CampusBridge account</p>
                </div>

                <form onSubmit={handleSubmit} className="card bg-white space-y-5 border border-slate-100 rounded-3xl p-8 shadow-sm">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@college.ac.in"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                            <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-dark transition-colors font-medium">Forgot Password?</Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field bg-slate-50"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 mt-2 cursor-pointer">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <p className="text-center text-slate-500 text-sm mt-4">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:text-primary-dark font-semibold transition-colors">Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
