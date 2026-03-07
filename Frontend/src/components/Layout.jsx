import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoGridOutline, IoBusinessOutline, IoKeyOutline, IoPersonOutline,
    IoReceiptOutline, IoPeopleOutline, IoStatsChartOutline, IoMegaphoneOutline,
    IoLogOutOutline, IoMenuOutline, IoChevronBackOutline, IoWalletOutline,
    IoCashOutline, IoCubeOutline
} from 'react-icons/io5';
import logo from '../assets/logo.png';
import { getAuthData } from '../utils/auth';

export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const { role, isAdmin, isAccountant, isSalesRep } = getAuthData();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <IoGridOutline />, category: null, roles: ['Admin', 'Accountant', 'SalesRep', 'DataEntry'] },
        { path: '/my-rentals', label: 'My Rentals', icon: <IoKeyOutline />, category: 'My Area', roles: ['SalesRep'] },
        { path: '/my-performance', label: 'My Performance', icon: <IoStatsChartOutline />, category: 'My Area', roles: ['SalesRep'] },
        { path: '/properties', label: 'Properties', icon: <IoBusinessOutline />, category: 'Management', roles: ['Admin', 'Accountant', 'DataEntry'] },
        { path: '/units', label: 'Units', icon: <IoKeyOutline />, category: 'Management', roles: ['Admin', 'Accountant', 'DataEntry'] },
        { path: '/owners', label: 'Owners', icon: <IoPersonOutline />, category: 'Management', roles: ['Admin', 'Accountant', 'DataEntry'] },
        { path: '/rentals', label: 'Rentals', icon: <IoReceiptOutline />, category: 'Management', roles: ['Admin', 'Accountant', 'DataEntry'] },
        { path: '/employees', label: 'Team', icon: <IoPeopleOutline />, category: 'Management', roles: ['Admin'] },
        { path: '/employee-accounts', label: 'Employee Accounts', icon: <IoWalletOutline />, category: 'Finance', roles: ['Admin', 'Accountant'] },
        { path: '/commission', label: 'Commission', icon: <IoStatsChartOutline />, category: 'Finance', roles: ['Admin', 'Accountant'] },
        { path: '/campaigns', label: 'Campaigns', icon: <IoMegaphoneOutline />, category: 'Admin', roles: ['Admin'] },
        { path: '/accounts', label: 'Financial Accounts', icon: <IoCashOutline />, category: 'Finance', roles: ['Admin', 'Accountant'] },
        { path: '/external-accounts', label: 'External Accounts', icon: <IoBusinessOutline />, category: 'Finance', roles: ['Admin', 'Accountant'] },
        { path: '/inventory', label: 'Inventory', icon: <IoCubeOutline />, category: 'Management', roles: ['Admin', 'Accountant', 'DataEntry'] },
    ];

    const visibleNavItems = navItems.filter(item => {
        if (!item.roles) return true;
        if (Array.isArray(role)) {
            return item.roles.some(r => role.includes(r));
        }
        return item.roles.includes(role);
    });

    const handleSignOut = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden transition-colors duration-300">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 280 }}
                className="bg-white shadow-xl flex flex-col z-20 relative border-r border-gray-100 transition-colors duration-300"
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center justify-between border-b">
                    <AnimatePresence mode="wait">
                        {!isCollapsed ? (
                            <motion.div
                                key="full"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-3 overflow-hidden"
                            >
                                <img src={logo} alt="TourMove" className="w-10 h-10 object-contain" />
                                <span className="text-xl font-black text-blue-600 whitespace-nowrap">TourMove</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="collapsed"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="mx-auto"
                            >
                                <img src={logo} alt="TourMove" className="w-10 h-10 object-contain" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {visibleNavItems.map((item, idx) => {
                        const isActive = location.pathname === item.path;
                        const showCategory = item.category && (idx === 0 || visibleNavItems[idx - 1].category !== item.category);

                        return (
                            <div key={item.path}>
                                {showCategory && !isCollapsed && (
                                    <div className="pt-4 pb-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {item.category}
                                    </div>
                                )}
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all relative group ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                                        }`}
                                >
                                    <span className={`text-xl ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'} transition-transform`}>
                                        {item.icon}
                                    </span>
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="font-bold text-sm whitespace-nowrap"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {isCollapsed && (
                                        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t space-y-2">
                    {/* Sign Out */}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-4 w-full p-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
                        title="Sign Out"
                    >
                        <span className="text-xl"><IoLogOutOutline /></span>
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>

                    {/* Collapse Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex flex-col items-center justify-center w-full p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    >
                        {isCollapsed ? <IoMenuOutline size={20} /> : <IoChevronBackOutline size={20} />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden transition-colors duration-300">
                {/* Header / Navbar */}
                <header className="h-20 border-b border-gray-100 bg-white shadow-sm flex items-center justify-between px-8 z-10 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
                        >
                            <IoMenuOutline size={24} />
                        </button>
                        <h2 className="text-lg font-black text-gray-800 truncate">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                        </h2>
                    </div>
                </header>

                <div className="flex-1 overflow-auto custom-scrollbar p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
