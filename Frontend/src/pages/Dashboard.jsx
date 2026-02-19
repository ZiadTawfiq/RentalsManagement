
import { useEffect, useState } from 'react';
import { IoHome, IoKey, IoPeople, IoStatsChart, IoPerson } from "react-icons/io5";
import api from '../api/axios';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-full bg-opacity-20`} style={{ backgroundColor: color }}>
                {icon}
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState({
        properties: 0,
        units: 0,
        owners: 0,
        rentals: 0,
        employees: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Using a hacky way to get counts since there might not be a dedicated stats endpoint
            // In a real app, a dedicated /dashboard endpoint is better
            const [props, units, owners, rentals, employees] = await Promise.all([
                api.get('Property'),
                api.get('Unit'),
                api.get('Owner'),
                api.get('Rental'),
                api.get('Employee')
            ]);

            setStats({
                properties: props.data.data ? props.data.data.length : 0,
                units: units.data.data ? units.data.data.length : 0,
                owners: owners.data.data ? owners.data.data.length : 0,
                rentals: rentals.data.data ? rentals.data.data.length : 0,
                employees: employees.data.data ? employees.data.data.length : 0
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total Properties"
                    value={stats.properties}
                    icon={<IoHome size={24} className="text-blue-600" />}
                    color="#2563EB"
                />
                <StatCard
                    title="Total Units"
                    value={stats.units}
                    icon={<IoKey size={24} className="text-green-600" />}
                    color="#16A34A"
                />
                <StatCard
                    title="Active Rentals"
                    value={stats.rentals}
                    icon={<IoStatsChart size={24} className="text-purple-600" />}
                    color="#9333EA"
                />
                <StatCard
                    title="Property Owners"
                    value={stats.owners}
                    icon={<IoPerson size={24} className="text-yellow-600" />}
                    color="#CA8A04"
                />
                <StatCard
                    title="Employees"
                    value={stats.employees}
                    icon={<IoPeople size={24} className="text-red-600" />}
                    color="#DC2626"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <IoStatsChart className="text-blue-600" />
                        System Statistics
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm font-bold text-gray-500">Occupancy Rate</span>
                            <span className="text-sm font-black text-blue-600">
                                {stats.units > 0 ? Math.round((stats.rentals / stats.units) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm font-bold text-gray-500">Avg Units per Owner</span>
                            <span className="text-sm font-black text-green-600">
                                {stats.owners > 0 ? (stats.units / stats.owners).toFixed(1) : 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <IoKey className="text-indigo-600" />
                        Operational Shortcuts
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="/rentals" className="flex flex-col items-center justify-center p-4 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-100 transition-all group">
                            <IoStatsChart size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Lease Hub</span>
                        </a>
                        <a href="/units" className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-all group">
                            <IoKey size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Unit Inventory</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
