import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoChevronBackOutline, IoWalletOutline, IoCalendarOutline,
    IoAddOutline, IoRemoveOutline, IoTimeOutline, IoCheckmarkCircleOutline,
    IoTrendingUpOutline, IoTrendingDownOutline, IoCashOutline, IoDocumentTextOutline, IoAlertCircleOutline, IoFilterCircleOutline
} from 'react-icons/io5';

export default function EmployeeFinancialProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [txCategory, setTxCategory] = useState('All');
    const [txType, setTxType] = useState('All');

    // Transaction form
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Salary');
    const [movement, setMovement] = useState('Deposit');
    const [description, setDescription] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Modals
    const [isEarningsModalOpen, setIsEarningsModalOpen] = useState(false);
    const [isBaseSalaryModalOpen, setIsBaseSalaryModalOpen] = useState(false);
    const [earningsAmount, setEarningsAmount] = useState('');
    const [baseSalaryAmount, setBaseSalaryAmount] = useState('');
    const [earningsCategory, setEarningsCategory] = useState('Salary');
    const [earningsHistory, setEarningsHistory] = useState([]);

    const [financialAccounts, setFinancialAccounts] = useState([]);
    const [fromAccountId, setFromAccountId] = useState('');

    useEffect(() => {
        fetchAccountData();
        api.get('FinancialAccount').then(res => {
            if (res.data.isSuccess) setFinancialAccounts(res.data.data);
        });
    }, [id]);

    useEffect(() => {
        if (account) fetchMonthlyData();
    }, [account]);

    const fetchAccountData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`EmployeeFinancial/Account/${id}`);
            if (res.data.isSuccess) setAccount(res.data.data);

            const transRes = await api.get(`EmployeeFinancial/Transactions/${id}`);
            if (transRes.data.isSuccess) setTransactions(transRes.data.data);

            const historyRes = await api.get(`EmployeeFinancial/EarningsHistory/${id}`);
            if (historyRes.data.isSuccess) setEarningsHistory(historyRes.data.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyData = async () => {
        try {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const res = await api.get(`EmployeeFinancial/MonthlySummary/${id}/${currentYear}/${currentMonth}`);
            if (res.data.isSuccess) setSummary(res.data.data);
        } catch (err) {
            console.error('Error fetching summary:', err);
        }
    };

    const handleUpdateBaseSalary = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`EmployeeFinancial/UpdateBaseSalary`, {
                accountId: account.id,
                baseSalary: parseFloat(baseSalaryAmount)
            });
            if (res.data.isSuccess) {
                setIsBaseSalaryModalOpen(false);
                fetchAccountData();
            }
        } catch (err) {
            console.error('Update base salary failed:', err);
        }
    };

    const handleAddEarnings = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`EmployeeFinancial/AddEarnings`, {
                employeeAccountId: account.id,
                category: earningsCategory,
                amount: parseFloat(earningsAmount)
            });
            if (res.data.isSuccess) {
                setIsEarningsModalOpen(false);
                setEarningsAmount('');
                fetchAccountData();
            }
        } catch (err) {
            console.error('Add earnings failed:', err);
        }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!amount || isNaN(amount)) return;

        try {
            const res = await api.post('EmployeeFinancial/Transaction', {
                employeeAccountId: account.id,
                fromAccountId: parseInt(fromAccountId),
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailedBalanceRow
                                label="Salary"
                                color="emerald"
                                paid={account?.baseMonthlySalary - account?.remainingMonthlySalary}
                                remaining={account?.remainingMonthlySalary}
                                sublabel={account?.baseMonthlySalary > 0 ? `Target: $${account.baseMonthlySalary}` : 'No target set'}
                                onAction={() => {
                                    setBaseSalaryAmount(account?.baseMonthlySalary.toString());
                                    setIsBaseSalaryModalOpen(true);
                                }}
                                actionLabel="Set Base Salary"
                            />
                            <DetailedBalanceRow
                                label="Commission"
                                color="blue"
                                paid={account?.commissionBalance - account?.remainingCommission}
                                remaining={account?.remainingCommission}
                                sublabel="Total Earned"
                                onAction={() => navigate(`/employee-commission/${account.id}`)}
                                actionLabel="Calculate & Pay"
                            />
                            <DetailedBalanceRow
                                label="Bonus"
                                color="purple"
                                paid={summary?.totalBonusPaid || 0}
                                remaining={account?.remainingBonusBalance}
                                primaryValueLabel="Wallet"
                                secondaryValueLabel="Paid"
                                sublabel="Extra Earnings"
                                onAction={() => {
                                    setEarningsCategory('Bonus');
                                    setEarningsAmount('');
                                    setIsEarningsModalOpen(true);
                                }}
                                actionLabel="Add Bonus"
                            />
                            <DetailedBalanceRow
                                label="Loan"
                                color="amber"
                                paid={account?.loanBalance}
                                remaining={account?.loanBalance}
                                primaryValueLabel="Balance"
                                sublabel="Employee Debt"
                            />
                        </div>

                        <button
                            onClick={() => setIsActionModalOpen(true)}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-95"
                        >
                            <IoCashOutline size={18} /> Financial Action
                        </button>
                    </div>


                </div>

                {/* Right Column: Monthly breakdown */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl flex-1 min-w-[200px]">
                            <IoCalendarOutline className="text-gray-400" size={20} />
                            <input
                                type="date"
                                className="bg-transparent font-black text-gray-900 outline-none w-full cursor-pointer text-sm"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl">
                            <IoFilterCircleOutline className="text-gray-400" size={20} />
                            <select 
                                value={txCategory} 
                                onChange={e => setTxCategory(e.target.value)}
                                className="bg-transparent font-black text-gray-900 outline-none cursor-pointer text-sm"
                            >
                                <option value="All">All Categories</option>
                                <option value="Salary">Salary</option>
                                <option value="Commission">Commission</option>
                                <option value="Bonus">Bonus</option>
                                <option value="Loan">Loan</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl">
                            <select 
                                value={txType} 
                                onChange={e => setTxType(e.target.value)}
                                className="bg-transparent font-black text-gray-900 outline-none cursor-pointer text-sm"
                            >
                                <option value="All">All Types</option>
                                <option value="Deposit">Deposit (In)</option>
                                <option value="Withdraw">Withdraw (Out)</option>
                            </select>
                        </div>
                        {(selectedDate || txCategory !== 'All' || txType !== 'All') && (
                            <button 
                                onClick={() => { setSelectedDate(''); setTxCategory('All'); setTxType('All'); }}
                                className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest px-4 py-2 bg-rose-50 rounded-2xl transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Detailed history for month */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mt-6">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <IoTimeOutline size={16} /> Activity History
                            </h4>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {(() => {
                                const filteredTx = transactions.filter(t => {
                                    if (selectedDate) {
                                        const txDate = new Date(t.time).toISOString().split('T')[0];
                                        if (txDate !== selectedDate) return false;
                                    }
                                    if (txCategory !== 'All' && t.category !== txCategory) return false;
                                    if (txType !== 'All' && t.movement !== txType && t.type !== txType) return false;
                                    return true;
                                });

                                return filteredTx.length > 0 ? (
                                    filteredTx.map(t => (
                                        <div key={t.id} className="p-4 hover:bg-gray-50 transition-all flex items-center justify-between group border border-transparent hover:border-gray-100 rounded-2xl m-2">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl flex-shrink-0 ${t.movement === 'Deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {t.movement === 'Deposit' ? <IoTrendingUpOutline size={18} /> : <IoTrendingDownOutline size={18} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="text-sm font-black text-gray-900">{t.description || `${t.category} Transaction`}</span>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${t.category === 'Salary' ? 'bg-purple-100 text-purple-700' :
                                                            t.category === 'Commission' ? 'bg-blue-100 text-blue-700' :
                                                                t.category === 'Bonus' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>{t.category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <span>{new Date(t.time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {t.performedByUserName && (
                                                            <>
                                                                <span className="opacity-40">•</span>
                                                                <span className="text-gray-500">By {t.performedByUserName}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`text-base font-black tabular-nums whitespace-nowrap ${t.movement === 'Deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.movement === 'Deposit' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center text-gray-300 font-black uppercase text-[10px]">No history matches filters</div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings Modal (for Salary & Bonus Targets) */}
            <AnimatePresence>
                {isEarningsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Left Side: Form */}
                            <div className="p-8 w-full md:w-1/2 bg-gray-50 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
                                <h2 className="text-2xl font-black text-gray-900 mb-2">Add {earningsCategory}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 leading-relaxed">
                                    Increase the unpaid {earningsCategory.toLowerCase()} target limit for this employee.
                                </p>

                                <form onSubmit={handleAddEarnings}>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none font-bold text-gray-900 text-lg mb-6 shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
                                        value={earningsAmount}
                                        onChange={(e) => setEarningsAmount(e.target.value)}
                                        placeholder="Amount ($)"
                                    />
                                    <div className="flex gap-2 text-xs font-bold uppercase tracking-widest">
                                        <button
                                            type="button"
                                            onClick={() => setIsEarningsModalOpen(false)}
                                            className="flex-1 py-3.5 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Right Side: History */}
                            <div className="p-8 w-full md:w-1/2 bg-white flex flex-col max-h-[400px]">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <IoTimeOutline size={16} /> History of Additions
                                </h3>
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                    {(() => {
                                        // Use the specific earnings history which doesn't reflect actual payments (transactions)
                                        const pastTx = earningsHistory.filter(t => t.category === earningsCategory);
                                        
                                        if (pastTx.length === 0) {
                                            return (
                                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-xs font-bold text-gray-400">No past {earningsCategory.toLowerCase()} deposits found.</p>
                                                </div>
                                            );
                                        }

                                        return pastTx.map(t => (
                                            <div key={t.id} className="p-4 rounded-2xl border border-gray-100 bg-emerald-50/30 flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-black text-emerald-700">+${t.amount}</div>
                                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                        {new Date(t.time).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                                                    DISBURSED
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Base Salary Modal */}
            <AnimatePresence>
                {isBaseSalaryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8"
                        >
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Set Base Monthly Salary</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 leading-relaxed">
                                This is the fixed monthly target for this employee.
                            </p>

                            <form onSubmit={handleUpdateBaseSalary}>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-900 text-lg mb-6 focus:border-emerald-500 transition-all"
                                    value={baseSalaryAmount}
                                    onChange={(e) => setBaseSalaryAmount(e.target.value)}
                                    placeholder="Base Amount ($)"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsBaseSalaryModalOpen(false)}
                                        className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Financial Action Modal */}
            <AnimatePresence>
                {isActionModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar"
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
                                            onClick={() => {
                                                setCategory(cat);
                                                if (cat !== 'Loan') setMovement('Deposit');
                                            }}
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
                                        Deposit (Pay/Give)
                                    </button>
                                    {category === 'Loan' && (
                                        <button
                                            type="button"
                                            onClick={() => setMovement('Withdraw')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${movement === 'Withdraw' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400'}`}
                                        >
                                            Withdraw (Repay)
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Account</label>
                                    <select
                                        value={fromAccountId}
                                        onChange={e => setFromAccountId(e.target.value)}
                                        required
                                        className="w-full p-4 bg-gray-50 border-none rounded-[24px] outline-none font-bold text-gray-700"
                                    >
                                        <option value="">Select Account...</option>
                                        {financialAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} - (${Number(acc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border-none rounded-[24px] outline-none font-black text-xl placeholder:text-gray-200"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monthly Status Check</label>
                                    {category === 'Salary' && movement === 'Deposit' && (
                                        <div className={`p-4 rounded-2xl text-[10px] font-bold ${isSalaryFull ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {isSalaryFull ? `Warning: ${summary?.totalSalaryPaid || 0} already paid this month!` : `Safe: Only ${summary?.totalSalaryPaid || 0} paid so far.`}
                                        </div>
                                    )}
                                </div>

                                <textarea
                                    className="w-full p-5 bg-gray-50 border-none rounded-[32px] outline-none font-medium text-gray-700 min-h-[100px]"
                                    placeholder="Transaction notes..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />

                                <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-emerald-500/20 transition-all active:scale-95">
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

function DetailedBalanceRow({ label, paid, remaining, color, onAction, actionLabel, sublabel, primaryValueLabel = "Remaining", secondaryValueLabel = "Paid Out" }) {
    const colors = {
        emerald: 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50',
        blue: 'bg-blue-50/50 text-blue-600 border-blue-100/50',
        purple: 'bg-purple-50/50 text-purple-600 border-purple-100/50',
        amber: 'bg-amber-50/50 text-amber-600 border-amber-100/50'
    };
    
    return (
        <div className={`p-6 rounded-[32px] border transition-all hover:shadow-lg hover:shadow-${color}-500/5 flex flex-col justify-between ${colors[color]} min-h-[160px]`}>
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
                    {sublabel && <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">{sublabel}</span>}
                </div>
                
                <div className="flex flex-col gap-1">
                    <span className="text-3xl font-black tracking-tight leading-none">${remaining?.toLocaleString() || '0'}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50 px-1">{primaryValueLabel}</span>
                </div>

                {label !== 'Loan' && (
                    <div className="pt-2 border-t border-current/10 flex justify-between items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{secondaryValueLabel}</span>
                        <span className="text-sm font-black">${paid?.toLocaleString() || '0'}</span>
                    </div>
                )}
            </div>

            {onAction && (
                <button
                    onClick={onAction}
                    className="mt-4 w-full py-3 bg-white text-[9px] font-black uppercase tracking-widest rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-gray-900 border border-gray-100"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
