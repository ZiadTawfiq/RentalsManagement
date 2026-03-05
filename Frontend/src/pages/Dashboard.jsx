import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    IoHomeOutline, IoKeyOutline, IoStatsChartOutline,
    IoTrendingUpOutline, IoWalletOutline, IoCalendarOutline,
    IoCheckmarkCircleOutline, IoCloseCircleOutline, IoExitOutline
} from "react-icons/io5";
import api from '../api/axios';
import { getAuthData } from '../utils/auth';

const StatCard = ({ title, value, icon, color, trend, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group transition-colors duration-300"
    >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.05] transition-transform duration-700 pointer-events-none">
            {icon}
        </div>
        <div className="flex items-center gap-4 relative z-10">
            <div
                className="p-3.5 rounded-2xl transition-colors duration-300 shadow-sm"
                style={{ backgroundColor: `${color}10`, color: color }}
            >
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h3>
                    {trend && (
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
);

export default function Dashboard() {
    const { isSalesRep, userId, isAdmin, isAccountant } = getAuthData();
    const [stats, setStats] = useState({
        properties: 0,
        units: 0,
        owners: 0,
        rentals: 0,
        employees: 0,
        totalCommission: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        earlyCheckout: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [props, units, owners, rentals, employees] = await Promise.all([
                api.get('Property'),
                api.get('Unit'),
                api.get('Owner'),
                api.get('Rental'),
                api.get('Employee')
            ]);

            let rentalData = rentals.data.data || [];

            // If SalesRep, filter rentals by their assignment
            if (isSalesRep && !isAdmin && !isAccountant) {
                rentalData = rentalData.filter(r =>
                    r.sales?.some(rs => rs.salesRepresentativeId === userId)
                );
            }

            // Calculate detailed stats
            const calculations = rentalData.reduce((acc, r) => {
                acc.totalCommission += (r.totalCommision || r.TotalCommision || 0) + (r.campainMoney || r.CampainMoney || 0);

                const status = (r.status || '').toLowerCase();
                if (status === 'active') acc.active++;
                else if (status === 'completed') acc.completed++;
                else if (status === 'cancelled') acc.cancelled++;
                else if (status === 'earlycheckout') acc.earlyCheckout++;

                return acc;
            }, { totalCommission: 0, active: 0, completed: 0, cancelled: 0, earlyCheckout: 0 });

            setStats({
                properties: props.data.data ? props.data.data.length : 0,
                units: units.data.data ? units.data.data.length : 0,
                owners: owners.data.data ? owners.data.data.length : 0,
                rentals: rentalData.length,
                employees: employees.data.data ? employees.data.data.length : 0,
                ...calculations
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const showAdminStats = !isSalesRep || isAdmin || isAccountant;

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive Overview</h1>
                    <p className="text-gray-500 mt-1 font-medium">Real-time portfolio performance and revenue metrics.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <IoCalendarOutline size={20} />
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Current Period</p>
                        <p className="text-xs font-bold text-gray-900 leading-none">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </header>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {showAdminStats && (
                    <StatCard
                        title="Total Company commission"
                        value={`$${stats.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={<IoWalletOutline size={24} />}
                        color="#3B82F6"
                        delay={0.1}
                    />
                )}
                <StatCard
                    title="Completed Rentals"
                    value={stats.completed}
                    icon={<IoCheckmarkCircleOutline size={24} />}
                    color="#10B981"
                    delay={0.2}
                />
                <StatCard
                    title="Canceled Rentals"
                    value={stats.cancelled}
                    icon={<IoCloseCircleOutline size={24} />}
                    color="#EF4444"
                    delay={0.3}
                />
                <StatCard
                    title="Early Checkouts"
                    value={stats.earlyCheckout}
                    icon={<IoExitOutline size={24} />}
                    color="#F59E0B"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {showAdminStats && (
                    <StatCard
                        title="Active Units"
                        value={stats.units}
                        icon={<IoHomeOutline size={24} />}
                        color="#6366F1"
                        delay={0.5}
                    />
                )}
                <StatCard
                    title="Active Rentals"
                    value={stats.active}
                    icon={<IoStatsChartOutline size={24} />}
                    color="#8B5CF6"
                    delay={0.6}
                />
                {showAdminStats && (
                    <StatCard
                        title="Managed Assets"
                        value={stats.properties}
                        icon={<IoKeyOutline size={24} />}
                        color="#EC4899"
                        delay={0.7}
                    />
                )}
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Operations Hub */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="lg:col-span-3 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm"
                >
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Quick Operations</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a href={isSalesRep && !isAdmin ? "/my-rentals" : "/rentals"} className="flex items-center justify-between p-6 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group font-black text-xs uppercase tracking-wider shadow-sm">
                            <div className="flex items-center gap-4">
                                <IoCalendarOutline size={24} className="group-hover:rotate-12 transition-transform" />
                                <span>{isSalesRep && !isAdmin ? "My Area" : "Lease Management Hub"}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                        </a>
                        {showAdminStats && (
                            <a href="/units" className="flex items-center justify-between p-6 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group font-black text-xs uppercase tracking-wider shadow-sm">
                                <div className="flex items-center gap-4">
                                    <IoHomeOutline size={24} className="group-hover:scale-110 transition-transform" />
                                    <span>Unit Portfolio</span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                            </a>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
