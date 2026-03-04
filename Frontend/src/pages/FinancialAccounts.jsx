import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
    IoWallet, IoAdd, IoClose, IoRefresh, IoSwapHorizontal,
    IoTrendingUp, IoTrendingDown, IoBusiness, IoPerson, IoHome,
    IoKey, IoReceipt, IoChevronDown, IoChevronUp
} from 'react-icons/io5';

// ─── Transaction type badge ──────────────────────────────────────────────────
const txBadge = (type) => {
    const map = {
        Deposit: { label: 'Deposit', cls: 'bg-green-100 text-green-700 border border-green-200' },
        Withdraw: { label: 'Withdraw', cls: 'bg-red-100 text-red-700 border border-red-200' },
        SecurityDeposit: { label: 'Security Deposit', cls: 'bg-purple-100 text-purple-700 border border-purple-200' },
        SecurityRefund: { label: 'Sec. Refund', cls: 'bg-teal-100 text-teal-700 border border-teal-200' },
        RentPayment: { label: 'Rent Payment', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
    };
    return map[type] || { label: type, cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
};

// ─── Single transaction card ─────────────────────────────────────────────────
function TransactionCard({ tx }) {
    const badge = txBadge(tx.transactionType);
    const isRental = !!tx.rentalId;
    const isCredit = ['Deposit', 'RentPayment', 'SecurityDeposit'].includes(tx.transactionType);

    return (
        <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm
            ${isRental ? 'bg-blue-50/20 border-blue-100/50' : 'bg-white border-gray-100'}`}>
            {/* Colored dot / icon */}
            <div className={`mt-0.5 p-2.5 rounded-xl flex-shrink-0 ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}>
                {isCredit ? <IoTrendingUp size={16} /> : <IoTrendingDown size={16} />}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Badge + description */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badge.cls}`}>
                            {badge.label}
                        </span>
                        {tx.description && (
                            <span className="text-[11px] text-gray-500 font-bold truncate max-w-[200px]">
                                {tx.description}
                            </span>
                        )}
                        {tx.depositHolder && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
                                <IoKey size={10} /> {tx.depositHolder}
                            </span>
                        )}
                    </div>
                    {/* Amount */}
                    <span className={`text-base font-black whitespace-nowrap ${isCredit ? 'text-green-700' : 'text-red-600'}`}>
                        {isCredit ? '+' : '−'} ${Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Rental context block */}
                {isRental && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-3 border-l-2 border-blue-300 bg-white/40 p-2 rounded-r-xl">
                        {tx.propertyName && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                                <IoBusiness size={11} className="flex-shrink-0" />
                                <span className="truncate">{tx.propertyName}</span>
                                {tx.unitCode && <span className="text-blue-400 font-black">#{tx.unitCode}</span>}
                            </div>
                        )}
                        {tx.ownerName && (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                                <IoHome size={11} className="flex-shrink-0" />
                                <span className="text-gray-400 mr-1">Owner:</span> {tx.ownerName}
                            </div>
                        )}
                        {tx.clientName && (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                                <IoPerson size={11} className="flex-shrink-0" />
                                <span className="text-gray-400 mr-1">Tenant:</span> {tx.clientName}
                            </div>
                        )}
                        {(tx.sales || []).map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded-lg w-fit">
                                <IoPerson size={10} className="flex-shrink-0" />
                                {s.salesRepName} <span className="text-indigo-300 font-black">({s.percentage}%)</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Comment / notes */}
                {tx.notes && (
                    <div className="mt-2 text-[11px] text-gray-500 bg-gray-50/50 p-2 rounded-lg border border-gray-100 italic">
                        "{tx.notes}"
                    </div>
                )}

                {/* Timestamp */}
                <div className="mt-2 flex items-center justify-between">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <IoRefresh size={10} className="text-gray-300" />
                        {new Date(tx.time).toLocaleDateString('en-GB')} at {new Date(tx.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {isRental && <div className="text-[9px] font-black text-blue-300 italic">#RENTAL-{tx.rentalId}</div>}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FinancialAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(false);
    const [selectedAcc, setSelectedAcc] = useState(null);
    const [transactions, setTransactions] = useState([]);

    // Transfer dialog
    const [transferDialog, setTransferDialog] = useState(false);
    const [tfSender, setTfSender] = useState('');
    const [tfReceiver, setTfReceiver] = useState('');
    const [tfAmount, setTfAmount] = useState('');
    const [tfComment, setTfComment] = useState('');
    const [tfLoading, setTfLoading] = useState(false);

    // Deposit External dialog
    const [depositDialog, setDepositDialog] = useState(null);
    const [depAmount, setDepAmount] = useState('');
    const [depComment, setDepComment] = useState('');
    const [depLoading, setDepLoading] = useState(false);

    // Withdraw External dialog
    const [withdrawDialog, setWithdrawDialog] = useState(null);
    const [wdAmount, setWdAmount] = useState('');
    const [wdComment, setWdComment] = useState('');
    const [wdLoading, setWdLoading] = useState(false);

    // Create Account dialog
    const [createDialog, setCreateDialog] = useState(false);
    const [newAccName, setNewAccName] = useState('');
    const [newAccType, setNewAccType] = useState('Bank');
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => { fetchAccounts(); }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await api.get('FinancialAccount');
            const raw = res.data;
            // Handle wrapped { isSuccess, data } or plain array
            const data = Array.isArray(raw) ? raw : (raw?.data || []);
            setAccounts(data);
        } catch (err) {
            console.error('Error fetching accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async (acc) => {
        setSelectedAcc(acc);
        setTxLoading(true);
        setTransactions([]);
        try {
            const res = await api.get(`FinancialAccount/${acc.id}/transactions`);
            const raw = res.data;
            const data = Array.isArray(raw) ? raw : (raw?.data || []);
            setTransactions(data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setTxLoading(false);
        }
    };

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleTransfer = async () => {
        setTfLoading(true);
        try {
            const params = new URLSearchParams({ senderId: tfSender, receiverId: tfReceiver, amount: tfAmount });
            if (tfComment.trim()) params.append('comment', tfComment.trim());
            const res = await api.post(`FinancialAccount/transfer?${params}`);
            if (res.data.isSuccess) {
                setTransferDialog(false);
                setTfSender(''); setTfReceiver(''); setTfAmount(''); setTfComment('');
                await fetchAccounts();
                if (selectedAcc) fetchTransactions(selectedAcc);
            } else { alert('Failed: ' + (res.data.message || 'Unknown error')); }
        } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
        finally { setTfLoading(false); }
    };

    const handleDepositExternal = async () => {
        setDepLoading(true);
        try {
            const params = new URLSearchParams({ amount: depAmount });
            if (depComment.trim()) params.append('comment', depComment.trim());
            const res = await api.post(`FinancialAccount/${depositDialog.id}/deposit-external?${params}`);
            if (res.data.isSuccess) {
                setDepositDialog(null); setDepAmount(''); setDepComment('');
                await fetchAccounts();
                if (selectedAcc?.id === depositDialog.id) fetchTransactions(depositDialog);
            } else { alert('Failed: ' + (res.data.message || 'Unknown error')); }
        } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
        finally { setDepLoading(false); }
    };

    const handleWithdrawExternal = async () => {
        setWdLoading(true);
        try {
            const params = new URLSearchParams({ amount: wdAmount });
            if (wdComment.trim()) params.append('comment', wdComment.trim());
            const res = await api.post(`FinancialAccount/${withdrawDialog.id}/withdraw-external?${params}`);
            if (res.data.isSuccess) {
                setWithdrawDialog(null); setWdAmount(''); setWdComment('');
                await fetchAccounts();
                if (selectedAcc?.id === withdrawDialog.id) fetchTransactions(withdrawDialog);
            } else { alert('Failed: ' + (res.data.message || 'Unknown error')); }
        } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
        finally { setWdLoading(false); }
    };

    const handleCreateAccount = async () => {
        setCreateLoading(true);
        try {
            const res = await api.post('FinancialAccount/create', { name: newAccName, accountType: newAccType, balance: 0 });
            if (res.data?.isSuccess !== false) {
                setCreateDialog(false); setNewAccName(''); setNewAccType('Bank');
                await fetchAccounts();
            } else { alert('Failed: ' + (res.data?.message || 'Unknown error')); }
        } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
        finally { setCreateLoading(false); }
    };

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalBalance = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Loading accounts...</p>
            </div>
        </div>
    );

    return (
        <div className="page-container">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Financial Accounts</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage accounts, transfers, and transaction history.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchAccounts} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all" title="Refresh">
                        <IoRefresh size={20} />
                    </button>
                    <button
                        onClick={() => { setTransferDialog(true); setTfSender(''); setTfReceiver(''); setTfAmount(''); setTfComment(''); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        <IoSwapHorizontal size={18} /> Transfer
                    </button>
                    <button onClick={() => setCreateDialog(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        <IoAdd size={18} /> New Account
                    </button>
                </div>
            </div>

            {/* ── Total KPI ──────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[28px] text-white shadow-xl shadow-blue-200 mb-6 inline-flex flex-col">
                <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Total Across All Accounts</div>
                <div className="text-4xl font-black">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="text-[11px] opacity-60 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</div>
            </div>

            {/* ── Accounts Grid ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {accounts.map(acc => (
                    <div key={acc.id}
                        className={`card p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5
                            ${selectedAcc?.id === acc.id ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => fetchTransactions(acc)}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <IoWallet size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-black text-gray-900">{acc.name}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{acc.accountType}</div>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-blue-600 mb-4">
                            ${Number(acc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={e => { e.stopPropagation(); setDepositDialog(acc); setDepAmount(''); setDepComment(''); }}
                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-black hover:bg-green-100 transition-all">
                                <IoTrendingUp size={13} /> Deposit
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); setWithdrawDialog(acc); setWdAmount(''); setWdComment(''); }}
                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-black hover:bg-red-100 transition-all">
                                <IoTrendingDown size={13} /> Withdraw
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Transaction Log Panel ──────────────────────────────────────── */}
            {selectedAcc && (
                <div className="card overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <IoReceipt size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-gray-900">{selectedAcc.name} — Transaction Log</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {txLoading ? 'Loading...' : `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-blue-600">
                                ${Number(selectedAcc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <button onClick={() => setSelectedAcc(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                <IoClose size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {txLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                <IoReceipt size={48} className="text-gray-200 mb-4" />
                                <p className="text-gray-400 font-bold text-sm tracking-tight text-center leading-relaxed">
                                    No transaction activity recorded yet for this account.<br />
                                    <span className="text-[10px] font-medium opacity-60">All deposits, withdrawals, and rental payments will appear here.</span>
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Rental Related Section */}
                                {transactions.some(t => t.rentalId) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="h-px flex-1 bg-blue-100/50"></div>
                                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap">Rental Related Transactions</h4>
                                            <div className="h-px flex-1 bg-blue-100/50"></div>
                                        </div>
                                        <div className="space-y-3">
                                            {transactions.filter(t => t.rentalId).map((tx, i) => (
                                                <TransactionCard key={tx.id || `r-${i}`} tx={tx} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* General Activity Section */}
                                {transactions.some(t => !t.rentalId) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="h-px flex-1 bg-gray-100"></div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">General Account Activity</h4>
                                            <div className="h-px flex-1 bg-gray-100"></div>
                                        </div>
                                        <div className="space-y-3">
                                            {transactions.filter(t => !t.rentalId).map((tx, i) => (
                                                <TransactionCard key={tx.id || `g-${i}`} tx={tx} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== Transfer Dialog ===== */}
            {transferDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <IoSwapHorizontal size={20} className="text-indigo-500" />
                                Transfer Between Accounts
                            </h3>
                            <button onClick={() => setTransferDialog(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                <IoClose size={18} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">From Account</label>
                                <select value={tfSender} onChange={e => setTfSender(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                    <option value="">Select sender...</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — ${Number(a.balance || 0).toLocaleString()}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">To Account</label>
                                <select value={tfReceiver} onChange={e => setTfReceiver(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                    <option value="">Select receiver...</option>
                                    {accounts.filter(a => String(a.id) !== String(tfSender))
                                        .map(a => <option key={a.id} value={a.id}>{a.name} — ${Number(a.balance || 0).toLocaleString()}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Amount</label>
                                <input type="number" step="0.01" value={tfAmount} onChange={e => setTfAmount(e.target.value)}
                                    onWheel={e => e.target.blur()}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold"
                                    placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Comment <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                                <textarea value={tfComment} onChange={e => setTfComment(e.target.value)} rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                    placeholder="Reason for transfer..." />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setTransferDialog(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={handleTransfer} disabled={tfLoading || !tfSender || !tfReceiver || !tfAmount}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                                {tfLoading ? 'Processing...' : 'Confirm Transfer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Deposit External Dialog ===== */}
            {depositDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <IoTrendingUp size={20} className="text-green-600" /> External Deposit
                            </h3>
                            <button onClick={() => setDepositDialog(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><IoClose size={18} /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-5">Depositing to: <span className="font-bold text-gray-800">{depositDialog.name}</span></p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Amount</label>
                                <input type="number" step="0.01" value={depAmount} onChange={e => setDepAmount(e.target.value)}
                                    onWheel={e => e.target.blur()}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-bold"
                                    placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Comment <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                                <textarea value={depComment} onChange={e => setDepComment(e.target.value)} rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                                    placeholder="Source of deposit..." />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setDepositDialog(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={handleDepositExternal} disabled={depLoading || !depAmount}
                                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                                {depLoading ? 'Processing...' : 'Confirm Deposit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Withdraw External Dialog ===== */}
            {withdrawDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <IoTrendingDown size={20} className="text-red-600" /> External Withdraw
                            </h3>
                            <button onClick={() => setWithdrawDialog(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><IoClose size={18} /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-5">Withdrawing from: <span className="font-bold text-gray-800">{withdrawDialog.name}</span></p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Amount</label>
                                <input type="number" step="0.01" value={wdAmount} onChange={e => setWdAmount(e.target.value)}
                                    onWheel={e => e.target.blur()}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 font-bold"
                                    placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Comment <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                                <textarea value={wdComment} onChange={e => setWdComment(e.target.value)} rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                                    placeholder="Reason for withdrawal..." />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setWithdrawDialog(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={handleWithdrawExternal} disabled={wdLoading || !wdAmount}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                                {wdLoading ? 'Processing...' : 'Confirm Withdraw'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Create Account Dialog ===== */}
            {createDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <IoAdd size={20} className="text-blue-600" /> New Financial Account
                            </h3>
                            <button onClick={() => setCreateDialog(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><IoClose size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Account Name</label>
                                <input type="text" value={newAccName} onChange={e => setNewAccName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="e.g. Main Bank Account" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Account Type</label>
                                <select value={newAccType} onChange={e => setNewAccType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    <option value="Bank">Bank</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setCreateDialog(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={handleCreateAccount} disabled={createLoading || !newAccName.trim()}
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                                {createLoading ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
