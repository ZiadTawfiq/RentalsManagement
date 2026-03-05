import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import {
    IoWallet, IoAdd, IoClose, IoRefresh, IoSwapHorizontal,
    IoTrendingUp, IoTrendingDown, IoBusiness, IoPerson, IoHome,
    IoKey, IoReceipt, IoShieldCheckmark, IoArrowDown, IoArrowUp,
    IoPencil, IoCheckmark, IoRepeat, IoAlertCircle, IoCardOutline,
    IoCash, IoEllipsisHorizontal, IoSearch, IoFilter
} from 'react-icons/io5';

// ─── Account Type enum mapping (matches C# AccountType enum) ─────────────────
// BankAccount = 0, Cash = 1, Custody = 2
const ACCOUNT_TYPES = [
    { value: 'BankAccount', label: 'Bank Account', emoji: '🏦' },
    { value: 'Cash', label: 'Cash', emoji: '💵' },
    { value: 'Custody', label: 'Custody', emoji: '🗂️' },
];

// ─── Normalise transaction type ───────────────────────────────────────────────
const TX_STRINGS = { 1: 'Deposit', 2: 'Withdraw', 3: 'SecurityDeposit', 4: 'SecurityRefund', 5: 'RentPayment' };
const normType = (raw) => typeof raw === 'number' ? (TX_STRINGS[raw] ?? String(raw)) : String(raw ?? '');
const CREDIT_TYPES = new Set(['Deposit', 'SecurityDeposit', 'RentPayment']);  // money IN = green
const DEBIT_TYPES = new Set(['Withdraw', 'SecurityRefund']);                 // money OUT = red

const TX_BADGE = {
    Deposit: { label: 'Deposit', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200', Icon: IoArrowDown },
    Withdraw: { label: 'Withdraw', cls: 'bg-red-100    text-red-700    border border-red-200', Icon: IoArrowUp },
    SecurityDeposit: { label: 'Security Deposit', cls: 'bg-purple-100 text-purple-700 border border-purple-200', Icon: IoShieldCheckmark },
    SecurityRefund: { label: 'Security Refund', cls: 'bg-teal-100   text-teal-700   border border-teal-200', Icon: IoShieldCheckmark },
    RentPayment: { label: 'Rent Payment', cls: 'bg-blue-100   text-blue-700   border border-blue-200', Icon: IoReceipt },
};
function txBadge(raw) {
    const key = normType(raw);
    return TX_BADGE[key] ?? { label: key, cls: 'bg-gray-100 text-gray-500 border border-gray-200', Icon: IoEllipsisHorizontal };
}

// ─── Account type icon ────────────────────────────────────────────────────────
const accIcon = (type) => {
    if (type === 'BankAccount') return <IoCardOutline size={20} />;
    if (type === 'Cash') return <IoCash size={20} />;
    return <IoWallet size={20} />;
};

function accLabel(type) {
    const found = ACCOUNT_TYPES.find(a => a.value === type);
    return found ? found.label : (type ?? 'Account');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, ok }) {
    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-bold
            ${ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {ok ? <IoCheckmark size={18} /> : <IoAlertCircle size={18} />}
            {msg}
        </div>
    );
}

// ─── Transaction Card ─────────────────────────────────────────────────────────
function TransactionCard({ tx }) {
    const type = normType(tx.transactionType);
    const { label, cls, Icon } = txBadge(type);
    const isCredit = CREDIT_TYPES.has(type);
    const isRental = !!tx.rentalId || type === 'RentPayment';
    const isSec = type === 'SecurityDeposit' || type === 'SecurityRefund';

    // If description says "withdraw", override to red/negative
    const descLower = (tx.description || '').toLowerCase();
    const isDescWithdraw = descLower.includes('withdraw');
    const showAsCredit = isDescWithdraw ? false : isCredit;

    const amtColor = showAsCredit ? 'text-emerald-600' : 'text-red-500';
    const amtSign = showAsCredit ? '+' : '−';
    const dotBg = showAsCredit ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500';

    return (
        <div className={`flex gap-4 p-4 rounded-2xl border transition-all hover:shadow-md
            ${isRental ? 'bg-blue-50/25 border-blue-100/60' : 'bg-white border-gray-100'}
            ${isSec ? 'border-l-[3px] border-l-purple-300' : ''}`}>

            <div className={`mt-0.5 p-2.5 rounded-xl flex-shrink-0 self-start ${dotBg}`}>
                <Icon size={14} />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${cls}`}>
                            <Icon size={9} /> {label}
                        </span>
                        {tx.depositHolder && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-purple-50 text-purple-600 border border-purple-200">
                                <IoKey size={9} /> Held by: {tx.depositHolder}
                            </span>
                        )}
                    </div>
                    <span className={`text-base font-black whitespace-nowrap tabular-nums ${amtColor}`}>
                        {amtSign} ${Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </div>

                {(tx.description || tx.notes) && (
                    <div className="space-y-1">
                        {tx.description && <p className="text-sm font-semibold text-gray-700">{tx.description}</p>}
                        {tx.notes && <p className="text-sm text-gray-500 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">"{tx.notes}"</p>}
                    </div>
                )}

                {isRental && (tx.propertyName || tx.clientName || (tx.sales && tx.sales.length > 0)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-3 border-l-2 border-blue-200 bg-blue-50/40 p-3 rounded-r-xl">
                        {tx.propertyName && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                <IoBusiness size={12} className="flex-shrink-0" />
                                <span className="truncate">{tx.propertyName}</span>
                                {tx.unitCode && <span className="text-blue-400 font-black">#{tx.unitCode}</span>}
                            </div>
                        )}
                        {tx.ownerName && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-700">
                                <IoHome size={12} className="flex-shrink-0 text-gray-400" />
                                <span className="text-gray-400 mr-0.5">Owner:</span>
                                <span className="font-bold">{tx.ownerName}</span>
                            </div>
                        )}
                        {tx.clientName && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-700">
                                <IoPerson size={12} className="flex-shrink-0 text-emerald-500" />
                                <span className="text-gray-400 mr-0.5">Tenant:</span>
                                <span className="font-bold">{tx.clientName}</span>
                                {tx.clientPhone && <span className="text-gray-400 text-[10px]">({tx.clientPhone})</span>}
                            </div>
                        )}
                        {(tx.sales || []).length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {tx.sales.map((s, i) => (
                                    <div key={i} className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                                        <IoPerson size={9} /> {s.salesRepName}
                                        <span className="text-indigo-300 font-black">({s.percentage}%)</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                        {new Date(tx.time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="mx-1 opacity-40">at</span>
                        {new Date(tx.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {tx.rentalId && (
                        <span className="text-[9px] font-black text-blue-300 bg-blue-50 px-1.5 py-0.5 rounded-md">
                            #RENTAL-{tx.rentalId}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Security Fund Panel ──────────────────────────────────────────────────────
function SecurityFundPanel({ transactions }) {
    const deps = transactions.filter(t => normType(t.transactionType) === 'SecurityDeposit');
    const refs = transactions.filter(t => normType(t.transactionType) === 'SecurityRefund');
    if (deps.length === 0 && refs.length === 0) return null;
    const totalDep = deps.reduce((s, t) => s + Number(t.amount || 0), 0);
    const totalRef = refs.reduce((s, t) => s + Number(t.amount || 0), 0);
    const byCompany = deps.filter(t => (t.depositHolder || '').toLowerCase() === 'company').reduce((s, t) => s + Number(t.amount || 0), 0);
    const byOwner = deps.filter(t => (t.depositHolder || '').toLowerCase() === 'owner').reduce((s, t) => s + Number(t.amount || 0), 0);

    return (
        <div className="p-4 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/60 to-indigo-50/40 mb-2">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><IoShieldCheckmark size={13} /></div>
                <h4 className="text-xs font-black text-purple-700 uppercase tracking-wider">Security Fund Overview</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Collected', val: totalDep, color: 'text-purple-700' },
                    { label: 'Total Refunded', val: totalRef, color: 'text-teal-600' },
                    { label: 'Held by Company', val: byCompany, color: 'text-blue-600' },
                    { label: 'Held by Owner', val: byOwner, color: 'text-orange-500' },
                ].map(({ label, val, color }) => (
                    <div key={label} className="bg-white/80 rounded-xl p-3 border border-gray-100">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                        <div className={`text-sm font-black tabular-nums ${color}`}>
                            ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Section Divider ──────────────────────────────────────────────────────────
function Divider({ label, color = 'gray' }) {
    const map = { blue: 'text-blue-400 bg-blue-50', purple: 'text-purple-500 bg-purple-50', gray: 'text-gray-400 bg-gray-50' };
    return (
        <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.18em] whitespace-nowrap ${map[color]}`}>{label}</span>
            <div className="h-px flex-1 bg-gray-100" />
        </div>
    );
}

// ─── Dialog wrapper ───────────────────────────────────────────────────────────
function Dialog({ onClose, width = 'max-w-sm', children }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} p-6 mx-4 max-h-[90vh] overflow-y-auto`}>
                {children}
            </div>
        </div>
    );
}

// ─── Transaction Filter Bar ───────────────────────────────────────────────────
function FilterBar({ search, setSearch, typeFilter, setTypeFilter, dateFrom, setDateFrom, dateTo, setDateTo }) {
    const types = ['All', 'Deposit', 'Withdraw', 'SecurityDeposit', 'SecurityRefund', 'RentPayment'];
    return (
        <div className="flex flex-col gap-3 p-4 border-b border-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <IoSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search description, notes, property..."
                        className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400"
                    />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <IoFilter size={13} className="text-gray-400 flex-shrink-0" />
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all
                                ${typeFilter === t
                                    ? t === 'All' ? 'bg-gray-700 text-white'
                                        : t === 'Deposit' ? 'bg-emerald-600 text-white'
                                            : t === 'Withdraw' ? 'bg-red-600 text-white'
                                                : t.startsWith('Security') ? 'bg-purple-600 text-white'
                                                    : 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {t === 'SecurityDeposit' ? 'Sec. Dep' : t === 'SecurityRefund' ? 'Sec. Ref' : t}
                        </button>
                    ))}
                </div>
            </div>
            {/* Date range row */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">From</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">To</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                    className="px-2.5 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-all">Clear Dates</button>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FinancialAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(false);
    const [selectedAcc, setSelectedAcc] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [toast, setToast] = useState(null);

    // Filter state
    const [txSearch, setTxSearch] = useState('');
    const [txTypeFilter, setTxTypeFilter] = useState('All');
    const todayStr = new Date().toISOString().split('T')[0];
    const [txDateFrom, setTxDateFrom] = useState(todayStr);
    const [txDateTo, setTxDateTo] = useState(todayStr);

    // Transfer
    const [transferDialog, setTransferDialog] = useState(false);
    const [tfSender, setTfSender] = useState('');
    const [tfReceiver, setTfReceiver] = useState('');
    const [tfAmount, setTfAmount] = useState('');
    const [tfComment, setTfComment] = useState('');
    const [tfLoading, setTfLoading] = useState(false);

    // Deposit
    const [depositDialog, setDepositDialog] = useState(null);
    const [depAmount, setDepAmount] = useState('');
    const [depComment, setDepComment] = useState('');
    const [depLoading, setDepLoading] = useState(false);

    // Withdraw
    const [withdrawDialog, setWithdrawDialog] = useState(null);
    const [wdAmount, setWdAmount] = useState('');
    const [wdComment, setWdComment] = useState('');
    const [wdLoading, setWdLoading] = useState(false);

    // Create
    const [createDialog, setCreateDialog] = useState(false);
    const [newAccName, setNewAccName] = useState('');
    const [newAccType, setNewAccType] = useState('BankAccount');
    const [createLoading, setCreateLoading] = useState(false);

    // Edit
    const [editDialog, setEditDialog] = useState(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState('BankAccount');
    const [editBalance, setEditBalance] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editConfirm, setEditConfirm] = useState(false);

    useEffect(() => { fetchAccounts(); }, []);

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await api.get('FinancialAccount');
            const raw = res.data;
            // API returns ApiResponse<List<>> or raw array
            const data = Array.isArray(raw) ? raw : (raw?.data ?? []);
            setAccounts(data);
        } catch (err) {
            console.error('fetchAccounts error:', err);
        } finally { setLoading(false); }
    };

    const fetchTransactions = async (acc) => {
        setSelectedAcc(acc);
        setTxLoading(true);
        setTransactions([]);
        setTxSearch('');
        setTxTypeFilter('All');
        setTxDateFrom('');
        setTxDateTo('');
        try {
            const res = await api.get(`FinancialAccount/${acc.id}/transactions`);
            const raw = res.data;
            setTransactions(Array.isArray(raw) ? raw : (raw?.data ?? []));
        } catch (err) {
            console.error('Transactions error:', err.response?.data ?? err.message);
            showToast('Could not load transactions: ' + (err.response?.data?.message ?? err.message), false);
        } finally { setTxLoading(false); }
    };

    // ── Filtered transactions ──────────────────────────────────────────────────
    const filteredTx = useMemo(() => {
        return transactions.filter(tx => {
            const type = normType(tx.transactionType);
            if (txTypeFilter !== 'All' && type !== txTypeFilter) return false;
            if (txSearch.trim()) {
                const q = txSearch.toLowerCase();
                const haystack = [
                    tx.description, tx.notes, tx.propertyName, tx.unitCode,
                    tx.ownerName, tx.clientName, tx.depositHolder, type
                ].filter(Boolean).join(' ').toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            // Date filter
            if (txDateFrom || txDateTo) {
                const txDate = tx.time ? tx.time.split('T')[0] : '';
                if (txDateFrom && txDate < txDateFrom) return false;
                if (txDateTo && txDate > txDateTo) return false;
            }
            return true;
        });
    }, [transactions, txSearch, txTypeFilter, txDateFrom, txDateTo]);

    const rentalTx = filteredTx.filter(t => t.rentalId || normType(t.transactionType) === 'RentPayment');
    const securityTx = filteredTx.filter(t => !t.rentalId && ['SecurityDeposit', 'SecurityRefund'].includes(normType(t.transactionType)));
    const generalTx = filteredTx.filter(t => !t.rentalId && !['SecurityDeposit', 'SecurityRefund', 'RentPayment'].includes(normType(t.transactionType)));

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleTransfer = async () => {
        setTfLoading(true);
        try {
            const params = new URLSearchParams({ senderId: tfSender, receiverId: tfReceiver, amount: tfAmount });
            if (tfComment.trim()) params.append('comment', tfComment.trim());
            const res = await api.post(`FinancialAccount/transfer?${params}`);
            if (res.data.isSuccess) {
                setTransferDialog(false); setTfSender(''); setTfReceiver(''); setTfAmount(''); setTfComment('');
                showToast('Transfer completed!');
                await fetchAccounts();
                if (selectedAcc) fetchTransactions(selectedAcc);
            } else showToast(res.data.message || 'Transfer failed', false);
        } catch (err) { showToast(err.response?.data?.message ?? err.message, false); }
        finally { setTfLoading(false); }
    };

    const handleDepositExternal = async () => {
        setDepLoading(true);
        try {
            const params = new URLSearchParams({ amount: depAmount });
            if (depComment.trim()) params.append('comment', depComment.trim());
            const res = await api.post(`FinancialAccount/${depositDialog.id}/deposit-external?${params}`);
            if (res.data.isSuccess) {
                const acc = depositDialog;
                setDepositDialog(null); setDepAmount(''); setDepComment('');
                showToast('Deposit successful!');
                await fetchAccounts();
                if (selectedAcc?.id === acc.id) fetchTransactions(acc);
            } else showToast(res.data.message || 'Deposit failed', false);
        } catch (err) { showToast(err.response?.data?.message ?? err.message, false); }
        finally { setDepLoading(false); }
    };

    const handleWithdrawExternal = async () => {
        setWdLoading(true);
        try {
            const params = new URLSearchParams({ amount: wdAmount });
            if (wdComment.trim()) params.append('comment', wdComment.trim());
            const res = await api.post(`FinancialAccount/${withdrawDialog.id}/withdraw-external?${params}`);
            if (res.data.isSuccess) {
                const acc = withdrawDialog;
                setWithdrawDialog(null); setWdAmount(''); setWdComment('');
                showToast('Withdrawal complete!');
                await fetchAccounts();
                if (selectedAcc?.id === acc.id) fetchTransactions(acc);
            } else showToast(res.data.message || 'Withdraw failed', false);
        } catch (err) { showToast(err.response?.data?.message ?? err.message, false); }
        finally { setWdLoading(false); }
    };

    const handleCreateAccount = async () => {
        setCreateLoading(true);
        try {
            const res = await api.post('FinancialAccount/create', { name: newAccName, accountType: newAccType });
            if (res.data?.isSuccess !== false) {
                setCreateDialog(false); setNewAccName(''); setNewAccType('BankAccount');
                showToast('Account created!');
                await fetchAccounts();
            } else showToast(res.data?.message || 'Creation failed', false);
        } catch (err) { showToast(err.response?.data?.message ?? err.message, false); }
        finally { setCreateLoading(false); }
    };

    const openEdit = (acc, e) => {
        e.stopPropagation();
        setEditDialog(acc);
        setEditName(acc.name);
        setEditType(acc.accountType);
        setEditBalance(String(acc.balance ?? ''));
        setEditConfirm(false);
    };

    const handleEditAccount = async () => {
        setEditLoading(true);
        try {
            const payload = { id: editDialog.id, name: editName, type: editType };
            if (editBalance !== '') payload.balance = Number(editBalance);
            const res = await api.put('FinancialAccount/update', payload);
            if (res.data?.isSuccess !== false) {
                setEditDialog(null); setEditConfirm(false);
                showToast('Account updated!');
                await fetchAccounts();
                if (selectedAcc?.id === editDialog.id) {
                    setSelectedAcc(prev => prev
                        ? { ...prev, name: editName, accountType: editType, balance: editBalance !== '' ? Number(editBalance) : prev.balance }
                        : null);
                }
            } else showToast(res.data?.message || 'Update failed', false);
        } catch (err) { showToast(err.response?.data?.message ?? err.message, false); }
        finally { setEditLoading(false); }
    };

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
            {toast && <Toast msg={toast.msg} ok={toast.ok} />}

            {/* ── Header ── */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Financial Accounts</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage accounts, transfers, and transactions.</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                    <button onClick={fetchAccounts} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all" title="Refresh">
                        <IoRefresh size={20} />
                    </button>
                    <button onClick={() => { setTransferDialog(true); setTfSender(''); setTfReceiver(''); setTfAmount(''); setTfComment(''); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        <IoSwapHorizontal size={18} /> Transfer
                    </button>
                    <button onClick={() => { setCreateDialog(true); setNewAccName(''); setNewAccType('BankAccount'); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        <IoAdd size={18} /> New Account
                    </button>
                </div>
            </div>

            {/* ── KPI card ── */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[28px] text-white shadow-xl shadow-blue-200 mb-6 inline-flex flex-col">
                <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Total Across All Accounts</div>
                <div className="text-4xl font-black tabular-nums">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="text-[11px] opacity-60 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</div>
            </div>

            {/* ── Accounts Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {accounts.map(acc => (
                    <div key={acc.id}
                        className={`card p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${selectedAcc?.id === acc.id ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => fetchTransactions(acc)}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">{accIcon(acc.accountType)}</div>
                                <div>
                                    <div className="text-sm font-black text-gray-900">{acc.name}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{accLabel(acc.accountType)}</div>
                                </div>
                            </div>
                            <button onClick={(e) => openEdit(acc, e)}
                                className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit account">
                                <IoPencil size={15} />
                            </button>
                        </div>

                        {/* Balance */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Balance</span>
                            <span className="text-xl font-black text-blue-700 tabular-nums">
                                ${Number(acc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={e => { e.stopPropagation(); setDepositDialog(acc); setDepAmount(''); setDepComment(''); }}
                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all">
                                <IoTrendingUp size={13} /> Deposit
                            </button>
                            <button onClick={e => { e.stopPropagation(); setWithdrawDialog(acc); setWdAmount(''); setWdComment(''); }}
                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-black hover:bg-red-100 transition-all">
                                <IoTrendingDown size={13} /> Withdraw
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Transaction Log ── */}
            {selectedAcc && (
                <div className="card overflow-hidden">
                    {/* Log header */}
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><IoReceipt size={18} /></div>
                            <div>
                                <h2 className="text-sm font-black text-gray-900">{selectedAcc.name} — Transaction Log</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {txLoading ? 'Loading...' : `${filteredTx.length} / ${transactions.length} transactions`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Current Balance</div>
                                <div className="text-lg font-black text-blue-600 tabular-nums">
                                    ${Number(selectedAcc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <button onClick={() => setSelectedAcc(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><IoClose size={18} /></button>
                        </div>
                    </div>

                    {/* Filters */}
                    {!txLoading && transactions.length > 0 && (
                        <FilterBar
                            search={txSearch} setSearch={setTxSearch}
                            typeFilter={txTypeFilter} setTypeFilter={setTxTypeFilter}
                            dateFrom={txDateFrom} setDateFrom={setTxDateFrom}
                            dateTo={txDateTo} setDateTo={setTxDateTo}
                        />
                    )}

                    {/* List */}
                    <div className="p-4 max-h-[680px] overflow-y-auto custom-scrollbar">
                        {txLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                <IoReceipt size={48} className="text-gray-200 mb-4" />
                                <p className="text-gray-400 font-bold text-sm text-center leading-relaxed">
                                    No transactions yet.<br />
                                    <span className="text-[10px] font-medium opacity-60">All deposits, withdrawals, and payments will appear here.</span>
                                </p>
                            </div>
                        ) : filteredTx.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <IoSearch size={36} className="mb-3 text-gray-200" />
                                <p className="font-bold text-sm">No transactions match your filter.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {rentalTx.length > 0 && (
                                    <div className="space-y-2">
                                        <Divider label={`Rental Related (${rentalTx.length})`} color="blue" />
                                        {rentalTx.map((tx, i) => <TransactionCard key={tx.id || `r-${i}`} tx={tx} />)}
                                    </div>
                                )}

                                {securityTx.length > 0 && (
                                    <div className="space-y-2">
                                        <Divider label={`Security Fund (${securityTx.length})`} color="purple" />
                                        {securityTx.map((tx, i) => <TransactionCard key={tx.id || `s-${i}`} tx={tx} />)}
                                    </div>
                                )}

                                {generalTx.length > 0 && (
                                    <div className="space-y-2">
                                        <Divider label={`General Activity (${generalTx.length})`} color="gray" />
                                        {generalTx.map((tx, i) => <TransactionCard key={tx.id || `g-${i}`} tx={tx} />)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== Edit Account Dialog ===== */}
            {editDialog && (
                <Dialog onClose={() => { setEditDialog(null); setEditConfirm(false); }} width="max-w-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <IoPencil size={18} className="text-blue-500" /> Edit Account
                        </h3>
                        <button onClick={() => { setEditDialog(null); setEditConfirm(false); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                            <IoClose size={18} />
                        </button>
                    </div>

                    {!editConfirm ? (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Account Name</label>
                                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Account name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Account Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {ACCOUNT_TYPES.map(t => (
                                            <button key={t.value} onClick={() => setEditType(t.value)}
                                                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-[10px] font-black transition-all
                                                    ${editType === t.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}>
                                                <span className="text-base">{t.emoji}</span> {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        Balance <span className="text-gray-400 normal-case font-normal">(manual override)</span>
                                    </label>
                                    <input type="number" step="0.01" value={editBalance} onChange={e => setEditBalance(e.target.value)}
                                        onWheel={e => e.target.blur()}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold tabular-nums"
                                        placeholder="0.00" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => { setEditDialog(null); setEditConfirm(false); }}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button onClick={() => setEditConfirm(true)} disabled={!editName.trim()}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                                    Review Changes
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 space-y-2">
                                <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <IoAlertCircle size={14} /> Confirm changes:
                                </p>
                                {editName !== editDialog.name && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-[10px] font-black text-gray-400 w-14">NAME</span>
                                        <span className="line-through text-red-400">{editDialog.name}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-bold text-emerald-600">{editName}</span>
                                    </div>
                                )}
                                {editType !== editDialog.accountType && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-[10px] font-black text-gray-400 w-14">TYPE</span>
                                        <span className="line-through text-red-400">{accLabel(editDialog.accountType)}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-bold text-emerald-600">{accLabel(editType)}</span>
                                    </div>
                                )}
                                {editBalance !== '' && Number(editBalance) !== Number(editDialog.balance) && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-[10px] font-black text-gray-400 w-14">BAL</span>
                                        <span className="line-through text-red-400">${Number(editDialog.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-bold text-emerald-600">${Number(editBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                {editName === editDialog.name && editType === editDialog.accountType && (editBalance === '' || Number(editBalance) === Number(editDialog.balance)) && (
                                    <p className="text-gray-400 text-xs italic">No changes detected.</p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setEditConfirm(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Back</button>
                                <button onClick={handleEditAccount} disabled={editLoading}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                                    {editLoading ? 'Saving...' : <><IoCheckmark size={16} /> Confirm Save</>}
                                </button>
                            </div>
                        </>
                    )}
                </Dialog>
            )}

            {/* ===== Transfer Dialog ===== */}
            {transferDialog && (
                <Dialog onClose={() => setTransferDialog(false)} width="max-w-md">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <IoRepeat size={20} className="text-indigo-500" /> Transfer Between Accounts
                        </h3>
                        <button onClick={() => setTransferDialog(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><IoClose size={18} /></button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'From Account', val: tfSender, set: setTfSender, filter: () => accounts },
                            { label: 'To Account', val: tfReceiver, set: setTfReceiver, filter: () => accounts.filter(a => String(a.id) !== String(tfSender)) },
                        ].map(({ label, val, set, filter }) => (
                            <div key={label}>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">{label}</label>
                                <select value={val} onChange={e => set(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                    <option value="">Select account...</option>
                                    {filter().map(a => <option key={a.id} value={a.id}>{a.name} — ${Number(a.balance || 0).toLocaleString()}</option>)}
                                </select>
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Amount</label>
                            <input type="number" step="0.01" value={tfAmount} onChange={e => setTfAmount(e.target.value)} onWheel={e => e.target.blur()}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Comment <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                            <textarea value={tfComment} onChange={e => setTfComment(e.target.value)} rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Reason..." />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setTransferDialog(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleTransfer} disabled={tfLoading || !tfSender || !tfReceiver || !tfAmount}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                            {tfLoading ? 'Processing...' : 'Confirm Transfer'}
                        </button>
                    </div>
                </Dialog>
            )}

            {/* ===== Deposit Dialog ===== */}
            {depositDialog && (
                <Dialog onClose={() => setDepositDialog(null)}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <IoTrendingUp size={20} className="text-emerald-600" /> External Deposit
                        </h3>
                        <button onClick={() => setDepositDialog(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><IoClose size={18} /></button>
                    </div>
                    <p className="text-sm text-gray-500 mb-5">To: <span className="font-bold text-gray-800">{depositDialog.name}</span></p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Amount</label>
                            <input type="number" step="0.01" value={depAmount} onChange={e => setDepAmount(e.target.value)} onWheel={e => e.target.blur()}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-bold" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Comment <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                            <textarea value={depComment} onChange={e => setDepComment(e.target.value)} rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" placeholder="Source..." />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setDepositDialog(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleDepositExternal} disabled={depLoading || !depAmount}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                            {depLoading ? 'Processing...' : 'Confirm Deposit'}
                        </button>
                    </div>
                </Dialog>
            )}

            {/* ===== Withdraw Dialog ===== */}
            {withdrawDialog && (
                <Dialog onClose={() => setWithdrawDialog(null)}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <IoTrendingDown size={20} className="text-red-600" /> External Withdraw
                        </h3>
                        <button onClick={() => setWithdrawDialog(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><IoClose size={18} /></button>
                    </div>
                    <p className="text-sm text-gray-500 mb-5">From: <span className="font-bold text-gray-800">{withdrawDialog.name}</span></p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Amount</label>
                            <input type="number" step="0.01" value={wdAmount} onChange={e => setWdAmount(e.target.value)} onWheel={e => e.target.blur()}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 font-bold" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Comment <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                            <textarea value={wdComment} onChange={e => setWdComment(e.target.value)} rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" placeholder="Reason..." />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setWithdrawDialog(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleWithdrawExternal} disabled={wdLoading || !wdAmount}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                            {wdLoading ? 'Processing...' : 'Confirm Withdraw'}
                        </button>
                    </div>
                </Dialog>
            )}

            {/* ===== Create Account Dialog ===== */}
            {createDialog && (
                <Dialog onClose={() => setCreateDialog(false)}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <IoAdd size={20} className="text-blue-600" /> New Financial Account
                        </h3>
                        <button onClick={() => setCreateDialog(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><IoClose size={18} /></button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Account Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {ACCOUNT_TYPES.map(t => (
                                <button key={t.value} onClick={() => setNewAccType(t.value)}
                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-black transition-all
                                        ${newAccType === t.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-white'}`}>
                                    <span className="text-lg">{t.emoji}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Account Name</label>
                        <input type="text" value={newAccName} onChange={e => setNewAccName(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="e.g. Main Bank Account" />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setCreateDialog(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleCreateAccount} disabled={createLoading || !newAccName.trim()}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                            {createLoading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </Dialog>
            )}
        </div>
    );
}
