import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoChevronBackOutline, IoWalletOutline, IoCalendarOutline,
    IoAddOutline, IoRemoveOutline, IoTimeOutline, IoCheckmarkCircleOutline,
    IoTrendingUpOutline, IoCashOutline, IoDocumentTextOutline, IoAlertCircleOutline
} from 'react-icons/io5';

export default function EmployeeFinancialProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Transaction form
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Salary');
    const [movement, setMovement] = useState('Deposit');
    const [description, setDescription] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchAccountData();
    }, [id]);

    useEffect(() => {
        if (account) fetchMonthlyData();
    }, [selectedMonth, selectedYear, account]);

    const fetchAccountData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`EmployeeFinancial/Account/${id}`);
            if (res.data.isSuccess) setAccount(res.data.data);

            const transRes = await api.get(`EmployeeFinancial/Transactions/${id}`);
            if (transRes.data.isSuccess) setTransactions(transRes.data.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyData = async () => {
        try {
            const res = await api.get(`EmployeeFinancial/MonthlySummary/${id}/${selectedYear}/${selectedMonth}`);
            if (res.data.isSuccess) setSummary(res.data.data);
        } catch (err) {
            console.error('Error fetching summary:', err);
        }
    };

    const updateBaseSalary = async (newSalary) => {
        try {
            const res = await api.post(`EmployeeFinancial/UpdateBaseSalary`, {
                accountId: account.id,
                baseSalary: newSalary
            });
            if (res.data.isSuccess) fetchAccountData();
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!amount || isNaN(amount)) return;

        try {
            const res = await api.post('EmployeeFinancial/Transaction', {
                employeeAccountId: account.id,
                category,
                movement,
                amount: parseFloat(amount),
                description
            });

            if (res.data.isSuccess) {
                setIsActionModalOpen(false);
                setAmount('');
                setDescription('');
                fetchAccountData();
            } else {
                setErrorMsg(res.data.message);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Transaction failed');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
    );

    const isSalaryFull = summary?.totalSalaryPaid >= account?.baseMonthlySalary && account?.baseMonthlySalary > 0;

    return (
        <div className="space-y-8 pb-12">
            <header className="flex items-center gap-6">
                <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400">
                    <IoChevronBackOutline size={20} />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{account?.userName}</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Employee Portfolio & Monthly Performance</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Account Details & Action */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex flex-col items-center text-center space-y-4 py-4">
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center text-4xl font-black">
                                {account?.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">{account?.userName}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account ID: #{account?.id}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <BalanceRow label="Total Salary" value={account?.salary} color="emerald" />
                            <BalanceRow label="Commission Balance" value={account?.commissionBalance} color="blue" />
                            <BalanceRow label="Bonus Total" value={account?.bonusBalance} color="purple" />
                            <BalanceRow label="Loan Amount" value={account?.loanBalance} color="amber" />
                        </div>

                        <button
                            onClick={() => setIsActionModalOpen(true)}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-95"
                        >
                            <IoCashOutline size={18} /> Financial Action
                        </button>
                    </div>

                    <div className="bg-emerald-600 p-8 rounded-[40px] shadow-xl shadow-emerald-500/20 text-white space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Base Monthly Salary</p>
                            <button
                                onClick={() => {
                                    const val = prompt('Enter new base salary:', account?.baseMonthlySalary);
                                    if (val && !isNaN(val)) updateBaseSalary(parseFloat(val));
                                }}
                                className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-all"
                            >
                                Edit
                            </button>
                        </div>
                        <h4 className="text-3xl font-black">${account?.baseMonthlySalary.toLocaleString()}</h4>
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-[10px] font-bold opacity-60 italic">Used to track monthly disbursement status</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Monthly breakdown */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Month Year Selector */}
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                        <IoCalendarOutline className="text-gray-400 ml-4" size={24} />
                        <select
                            className="bg-transparent font-black text-gray-900 outline-none"
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(parseInt(e.target.value))}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            className="bg-transparent font-black text-gray-900 outline-none"
                            value={selectedYear}
                            onChange={e => setSelectedYear(parseInt(e.target.value))}
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* Monthly Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Salary Disbursed (This Month)</p>
                            <h3 className={`text-4xl font-black ${isSalaryFull ? 'text-emerald-600' : 'text-gray-900'}`}>
                                ${summary?.totalSalaryPaid.toLocaleString()}
                            </h3>
                            {isSalaryFull && (
                                <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                                    <IoCheckmarkCircleOutline /> Fully Paid
                                </div>
                            )}
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Commissions Earned (This Month)</p>
                            <h3 className="text-4xl font-black text-gray-900">${summary?.totalCommission.toLocaleString()}</h3>
                        </div>
                    </div>

                    {/* Detailed history for month */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <IoTimeOutline size={16} /> Activity History
                            </h4>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {transactions.filter(t => new Date(t.time).getMonth() + 1 === selectedMonth && new Date(t.time).getFullYear() === selectedYear).length > 0 ? (
                                transactions.filter(t => new Date(t.time).getMonth() + 1 === selectedMonth && new Date(t.time).getFullYear() === selectedYear).map(t => (
                                    <div key={t.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${t.movement === 'Deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {t.movement === 'Deposit' ? <IoAddOutline /> : <IoRemoveOutline />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900">{t.description || `${t.category} ${t.movement}`}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(t.time).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-black ${t.movement === 'Deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.movement === 'Deposit' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center text-gray-300 font-black uppercase text-[10px]">No history for this month</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Action Modal */}
            <AnimatePresence>
                {isActionModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between border-b pb-6">
                                <h2 className="text-2xl font-black text-gray-900">Wallet Action</h2>
                                <button onClick={() => setIsActionModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">Close</button>
                            </div>

                            {errorMsg && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                                    <IoAlertCircleOutline size={18} /> {errorMsg}
                                </div>
                            )}

                            <form onSubmit={handleTransaction} className="space-y-6">
                                <div className="grid grid-cols-2 gap-2">
                                    {['Salary', 'Commission', 'Bonus', 'Loan'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${category === cat ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 border-gray-50 text-gray-400 hover:border-emerald-100'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex bg-gray-100 p-1 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setMovement('Deposit')}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${movement === 'Deposit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        Deposit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMovement('Withdraw')}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${movement === 'Withdraw' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        Withdraw
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full p-5 bg-gray-50 border-none rounded-[32px] outline-none font-black text-2xl placeholder:text-gray-200"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monthly Status Check</label>
                                    {category === 'Salary' && movement === 'Deposit' && (
                                        <div className={`p-4 rounded-2xl text-[10px] font-bold ${isSalaryFull ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {isSalaryFull ? `Warning: ${summary?.totalSalaryPaid} already paid this month!` : `Safe: Only ${summary?.totalSalaryPaid} paid so far.`}
                                        </div>
                                    )}
                                </div>

                                <textarea
                                    className="w-full p-5 bg-gray-50 border-none rounded-[32px] outline-none font-medium text-gray-700 min-h-[100px]"
                                    placeholder="Transaction notes..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />

                                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[32px] font-black uppercase tracking-widest text-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all active:scale-95">
                                    Execute
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BalanceRow({ label, value, color }) {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600'
    };
    return (
        <div className={`p-4 rounded-2xl flex items-center justify-between ${colors[color]}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            <span className="text-lg font-black">${value?.toLocaleString() || '0'}</span>
        </div>
    );
}
