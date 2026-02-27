import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoPersonOutline, IoLockClosedOutline, IoFlash, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import api from '../api/axios';
import logo from '../assets/logo.png';

export default function Login() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('auth/login', { userName, password });
            if (response.data.isSuccess) {
                localStorage.setItem('token', response.data.data.accessToken);
                navigate('/');
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 overflow-hidden relative">
            {/* Soft decorative background elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-50" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-[440px]"
            >
                <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 p-10 sm:p-12 border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-10 space-y-4">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-block"
                        >
                            <img src={logo} alt="TourMove" className="w-20 h-20 object-contain mx-auto transition-transform hover:scale-110" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
                            <p className="text-blue-600 font-bold text-sm mt-1 uppercase tracking-widest">Portal Access</p>
                        </motion.div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-2"
                        >
                            <span className="text-lg">⚠️</span>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-2"
                        >
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <IoPersonOutline size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    autoComplete="username"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500/20 focus:bg-white transition-all font-bold shadow-sm"
                                    placeholder="your username"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-2"
                        >
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <IoLockClosedOutline size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500/20 focus:bg-white transition-all font-bold shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            whileHover={{ scale: 1.02, backgroundColor: '#2563eb' }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <IoFlash className="text-yellow-300" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-center mt-8 text-gray-400 text-xs font-bold uppercase tracking-widest"
                >
                    &copy; 2026 TourMove &bull; Secured with TLS 2.0
                </motion.p>
            </motion.div>
        </div>
    );
}
