import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DataManagement from './pages/DataManagement'
import WarehouseReports from './pages/WarehouseReports'
import SupplyChain from './pages/SupplyChain'
import Reports from './pages/Reports'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="/warehouse-reports" element={<WarehouseReports />} />
          <Route path="/supply-chain" element={<SupplyChain />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App


