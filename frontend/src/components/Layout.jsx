import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Clock,
  BookOpen,
  FileCheck,
  CheckSquare,
  Users,
  UserCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  MapPin
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const badges = {
      peserta: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Peserta Magang' },
      pembimbing: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Pembimbing Lapangan' },
      admin: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'Admin Instansi' },
    };
    const b = badges[role];
    if (!b) return null;
    return (
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${b.bg} ${b.text} ${b.border}`}>
        {b.label}
      </span>
    );
  };

  const getNavLinks = () => {
    if (user?.role === 'peserta') {
      return [
        { to: '/peserta/dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
        { to: '/peserta/presensi',   label: 'Presensi Harian',   icon: Clock },
        { to: '/peserta/logbook',    label: 'Logbook Kegiatan',  icon: BookOpen },
        { to: '/peserta/izin',       label: 'Pengajuan Izin',    icon: FileCheck },
        { to: '/peserta/tugas',      label: 'Tugas Magang',      icon: CheckSquare },
      ];
    }
    if (user?.role === 'pembimbing') {
      return [
        { to: '/pembimbing/dashboard',         label: 'Dashboard',              icon: LayoutDashboard },
        { to: '/pembimbing/review-logbook',    label: 'Review Logbook',         icon: BookOpen },
        { to: '/pembimbing/verifikasi-izin',   label: 'Verifikasi Izin',        icon: FileCheck },
        { to: '/pembimbing/kelola-tugas',      label: 'Kelola & Review Tugas',  icon: CheckSquare },
        { to: '/pembimbing/monitor-presensi',  label: 'Monitor Presensi & GPS', icon: MapPin },
      ];
    }
    if (user?.role === 'admin') {
      return [
        { to: '/admin/dashboard',    label: 'Dashboard',           icon: LayoutDashboard },
        { to: '/admin/kelola-user',  label: 'Kelola User (Master)',icon: Users },
        { to: '/admin/plotting',     label: 'Plotting Bimbingan',  icon: UserCheck },
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-inter text-slate-800">

      {/* ── Top Navbar ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        {/* Top Gold Accent Line */}
        <div className="h-1 bg-gradient-to-r from-[#E8A800] via-[#F5C42E] to-[#E8A800]" />

        <div className="px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Left: Mobile Toggle + Unified Brand Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="flex items-center gap-3">
              {/* Brand Badge Logo */}
              <div className="h-10 w-10 rounded-xl bg-[#E8A800] flex items-center justify-center font-bold text-slate-950 text-xl shadow-xs shrink-0">
                P
              </div>
              <h1 className="font-bold text-slate-900 text-base md:text-lg tracking-tight">
                Sistem Magang Polifurneka Kendal
              </h1>
            </div>
          </div>

          {/* Right: Compact User Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center border border-amber-200 shrink-0">
                {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-semibold text-slate-900 leading-tight max-w-[140px] truncate">{user?.nama}</div>
                <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Popover */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in zoom-in duration-150">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-900 font-bold text-base flex items-center justify-center border border-amber-200 shrink-0">
                      {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-slate-900 truncate">{user?.nama}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="py-2 space-y-2 text-xs border-b border-slate-100 my-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Peran Akses:</span>
                      {getRoleBadge(user?.role)}
                    </div>
                    {user?.nim_nis && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>NIM / Identifier:</span>
                        <span className="font-mono text-[11px] font-semibold text-slate-800">{user.nim_nis}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all mt-1"
                  >
                    <LogOut size={15} />
                    <span>Keluar dari Sistem</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar Navigation ── */}
        <aside
          className={`fixed lg:static top-[68px] lg:top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-20 transform transition-transform duration-200 ease-in-out flex flex-col justify-between ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 mt-1">
            {/* Nav Menu Links - Directly shown without account card */}
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Menu Utama
              </p>
              {getNavLinks().map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#FEF9E7] text-slate-900 font-semibold border-l-4 border-[#E8A800] shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon size={18} className="shrink-0 text-slate-600" />
                    <span className="flex-1">{link.label}</span>
                    <ChevronRight size={14} className="opacity-40" />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50">
            <p className="text-xs text-slate-500 font-mono">Sistem Magang Polifurneka</p>
            <p className="text-[10px] text-slate-400 mt-0.5">poltek-furnitur.ac.id</p>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
