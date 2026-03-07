import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoPeopleOutline, IoWalletOutline, IoSwapHorizontalOutline,
    IoAddOutline, IoRemoveOutline, IoSearchOutline, IoCloseOutline,
    IoTimeOutline, IoCheckmarkCircleOutline, IoTrendingUpOutline
} from 'react-icons/io5';
import { getAuthData } from '../utils/auth';

export default function EmployeeAccounts() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    // Form state
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Salary');
    const [movement, setMovement] = useState('Deposit');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await api.get('EmployeeFinancial/AllAccounts');
            if (res.data.isSuccess) setAccounts(res.data.data);
        } catch (err) {
            console.error('Error fetching employee accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async (accountId) => {
        setLoadingTransactions(true);
        try {
            const res = await api.get(`EmployeeFinancial/Transactions/${accountId}`);
            if (res.data.isSuccess) setTransactions(res.data.data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleOpenTransactions = (account) => {
        setSelectedAccount(account);
        setIsTransactionModalOpen(true);
        fetchTransactions(account.id);
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount)) return;

        try {
            const res = await api.post('EmployeeFinancial/Transaction', {
                employeeAccountId: selectedAccount.id,
                category,
                movement,
                amount: parseFloat(amount),
                description
            });

            if (res.data.isSuccess) {
                setAmount('');
                setDescription('');
                fetchTransactions(selectedAccount.id);
                fetchAccounts(); // Update balances in list
            }
        } catch (err) {
            console.error('Transaction failed:', err);
        }
    };

    const filteredAccounts = accounts.filter(a =>
        a.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Employee Portfolios...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Financial Accounts</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage employee salaries, commissions, and bonuses.</p>
                </div>
            </header>

            <div className="relative group max-w-md">
                <IoSearchOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search employees..."
                    className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAccounts.map((account, idx) => (
                    <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-emerald-500/5 transition-all group"
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-black">
                                        {account.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 leading-none mb-1">{account.userName}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financial ID: #{account.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/employee-profile/${account.id}`)}
                                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                >
                                    <IoSwapHorizontalOutline size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Transaction Modal */}
            <AnimatePresence>
                {isTransactionModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                        <IoWalletOutline size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">Wallet Management</h2>
                                        <p className="text-gray-400 text-sm font-medium">{selectedAccount?.userName}'s Financial Operations</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsTransactionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <IoCloseOutline size={28} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Form Side */}
                                <form onSubmit={handleTransaction} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Category</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Salary', 'Commission', 'Bonus', 'Loan'].map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setCategory(cat)}
                                                    className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${category === cat ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-gray-50 border-gray-50 text-gray-400 hover:border-emerald-100'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operation Type</label>
                                        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                                            <button
                                                type="button"
                                                onClick={() => setMovement('Deposit')}
                                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${movement === 'Deposit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                                            >
                                                <IoAddOutline size={18} /> Deposit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMovement('Withdraw')}
                                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${movement === 'Withdraw' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400'}`}
                                            >
                                                <IoRemoveOutline size={18} /> Withdraw
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount ($)</label>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                className="w-full p-5 bg-gray-50 border-none rounded-2xl outline-none font-black text-2xl placeholder:text-gray-200"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description / Reason</label>
                                            <textarea
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                className="w-full p-5 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 min-h-[100px]"
                                                placeholder="Internal notes..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:transform hover:translate-y-[-2px] hover:shadow-xl transition-all active:scale-95"
                                    >
                                        Execute Transaction
                                    </button>
                                </form>

                                {/* history Side */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Activity</h4>
                                    <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                        {loadingTransactions ? (
                                            <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
                                        ) : transactions.length > 0 ? transactions.map((t, i) => (
                                            <div key={t.id} className="p-5 bg-gray-50 rounded-3xl relative overflow-hidden group">
                                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${t.movement === 'Deposit' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase mr-2">{t.category}</span>
                                                        <span className="text-[10px] font-bold text-gray-400">{new Date(t.time).toLocaleString()}</span>
                                                    </div>
                                                    <span className={`text-sm font-black ${t.movement === 'Deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {t.movement === 'Deposit' ? '+' : '-'}${t.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-700 leading-relaxed">{t.description || 'No description provided.'}</p>
                                                <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 font-black uppercase">
                                                    <span className="flex items-center gap-1"><IoCheckmarkCircleOutline size={12} /> Approved</span>
                                                    <span>By: {t.performedByUserName}</span>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-20 text-center text-gray-300 font-black uppercase text-[10px] border-2 border-dashed border-gray-50 rounded-[32px]">No history yet</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
