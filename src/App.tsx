import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import AdminHome from './pages/admin/Home';
import EmployeeHome from './pages/employee/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/employee/home" element={<EmployeeHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
