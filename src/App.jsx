import { Routes, Route } from 'react-router';
import PrivateRoute from './components/PrivateRoute';
import Auth from './pages/Auth';
import Home from './pages/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={
        <PrivateRoute>
          <Home/>
        </PrivateRoute>
      }/>
      
      <Route path="/login" element={<Auth mode="login" />} /> 

      <Route path="/register" element={<Auth mode="register" />} /> 
    </Routes>
  );
}
