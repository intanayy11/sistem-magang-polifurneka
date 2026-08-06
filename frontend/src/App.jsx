import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Auth/Login';

// Peserta Pages
import PesertaDashboard from './pages/Peserta/PesertaDashboard';
import PresensiPage from './pages/Peserta/PresensiPage';
import LogbookPage from './pages/Peserta/LogbookPage';
import IzinPage from './pages/Peserta/IzinPage';
import TugasPage from './pages/Peserta/TugasPage';

// Pembimbing Pages
import PembimbingDashboard from './pages/Pembimbing/PembimbingDashboard';
import ReviewLogbookPage from './pages/Pembimbing/ReviewLogbookPage';
import VerifikasiIzinPage from './pages/Pembimbing/VerifikasiIzinPage';
import KelolaTugasPage from './pages/Pembimbing/KelolaTugasPage';
import MonitorPresensiPage from './pages/Pembimbing/MonitorPresensiPage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import KelolaUserPage from './pages/Admin/KelolaUserPage';
import PlottingPage from './pages/Admin/PlottingPage';

// Shared Pages
import Profile from './pages/Profile';
import LaporanPage from './pages/LaporanPage';

const RootRedirect = () => {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'peserta') return <Navigate to="/peserta/dashboard" replace />;
  if (user.role === 'pembimbing') return <Navigate to="/pembimbing/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Role: Peserta Routes */}
          <Route element={<ProtectedRoute allowedRoles={['peserta']} />}>
            <Route element={<Layout />}>
              <Route path="/peserta/dashboard" element={<PesertaDashboard />} />
              <Route path="/peserta/presensi" element={<PresensiPage />} />
              <Route path="/peserta/logbook" element={<LogbookPage />} />
              <Route path="/peserta/izin" element={<IzinPage />} />
              <Route path="/peserta/tugas" element={<TugasPage />} />
              <Route path="/peserta/laporan" element={<LaporanPage />} />
            </Route>
          </Route>

          {/* Role: Pembimbing Routes */}
          <Route element={<ProtectedRoute allowedRoles={['pembimbing']} />}>
            <Route element={<Layout />}>
              <Route path="/pembimbing/dashboard" element={<PembimbingDashboard />} />
              <Route path="/pembimbing/review-logbook" element={<ReviewLogbookPage />} />
              <Route path="/pembimbing/verifikasi-izin" element={<VerifikasiIzinPage />} />
              <Route path="/pembimbing/kelola-tugas" element={<KelolaTugasPage />} />
              <Route path="/pembimbing/monitor-presensi" element={<MonitorPresensiPage />} />
              <Route path="/pembimbing/laporan" element={<LaporanPage />} />
            </Route>
          </Route>

          {/* Role: Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/kelola-user" element={<KelolaUserPage />} />
              <Route path="/admin/plotting" element={<PlottingPage />} />
              <Route path="/admin/laporan" element={<LaporanPage />} />
            </Route>
          </Route>

          {/* Shared Profile Route (All Logged-in Roles) */}
          <Route element={<ProtectedRoute allowedRoles={['peserta', 'pembimbing', 'admin']} />}>
            <Route element={<Layout />}>
              <Route path="/profil" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
