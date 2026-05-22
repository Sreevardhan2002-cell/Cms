import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    Stethoscope, 
    Pill, 
    Microscope, 
    Building,
    LogOut,
    Menu,
    UserCircle2,
    ChevronDown,
    X,
    Moon,
    Sun
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, onClick }) => (
    <NavLink to={to} onClick={onClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Icon size={20} />
        <span>{label}</span>
    </NavLink>
);

const SidebarSection = ({ title, children }) => (
    <div style={{ marginBottom: '1.35rem' }}>
        <div style={{ padding: '0 0.25rem 0.6rem', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {title}
        </div>
        {children}
    </div>
);

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const profileMenuRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const openProfilePanel = () => {
        setIsProfileMenuOpen(false);
        setIsProfilePanelOpen(true);
    };

    const closeProfilePanel = () => {
        setIsProfilePanelOpen(false);
    };

    const toggleTheme = () => {
        setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = event => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {isSidebarOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation menu" onClick={closeSidebar} />}

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">M</div>
                    <h2>maclinic</h2>
                </div>

                <div style={{ flex: 1 }}>
                    {user?.role === 'Administrator' && (
                        <>
                            <SidebarSection title="Administration">
                                <SidebarLink to="/admin" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
                                <SidebarLink to="/admin/staff" icon={Users} label="Staff Management" onClick={closeSidebar} />
                                <SidebarLink to="/admin/departments" icon={Building} label="Departments" onClick={closeSidebar} />
                            </SidebarSection>

                            <SidebarSection title="Reception">
                                <SidebarLink to="/reception" icon={LayoutDashboard} label="Reception Dashboard" onClick={closeSidebar} />
                                <SidebarLink to="/reception/patients" icon={Users} label="Patients" onClick={closeSidebar} />
                                <SidebarLink to="/reception/appointments" icon={Calendar} label="Appointments" onClick={closeSidebar} />
                            </SidebarSection>

                            <SidebarSection title="Pharmacy">
                                <SidebarLink to="/pharmacy" icon={LayoutDashboard} label="Pharmacy Dashboard" onClick={closeSidebar} />
                                <SidebarLink to="/pharmacy/inventory" icon={Pill} label="Inventory" onClick={closeSidebar} />
                                <SidebarLink to="/pharmacy/prescriptions" icon={Stethoscope} label="Prescriptions" onClick={closeSidebar} />
                            </SidebarSection>

                            <SidebarSection title="Lab">
                                <SidebarLink to="/lab" icon={LayoutDashboard} label="Lab Tests" onClick={closeSidebar} />
                                <SidebarLink to="/lab/evaluations" icon={Microscope} label="Evaluations" onClick={closeSidebar} />
                            </SidebarSection>
                        </>
                    )}
                    
                    {user?.role === 'Receptionist' && (
                        <>
                            <SidebarLink to="/reception" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
                            <SidebarLink to="/reception/patients" icon={Users} label="Patients" onClick={closeSidebar} />
                            <SidebarLink to="/reception/appointments" icon={Calendar} label="Appointments" onClick={closeSidebar} />
                        </>
                    )}

                    {user?.role === 'Doctor' && (
                        <>
                            <SidebarLink to="/doctor" icon={Stethoscope} label="Consultations" onClick={closeSidebar} />
                            <SidebarLink to="/doctor/lab-results" icon={Microscope} label="Lab Results" onClick={closeSidebar} />
                        </>
                    )}

                    {user?.role === 'Pharmacist' && (
                        <>
                            <SidebarLink to="/pharmacy" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
                            <SidebarLink to="/pharmacy/inventory" icon={Pill} label="Inventory" onClick={closeSidebar} />
                            <SidebarLink to="/pharmacy/prescriptions" icon={Stethoscope} label="Prescriptions" onClick={closeSidebar} />
                        </>
                    )}

                    {user?.role === 'Lab Technician' && (
                        <>
                            <SidebarLink to="/lab" icon={LayoutDashboard} label="Lab Tests" onClick={closeSidebar} />
                            <SidebarLink to="/lab/evaluations" icon={Microscope} label="Evaluations" onClick={closeSidebar} />
                        </>
                    )}
                </div>

                <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button type="button" onClick={() => setIsSidebarOpen(open => !open)} style={{ padding: '0.4rem', background: 'var(--primary)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }} title="Toggle menu" aria-label="Toggle navigation menu">
                                <Menu size={22} style={{ color: '#ffffff' }} />
                        </button>
                                <span style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '1.15rem', letterSpacing: '0.02em' }}>maclinic</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }} ref={profileMenuRef}>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="theme-toggle"
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <span style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                            {user?.role}
                        </span>

                        <button
                            type="button"
                            onClick={() => setIsProfileMenuOpen(open => !open)}
                            className="profile-button"
                            aria-label="Open profile menu"
                            aria-expanded={isProfileMenuOpen}
                        >
                            <div className="profile-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="profile-name">{user?.name}</span>
                            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                        </button>

                        {isProfileMenuOpen && (
                            <div className="profile-menu">
                                <button type="button" className="profile-menu-item" onClick={openProfilePanel}>
                                    <UserCircle2 size={18} />
                                    <span>Profile</span>
                                </button>
                                <button type="button" className="profile-menu-item danger" onClick={handleLogout}>
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="content-area animate-fade-in">
                    <Outlet />
                </div>
            </main>

            {isProfilePanelOpen && (
                <div className="profile-panel-overlay" role="presentation" onClick={closeProfilePanel}>
                    <div className="profile-panel" role="dialog" aria-modal="true" aria-label="Profile details" onClick={event => event.stopPropagation()}>
                        <div className="profile-panel-header">
                            <div>
                                <p className="profile-panel-eyebrow">Signed in as</p>
                                <h2>{user?.name}</h2>
                            </div>
                            <button type="button" className="profile-panel-close" onClick={closeProfilePanel} aria-label="Close profile panel">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="profile-panel-body">
                            <div className="profile-panel-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>

                            <div className="profile-panel-info">
                                <div>
                                    <span>Role</span>
                                    <strong>{user?.role}</strong>
                                </div>
                                <div>
                                    <span>Username</span>
                                    <strong>{user?.username || user?.name}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="profile-panel-actions">
                            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
