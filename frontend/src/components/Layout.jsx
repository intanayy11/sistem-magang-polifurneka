import React, { useState, useEffect } from 'react';
import { useLocation, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getStorageUrl } from '../utils/url';
import {
  LayoutDashboard,
  Clock,
  BookOpen,
  FileCheck,
  CheckSquare,
  Users,
  UserCheck,
  UserPlus,
  Link2,
  Database,
  LogOut,
  Menu,
  X,
  ChevronDown,
  MapPin,
  User,
  FileText,
  History,
  BarChart3,
  Bell
} from 'lucide-react';

import logoImg from '../assets/logo-polifurneka.png';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dataMasterOpen, setDataMasterOpen] = useState(true);
  const [laporanCentralOpen, setLaporanCentralOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`read_notifs_${user?.user_id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const fetchNotifications = async () => {
    if (!user || user.role === 'admin') {
      setNotifications([]);
      return;
    }
    try {
      const res = await api.get('/notifications');
      if (res.data.status === 'success') {
        const rawNotifs = res.data.data || [];
        const mapped = rawNotifs.map((n) => ({
          ...n,
          unread: !readNotifIds.includes(n.id)
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Gagal memuat notifikasi:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Auto-mark all as read when panel closes
  useEffect(() => {
    if (!notifOpen && notifications.some((n) => n.unread)) {
      const allIds = notifications.map((n) => n.id);
      setReadNotifIds(allIds);
      try {
        localStorage.setItem(`read_notifs_${user?.user_id}`, JSON.stringify(allIds));
      } catch (e) {}
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }
  }, [notifOpen]);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const handleNotifClick = (notif) => {
    if (!readNotifIds.includes(notif.id)) {
      const newRead = [...readNotifIds, notif.id];
      setReadNotifIds(newRead);
      try {
        localStorage.setItem(`read_notifs_${user?.user_id}`, JSON.stringify(newRead));
      } catch (e) {}
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    if (role === 'peserta') return 'Peserta Magang';
    if (role === 'pembimbing') return 'Pembimbing Lapangan';
    if (role === 'admin') return 'Administrator Sistem';
    return 'Pengguna';
  };

  const getAvatar = (userObj, sizeClass = 'h-9 w-9 text-xs', roundClass = 'rounded-full') => {
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
    const textClass = isMobile ? 'text-xs' : 'text-xs sm:text-sm';
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
                  ? 'bg-[#E8A800] text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard size={18} className={`shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="flex-1 truncate">Dashboard</span>
              </>
            )}
          </NavLink>

          {/* Collapsible Kelola User Group */}
          <div>
            <button
              type="button"
              onClick={() => setDataMasterOpen(!dataMasterOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl ${textClass} font-semibold transition-all duration-200 cursor-pointer ${
                isDataMasterChildActive
                  ? 'bg-slate-100/80 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Database size={18} className={`shrink-0 ${isDataMasterChildActive ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                <span className="truncate">Kelola User</span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 shrink-0 transition-transform duration-200 ${dataMasterOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dataMasterOpen && (
              <div className="ml-4 pl-3 pt-1.5 pb-1 space-y-1 border-l-2 border-slate-100">
                {/* Sub-menu 1: Semua User */}
                <NavLink
                  to="/admin/kelola-user"
                  onClick={closeMobile}
                  className={() => {
                    const isAllUserActive = location.pathname === '/admin/kelola-user';
                    return `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isAllUserActive
                        ? 'bg-[#E8A800] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`;
                  }}
                  title="Daftar Semua User"
                >
                  {() => {
                    const isAllUserActive = location.pathname === '/admin/kelola-user';
                    return (
                      <>
                        <Users size={16} className={`shrink-0 ${isAllUserActive ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="flex-1 truncate">Daftar Semua User</span>
                      </>
                    );
                  }}
                </NavLink>

                {/* Sub-menu 2: Tambah User */}
                <NavLink
                  to="/admin/tambah-user"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isActive
                        ? 'bg-[#E8A800] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                  title="Tambah User"
                >
                  {({ isActive }) => (
                    <>
                      <UserPlus size={16} className={`shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span className="flex-1 truncate">Tambah User</span>
                    </>
                  )}
                </NavLink>
              </div>
            )}
          </div>

          {/* Plotting Bimbingan */}
          <NavLink
            to="/admin/plotting"
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${textClass} font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[#E8A800] text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Link2 size={18} className={`shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="flex-1 truncate">Plotting Bimbingan</span>
              </>
            )}
          </NavLink>

          {/* Collapsible Rekapitulasi & Laporan Group */}
          <div>
            <button
              type="button"
              onClick={() => setLaporanCentralOpen(!laporanCentralOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl ${textClass} font-semibold transition-all duration-200 cursor-pointer ${
                location.pathname === '/admin/laporan'
                  ? 'bg-slate-100/80 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={18} className={`shrink-0 ${location.pathname === '/admin/laporan' ? 'text-[#E8A800]' : 'text-slate-400'}`} />
                <span className="truncate">Rekapitulasi & Laporan</span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 shrink-0 transition-transform duration-200 ${laporanCentralOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {laporanCentralOpen && (
              <div className="ml-4 pl-3 pt-1.5 pb-1 space-y-1 border-l-2 border-slate-100">
                <NavLink
                  to="/admin/laporan?kategori=aktivitas_magang"
                  onClick={closeMobile}
                  className={() => {
                    const isAktif = location.pathname === '/admin/laporan' &&
                      (location.search.includes('kategori=aktivitas_magang') || !location.search.includes('kategori='));
                    return `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isAktif
                        ? 'bg-[#E8A800] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`;
                  }}
                  title="Laporan Aktivitas Magang"
                >
                  {() => {
                    const isAktif = location.pathname === '/admin/laporan' &&
                      (location.search.includes('kategori=aktivitas_magang') || !location.search.includes('kategori='));
                    return (
                      <>
                        <BookOpen size={16} className={`shrink-0 ${isAktif ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="flex-1 truncate">Laporan Aktivitas Magang</span>
                      </>
                    );
                  }}
                </NavLink>

                <NavLink
                  to="/admin/laporan?kategori=data_peserta"
                  onClick={closeMobile}
                  className={() => {
                    const isAktif = location.pathname === '/admin/laporan' && location.search.includes('kategori=data_peserta');
                    return `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isAktif
                        ? 'bg-[#E8A800] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`;
                  }}
                  title="Laporan Data Peserta"
                >
                  {() => {
                    const isAktif = location.pathname === '/admin/laporan' && location.search.includes('kategori=data_peserta');
                    return (
                      <>
                        <Users size={16} className={`shrink-0 ${isAktif ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="flex-1 truncate">Laporan Data Peserta</span>
                      </>
                    );
                  }}
                </NavLink>

                <NavLink
                  to="/admin/laporan?kategori=data_pembimbing"
                  onClick={closeMobile}
                  className={() => {
                    const isAktif = location.pathname === '/admin/laporan' && location.search.includes('kategori=data_pembimbing');
                    return `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isAktif
                        ? 'bg-[#E8A800] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`;
                  }}
                  title="Laporan Data Pembimbing"
                >
                  {() => {
                    const isAktif = location.pathname === '/admin/laporan' && location.search.includes('kategori=data_pembimbing');
                    return (
                      <>
                        <UserCheck size={16} className={`shrink-0 ${isAktif ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="flex-1 truncate">Laporan Data Pembimbing</span>
                      </>
                    );
                  }}
                </NavLink>

                <NavLink
                  to="/admin/laporan?kategori=rekapitulasi_kehadiran"
                  onClick={closeMobile}
                  className={() => {
                    const isAktif = location.pathname === '/admin/laporan' && location.search.includes('kategori=rekapitulasi_kehadiran');
                    return `flex items-center gap-2.5 px-3 py-2 rounded-xl ${textClass} font-semibold transition-all ${
                      isAktif
                        ? 'bg-[#E8A800] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`;
                  }}
                  title="Rekapitulasi Kehadiran"
                >
                  {() => {
                    const isAktif = location.pathname === '/admin/laporan' && location.search.includes('kategori=rekapitulasi_kehadiran');
                    return (
                      <>
                        <BarChart3 size={16} className={`shrink-0 ${isAktif ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="flex-1 truncate">Rekapitulasi Kehadiran</span>
                      </>
                    );
                  }}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Role Peserta & Pembimbing Nav Links
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
                    ? 'bg-[#E8A800] text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={`shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="flex-1 truncate">{link.label}</span>
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
    }

    if (user?.role !== 'admin') {
      links.push({ to: '/profil', label: 'Profil Saya', icon: User });
    }
    return links;
  };

  return (
    <div className="h-screen flex bg-[#F8F9FB] font-inter text-slate-800 overflow-hidden relative">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── 1. SIDEBAR (FULL HEIGHT LEFT PANEL - STICKY/FIXED) ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 h-screen bg-white text-slate-800 border-r border-slate-200 z-50 transform transition-transform duration-200 ease-in-out flex flex-col justify-between shrink-0 lg:sticky lg:top-0 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Header in Sidebar */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Logo Polifurneka" className="h-10 w-auto object-contain shrink-0 drop-shadow-2xs" />
              <div>
                <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                  SIMONIKA
                </h1>
                <p className="text-[10px] font-medium text-slate-400 leading-tight">
                  Politeknik Industri Furnitur
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Middle: Navigation Links */}
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1.5">
            {renderSidebarNav(sidebarOpen)}
          </nav>
        </div>

        {/* Bottom Section: Dedicated Logout Link in Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all text-left cursor-pointer"
          >
            <LogOut size={18} className="text-rose-500 shrink-0" />
            <span className="flex-1 truncate">Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── 2. RIGHT CONTAINER (TOPBAR + MAIN CONTENT SCROLLABLE) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* ── TOPBAR (STICKY AT TOP) ── */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs h-16 flex items-center px-4 sm:px-6 md:px-8 shrink-0">
          <div className="flex items-center justify-between w-full gap-4">
            
            {/* Left: Mobile Sidebar Toggle (Hidden on Desktop) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
            </div>

            {/* Right: Notifications + User Profile Widget */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              
              {/* Notification Bell (Peserta & Pembimbing) */}
              {user?.role !== 'admin' && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setProfileOpen(false);
                    }}
                    className="relative p-2 rounded-full text-slate-600 hover:text-amber-900 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all cursor-pointer shadow-2xs"
                    title="Pemberitahuan"
                  >
                    <Bell size={18} />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xs">
                        {unreadNotifCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
                          <Bell size={16} className="text-amber-600" />
                          <h4 className="font-bold text-sm text-slate-900">Pemberitahuan</h4>
                          {unreadNotifCount > 0 && (
                            <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                              {unreadNotifCount} baru
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {notifications.length === 0 ? (
                            <div className="py-8 px-4 text-center space-y-2">
                              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                <Bell size={18} />
                              </div>
                              <p className="text-xs font-bold text-slate-800">Semua sudah beres!</p>
                              <p className="text-[11px] text-slate-400">
                                Tidak ada pengingat aktif saat ini.
                              </p>
                            </div>
                          ) : (
                            notifications.map((n) => {
                              const typeStyles = {
                                danger: 'border-l-4 border-l-rose-500 bg-rose-50/50 border-rose-200/70 hover:bg-rose-100/50',
                                warning: 'border-l-4 border-l-amber-500 bg-amber-50/50 border-amber-200/70 hover:bg-amber-100/50',
                                info: 'border-l-4 border-l-sky-500 bg-sky-50/50 border-sky-200/70 hover:bg-sky-100/50',
                                success: 'border-l-4 border-l-emerald-500 bg-emerald-50/50 border-emerald-200/70 hover:bg-emerald-100/50',
                              };
                              const cardStyle = typeStyles[n.type] || 'border-l-4 border-l-slate-400 bg-slate-50/50 border-slate-200 hover:bg-slate-100/50';

                              return (
                                <div
                                  key={n.id}
                                  onClick={() => handleNotifClick(n)}
                                  className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${cardStyle}`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="font-bold text-slate-900 truncate">{n.title}</p>
                                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.time}</span>
                                  </div>
                                  <p className="text-[11px] leading-relaxed text-slate-600">
                                    {n.message}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* User Profile Widget in Topbar (Avatar + Name & Role) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer text-left"
                  title={user?.nama || 'Profil Pengguna'}
                >
                  {getAvatar(user, 'h-9 w-9 text-xs font-bold', 'rounded-full')}
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[140px] md:max-w-[180px]">
                      Halo, {user?.nama?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 truncate max-w-[140px] md:max-w-[180px]">
                      {getRoleLabel(user?.role)}
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown Popover */}
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in zoom-in duration-150">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-2">
                        {getAvatar(user, 'h-10 w-10 text-base font-bold', 'rounded-full')}
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm text-slate-900 truncate">{user?.nama}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          <span className="inline-block text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                            {getRoleLabel(user?.role)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        {user?.role !== 'admin' && (
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              navigate('/profil');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all text-left cursor-pointer"
                          >
                            <User size={15} className="text-slate-400" />
                            <span>Profil Saya</span>
                          </button>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all text-left cursor-pointer"
                        >
                          <LogOut size={15} className="text-rose-500" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>

          </div>
        </header>

        {/* ── MAIN CONTENT OUTLET ── */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default Layout;
