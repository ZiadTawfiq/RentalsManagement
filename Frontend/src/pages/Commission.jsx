import { useEffect, useState } from 'react';
import api from '../api/axios';
import SearchableSelect from '../components/SearchableSelect';
import { IoWallet, IoFunnel, IoPerson, IoBusiness, IoHome, IoRefresh, IoTrendingUp, IoPeople, IoWalletOutline, IoSearch, IoFilter } from 'react-icons/io5';

export default function Commission() {
    const [allSalesRep, setAllSalesRep] = useState([]);
    const [campaignTotal, setCampaignTotal] = useState(null);
    const [filterResult, setFilterResult] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [properties, setProperties] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [error, setError] = useState('');

    // Filter state
    const [filterSalesId, setFilterSalesId] = useState('');
    const [filterPropertyId, setFilterPropertyId] = useState('');
    const [filterUnitId, setFilterUnitId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [salesRepRes, campaignRes, employeesRes, propertiesRes, unitsRes] = await Promise.all([
                api.get('Commission/AllSalesRep'),
                api.get('Commission/Campaign'),
                api.get('Employee'),
                api.get('Property'),
                api.get('Unit'),
            ]);

            if (salesRepRes.data.isSuccess) setAllSalesRep(salesRepRes.data.data || []);
            if (campaignRes.data.isSuccess) setCampaignTotal(campaignRes.data.data);
            if (employeesRes.data.isSuccess) setEmployees(employeesRes.data.data || []);
            if (propertiesRes.data.isSuccess) setProperties(propertiesRes.data.data || []);
            if (unitsRes.data.isSuccess) setUnits(unitsRes.data.data || []);
        } catch (err) {
            setError('Error loading commission data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async () => {
        setFilterLoading(true);
        setFilterResult(null);
        try {
            const payload = {};
            if (filterSalesId) payload.salesId = filterSalesId;
            if (filterPropertyId) payload.propertyId = parseInt(filterPropertyId);
            if (filterUnitId) payload.unitId = parseInt(filterUnitId);

            const res = await api.post('Commission/filter', payload);
            if (res.data.isSuccess) {
                setFilterResult(res.data.data);
            } else {
                setError(res.data.message || 'Filter failed');
            }
        } catch (err) {
            setError('Filter error: ' + (err.response?.data?.message || err.message));
        } finally {
            setFilterLoading(false);
        }
    };

    const clearFilter = () => {
        setFilterSalesId('');
        setFilterPropertyId('');
        setFilterUnitId('');
        setFilterResult(null);
    };

    const totalSalesCommission = allSalesRep.reduce((sum, r) => sum + (r.totalCommission || r.TotalCommission || 0), 0);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 font-medium">Loading commission data...</p>
            </div>
        </div>
    );

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Commission Center</h1>
                    <p className="text-gray-500 mt-1">Track sales commissions, campaign bonuses, and agent performance.</p>
                </div>
                <button onClick={fetchData} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all active:scale-95" title="Refresh">
                    <IoRefresh size={20} />
                </button>
            </div>

            {/* Combined Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Company Commission Combined */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] shadow-xl shadow-blue-200 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <IoWalletOutline size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-80">Total Company Commission</div>
                        <div className="text-3xl font-black mb-1">
                            ${(totalSalesCommission + (campaignTotal !== null ? Number(campaignTotal) : 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] font-bold opacity-70">Sales + Campaign Commission</div>
                    </div>
                </div>

                <div className="card p-6 flex items-center gap-4 border-gray-100 shadow-sm rounded-[24px]">
                    <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl">
                        <IoWallet size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sales Total</div>
                        <div className="text-2xl font-black text-gray-900">
                            ${totalSalesCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                <div className="card p-6 flex items-center gap-4 border-gray-100 shadow-sm rounded-[24px]">
                    <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                        <IoTrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Campaign Total</div>
                        <div className="text-2xl font-black text-gray-900">
                            ${(campaignTotal !== null ? Number(campaignTotal) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <IoFunnel className="text-blue-600" />
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Filter Commissions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <SearchableSelect
                            label="Sales Representative"
                            placeholder="All Representatives"
                            options={employees.map(e => ({ id: e.id, label: e.userName, sublabel: 'Representative' }))}
                            value={filterSalesId}
                            onChange={(val) => setFilterSalesId(val)}
                        />
                    </div>
                    <div>
                        <SearchableSelect
                            label="Property"
                            placeholder="All Properties"
                            options={properties.map(p => ({ id: p.id, label: p.name, sublabel: 'Property' }))}
                            value={filterPropertyId}
                            onChange={(val) => setFilterPropertyId(val)}
                        />
                    </div>
                    <div>
                        <SearchableSelect
                            label="Unit"
                            placeholder="All Units"
                            options={units.filter(u => !filterPropertyId || u.propertyId === parseInt(filterPropertyId)).map(u => ({
                                id: u.id,
                                label: u.code,
                                sublabel: u.propertyName
                            }))}
                            value={filterUnitId}
                            onChange={(val) => setFilterUnitId(val)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleFilter}
                            disabled={filterLoading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                            {filterLoading ? 'Searching...' : 'Search'}
                        </button>
                        <button
                            onClick={clearFilter}
                            className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-gray-200 transition-all"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    {error}
                </div>
            )}

            {/* Main Content Table (Default View) */}
            {!filterResult && (
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Sales Representative Performance</h2>
                        <div className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-3 py-1.5 rounded-full">
                            Total Agents: {allSalesRep.length}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings Total</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {allSalesRep.map((r, i) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm">
                                                    {r.salesRepName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">{r.salesRepName}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Active Agent</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-blue-600">
                                                ${(r.totalCommission || r.TotalCommission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (r.totalCommission / (totalSalesCommission || 1)) * 300)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-600">
                                                    {totalSalesCommission > 0 ? (((r.totalCommission || r.TotalCommission || 0) / totalSalesCommission) * 100).toFixed(1) : 0}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Filtered View Details */}
            {filterResult && (
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Commission Detailed View</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-white bg-blue-600 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                Total Found: {filterResult.detailedCommission?.length || 0}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-50/50 border-b border-blue-50 flex items-center gap-6">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sales Commission</p>
                            <p className="text-xl font-black text-blue-600">${(filterResult.totalSalesCommission || filterResult.TotalSalesCommission || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-px h-10 bg-blue-100"></div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Campaign Amount</p>
                            <p className="text-xl font-black text-indigo-600">${(filterResult.totalCampaignAmount || filterResult.TotalCampaignAmount || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-px h-10 bg-blue-100 ml-auto"></div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Grand Total</p>
                            <p className="text-2xl font-black text-gray-900">${((filterResult.totalSalesCommission || filterResult.TotalSalesCommission || 0) + (filterResult.totalCampaignAmount || filterResult.TotalCampaignAmount || 0)).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property / Unit</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Commission Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Settlement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(filterResult.detailedCommission || []).map((item, i) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <IoBusiness size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">{item.unitCode || item.UnitCode}</div>
                                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{item.propertyName || item.PropertyName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-black text-gray-600 uppercase bg-gray-100 px-2 py-1 rounded inline-block">
                                                {item.startDate || item.StartDate} → {item.endDate || item.EndDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 w-16">Sales:</span>
                                                    <span className="text-xs font-black text-blue-600">${(item.salesCommission || item.SalesCommission || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 w-16">Campaign:</span>
                                                    <span className="text-xs font-black text-indigo-600">${(item.campaignCommission || item.CampaignCommission || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-black text-gray-900">
                                                ${((item.salesCommission || item.SalesCommission || 0) + (item.campaignCommission || item.CampaignCommission || 0)).toLocaleString()}
                                            </div>
                                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Settled</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
