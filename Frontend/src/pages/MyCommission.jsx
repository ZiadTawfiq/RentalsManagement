import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoWalletOutline, IoCalendarOutline, IoSearchOutline, IoFilterOutline,
    IoRefreshOutline, IoBusinessOutline, IoKeyOutline, IoPersonOutline,
    IoTrendingUpOutline, IoCalculatorOutline
} from 'react-icons/io5';
import { getAuthData } from '../utils/auth';

export default function MyCommission() {
    const { userId, isSalesRep } = getAuthData();
    const [rentals, setRentals] = useState([]);
    const [allRentals, setAllRentals] = useState([]);
    const [units, setUnits] = useState([]);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [manualPercentage, setManualPercentage] = useState(100);

    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProperty, setFilterProperty] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filterProperty, filterStartDate, filterEndDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const targetUserId = userId; // Just use userId directly since this is MyCommission

            const filterDto = {
                propertyId: filterProperty ? parseInt(filterProperty) : null,
                startDate: filterStartDate || null,
                endDate: filterEndDate || null,
                salesRepId: targetUserId
            };

            const allFilterDto = {
                salesRepId: targetUserId
            };

            const [rentalsRes, allRentalsRes, unitsRes, accountRes] = await Promise.all([
                api.post('Rental/Filter', filterDto),
                api.post('Rental/Filter', allFilterDto),
                api.get('Unit'),
                api.get('EmployeeFinancial/MyAccount')
            ]);

            if (unitsRes.data.isSuccess) setUnits(unitsRes.data.data);
            if (accountRes.data.isSuccess) setAccount(accountRes.data.data);

            let data = rentalsRes.data.isSuccess ? (rentalsRes.data.data || []) : [];
            let allData = allRentalsRes.data.isSuccess ? (allRentalsRes.data.data || []) : [];

            if (targetUserId) {
                data = data.filter(r => r.sales?.some(rs => rs.salesRepresentativeId === targetUserId) || r.createdByEmployeeId === targetUserId);
                allData = allData.filter(r => r.sales?.some(rs => rs.salesRepresentativeId === targetUserId) || r.createdByEmployeeId === targetUserId);
            }

            setRentals(data);
            setAllRentals(allData);
        } catch (err) {
            console.error('Error fetching commission data:', err);
        } finally {
            setLoading(false);
        }
    };

    const properties = [...new Set(units.map(u => u.propertyId))].map(pid => {
        const unit = units.find(u => u.propertyId === pid);
        return { id: pid, name: unit?.propertyName || `Property ${pid}` };
    });

    const filteredRentals = rentals.filter(r =>
        !searchTerm ||
        r.unitCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerFullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalBaseCommission = allRentals.reduce((sum, r) => {
        const mySale = r.sales?.find(rs => rs.salesRepresentativeId === userId);
        return sum + (mySale?.commissionAmount || 0);
    }, 0);

    const finalCommission = totalBaseCommission * (manualPercentage / 100);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Calculating Earnings...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Commissions</h1>
                    <p className="text-gray-500 mt-2 font-medium">Track your earnings and calculate final payouts.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
                >
                    <IoRefreshOutline size={20} />
                </button>
            </header>

            {/* Multi-Balance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-600 p-8 rounded-[32px] shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-80">Salary Balance</p>
                    <h3 className="text-3xl font-black mb-2">${account?.salary.toLocaleString() || '0'}</h3>
                    <p className="text-[10px] font-bold opacity-60">Available for withdrawal</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm"
                >
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Commission</p>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">${account?.commissionBalance.toLocaleString() || '0'}</h3>
                    <p className="text-[10px] font-bold text-gray-400">Current earnings</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm"
                >
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Bonus</p>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">${account?.bonusBalance.toLocaleString() || '0'}</h3>
                    <p className="text-[10px] font-bold text-gray-400">Rewards & Extras</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900 p-8 rounded-[32px] shadow-2xl text-white"
                >
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">Loan Balance</p>
                    <h3 className="text-3xl font-black text-white mb-2">${account?.loanBalance.toLocaleString() || '0'}</h3>
                    <p className="text-[10px] font-bold text-gray-500">Remaining to settle</p>
                </motion.div>
            </div>

            {/* Calculations & Adjustments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Personal Adjustment (ReadOnly for Sales)</p>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <IoCalculatorOutline size={24} />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="number"
                                    value={manualPercentage}
                                    readOnly={isSalesRep}
                                    onChange={(e) => setManualPercentage(Number(e.target.value))}
                                    className={`w-full text-2xl font-black text-gray-900 bg-transparent border-b-2 border-dashed ${isSalesRep ? 'border-transparent' : 'border-gray-200 focus:border-blue-500'} outline-none transition-colors`}
                                />
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Applied Multiplier %</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50/30 p-8 rounded-[32px] border border-emerald-100/50 flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <IoTrendingUpOutline size={120} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Total Commission Lifetime</p>
                        <h3 className="text-4xl font-black text-emerald-700">${totalBaseCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                        <p className="text-[10px] font-bold text-emerald-600/60 mt-2 uppercase">Sum of {allRentals.length} total rentals</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <IoSearchOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search rentals..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                </div>

                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-6 py-4 border rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${isFilterOpen ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-100'}`}
                >
                    <IoFilterOutline size={18} /> Filters
                </button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700"
                                    value={filterProperty}
                                    onChange={e => setFilterProperty(e.target.value)}
                                >
                                    <option value="">All Properties</option>
                                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Date</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700"
                                    value={filterStartDate}
                                    onChange={e => setFilterStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To Date</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700"
                                    value={filterEndDate}
                                    onChange={e => setFilterEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detailed Table */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rental Asset</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Share</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Base Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Adjusted Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRentals.length > 0 ? filteredRentals.map((r, i) => {
                                const mySale = r.sales?.find(rs => rs.salesRepresentativeId === userId);
                                const baseAmt = mySale?.commissionAmount || 0;
                                const adjAmt = baseAmt * (manualPercentage / 100);
                                return (
                                    <motion.tr
                                        key={r.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group hover:bg-emerald-50/30 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                                    <IoKeyOutline size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 leading-none mb-1">{r.unitCode}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.propertyName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[11px] font-black group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                {mySale?.percentage}%
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-sm font-bold text-gray-600">${baseAmt.toLocaleString()}</div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-sm font-black text-emerald-600">${adjAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        </td>
                                    </motion.tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No detailed commission data.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
