import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './components/ToastConfig.css';
import Dashboard from './Dashboard';
// Admin Import Pages
import AdminHome from './pages/admin/Home';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Discounts from './pages/admin/Discounts';
import Orders from './pages/admin/Orders';
import Invoices from './pages/admin/Invoices';
import Students from './pages/admin/Students';
import Reports from './pages/admin/Reports';
import PriceHistory from './pages/admin/PriceHistory';
import Settings from './pages/admin/Settings';
import AuditLogs from './pages/admin/AuditLogs';
// Employee Import Pages
import EmployeeHome from './pages/employee/Home';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/discounts" element={<Discounts />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/invoices" element={<Invoices />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/price-history" element={<PriceHistory />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />

        {/* Employee Routes */}
        <Route path="/employee/home" element={<EmployeeHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
