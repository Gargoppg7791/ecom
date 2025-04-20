import {BrowserRouter as Router,Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Navigation from './customer/Components/Navbar/Navigation';
import CustomerRoutes from './Routers/CustomerRoutes';
import AdminRoutes from './Routers/AdminRoutes';
import NotFound from './Pages/Notfound';
import AdminPannel from './Admin/AdminPannel';
import Routers from './Routers/Routers';

function App() {
  return (
    <div className="">
      <Toaster position="top-center" />
      <Routes>
        <Route path="/admin/*" element={<AdminPannel />} />
        <Route path="/*" element={<CustomerRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
