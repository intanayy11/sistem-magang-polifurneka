import React, { useState } from 'react';
import { useLocation, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStorageUrl } from '../utils/url';
import {
  LayoutDashboard,
  Clock,
  BookOpen,
  FileCheck,
  CheckSquare,
  Users,
  UserCheck,
  UserCog,
  UserPlus,
  GraduationCap,
  Link2,
  Database,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  User,
  FileText,
  History
} from 'lucide-react';

import logoImg from '../assets/logo-polifurneka.png';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dataMasterOpen, setDataMasterOpen] = useState(true);

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

  const getAvatar = (userObj, sizeClass = 'h-8 w-8 text-xs', roundClass = 'rounded-full') => {
    if (userObj?.foto_profil) {
      return (
        <img
          src={getStorageUrl(userObj.foto_profil)}
          alt={userObj?.nama}
          className={`${sizeClass} ${roundClass} object-cover border border-amber-200 shrink-0`}
        />
      );
    }
    return (
      <div className={`${sizeClass} ${roundClass} bg-amber-100 text-amber-900 font-bold flex items-center justify-center border border-amber-200 shrink-0`}>
        {userObj?.nama ? userObj.nama.charAt(0).toUpperCase() : 'U'}
      </div>
    );
  };

  const renderSidebarNav = (isMobile = false) => {
    const textClass = isMobile ? 'text-xs' : 'text-sm';
    const closeMobile = isMobile ? () => setSidebarOpen(false) : () => {};

    if (user?.role === 'admin') {
      const isDataMasterChildActive =
        (location.pathname === '/admin/kelola-user' &&
          (location.search.includes('role=peserta') || location.search.includes('role=pembimbing') || !location.search)) ||
        location.pathname === '/admin/tambah-user';

      return (
        <div className="space-y-1.5">
          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${textClass} font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-amber-50/80 text-amber-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard size={18} className={`shrink-0 ${isActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                <span className="flex-1 whitespace-nowrap">Dashboard</span>
              </>
            )}
          </NavLink>

          {/* Collapsible Data Master Group */}
          <div>
            <button
              type="button"
              onClick={() => setDataMasterOpen(!dataMasterOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl ${textClass} font-semibold transition-all duration-200 cursor-pointer ${
                isDataMasterChildActive
                  ? 'bg-amber-50/50 text-amber-950 font-bold'
                  : 'text-slate-700 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database size={18} className={`shrink-0 ${isDataMasterChildActive ? 'text-[#E8A800]' : 'text-slate-500'}`} />
                <span className="whitespace-nowrap">Data Master</span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${dataMasterOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dataMasterOpen && (
              <div className="pl-5 pt-1 space-y-1">
                {/* Sub-menu 1: Semua User */}
                <NavLink
                  to="/admin/kelola-user"
                  onClick={closeMobile}
                  end
                  className={() => {
                    const isAllUserActive = location.pathname === '/admin/kelola-user' && !location.search.includes('role=');
                    return `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isAllUserActive
                        ? 'bg-amber-50/90 text-amber-900 font-bold border border-amber-200/60'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`;
                  }}
                >
                  {() => {
                    const isAllUserActive = location.pathname === '/admin/kelola-user' && !location.search.includes('role=');
                    return (
                      <>
                        <Users size={16} className={`shrink-0 ${isAllUserActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                        <span className="flex-1 whitespace-nowrap">Semua User System</span>
                      </>
                    );
                  }}
                </NavLink>

                {/* Sub-menu 2: Data Peserta */}
                <NavLink
                  to="/admin/kelola-user?role=peserta"
                  onClick={closeMobile}
                  className={() => {
                    const isPesertaActive = location.pathname === '/admin/kelola-user' && location.search.includes('role=peserta');
                    return `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isPesertaActive
                        ? 'bg-amber-50/90 text-amber-900 font-bold border border-amber-200/60'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`;
                  }}
                >
                  {() => {
                    const isPesertaActive = location.pathname === '/admin/kelola-user' && location.search.includes('role=peserta');
                    return (
                      <>
                        <GraduationCap size={16} className={`shrink-0 ${isPesertaActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                        <span className="flex-1 whitespace-nowrap">Data Peserta</span>
                      </>
                    );
                  }}
                </NavLink>

                {/* Sub-menu 3: Data Pembimbing */}
                <NavLink
                  to="/admin/kelola-user?role=pembimbing"
                  onClick={closeMobile}
                  className={() => {
                    const isPembimbingActive = location.pathname === '/admin/kelola-user' && location.search.includes('role=pembimbing');
                    return `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isPembimbingActive
                        ? 'bg-amber-50/90 text-amber-900 font-bold border border-amber-200/60'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`;
                  }}
                >
                  {() => {
                    const isPembimbingActive = location.pathname === '/admin/kelola-user' && location.search.includes('role=pembimbing');
                    return (
                      <>
                        <UserCog size={16} className={`shrink-0 ${isPembimbingActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                        <span className="flex-1 whitespace-nowrap">Data Pembimbing</span>
                      </>
                    );
                  }}
                </NavLink>

                {/* Sub-menu 4: Tambah User */}
                <NavLink
                  to="/admin/tambah-user"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-50/90 text-amber-900 font-bold border border-amber-200/60'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <UserPlus size={16} className={`shrink-0 ${isActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                      <span className="flex-1 whitespace-nowrap">Tambah User</span>
                    </>
                  )}
                </NavLink>
              </div>
            )}
          </div>

          {/* Menu Utama: Plotting Bimbingan */}
          <NavLink
            to="/admin/plotting"
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${textClass} font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-amber-50/80 text-amber-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Link2 size={18} className={`shrink-0 ${isActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                <span className="flex-1 whitespace-nowrap">Plotting Bimbingan</span>
              </>
            )}
          </NavLink>

          {/* Menu Utama: Laporan Central */}
          <NavLink
            to="/admin/laporan"
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${textClass} font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-amber-50/80 text-amber-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <FileText size={18} className={`shrink-0 ${isActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                <span className="flex-1 whitespace-nowrap">Laporan Central</span>
              </>
            )}
          </NavLink>

          {/* Profil Saya */}
          <NavLink
            to="/profil"
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${textClass} font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-amber-50/80 text-amber-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User size={18} className={`shrink-0 ${isActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                <span className="flex-1 whitespace-nowrap">Profil Saya</span>
              </>
            )}
          </NavLink>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        {getNavLinks().map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${textClass} font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-50/80 text-amber-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={`shrink-0 ${isActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                  <span className="flex-1 whitespace-nowrap">{link.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    );
  };

  const getNavLinks = () => {
    let links = [];
    if (user?.role === 'peserta') {
      links = [
        { to: '/peserta/dashboard',        label: 'Dashboard',         icon: LayoutDashboard },
        { to: '/peserta/presensi',         label: 'Presensi Harian',   icon: Clock },
        { to: '/peserta/riwayat-presensi', label: 'Riwayat Presensi', icon: History },
        { to: '/peserta/logbook',          label: 'Logbook Kegiatan',  icon: BookOpen },
        { to: '/peserta/izin',             label: 'Pengajuan Izin',    icon: FileCheck },
        { to: '/peserta/tugas',            label: 'Tugas Magang',      icon: CheckSquare },
        { to: '/peserta/laporan',          label: 'Laporan Magang',    icon: FileText },
      ];
    } else if (user?.role === 'pembimbing') {
      links = [
        { to: '/pembimbing/dashboard',         label: 'Dashboard',              icon: LayoutDashboard },
        { to: '/pembimbing/review-logbook',    label: 'Review Logbook',         icon: BookOpen },
        { to: '/pembimbing/verifikasi-izin',   label: 'Verifikasi Izin',        icon: FileCheck },
        { to: '/pembimbing/kelola-tugas',      label: 'Kelola & Review Tugas',  icon: CheckSquare },
        { to: '/pembimbing/monitor-presensi',  label: 'Monitor Presensi & GPS', icon: MapPin },
        { to: '/pembimbing/laporan',           label: 'Laporan & Rekap',        icon: FileText },
      ];
    } else if (user?.role === 'admin') {
      links = [
        { to: '/admin/dashboard',    label: 'Dashboard',           icon: LayoutDashboard },
        { to: '/admin/kelola-user',  label: 'Kelola User (Master)',icon: Users },
        { to: '/admin/plotting',     label: 'Plotting Bimbingan',  icon: UserCheck },
        { to: '/admin/laporan',      label: 'Laporan Central',     icon: FileText },
      ];
    }

    // Add Profil Saya for all roles
    links.push({ to: '/profil', label: 'Profil Saya', icon: User });
    return links;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-inter text-slate-800">

      {/* ── Top Navbar ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        {/* Top Gold Accent Line */}
        <div className="h-1 bg-gradient-to-r from-[#E8A800] via-[#F5C42E] to-[#E8A800]" />

        <div className="px-3 sm:px-6 py-2.5 md:py-3 flex items-center justify-between">
          {/* Left: Mobile Toggle + Unified Brand Title */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
              {/* Brand Badge Logo */}
              <img src={logoImg} alt="Logo Polifurneka" className="h-8 sm:h-9 md:h-11 w-auto object-contain shrink-0 drop-shadow-2xs" />
              <div className="overflow-hidden">
                <h1 className="font-bold text-slate-900 text-xs sm:text-sm md:text-base leading-tight tracking-tight truncate sm:whitespace-normal">
                  Sistem Monitoring Kegiatan Magang
                </h1>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-amber-900 font-bold tracking-wide truncate sm:whitespace-normal">
                  Politeknik Industri Furnitur dan Pengolahan Kayu
                </p>
              </div>
            </div>
          </div>

          {/* Right: Compact User Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-left"
            >
              {getAvatar(user, 'h-8 w-8 text-xs', 'rounded-full')}
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
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
                    {getAvatar(user, 'h-10 w-10 text-base', 'rounded-full')}
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-slate-900 truncate">{user?.nama}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/profil');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 transition-all mb-2"
                  >
                    <User size={15} />
                    <span>Profil Saya</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all"
                  >
                    <LogOut size={15} />
                    <span>Keluar</span>
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

        {/* ── MOBILE SIDEBAR DRAWER (< lg) ── */}
        <aside
          className={`fixed top-0 bottom-0 left-0 w-64 bg-white text-slate-800 border-r border-slate-200/90 z-40 transform transition-transform duration-200 ease-in-out flex flex-col justify-between lg:hidden ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {/* Mobile Drawer Top Header with Close Button */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="Logo" className="h-7 w-auto" />
              <span className="font-bold text-xs text-slate-900">SIMONIKA</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

            <div className="p-4 flex-1 overflow-y-auto">
            <nav className="space-y-1.5">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                Menu Utama
              </p>
              {renderSidebarNav(true)}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100 text-center bg-slate-50/70">
            <p className="text-xs text-slate-600 font-mono font-medium">Sistem Monitoring Kegiatan Magang</p>
            <p className="text-[10px] text-slate-400 mt-0.5">poltek-furnitur.ac.id</p>
          </div>
        </aside>

        {/* ── DESKTOP SIDEBAR (>= lg) ── */}
        {!sidebarCollapsed && (
          <aside className="hidden lg:flex flex-col justify-between w-64 bg-white text-slate-800 border-r border-slate-200/90 relative shrink-0 transition-all duration-200">
            {/* Collapse Trigger Arrow Button on Sidebar Right Border */}
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md text-slate-600 hover:text-amber-800 hover:border-amber-400 hover:scale-110 transition-all flex items-center justify-center cursor-pointer z-30 group"
              title="Tutup / Lipat Sidebar"
            >
              <ChevronLeft size={15} className="text-slate-600 group-hover:text-amber-800 transition-colors" />
            </button>

            <div className="p-4 mt-1 flex-1">
              <nav className="space-y-1.5">
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                  Menu Utama
                </p>
                {renderSidebarNav(false)}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-100 text-center bg-slate-50/70">
              <p className="text-xs text-slate-600 font-mono font-medium whitespace-nowrap">Sistem Monitoring Kegiatan Magang</p>
              <p className="text-[10px] text-slate-400 mt-0.5">poltek-furnitur.ac.id</p>
            </div>
          </aside>
        )}

        {/* Floating Expand Trigger Arrow when Desktop Sidebar is Collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="hidden lg:flex fixed left-3 top-1/2 -translate-y-1/2 w-8 h-10 rounded-r-xl bg-white border border-slate-200 border-l-4 border-l-[#E8A800] shadow-lg text-slate-700 hover:text-amber-800 hover:w-9 transition-all items-center justify-center cursor-pointer z-30 group"
            title="Buka Sidebar"
          >
            <ChevronRight size={16} className="text-amber-700 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* ── Main Content Area ── */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
