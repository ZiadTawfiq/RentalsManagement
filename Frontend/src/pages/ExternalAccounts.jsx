import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IoWalletOutline, IoAddOutline, IoTimeOutline, IoCheckmarkCircleOutline, 
    IoAlertCircleOutline, IoCloseOutline, IoBusinessOutline, IoImageOutline,
    IoTrendingUpOutline, IoTrendingDownOutline, IoFileTrayFullOutline
} from 'react-icons/io5';

export default function ExternalAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    
    // Form States
    const [newAccount, setNewAccount] = useState({ name: '', description: '' });
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [newTx, setNewTx] = useState({
        amount: '',
        currency: 'EGP',
        type: 'Debit',
        description: ''
    });
    const [proofImage, setProofImage] = useState(null);

    // Filtering States
    const [searchTerms, setSearchTerms] = useState('');
    const [filterCurrency, setFilterCurrency] = useState('All');
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const accRes = await api.get('ExternalAccount');
            if (accRes.data.isSuccess) setAccounts(accRes.data.data);
            
            const histRes = await api.get('ExternalAccount/History');
            if (histRes.data.isSuccess) setHistory(histRes.data.data);
        } catch (err) {
            console.error('Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccount = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('ExternalAccount', newAccount);
            if (res.data.isSuccess) {
                setIsAddAccountModalOpen(false);
                setNewAccount({ name: '', description: '' });
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('externalAccountId', selectedAccount.id);
        formData.append('amount', newTx.amount);
        formData.append('currency', newTx.currency);
        formData.append('type', newTx.type);
        formData.append('description', newTx.description);
        if (proofImage) formData.append('proofImage', proofImage);

        try {
            const res = await api.post('ExternalAccount/Transaction', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.isSuccess) {
                setIsAddTransactionModalOpen(false);
                setNewTx({ amount: '', currency: 'EGP', type: 'Debit', description: '' });
                setProofImage(null);
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading external accounts...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">External Accounts</h1>
                    <p className="text-gray-500 mt-2 font-medium italic">Track company debts, credits, and multi-currency balances</p>
                </div>
                <button 
                    onClick={() => setIsAddAccountModalOpen(true)}
                    className="px-8 py-4 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:shadow-2xl hover:shadow-gray-900/20 transition-all active:scale-95"
                >
                    <IoAddOutline size={20} /> New Account
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Accounts List */}
                <div className="xl:col-span-1 space-y-6">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                        <IoBusinessOutline size={14} /> Active External Parties
                    </h3>
                    <div className="space-y-4">
                        {accounts.map(acc => (
                            <motion.div 
                                key={acc.id}
                                layoutId={`account-${acc.id}`}
                                className={`p-6 bg-white rounded-[40px] border shadow-sm transition-all cursor-pointer ${selectedAccount?.id === acc.id ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}
                                onClick={() => setSelectedAccount(acc)}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                                        <IoBusinessOutline size={24} />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedAccount(acc); setIsAddTransactionModalOpen(true); }}
                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                                    >
                                        <IoAddOutline size={20} />
                                    </button>
                                </div>
                                <h4 className="text-xl font-black text-gray-900">{acc.name}</h4>
                                <p className="text-xs font-bold text-gray-400 mt-1">{acc.description || 'No description'}</p>
                                
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {acc.balances.length > 0 ? acc.balances.map(b => (
                                        <div key={b.currency} className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${b.totalBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {b.currency}: {b.totalBalance.toLocaleString()}
                                        </div>
                                    )) : (
                                        <span className="text-[10px] font-black text-gray-300 uppercase italic">No balance history</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* History Log */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ml-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <IoFileTrayFullOutline size={14} /> Transaction History {selectedAccount ? `for ${selectedAccount.name}` : '(All)'}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative group">
                                <IoAddOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors rotate-45" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Search history..." 
                                    className="pl-8 pr-4 py-2 bg-white border border-gray-100 rounded-xl outline-none text-[10px] font-bold w-40 focus:border-emerald-500 transition-all"
                                    value={searchTerms}
                                    onChange={e => setSearchTerms(e.target.value)}
                                />
                            </div>
                            <select 
                                className="px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none text-[10px] font-bold cursor-pointer"
                                value={filterCurrency}
                                onChange={e => setFilterCurrency(e.target.value)}
                            >
                                <option value="All">All Currencies</option>
                                <option value="EGP">EGP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="SAR">SAR</option>
                                <option value="GOLD">GOLD</option>
                            </select>
                            <select 
                                className="px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none text-[10px] font-bold cursor-pointer"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                <option value="Debit">Debit</option>
                                <option value="Credit">Credit</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
                        <div className="divide-y divide-gray-50">
                            {(() => {
                                let filtered = history.filter(h => !selectedAccount || h.externalAccountId === selectedAccount.id);
                                if (searchTerms) {
                                    filtered = filtered.filter(t => 
                                        t.description?.toLowerCase().includes(searchTerms.toLowerCase()) || 
                                        t.externalAccountName?.toLowerCase().includes(searchTerms.toLowerCase())
                                    );
                                }
                                if (filterCurrency !== 'All') {
                                    filtered = filtered.filter(t => t.currency === filterCurrency);
                                }
                                if (filterType !== 'All') {
                                    filtered = filtered.filter(t => t.type === filterType);
                                }
                                
                                return filtered.length > 0 ? filtered.map(t => (
                                <div key={t.id} className="p-8 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${t.type === 'Credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {t.type === 'Credit' ? <IoTrendingUpOutline size={24} /> : <IoTrendingDownOutline size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                {!selectedAccount && <span className="text-xs font-black text-gray-900 px-3 py-1 bg-gray-50 rounded-lg">{t.externalAccountName}</span>}
                                                <span className="text-lg font-black text-gray-900">{t.description || `${t.type} Transaction`}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <span>{new Date(t.date).toLocaleDateString()}</span>
                                                <span className="opacity-40">•</span>
                                                <span>By {t.performedByUserName}</span>
                                                {t.proofImagePath && (
                                                    <div className="flex items-center gap-2">
                                                        <a href={`${api.defaults.baseURL.replace(/\/api\/?$/, '')}${t.proofImagePath}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700">
                                                            <IoImageOutline size={14} /> View Original
                                                        </a>
                                                        <img 
                                                            src={`${api.defaults.baseURL.replace(/\/api\/?$/, '')}${t.proofImagePath}`} 
                                                            alt="Proof" 
                                                            className="w-10 h-10 object-cover rounded-lg border border-gray-100 hover:scale-150 transition-transform cursor-zoom-in"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black tabular-nums ${t.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.type === 'Credit' ? '+' : '-'}{t.amount.toLocaleString()} <span className="text-sm opacity-60">{t.currency}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center p-40 text-gray-300">
                                    <IoFileTrayFullOutline size={64} className="opacity-20 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">No transactions match your filters</p>
                                </div>
                            );
                        })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAddAccountModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-gray-900">New External Party</h2>
                                <button onClick={() => setIsAddAccountModalOpen(false)}><IoCloseOutline size={24} /></button>
                            </div>
                            <form onSubmit={handleAddAccount} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Name</label>
                                    <input required type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold min-h-[100px]" value={newAccount.description} onChange={e => setNewAccount({...newAccount, description: e.target.value})} />
                                </div>
                                <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl transition-all">Create Account</button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isAddTransactionModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">New Transaction</h2>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">{selectedAccount?.name}</p>
                                </div>
                                <button onClick={() => setIsAddTransactionModalOpen(false)}><IoCloseOutline size={24} /></button>
                            </div>
                            <form onSubmit={handleAddTransaction} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                                        <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})}>
                                            <option value="Debit">Debit (We Owe)</option>
                                            <option value="Credit">Credit (They Owe)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Currency</label>
                                        <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={newTx.currency} onChange={e => setNewTx({...newTx, currency: e.target.value})}>
                                            <option value="EGP">EGP</option>
                                            <option value="USD">USD</option>
                                            <option value="AED">AED</option>
                                            <option value="EUR">EUR</option>
                                            <option value="SAR">SAR (Rial)</option>
                                            <option value="GOLD">GOLD (ذهب)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount</label>
                                    <input required type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-2xl" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Proof Image</label>
                                    <div className="relative h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center hover:border-emerald-300 transition-colors">
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setProofImage(e.target.files[0])} />
                                        {proofImage ? (
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase"><IoCheckmarkCircleOutline /> {proofImage.name.substring(0, 15)}...</div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase"><IoImageOutline /> Click to upload</div>
                                        )}
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs mt-4 hover:shadow-xl transition-all">Record Transaction</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
