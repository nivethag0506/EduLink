import { Link } from 'react-router-dom';
import { HiOutlineAcademicCap, HiOutlineChatBubbleLeftRight, HiOutlineShieldCheck, HiOutlineUserGroup } from 'react-icons/hi2';

const features = [
    { icon: HiOutlineUserGroup, title: 'College Network', desc: 'Connect with verified students and alumni from your college exclusively.' },
    { icon: HiOutlineChatBubbleLeftRight, title: 'Real-time Chat', desc: 'Instant messaging with peers and mentors in your college community.' },
    { icon: HiOutlineAcademicCap, title: 'Mentoring Sessions', desc: 'Book 1-on-1 sessions with alumni for career guidance and advice.' },
    { icon: HiOutlineShieldCheck, title: 'Secure & Isolated', desc: 'Your data stays within your college. No cross-college data leaks.' },
];

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 relative overflow-hidden selection:bg-primary/30 selection:text-white">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Hero */}
            <header className="relative">
                <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">CampusBridge</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="text-gray-400 hover:text-white font-medium transition-colors">Login</Link>
                        <Link to="/signup" className="btn-primary text-sm px-5 py-2">Get Started</Link>
                    </div>
                </nav>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
                    <div className="inline-block mb-6 animate-scale-up">
                        <span className="bg-primary/10 border border-primary/20 text-primary-light text-xs px-4 py-2 rounded-full font-medium tracking-wide uppercase inline-flex items-center">🚀 Connect & Mentorship Network</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight animate-slide-up">
                        Bridge the Gap Between<br />
                        <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
                            Campus & Career
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        A secure, college-isolated platform where students connect with alumni,
                        share knowledge, and grow together. Think LinkedIn, but built exclusively for your college.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">Join Your College Network</Link>
                        <Link to="/login" className="bg-white/10 hover:bg-white/15 text-white font-semibold py-3.5 px-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto">Sign In</Link>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Everything You Need to Succeed</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">One platform to network, learn, and grow within your verified college community.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/8 hover:border-white/15 hover:-translate-y-1 group">
                            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-6 group-hover:bg-primary/25 transition-all duration-300 border border-primary/20">
                                <f.icon className="w-6 h-6 text-primary-light" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-3">{f.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
                <div className="bg-white/5 text-center py-20 relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-secondary/10 pointer-events-none" />
                    <div className="relative z-10 px-4">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Ready to Connect?</h2>
                        <p className="text-gray-400 max-w-lg mx-auto mb-10 text-base leading-relaxed">Join thousands of students and alumni already networking on CampusBridge.</p>
                        <Link to="/signup" className="btn-primary text-base px-10 py-3.5 inline-flex">Create Account</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 text-center text-gray-500 text-sm bg-slate-950/50">
                <p>© 2026 CampusBridge. Built with ❤️ for college communities.</p>
            </footer>
        </div>
    );
};

export default Landing;
