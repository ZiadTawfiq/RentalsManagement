import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Rentals from './pages/Rentals';
import Properties from './pages/Properties';
import Units from './pages/Units';
import Employees from './pages/Employees';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/units" element={<Units />} />
          <Route path="/employees" element={<Employees />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
