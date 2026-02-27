import { useEffect, useState } from 'react';
import api from '../api/axios';
import { IoAdd, IoTrash, IoMegaphone, IoStatsChart, IoRefresh, IoPerson, IoBusiness } from 'react-icons/io5';

const CHANNEL_COLORS = {
    facebook: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
    whatsapp: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
    instagram: { bg: 'bg-pink-50', text: 'text-pink-700', bar: 'bg-pink-500' },
    tiktok: { bg: 'bg-gray-900', text: 'text-white', bar: 'bg-gray-700' },
    default: { bg: 'bg-indigo-50', text: 'text-indigo-700', bar: 'bg-indigo-500' },
};
function getColors(type = '') {
    return CHANNEL_COLORS[type.toLowerCase()] || CHANNEL_COLORS.default;
}

const STATUS_BADGE = {
    Active: 'bg-green-50 text-green-700 border-green-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
    EarlyCheckout: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newType, setNewType] = useState('');
    const [adding, setAdding] = useState(false);
    const [formError, setFormError] = useState('');

    // Rentals for selected channel
    const [selectedCampaign, setSelectedCampaign] = useState(null); // { id, type }
    const [rentals, setRentals] = useState([]);
    const [rentalsLoading, setRentalsLoading] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('Campain/stats');
            if (res.data.isSuccess) setCampaigns(res.data.data || []);
        } catch (err) {
            setError('Error loading campaigns: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCampaign = async (campaign) => {
        if (selectedCampaign?.id === campaign.id) {
            // toggle off
            setSelectedCampaign(null);
            setRentals([]);
            return;
        }
        setSelectedCampaign(campaign);
        setRentalsLoading(true);
        try {
            const res = await api.get(`Campain/${campaign.id}/rentals`);
            if (res.data.isSuccess) setRentals(res.data.data || []);
        } catch (err) {
            setError('Error loading rentals: ' + err.message);
        } finally {
            setRentalsLoading(false);
        }
    };

    const handleAdd = async () => {
        const trimmed = newType.trim();
        if (!trimmed) { setFormError('Please enter a campaign name.'); return; }
        setFormError('');
        setAdding(true);
        try {
            const res = await api.post('Campain', { type: trimmed });
            if (res.data.isSuccess) {
                setNewType('');
                await fetchData();
            } else {
                setFormError(res.data.message || 'Failed to add campaign.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.title || err.message;
            setFormError(msg || 'Error adding campaign.');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Delete campaign "${type}"? Existing rental records won't be affected.`)) return;
        try {
            await api.delete(`Campain/${id}`);
            if (selectedCampaign?.id === id) { setSelectedCampaign(null); setRentals([]); }
            await fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert(msg || 'Error deleting campaign.');
        }
    };

    const totalRentals = campaigns.reduce((s, c) => s + (c.rentalCount || 0), 0);
    const maxRentals = Math.max(...campaigns.map(c => c.rentalCount || 0), 1);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Marketing Campaigns</h1>
                    <p className="text-gray-500 mt-1">Manage campaign channels and track rental performance per source.</p>
                </div>
                <button onClick={fetchData} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all active:scale-95" title="Refresh">
                    <IoRefresh size={20} />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                    {error}
                    <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-600">✕</button>
                </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card p-5 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><IoMegaphone size={24} /></div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Channels</div>
                        <div className="text-2xl font-black text-indigo-600">{campaigns.length}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Active campaign sources</div>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><IoStatsChart size={24} /></div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Campaign Rentals</div>
                        <div className="text-2xl font-black text-green-600">{totalRentals}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Across all channels</div>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><IoMegaphone size={24} /></div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Top Channel</div>
                        <div className="text-2xl font-black text-orange-600">
                            {campaigns.length > 0
                                ? campaigns.reduce((a, b) => (a.rentalCount || 0) >= (b.rentalCount || 0) ? a : b).type
                                : '—'}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">Most rentals generated</div>
                    </div>
                </div>
            </div>

            {/* Add campaign form */}
            <div className="card p-5 mb-6">
                <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <IoAdd size={18} className="text-indigo-500" />
                    Add New Channel
                </h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newType}
                        onChange={(e) => { setNewType(e.target.value); setFormError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="e.g. TikTok, Snapchat, Email..."
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                        <IoAdd size={16} />
                        {adding ? 'Adding...' : 'Add Channel'}
                    </button>
                </div>
                {formError && <p className="mt-2 text-sm text-red-600 font-medium">{formError}</p>}
            </div>

            {/* Channels table — click a row to load its rentals */}
            <div className="card overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <IoStatsChart size={18} className="text-gray-400" />
                    <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">Performance by Channel</h2>
                    <span className="ml-auto text-xs text-gray-400">Click a row to see its rentals ↓</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-400 font-medium">
                        No campaigns yet. Add your first channel above.
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="table-header w-16">#</th>
                                <th className="table-header">Channel</th>
                                <th className="table-header">Rentals Generated</th>
                                <th className="table-header">Performance</th>
                                <th className="table-header text-right">Share</th>
                                <th className="table-header w-16" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {campaigns
                                .sort((a, b) => (b.rentalCount || 0) - (a.rentalCount || 0))
                                .map((c, idx) => {
                                    const colors = getColors(c.type);
                                    const pct = totalRentals > 0 ? ((c.rentalCount / totalRentals) * 100).toFixed(1) : '0.0';
                                    const barW = ((c.rentalCount || 0) / maxRentals) * 100;
                                    const isSelected = selectedCampaign?.id === c.id;
                                    return (
                                        <tr
                                            key={c.id}
                                            className={`table-row cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}
                                            onClick={() => handleSelectCampaign(c)}
                                        >
                                            <td className="px-6 py-4 text-xs font-black text-gray-400">#{idx + 1}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${colors.bg} ${colors.text}`}>
                                                    {c.type}
                                                </span>
                                                {isSelected && <span className="ml-2 text-[10px] text-indigo-500 font-bold">▼ viewing rentals</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-gray-800">{c.rentalCount || 0}</span>
                                                <span className="text-xs text-gray-400 ml-1">rentals</span>
                                            </td>
                                            <td className="px-6 py-4 min-w-[160px]">
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className={`${colors.bar} rounded-full h-2 transition-all duration-500`} style={{ width: `${barW}%` }} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-black text-gray-500">{pct}%</td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleDelete(c.id, c.type)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete channel"
                                                >
                                                    <IoTrash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                        {campaigns.length > 0 && (
                            <tfoot>
                                <tr className="bg-gray-50 border-t-2 border-gray-200">
                                    <td colSpan="2" className="px-6 py-3 text-xs font-black text-gray-600 uppercase tracking-wider">TOTAL</td>
                                    <td className="px-6 py-3 text-sm font-black text-gray-700">{totalRentals} rentals</td>
                                    <td colSpan="2" className="px-6 py-3 text-right text-xs font-black text-gray-500">100%</td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                )}
            </div>

            {/* Rentals for selected channel */}
            {selectedCampaign && (
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                        <IoBusiness size={18} className="text-indigo-500" />
                        <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">
                            Rentals via
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-black ${getColors(selectedCampaign.type).bg} ${getColors(selectedCampaign.type).text}`}>
                                {selectedCampaign.type}
                            </span>
                        </h2>
                    </div>

                    {rentalsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : rentals.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-400 font-medium">
                            No rentals from this channel yet.
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="table-header">#</th>
                                    <th className="table-header">Unit</th>
                                    <th className="table-header">Customer</th>
                                    <th className="table-header">Period</th>
                                    <th className="table-header">Status</th>
                                    <th className="table-header">Sales Agents</th>
                                    <th className="table-header text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rentals.map((r, idx) => {
                                    const badgeCls = STATUS_BADGE[r.status] || 'bg-gray-50 text-gray-600 border-gray-200';
                                    return (
                                        <tr key={r.id} className="table-row">
                                            <td className="px-6 py-4 text-xs font-black text-gray-400">#{idx + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-gray-900">{r.unitCode}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm font-black text-gray-800">
                                                    <IoPerson size={13} className="text-gray-400" />
                                                    {r.customerFullName}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">{r.customerPhoneNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-gray-500">
                                                {r.startDate} → {r.endDate}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${badgeCls}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {(r.sales || []).map((s, si) => (
                                                        <div key={si} className="flex items-center gap-1.5 text-xs">
                                                            <span className="font-black text-gray-700">{s.salesRepName}</span>
                                                            <span className="text-indigo-500 font-black">{s.commissionPercentage}%</span>
                                                        </div>
                                                    ))}
                                                    {!r.sales?.length && <span className="text-[10px] text-gray-300 italic">No agents</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-black text-blue-600">
                                                ${Number(r.campainMoney || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 border-t-2 border-gray-200">
                                    <td colSpan="5" className="px-6 py-3 text-xs font-black text-gray-600 uppercase tracking-wider">
                                        {rentals.length} rental{rentals.length !== 1 ? 's' : ''} via {selectedCampaign.type}
                                    </td>
                                    <td />
                                    <td className="px-6 py-3 text-right text-sm font-black text-blue-600">
                                        ${rentals.reduce((s, r) => s + (r.campainMoney || 0), 0).toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
