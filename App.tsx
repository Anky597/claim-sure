import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import NewClaimWizard from './pages/customer/NewClaimWizard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ClaimDetail from './pages/employee/ClaimDetail';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Customer Routes */}
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/new" element={<NewClaimWizard />} />
        
        {/* Employee Routes */}
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/claim/:id" element={<ClaimDetail />} />
      </Routes>
    </HashRouter>
  );
};

export default App;