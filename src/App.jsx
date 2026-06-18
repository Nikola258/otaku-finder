import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Auth from './pages/Auth';
import Home from './pages/Home';
import { Profile, PublicProfile } from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      } />

      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />

      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      <Route path="/profile/:id" element={
        <PrivateRoute>
          <PublicProfile />
        </PrivateRoute>
      } />
    </Routes>
  );
}
