import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Search from './pages/Search';
import { Profile, PublicProfile } from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />

      <Route path="/" element={
        <PrivateRoute>
          <AppLayout><Home /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/profile" element={
        <PrivateRoute>
          <AppLayout><Profile /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/profile/:id" element={
        <PrivateRoute>
          <AppLayout><PublicProfile /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/search" element={
        <PrivateRoute>
          <AppLayout><Search /></AppLayout>
        </PrivateRoute>
      } />
    </Routes>
  );
}
