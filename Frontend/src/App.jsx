import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Rentals from './pages/Rentals';
import Properties from './pages/Properties';
import Units from './pages/Units';
import Employees from './pages/Employees';
import Commission from './pages/Commission';
import Campaigns from './pages/Campaigns';
import FinancialAccounts from './pages/FinancialAccounts';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SalesRepRentals from './pages/SalesRepRentals';
import MyCommission from './pages/MyCommission';
import EmployeeAccounts from './pages/EmployeeAccounts';
import EmployeeFinancialProfile from './pages/EmployeeFinancialProfile';
import Inventory from './pages/Inventory';
import ExternalAccounts from './pages/ExternalAccounts';

import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: true });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/my-rentals" element={<SalesRepRentals />} />
            <Route path="/my-performance" element={<MyCommission />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/units" element={<Units />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employee-accounts" element={<EmployeeAccounts />} />
            <Route path="/employee-profile/:id" element={<EmployeeFinancialProfile />} />
            <Route path="/employee-commission/:accountId" element={<MyCommission />} />
            <Route path="/commission" element={<Commission />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/accounts" element={<FinancialAccounts />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/external-accounts" element={<ExternalAccounts />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

