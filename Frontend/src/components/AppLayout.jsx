import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Code,
  Newspaper,
  Workflow,
  Users,
  Target,
  Briefcase,
  Swords,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { logoutUser } from '../store/authSlice';

// Change this to your project name
const APP_NAME = 'LeetCode';

function AppLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  // UI-only: theme, saved in localStorage
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'codedark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // To add a page later, add one entry here
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: pathname.startsWith('/dashboard') },
    { to: '/', label: 'Problems', icon: Code, active: pathname === '/' || pathname.startsWith('/problem') },
    { to: '/feed', label: 'Feed', icon: Newspaper, active: pathname.startsWith('/feed') },
    { to: '/algo-visualiser', label: 'Algo Visualiser', icon: Workflow, active: pathname.startsWith('/algo-visualiser') },
    { to: '/group', label: 'Group', icon: Users, active: pathname.startsWith('/group') },
    { to: '/goals', label: 'Goals', icon: Target, active: pathname.startsWith('/goals') },
    { to: '/interview-prep', label: 'Interview Prep', icon: Briefcase, active: pathname.startsWith('/interview-prep') },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/dsa-arena', label: 'DSA Arena', icon: Swords, active: pathname.startsWith('/dsa-arena') },
    ...(user?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, active: pathname.startsWith('/admin') }]
      : []),
  ];

  const closeMenu = () => document.activeElement?.blur();

  const handleLogout = () => {
    closeMenu();
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-base-300 bg-base-200/90 px-4 backdrop-blur md:px-6">
        <NavLink to="/" className="text-xl font-bold tracking-tight md:pl-20">
          {APP_NAME}
        </NavLink>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {user?.firstName?.charAt(0)?.toUpperCase()}
            </span>
            <span className="hidden sm:inline">{user?.firstName}</span>
            <ChevronDown size={14} className="opacity-60" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content z-40 mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <li>
              <button
                onClick={() => {
                  setTheme(theme === 'codedark' ? 'codelight' : 'codedark');
                  closeMenu();
                }}
              >
                {theme === 'codedark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'codedark' ? 'Light theme' : 'Dark theme'}
              </button>
            </li>
            <li>
              <button onClick={handleLogout}>
                <LogOut size={16} /> Log out
              </button>
            </li>
          </ul>
        </div>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="fixed bottom-0 left-0 top-14 z-20 hidden w-20 flex-col items-stretch gap-1 overflow-y-auto border-r border-base-300 bg-base-200 px-2 py-4 md:flex">
        {navItems.map(({ to, label, icon: Icon, active }) => (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center text-[11px] font-medium leading-tight transition-colors ${
              active
                ? 'bg-primary/15 text-primary'
                : 'text-base-content/60 hover:bg-base-300/50 hover:text-base-content'
            }`}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Page content */}
      <main className="pb-16 pt-14 md:pb-0 md:pl-20">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center gap-1 overflow-x-auto border-t border-base-300 bg-base-200 md:hidden">
        {navItems.map(({ to, label, icon: Icon, active }) => (
          <NavLink
            key={to}
            to={to}
            className={`flex min-w-[4.5rem] shrink-0 flex-col items-center gap-0.5 text-[11px] font-medium ${
              active ? 'text-primary' : 'text-base-content/60'
            }`}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AppLayout;