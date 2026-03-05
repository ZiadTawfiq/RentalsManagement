import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoWalletOutline, IoCalendarOutline, IoSearchOutline, IoFilterOutline,
    IoRefreshOutline, IoBusinessOutline, IoKeyOutline, IoPersonOutline
} from 'react-icons/io5';
import { getAuthData } from '../utils/auth';

export default function SalesRepRentals() {
    const { userId } = getAuthData();
    const [rentals, setRentals] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Manual percentage for "Final Commission"
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
            const filterDto = {
                propertyId: filterProperty ? parseInt(filterProperty) : null,
                startDate: filterStartDate || null,
                endDate: filterEndDate || null
            };

            const [rentalsRes, unitsRes] = await Promise.all([
                api.post('Rental/Filter', filterDto),
                api.get('Unit')
            ]);

            if (unitsRes.data.isSuccess) setUnits(unitsRes.data.data);

            let data = rentalsRes.data.isSuccess ? (rentalsRes.data.data || []) : [];

            // Safety filter: ensure we only show rentals where this user is assigned
            if (userId) {
                data = data.filter(r =>
                    r.sales?.some(rs => rs.salesRepresentativeId === userId)
                );
            }

            setRentals(data);
        } catch (err) {
            console.error('Error fetching rep data:', err);
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Portfolio...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Rentals</h1>
                    <p className="text-gray-500 mt-2 font-medium">View your assigned rental contracts and portfolio activity.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                >
                    <IoRefreshOutline size={20} />
                </button>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <IoSearchOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search assets, properties, customers..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                </div>

                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-6 py-4 border rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${isFilterOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-100'}`}
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

            {/* Rentals Table */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lease Asset</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tenant</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Duration</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Daily Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRentals.length > 0 ? filteredRentals.map((r, i) => {
                                return (
                                    <motion.tr
                                        key={r.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <IoKeyOutline size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 leading-none mb-1">{r.unitCode}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{r.propertyName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${r.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                                r.status?.toLowerCase() === 'completed' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-gray-900">{r.customerFullName}</div>
                                            <div className="text-xs text-gray-400">{r.customerPhoneNumber}</div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-gray-600">
                                            {r.startDate} <span className="mx-2 text-gray-300">→</span> {r.endDate}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-sm font-black text-gray-900">${(r.dayPriceCustomer || 0).toLocaleString()}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Per Day</div>
                                        </td>
                                    </motion.tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="inline-flex p-6 bg-gray-50 text-gray-300 rounded-[32px] mb-4">
                                            <IoSearchOutline size={32} />
                                        </div>
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No rental contracts found.</p>
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
