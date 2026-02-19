import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-blue-600">Rental Manager</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link to="/" className="flex items-center gap-3 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-700 transition-colors">
                        Dashboard
                    </Link>
                    <div className="pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</div>
                    <Link to="/properties" className="flex items-center gap-3 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-700 transition-colors">
                        Properties
                    </Link>
                    <Link to="/units" className="flex items-center gap-3 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-700 transition-colors">
                        Units
                    </Link>
                    <Link to="/owners" className="flex items-center gap-3 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-700 transition-colors">
                        Owners
                    </Link>
                    <Link to="/rentals" className="flex items-center gap-3 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-700 transition-colors">
                        Rentals
                    </Link>
                    <div className="pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</div>
                    <Link to="/employees" className="flex items-center gap-3 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-700 transition-colors">
                        Employees
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}
                        className="flex items-center justify-center w-full gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
