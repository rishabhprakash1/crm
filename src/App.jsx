import React, { useState, useMemo } from 'react';
import {
    Bell, Building, Search, Eye, Send, X, Check,
    LogOut, Briefcase, Mail, MessageSquare, Smartphone,
    ArrowLeft, FileText, Download, Link, CreditCard, ChevronRight,
    Calculator, FileSignature, CheckSquare, ScanLine, UploadCloud, FileTerminal,
    Grid, ClipboardCheck, AlertTriangle, Users, TrendingUp, Key, Filter, Link as LinkIcon
} from 'lucide-react';
import { clientsData as initialClients } from './data';
import './tools.css';
import './revamp.css';

const SERVICE_RATES = {
    'GST Filing': 15000,
    'Corporate Tax': 25000,
    'TDS': 10000,
    'Income Tax': 12000,
    'Audit': 50000,
    'Advisory': 30000
};

const DUMMY_NOTIFICATIONS = [
    { id: 1, text: "Reminder sent to Sharma Textiles for GST", time: "2 hours ago", link: "client-list" },
    { id: 2, text: "Payment received from Patel Pharma — ₹45,000", time: "Yesterday", link: "client-list" },
    { id: 3, text: "Deadline breached: Kapoor Constructions TDS — Action required", time: "1 day ago", link: "client-list", isAlert: true },
    { id: 4, text: "Invoice #JCKCA/2025-26/034 generated for Gupta Logistics", time: "2 days ago", link: "client-list" }
];

const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
const YEARS = ['FY 2025-26', 'FY 2024-25', 'FY 2023-24'];

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('homepage');

    const [clients, setClients] = useState(initialClients);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Navigation
    const [selectedClient, setSelectedClient] = useState(null);
    const [filingType, setFilingType] = useState('');

    const [showNotifications, setShowNotifications] = useState(false);
    const [toasts, setToasts] = useState([]);

    function addToast(msg, type = 'success') {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'admin@jckca.in' && password === 'admin123') { setUser({ role: 'admin', name: 'Moksh' }); setIsAuthenticated(true); }
        else if (email === 'riya.mehta@jckca.in' && password === 'staff123') { setUser({ role: 'staff', name: 'Riya Mehta' }); setIsAuthenticated(true); }
        else alert("Invalid credentials. Please use demo logins.");
    };

    const handleLogout = () => { setIsAuthenticated(false); setCurrentView('homepage'); setUser(null); };

    if (!isAuthenticated) return <LoginView onLogin={handleLogin} email={email} setEmail={setEmail} password={password} setPassword={setPassword} />;

    return (
        <div className="app-container">
            {/* HEADER */}
            <header className="topbar">
                <div className="brand" style={{ cursor: 'pointer', padding: '0' }} onClick={() => setCurrentView('homepage')}>
                    <img src="/logo.jpg" alt="JC Kabra & Associates" style={{ height: '56px', objectFit: 'contain' }} />
                </div>
                <div className="topbar-right">
                    <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={20} /><span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--status-red)', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</span>
                        {showNotifications && (
                            <div className="notifications-panel animate-slide-down" onClick={e => e.stopPropagation()}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}><span className="text-blue">Recent Activity</span></div>
                                {DUMMY_NOTIFICATIONS.map(n => (
                                    <div key={n.id} className="notification-item" onClick={() => { setShowNotifications(false); setCurrentView(n.link); }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}><div style={{ color: n.isAlert ? 'var(--status-red)' : 'var(--primary-blue)', marginTop: '2px' }}>{n.isAlert ? <AlertTriangle size={16} /> : <Check size={16} />}</div><div><div className="text-sm font-semibold">{n.text}</div><div className="notification-time">{n.time}</div></div></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div className="avatar">{user.name.charAt(0)}</div><span className="font-semibold text-sm">{user.name}</span></div>
                    <button onClick={handleLogout} className="btn-icon" title="Logout"><LogOut size={18} /></button>
                </div>
            </header>

            {/* VIEWS */}
            {currentView === 'homepage' && <HomePageView userName={user.name} setView={setCurrentView} />}
            {currentView === 'client-list' && <ClientListView clients={clients} setView={setCurrentView} selectClient={(c) => { setSelectedClient(c); setCurrentView('client-detail'); }} />}

            {currentView === 'client-detail' && (
                <ClientDetailView
                    client={selectedClient}
                    setView={setCurrentView}
                    addToast={addToast}
                    onStartFiling={(type) => { setFilingType(type); setCurrentView('filing-flow'); }}
                />
            )}

            {currentView === 'filing-flow' && (
                <FilingFlowView
                    client={selectedClient}
                    type={filingType}
                    setView={setCurrentView}
                    addToast={addToast}
                />
            )}

            {currentView === 'tools' && <ToolsHubView setView={setCurrentView} clients={clients} addToast={addToast} />}
            {currentView === 'invoices' && <InvoiceManagerView clients={clients} setView={setCurrentView} addToast={addToast} />}
            {currentView === 'opportunities' && <OpportunitiesView clients={clients} setView={setCurrentView} addToast={addToast} />}

            {currentView === 'billing' && <BillingAccountView setView={setCurrentView} addToast={addToast} />}
            {currentView === 'users' && <UserManagementView setView={setCurrentView} addToast={addToast} clients={clients} />}

            {/* Global Toasts */}
            <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}><Check size={18} /> {t.msg}</div>)}</div>
        </div>
    );
}

// =========================================================================
// HOMEPAGE VIEW
// =========================================================================

function HomePageView({ userName, setView }) {
    return (
        <main className="main-content animate-slide-down" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '3rem', color: '#111', fontWeight: '800' }}>Welcome {userName},</h1>
                <p className="text-muted" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Select a module to manage your practice today.</p>
            </div>
            <div className="home-grid">
                <div className="home-card" onClick={() => setView('client-list')}>
                    <div className="home-card-icon"><Users size={32} /></div>
                    <div className="home-card-title">Client Servicing</div>
                    <span className="text-sm text-muted">Manage all client details, tracking, and deep-dive analytics.</span>
                </div>
                <div className="home-card" onClick={() => setView('invoices')}>
                    <div className="home-card-icon"><FileText size={32} /></div>
                    <div className="home-card-title">Invoice Management</div>
                    <span className="text-sm text-muted">Auto-generate invoices, track billing, and initiate SecurePay.</span>
                </div>
                <div className="home-card" onClick={() => setView('tools')}>
                    <div className="home-card-icon"><Calculator size={32} /></div>
                    <div className="home-card-title">Tools & Utilities</div>
                    <span className="text-sm text-muted">Access AI Audit, GST 3B sheets, Document Checklists & Drafts.</span>
                </div>
                <div className="home-card" onClick={() => setView('opportunities')}>
                    <div className="home-card-icon" style={{ background: '#DEF7EC', color: '#03543F' }}><TrendingUp size={32} /></div>
                    <div className="home-card-title">New Opportunities</div>
                    <span className="text-sm text-muted">Identify upsell targets for unmanaged GST, TDS, and Tax services.</span>
                </div>
                <div className="home-card" onClick={() => setView('billing')}>
                    <div className="home-card-icon" style={{ background: '#FDF6B2', color: '#723B13' }}><CreditCard size={32} /></div>
                    <div className="home-card-title">Billing & Account</div>
                    <span className="text-sm text-muted">Manage firm resources, subscriptions, and administrative settings.</span>
                </div>
                <div className="home-card" onClick={() => setView('users')}>
                    <div className="home-card-icon" style={{ background: '#E0E7FF', color: '#3730A3' }}><CheckSquare size={32} /></div>
                    <div className="home-card-title">User Management</div>
                    <span className="text-sm text-muted">Manage JCKCA staff role permissions, credentials, and client access logic.</span>
                </div>
            </div>
        </main>
    );
}

// =========================================================================
// INVOICE MANAGEMENT VIEW
// =========================================================================

function InvoiceManagerView({ clients, setView, addToast }) {
    const stats = useMemo(() => {
        let billed = 0, paid = 0, pending = 0;
        clients.forEach(c => { billed += c.invoice.total; paid += c.invoice.paid; pending += c.invoice.pending; });
        return { billed, paid, pending };
    }, [clients]);

    return (
        <main className="main-content animate-slide-down" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn-icon" onClick={() => setView('homepage')}><ArrowLeft /></button>
                <h2 className="text-h1">Invoice Management</h2>
            </div>

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="table-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <h3 className="section-title text-muted" style={{ display: 'block' }}>Total Billed Output</h3>
                    <div className="text-h1 text-blue" style={{ fontSize: '3rem', margin: '1rem 0' }}>₹{stats.billed.toLocaleString('en-IN')}</div>
                </div>
                <div className="table-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <h3 className="section-title text-muted" style={{ display: 'block' }}>Total Collection / Settled</h3>
                    <div className="text-h1 text-green" style={{ fontSize: '3rem', margin: '1rem 0' }}>₹{stats.paid.toLocaleString('en-IN')}</div>
                    <p className="text-sm font-semibold text-red">Net Outstanding: ₹{stats.pending.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="table-card">
                <table className="spreadsheet-table" style={{ border: 'none' }}>
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Total Billed Amount (₹)</th>
                            <th>Total Paid Amount (₹)</th>
                            <th>Outstanding Amount (₹)</th>
                            <th>Collection Strategy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(c => (
                            <tr key={c.id} style={{ background: c.invoice.pending > 0 ? '#FEF2F2' : '' }}>
                                <td><div className="font-semibold text-blue">{c.companyName}</div><div className="text-xs text-muted">{c.email}</div></td>
                                <td>{c.invoice.total.toLocaleString('en-IN')}</td>
                                <td className="text-green font-semibold">{c.invoice.paid.toLocaleString('en-IN')}</td>
                                <td className={c.invoice.pending > 0 ? 'text-red font-semibold' : 'text-muted'}>{c.invoice.pending.toLocaleString('en-IN')}</td>
                                <td>
                                    {c.invoice.pending > 0 ? (
                                        <button className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: 'var(--status-red)', color: 'var(--status-red)' }} onClick={() => addToast('Payment reminder dispatched seamlessly!', 'success')}>Send Reminder Link</button>
                                    ) : (
                                        <span className="badge badge-green">Fully Settled</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

// =========================================================================
// NEW OPPORTUNITIES VIEW
// =========================================================================

function OpportunitiesView({ clients, setView, addToast }) {
    const [proposalData, setProposalData] = useState(null);

    const opportunitiesList = useMemo(() => {
        return clients.map(client => {
            const taxType = client.type === 'Company' ? 'Corporate Tax' : 'Income Tax';
            const possibleServices = ['GST Filing', 'TDS', taxType];
            const missing = possibleServices.filter(s => !client.services.includes(s));
            return { ...client, missing };
        }).filter(c => c.missing.length > 0);
    }, [clients]);

    return (
        <main className="main-content animate-slide-down" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn-icon" onClick={() => setView('homepage')}><ArrowLeft /></button>
                <div>
                    <h2 className="text-h1">New Opportunities</h2>
                    <div className="text-muted font-semibold">Targets identified through Unmanaged Services mapping.</div>
                </div>
            </div>

            <div className="table-card">
                <table className="spreadsheet-table" style={{ border: 'none' }}>
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Contact Node</th>
                            <th>Unmanaged Target Services</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {opportunitiesList.map(c => (
                            <tr key={c.id}>
                                <td><div className="font-semibold text-blue">{c.companyName}</div><div className="text-xs text-muted">Entity: {c.type}</div></td>
                                <td><div className="font-semibold text-sm">{c.contactPerson}</div><div className="text-xs text-muted">{c.email}</div></td>
                                <td>
                                    <div className="service-pill-group">
                                        {c.missing.map(m => <div key={m} className="service-pill opportunity">{m}</div>)}
                                    </div>
                                </td>
                                <td>
                                    <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setProposalData(c)}>Send Proposal <Send size={14} style={{ display: 'inline', marginLeft: '4px' }} /></button>
                                </td>
                            </tr>
                        ))}
                        {opportunitiesList.length === 0 && (
                            <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>All tracked clients are fully managed mapped securely across all compliance verticals!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* SEND PROPOSAL POPUP */}
            {proposalData && (
                <div className="modal-overlay" onClick={() => setProposalData(null)}>
                    <div className="modal-content animate-slide-down" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div><h2 className="text-h1" style={{ fontSize: '1.25rem' }}>Custom Proposal Pitch</h2><div className="text-xs text-muted">Targeting {proposalData.companyName} for {proposalData.missing.join(' & ')}</div></div>
                            <button className="btn-icon" onClick={() => setProposalData(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ marginBottom: '1rem' }}>
                            <div className="input-group" style={{ marginBottom: '1rem' }}><label>To</label><input type="text" value={proposalData.email} disabled /></div>
                            <div className="input-group" style={{ marginBottom: '1rem' }}><label>Subject</label><input type="text" defaultValue={`Compliance Optimization: Managing your ${proposalData.missing.join(' and ')} requirements`} /></div>
                            <div className="input-group">
                                <label>Email Body (Auto-generated)</label>
                                <textarea rows="10" defaultValue={`Hi ${proposalData.contactPerson},\n\nWe noted that while we manage elements of your portfolio gracefully, your organization explicitly manages ${proposalData.missing.join(' and ')} internally.\n\nJC Kabra & Associates specializes exactly in rendering these workflows heavily redundant regarding time and compliance exposure. Relocating these specific pipelines to our AI-audited ecosystem guarantees optimal liability reduction.\n\nCould we arrange a quick 10-minute hookup to discuss syncing this officially?\n\nBest Regards,\nMoksh (JC Kabra & Associates)`} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn-outline" onClick={() => setProposalData(null)}>Cancel</button>
                            <button className="btn-primary" onClick={() => { addToast(`Proposal transmitted to ${proposalData.companyName} explicitly successfully.`); setProposalData(null); }}><Send size={16} style={{ display: 'inline', marginRight: '6px' }} /> Broadcast Proposal</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

// =========================================================================
// REST OF THE APPLICATION VIEWS (Client Servicing, Detail, Tools, Filing)
// =========================================================================

function ClientListView({ clients, setView, selectClient }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        let cls = clients;
        if (search) {
            const q = search.toLowerCase();
            cls = cls.filter(c => c.companyName.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q));
        }
        return cls;
    }, [search, clients]);

    return (
        <main className="main-content animate-slide-down">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => setView('homepage')}><ArrowLeft /></button>
                    <h2 className="text-h1">Client Servicing</h2>
                </div>
                <div className="search-input-wrapper" style={{ width: '350px' }}>
                    <Search /><input type="text" placeholder="Search clients by name..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                </div>
            </div>

            <div className="table-card">
                <table>
                    <thead><tr><th>Client Name</th><th>Email</th><th>Phone Number</th><th>Service Tracking Status</th></tr></thead>
                    <tbody>
                        {filtered.map(client => {
                            const hasGST = client.services.includes('GST Filing');
                            const hasTDS = client.services.includes('TDS');
                            const taxType = client.type === 'Company' ? 'Corporate Tax' : 'Income Tax';
                            const hasTax = client.services.includes(taxType);

                            return (
                                <tr key={client.id}>
                                    <td>
                                        <div className="font-semibold text-blue" style={{ cursor: 'pointer', fontSize: '1.05rem', textDecoration: 'underline', textUnderlineOffset: '4px' }} onClick={() => selectClient(client)}>
                                            {client.companyName}
                                        </div>
                                    </td>
                                    <td className="text-muted">{client.email}</td>
                                    <td className="text-muted">{client.phone}</td>
                                    <td>
                                        <div className="service-pill-group">
                                            <div className={`service-pill ${hasGST ? 'active' : 'opportunity'}`} title={hasGST ? 'Managed by JCKCA' : 'Opportunity - Not managed'}>GST</div>
                                            <div className={`service-pill ${hasTDS ? 'active' : 'opportunity'}`} title={hasTDS ? 'Managed by JCKCA' : 'Opportunity - Not managed'}>TDS</div>
                                            <div className={`service-pill ${hasTax ? 'active' : 'opportunity'}`} title={hasTax ? 'Managed by JCKCA' : 'Opportunity - Not managed'}>{taxType}</div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No clients found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

function ClientDetailView({ client, setView, addToast, onStartFiling }) {
    const [tab, setTab] = useState('Taxation');
    const [year, setYear] = useState('FY 2025-26');
    const [showIntegration, setShowIntegration] = useState(false);

    const taxType = client.type === 'Company' ? 'Corporate Tax' : 'Income Tax';

    const mockMonthData = useMemo(() => {
        return MONTHS.map((m, i) => {
            const isPast = i < 10;
            const amount = Math.floor(Math.random() * 50000) + 10000;
            return { month: m, pending: isPast ? 0 : amount, paid: isPast ? amount : 0, notice: (isPast && Math.random() > 0.85) ? 'Notice Pending' : 'None' };
        });
    }, [year]);

    const mockCommunications = [
        { id: 1, title: 'GST Document Reminder (GSTR-3B)', date: 'April 2026', whatsapp: true, sms: true, email: true },
        { id: 2, title: 'ITR Document Reminder (AY 25-26)', date: 'May 2025', whatsapp: false, sms: true, email: true },
        { id: 3, title: 'TDS Deduction Challan Alert', date: 'March 2026', whatsapp: true, sms: false, email: false },
        { id: 4, title: 'Client Meeting Scheduled Notification', date: 'January 2026', whatsapp: true, sms: false, email: true }
    ];

    return (
        <main className="main-content animate-slide-down" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => setView('client-list')}><ArrowLeft /></button>
                    <div className="text-muted font-semibold">Client Overview</div>
                </div>
                <button className="btn-secondary" onClick={() => setShowIntegration(true)}><Key size={16} /> Connect Client Tools</button>
            </div>

            <div className="client-hero">
                <div style={{ flex: 1 }}>
                    <h1 className="text-h1" style={{ fontSize: '2.5rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>{client.companyName}</h1>
                    <div className="client-hero-info">
                        <div className="info-item"><b>Email:</b> {client.email}</div>
                        <div className="info-item"><b>WhatsApp:</b> {client.whatsapp}</div>
                        <div className="info-item"><b>Primary Phone:</b> {client.phone}</div>
                        <div className="info-item"><b>Backup Phone:</b> {client.secondaryPhone || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
                <div className="tabs" style={{ borderBottom: 'none', marginBottom: '-2px', gap: '1.5rem' }}>
                    {['Taxation', 'TDS', 'GST', 'Invoice', 'Communications'].map(t => (
                        <div key={t} className={`tab ${tab === t ? 'active' : ''}`} style={{ fontSize: '1.1rem', padding: '0.75rem 1rem' }} onClick={() => setTab(t)}>
                            {t === 'Taxation' ? taxType : t}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.5rem' }}>
                    {tab === 'Taxation' && <button className="btn-primary" onClick={() => onStartFiling('Taxation')}>Calculate Tax</button>}
                    {tab === 'GST' && <button className="btn-primary" onClick={() => onStartFiling('GST')}>Start GST Filing</button>}
                    {tab === 'TDS' && <button className="btn-primary" onClick={() => onStartFiling('TDS')}>Start TDS Filing</button>}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                        <Filter size={18} className="text-muted" />
                        <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '0.4rem 2rem 0.4rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)', background: 'white' }}>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {tab === 'Taxation' && (
                <div className="animate-slide-down">
                    <div className="grid-2" style={{ marginBottom: '2rem' }}>
                        <div className="table-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <h3 className="section-title text-muted" style={{ display: 'block' }}>{taxType} Pending ({year})</h3>
                            <div className="text-h1 text-blue" style={{ fontSize: '3rem', margin: '1rem 0' }}>₹{year === 'FY 2025-26' ? '4,50,000' : '0'}</div>
                            <p className="text-sm font-semibold text-red">Advance Tax Deadline: 15-Mar</p>
                        </div>
                        <div className="table-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <h3 className="section-title text-muted" style={{ display: 'block' }}>{taxType} Paid ({year})</h3>
                            <div className="text-h1 text-green" style={{ fontSize: '3rem', margin: '1rem 0' }}>₹{year === 'FY 2025-26' ? '1,50,000' : '6,00,000'}</div>
                            <p className="text-sm font-semibold text-muted">No pending notices received currently.</p>
                        </div>
                    </div>
                    <div className="table-card">
                        <div className="audit-section-header">Yearly Tax Milestones ({year})</div>
                        <table className="spreadsheet-table">
                            <thead><tr><th>Milestone</th><th>Due Date</th><th>Amount (₹)</th><th>Status</th><th>Notices</th></tr></thead>
                            <tbody>
                                <tr><td>Advance Tax - Inst 1 (15%)</td><td>15-Jun</td><td>₹1,50,000</td><td><span className="badge badge-green">Paid</span></td><td>None</td></tr>
                                <tr><td>Advance Tax - Inst 2 (45%)</td><td>15-Sep</td><td>₹3,00,000</td><td><span className="badge badge-yellow">Pending</span></td><td>None</td></tr>
                                <tr><td>Advance Tax - Inst 3 (75%)</td><td>15-Dec</td><td>₹3,00,000</td><td><span className="badge badge-grey">Upcoming</span></td><td>None</td></tr>
                                <tr><td>Advance Tax - Inst 4 (100%)</td><td>15-Mar</td><td>₹2,50,000</td><td><span className="badge badge-grey">Upcoming</span></td><td>None</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {['TDS', 'GST', 'Invoice'].includes(tab) && (
                <div className="table-card animate-slide-down">
                    <table className="spreadsheet-table" style={{ border: 'none' }}>
                        <thead>
                            <tr><th>Month</th><th>{tab === 'Invoice' ? 'Amount Billed (₹)' : `${tab} Expected (₹)`}</th><th>{tab} Settled (₹)</th><th>{tab} Pending (₹)</th><th>Notices</th></tr>
                        </thead>
                        <tbody>
                            {mockMonthData.map((data, idx) => (
                                <tr key={idx} style={{ background: data.pending > 0 ? '#FEF2F2' : '' }}>
                                    <td className="font-semibold">{data.month}</td>
                                    <td>{(data.pending + data.paid).toLocaleString('en-IN')}</td>
                                    <td className="text-green font-semibold">{data.paid.toLocaleString('en-IN')}</td>
                                    <td className={data.pending > 0 ? 'text-red font-semibold' : 'text-muted'}>{data.pending.toLocaleString('en-IN')}</td>
                                    <td>{data.notice === 'None' ? <span className="text-muted">None</span> : <span className="badge badge-red">{data.notice}</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="subtotal-row" style={{ fontSize: '1.1rem' }}>
                                <td>Yearly Total:</td>
                                <td>₹{mockMonthData.reduce((acc, d) => acc + d.pending + d.paid, 0).toLocaleString('en-IN')}</td>
                                <td className="text-green">₹{mockMonthData.reduce((acc, d) => acc + d.paid, 0).toLocaleString('en-IN')}</td>
                                <td className="text-red">₹{mockMonthData.reduce((acc, d) => acc + d.pending, 0).toLocaleString('en-IN')}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {tab === 'Communications' && (
                <div className="table-card animate-slide-down">
                    <table className="spreadsheet-table" style={{ border: 'none' }}>
                        <thead>
                            <tr>
                                <th>Communication Subject / Context</th>
                                <th>Period / Action Date</th>
                                <th>Delivery Channels Sent</th>
                                <th>Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCommunications.map(comm => (
                                <tr key={comm.id}>
                                    <td className="font-semibold text-blue">{comm.title}</td>
                                    <td className="text-muted">{comm.date}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <span style={{ color: comm.whatsapp ? '#03543F' : '#9CA3AF', opacity: comm.whatsapp ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {comm.whatsapp && <Check size={14} />} WhatsApp
                                            </span>
                                            <span style={{ color: comm.sms ? '#03543F' : '#9CA3AF', opacity: comm.sms ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {comm.sms && <Check size={14} />} SMS
                                            </span>
                                            <span style={{ color: comm.email ? '#03543F' : '#9CA3AF', opacity: comm.email ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {comm.email && <Check size={14} />} Email
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => addToast('Communication successfully re-dispatched!', 'success')}>Resend</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showIntegration && (
                <div className="modal-overlay" onClick={() => setShowIntegration(false)}>
                    <div className="modal-content animate-slide-down" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Key className="text-blue" size={24} /><h2 className="text-h1" style={{ fontSize: '1.25rem' }}>Connect Client Tools</h2></div>
                            <button className="btn-icon" onClick={() => setShowIntegration(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>Sync external software mapping data directly to {client.companyName}.</p>
                            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Select Associated Tool</label>
                                <select><option>Zoho Books / ERP</option><option>Tally Prime API</option><option>Salesforce CRM</option><option>Odoo ERP</option></select>
                            </div>
                            <div className="input-group">
                                <label>API Key / Client Secret</label>
                                <input type="password" placeholder="your_api_key_xxxxxxxxxxxxxxxxxxxxxx" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-outline" onClick={() => setShowIntegration(false)}>Cancel</button>
                            <button className="btn-primary" onClick={() => { addToast('Third-party API Keys connected safely!'); setShowIntegration(false); }}>Establish Link</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function FilingFlowView({ client, type, setView, addToast }) {
    const [calcState, setCalcState] = useState(0);
    const [validState, setValidState] = useState(0);
    const [linkSent, setLinkSent] = useState(false);

    const titlePrefix = type === 'Taxation' ? 'Calculate Tax' : `Start ${type} Filing`;
    const connectedTools = Object.keys(client.integrations).filter(k => client.integrations[k]);

    return (
        <main className="main-content animate-slide-down" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <button className="btn-icon" onClick={() => setView('client-detail')}><ArrowLeft /></button>
                <div><h2 className="text-h1">{client.companyName}</h2><div className="text-muted font-semibold">{titlePrefix}</div></div>
            </div>

            <div className="table-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 className="section-title">1. Connected Client Tools</h3>
                {connectedTools.length > 0 ? (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {connectedTools.map(t => <span key={t} className="badge badge-blue" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem', textTransform: 'capitalize' }}><LinkIcon size={14} style={{ display: 'inline', marginRight: '4px' }} /> {t} connected</span>)}
                        <button className="btn-outline" style={{ padding: '0.3rem 0.8rem' }}>+ Add Additional Tool</button>
                        <button className="btn-outline" style={{ padding: '0.3rem 0.8rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }}>Remove Tool</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><span className="text-muted">No external tools connected for automated pulling.</span><button className="btn-outline" style={{ padding: '0.3rem 0.8rem' }}>+ Connect Client Tool</button></div>
                )}
            </div>

            <div className="table-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 className="section-title">2. Upload Client Data (Manual Override)</h3>
                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '2rem', textAlign: 'center', background: '#F8FAFC' }}>
                    <UploadCloud size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <div className="font-semibold text-muted">Drag and drop raw data sheets (Tally exports, ledgers, JSON)</div>
                    <button className="btn-secondary" style={{ marginTop: '1rem' }}>Select File</button>
                </div>
            </div>

            {calcState === 0 && (
                <button className="btn-primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1.25rem', marginBottom: '2rem', letterSpacing: '1px' }} onClick={() => { setCalcState(1); setTimeout(() => setCalcState(2), 2000); }}><Calculator size={20} style={{ display: 'inline', marginRight: '8px', position: 'relative', top: '2px' }} /> CALCULATE {type.toUpperCase()}</button>
            )}

            {calcState === 1 && (<div className="table-card flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}><div className="spinner"></div><div className="font-semibold text-blue">Running AI parsing and logic engines...</div></div>)}

            {calcState === 2 && (
                <div className="animate-slide-down">
                    {validState === 0 && (
                        <div className="table-card" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            <h3 className="section-title" style={{ color: 'var(--status-green)' }}>Initial Calculation Complete.</h3>
                            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Calculated projected values from internal ledgers. Ready to cross-verify with external portals.</p>
                            <button className="btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => { setValidState(1); setTimeout(() => setValidState(2), 2500); }}><ScanLine style={{ display: 'inline', marginRight: '8px' }} /> Validate via External Sources</button>
                        </div>
                    )}

                    {validState === 1 && (<div className="table-card flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}><div className="spinner" style={{ borderColor: 'rgba(252, 165, 165, 0.4)', borderLeftColor: 'var(--status-red)' }}></div><div className="font-semibold text-red">Fetching compliance portal networks...</div></div>)}

                    {validState === 2 && (
                        <div className="animate-slide-down">
                            <div className="table-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><h3 className="section-title" style={{ margin: 0 }}>Validation Results</h3><span className="badge badge-red">Mismatches Found</span></div>
                                <table className="spreadsheet-table" style={{ marginBottom: '1rem' }}>
                                    <thead><tr><th>Source</th><th>Internal System (₹)</th><th>External Portal (₹)</th><th>Variance/Mismatch</th></tr></thead>
                                    <tbody>
                                        {type === 'GST' ? <tr className="mismatch-row"><td>GSTR-2A vs 3B (ITC)</td><td>₹45,000</td><td>₹42,500</td><td><b className="text-red">-₹2,500</b></td></tr> : type === 'TDS' ? <tr className="mismatch-row"><td>Form 26AS Match</td><td>₹12,400</td><td>₹10,000</td><td><b className="text-red">-₹2,400</b></td></tr> : <tr className="mismatch-row"><td>AIS Information Base</td><td>₹5,00,000</td><td>₹6,50,000</td><td><b className="text-red">-₹1,50,000</b></td></tr>}
                                    </tbody>
                                </table>
                            </div>

                            <div className="table-card" style={{ background: '#F0F6FF', padding: '2rem', border: '1px solid #CBE0FF', marginBottom: '2rem' }}>
                                <h3 className="section-title text-blue" style={{ fontSize: '1.25rem' }}>Final {type} Calculation Summary</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                                    <div><div className="text-muted">Gross Outward / Liability</div><div className="text-h1">₹1,25,000</div></div>
                                    <div><div className="text-muted">Total Credits / TDS Setup</div><div className="text-h1">₹42,500</div></div>
                                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}><div className="text-muted">Consolidated Net Payable</div><div className="text-h1 text-blue" style={{ fontSize: '2.5rem' }}>₹82,500</div></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-primary" style={{ flex: 1, padding: '1.25rem', fontSize: '1.1rem' }} onClick={() => addToast('Successfully filed natively via Kolabix secure endpoint!', 'success')}>Fill on behalf of client</button>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <button className="btn-outline" style={{ padding: '1.25rem', fontSize: '1.1rem', background: 'white' }} onClick={() => { setLinkSent(true); addToast('Client instructions broadcasted completely.'); }}>Send link to client for payment & instructions</button>
                                    {linkSent && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', background: '#DEF7EC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #84E1BC' }}>
                                            <span style={{ color: '#03543F', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={16} /> WhatsApp</span><span style={{ color: '#03543F', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={16} /> SMS</span><span style={{ color: '#03543F', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={16} /> Email</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            )}

        </main>
    );
}

function ToolsHubView({ setView, clients, addToast }) {
    const [activeTool, setActiveTool] = useState(null);

    const renderTool = () => {
        if (activeTool === 'GST 3B Working Sheet') return <GSTTool3B onBack={() => setActiveTool(null)} addToast={addToast} clients={clients} />;
        if (activeTool === 'Audit Automation') return <AuditTool onBack={() => setActiveTool(null)} addToast={addToast} clients={clients} />;
        if (activeTool === 'IT Response Drafter') return <ITResponseTool onBack={() => setActiveTool(null)} addToast={addToast} />;
        if (activeTool === 'GST Calculator') return <div className="text-center" style={{ padding: '3rem' }}><Calculator size={48} style={{ margin: '0 auto', opacity: 0.3 }} /><h2 className="text-h1" style={{ marginTop: '1rem' }}>GST Calculator</h2><p className="text-muted">Standard standalone calculator is currently linked inside Client GST Tracker internally.</p><br /><button className="btn-secondary" onClick={() => setActiveTool(null)}>Go Back</button></div>;
    };

    return (
        <main className="main-content animate-slide-down" style={{ maxWidth: activeTool ? '900px' : '1200px', margin: '0 auto' }}>
            {!activeTool && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button className="btn-icon" onClick={() => setView('homepage')}><ArrowLeft /></button>
                    <h2 className="text-h1">Tools & Utilities</h2>
                </div>
            )}

            {activeTool ? (
                <div className="animate-slide-down">
                    {renderTool()}
                </div>
            ) : (
                <div className="tool-grid">
                    <div className="tool-card"><div className="tool-icon"><Grid size={24} /></div><h3 className="section-title">GST 3B Working Sheet</h3><button className="btn-outline" onClick={() => setActiveTool('GST 3B Working Sheet')}>Open Engine</button></div>
                    <div className="tool-card"><div className="tool-icon"><ClipboardCheck size={24} /></div><h3 className="section-title">Audit Automation</h3><button className="btn-outline" onClick={() => setActiveTool('Audit Automation')}>Open Engine</button></div>
                    <div className="tool-card" style={{ opacity: 0.6 }}><div className="tool-icon"><Calculator size={24} /></div><h3 className="section-title">GST Calculator</h3><button className="btn-outline" onClick={() => setActiveTool('GST Calculator')}>Open Calculator</button></div>
                    <div className="tool-card"><div className="tool-icon"><FileSignature size={24} /></div><h3 className="section-title">IT Response Drafter</h3><button className="btn-outline" onClick={() => setActiveTool('IT Response Drafter')}>Open Drafter</button></div>
                </div>
            )}
        </main>
    );
}

// -----------------------------------------------------
// GST 3B ENGINE
// -----------------------------------------------------

function GSTTool3B({ onBack, addToast, clients }) {
    const [step, setStep] = useState(0);
    // 0=init, 1=ocr-prompt, 2=loading, 3=data-list, 4=validating, 5=validation-res, 6=final

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}><button className="btn-icon" onClick={onBack}><ArrowLeft /></button><h2 className="text-h1">GST 3B Advanced Working Sheet</h2></div>

            {step === 0 && (
                <div className="table-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => setStep(1)}><UploadCloud style={{ display: 'inline', marginRight: '8px' }} /> Upload Raw GST Data</button>
                        <button className="btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => setStep(1)}><Key style={{ display: 'inline', marginRight: '8px' }} /> Fetch from Connected Tools</button>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="table-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <h3 className="section-title text-blue" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Data Payload Secured. Trigger OCR Engine?</h3>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Applying Batch AI OCR vastly rectifies scanning artifacts and ledger discrepancies before GSTR mapping natively.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-primary" onClick={() => { setStep(2); setTimeout(() => setStep(3), 2000) }}><ScanLine style={{ display: 'inline', marginRight: '8px' }} /> Schedule Batch OCR processing</button>
                        <button className="btn-outline" onClick={() => { setStep(2); setTimeout(() => setStep(3), 800) }}>Skip to Validation Map</button>
                    </div>
                </div>
            )}

            {step === 2 && (<div className="table-card flex-center" style={{ padding: '4rem', flexDirection: 'column', gap: '1rem' }}><div className="spinner"></div><div className="font-semibold text-blue">Initializing secure line algorithms...</div></div>)}

            {step === 3 && (
                <div className="animate-slide-down">
                    <div className="table-card" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}><h3 className="section-title" style={{ margin: 0 }}>Mapped Output Liability & Input Credits</h3></div>
                        <table className="spreadsheet-table" style={{ border: 'none', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                            <thead><tr><th>Invoice / Ref#</th><th>Date Documented</th><th>Type</th><th>Taxable Worth</th><th>Input Credit Accrued</th></tr></thead>
                            <tbody>
                                <tr><td className="font-semibold text-blue">INV-2026/044</td><td>04-Mar-2026</td><td><span className="badge badge-yellow">B2B Outward</span></td><td>₹45,000</td><td className="text-muted">--</td></tr>
                                <tr><td className="font-semibold text-blue">INV-2026/045</td><td>05-Mar-2026</td><td><span className="badge badge-yellow">B2B Outward</span></td><td>₹12,400</td><td className="text-muted">--</td></tr>
                                <tr style={{ background: '#F0FDF4' }}><td className="font-semibold text-green">PUR-8822/AA</td><td>11-Mar-2026</td><td><span className="badge badge-green">Inward Input</span></td><td className="text-muted">--</td><td className="font-semibold text-green">₹14,500 ITC</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={() => { setStep(4); setTimeout(() => setStep(5), 2000) }}><CheckSquare style={{ display: 'inline', marginLeft: '4px' }} /> Validate with Live GSTR-2A</button>
                </div>
            )}

            {step === 4 && (<div className="table-card flex-center" style={{ padding: '4rem', flexDirection: 'column', gap: '1rem' }}><div className="spinner" style={{ borderColor: 'rgba(5, 150, 105, 0.4)', borderLeftColor: 'var(--status-green)' }}></div><div className="font-semibold text-green">Pinging external GSTN nodes securely...</div></div>)}

            {step === 5 && (
                <div className="animate-slide-down">
                    <div className="table-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}><h3 className="section-title" style={{ margin: 0 }}>Validation Trace vs GSTR-2A</h3><span className="badge badge-green">Validation Hook Succeeded</span></div>
                        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '1rem', borderRadius: '8px', color: '#991B1B', fontWeight: 'semibold', marginBottom: '1.5rem' }}>Mismatch detected traversing 1 inbound entry: PUR-8822/AA lacking IGST conformity by ₹4,500.</div>
                        <button className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', background: 'var(--status-blue)', borderColor: 'var(--status-blue)' }} onClick={() => setStep(6)}>Proceed to Final Compute GST Output</button>
                    </div>
                </div>
            )}

            {step === 6 && (
                <div className="animate-slide-down">
                    <div className="table-card" style={{ background: '#F8FAFC', padding: '2.5rem', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                        <h3 className="section-title text-blue" style={{ fontSize: '1.3rem' }}>Consolidated GSTR-3B Computation</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                            <div><div className="text-muted">Total Gross Output Tax</div><div className="text-h1" style={{ fontSize: '2.2rem' }}>₹1,84,000</div></div>
                            <div><div className="text-muted">Total ITC Utilized (Post-2A Mismatch)</div><div className="text-h1 text-blue" style={{ fontSize: '2.2rem' }}>₹68,500</div></div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                            <div className="text-muted font-semibold" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>Net GST Obligation Payable</div>
                            <div className="text-h1 text-red" style={{ fontSize: '3.5rem' }}>₹1,15,500</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }} onClick={() => addToast('Challan paid natively utilizing Kolabix Pay module.')}>✅ Pay exactly on behalf of client</button>
                        <button className="btn-outline" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', background: 'white' }} onClick={() => addToast('Payment link generated predicting WhatsApp hook successfully.')}>💸 Request payment bridging</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// -----------------------------------------------------
// AUDIT AUTOMATION ENGINE
// -----------------------------------------------------

function AuditTool({ onBack, addToast }) {
    const [step, setStep] = useState(0);

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}><button className="btn-icon" onClick={onBack}><ArrowLeft /></button><h2 className="text-h1">Audit Scan Automation</h2></div>

            {step === 0 && (
                <div className="table-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => setStep(1)}><UploadCloud style={{ display: 'inline', marginRight: '8px' }} /> Upload Balance / Account Statement</button>
                        <button className="btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => setStep(1)}><Key style={{ display: 'inline', marginRight: '8px' }} /> Pull directly from external ERP Tool</button>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="table-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <h3 className="section-title text-blue" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Statement Payload Loaded. Trigger OCR Pipeline?</h3>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Applying Batch OCR cleanses messy external ledgers preventing flag leakage down the parsing loop.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-primary" onClick={() => { setStep(2); setTimeout(() => setStep(3), 2000) }}><ScanLine style={{ display: 'inline', marginRight: '8px' }} /> Schedule Batch OCR mapping</button>
                        <button className="btn-outline" onClick={() => { setStep(2); setTimeout(() => setStep(3), 800) }}>Skip to keyword mapping</button>
                    </div>
                </div>
            )}

            {step === 2 && (<div className="table-card flex-center" style={{ padding: '4rem', flexDirection: 'column', gap: '1rem' }}><div className="spinner"></div><div className="font-semibold text-blue">Initializing native context models...</div></div>)}

            {step === 3 && (
                <div className="table-card animate-slide-down" style={{ padding: '2.5rem' }}>
                    <h3 className="section-title text-blue" style={{ marginBottom: '1rem' }}>Audit Target Definitions</h3>
                    <div className="text-muted" style={{ marginBottom: '1rem' }}>Inject custom query flags. AI will actively traverse the extracted document rows isolating instances of these exact patterns globally.</div>
                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <label>AI Flag Keywords (Comma delineated)</label>
                        <textarea rows="4" style={{ fontFamily: 'monospace', padding: '1rem', fontSize: '0.9rem' }} defaultValue="Director Remuneration, Suspense Account, Related Party Transaction, Unrecognized Legal Fees, Penalty Setup"></textarea>
                    </div>
                    <button className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }} onClick={() => { setStep(4); setTimeout(() => setStep(5), 2500) }}>Initiate Deep AI Document Scan</button>
                </div>
            )}

            {step === 4 && (<div className="table-card flex-center" style={{ padding: '4rem', flexDirection: 'column', gap: '1rem' }}><div className="spinner" style={{ borderColor: 'rgba(5, 150, 105, 0.4)', borderLeftColor: 'var(--status-green)' }}></div><div className="font-semibold text-green">Mapping flags directly against ledger rows natively...</div></div>)}

            {step === 5 && (
                <div className="table-card animate-slide-down" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}><h3 className="section-title text-red" style={{ margin: 0 }}>Flagged Suspect Rows Identified</h3><span className="badge badge-red">3 Hot Hits Caught</span></div>
                    <table className="spreadsheet-table" style={{ border: 'none' }}>
                        <thead><tr><th>Spreadsheet Ref</th><th>Identified Target Cluster</th><th>Extracted Context Description</th><th>Transaction (₹)</th></tr></thead>
                        <tbody>
                            <tr><td><span className="font-semibold text-blue">Row 142</span></td><td><span className="badge badge-yellow">Unrecognized Legal Fees</span></td><td className="text-muted">High value legal consulting retainer flagged inside general...</td><td>₹8,50,000</td></tr>
                            <tr style={{ background: '#FEF2F2' }}><td><span className="font-semibold text-blue">Row 211</span></td><td><span className="badge badge-red">Suspense Account</span></td><td className="text-muted">Unclaimed transfer routed via undefined holding protocol...</td><td className="font-semibold text-red">₹42,500</td></tr>
                            <tr><td><span className="font-semibold text-blue">Row 62</span></td><td><span className="badge badge-yellow">Director Remuneration</span></td><td className="text-muted">Anomalous offset variance vs standard baseline...</td><td>₹12,00,000</td></tr>
                        </tbody>
                    </table>
                    <button className="btn-outline" style={{ width: '100%', marginTop: '1rem' }} onClick={() => addToast('Audit flag mapping exported to detailed Excel cleanly', 'success')}><Download style={{ display: 'inline', marginRight: '6px' }} /> Export Audit Flags to Excel</button>
                </div>
            )}
        </div>
    );
}

// -----------------------------------------------------
// IT RESPONSE DRAFTER
// -----------------------------------------------------

function ITResponseTool({ onBack, addToast }) {
    const [step, setStep] = useState(0);
    const [draftOpen, setDraftOpen] = useState(false);
    const [notice, setNotice] = useState('143(1) - Intimation on mismatch');

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}><button className="btn-icon" onClick={onBack}><ArrowLeft /></button><h2 className="text-h1">AI Notice Response Drafter</h2></div>

            {step === 0 && (
                <div className="table-card animate-slide-down" style={{ padding: '3rem' }}>
                    <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Select Identified IT Notice Node Classification</label>
                        <select value={notice} onChange={e => setNotice(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', width: '100%' }}>
                            <option value="143(1) - Intimation on mismatch">Section 143(1) - Discrepancy / Intimation Node</option>
                            <option value="142(1) - Inquiry before assessment">Section 142(1) - Inquiry preceding formal mapping</option>
                            <option value="148 - Income escaping assessment">Section 148 - Escaping standard profiling flag</option>
                            <option value="Generic Scrutiny Notice">Generic Scrutiny Request Format</option>
                        </select>
                    </div>
                    <div className="text-muted font-semibold" style={{ marginBottom: '0.5rem' }}>Upload Original Notice PDF / Text Scan</div>
                    <div style={{ border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px', borderRadius: '8px', marginBottom: '2rem', background: '#F8FAFC' }}>
                        <button className="btn-secondary"><FileText style={{ display: 'inline', marginRight: '4px' }} /> Select PDF Document</button>
                    </div>
                    <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={() => { setStep(1); setTimeout(() => setStep(2), 2500) }}><ScanLine style={{ display: 'inline', marginRight: '8px' }} /> Parse Notice Structurally</button>
                </div>
            )}

            {step === 1 && (<div className="table-card flex-center animate-slide-down" style={{ padding: '4rem', flexDirection: 'column', gap: '1rem' }}><div className="spinner"></div><div className="font-semibold text-blue">Translating legalese parsing structures into prompt anchors...</div></div>)}

            {step === 2 && (
                <div className="table-card animate-slide-down" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--status-green)', marginBottom: '1rem' }}><CheckSquare size={48} style={{ margin: '0 auto' }} /></div>
                    <h3 className="text-h1" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Parsing Complete. Context Locked.</h3>
                    <p className="text-muted" style={{ maxWidth: '60%', margin: '0 auto 2rem' }}>The document strictly identifies as functionally aligned with [{notice}]. The AI has located key parameters required to automatically draft the required authoritative payload.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => setDraftOpen(true)}>Generate Canned Notice Reply Template</button>
                    </div>
                </div>
            )}

            {draftOpen && (
                <div className="modal-overlay" onClick={() => setDraftOpen(false)}>
                    <div className="modal-content animate-slide-down" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div><h2 className="text-h1 text-blue" style={{ fontSize: '1.25rem' }}>Draft Payload Generation</h2><div className="text-sm text-muted">Response aligned to target: {notice}</div></div>
                            <button className="btn-icon" onClick={() => setDraftOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <textarea id="draft-reply-txt" rows="18" style={{ width: '100%', padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5', border: '1px solid var(--border-color)', borderRadius: '8px' }} readOnly defaultValue={`To,\nThe Assessing Officer / Centralized Processing Centre,\nIncome Tax Department,\n[Location].\n\nSub: Response to Notice u/s ${notice.split(' - ')[0]} for AY [AY_YEAR]\nRef: Notice Reference Number: [NOTICE_REF] Details Date: [NOT_DATE]\n\nDear Sir/Madam,\n\nWe refer to the intimation dispatched gracefully mapped across our native PAN locus structurally.\n\nRegarding the flag denoting structural anomaly located precisely isolating discrepancies natively within line item mapping, we submit respectfully that the original return mapped accurately to certified internal records utilizing formal GST/TDS offsets efficiently. The proposed mismatch is an artificial logic glitch owing specifically to external portal timing variables overlapping aggressively across compliance boundaries.\n\nWe request the algorithm be reset gracefully aligning closely bypassing penal implications officially terminating this string without prejudice.\n\nSincerely,\nFor [CLIENT NAME]\n\nAuthorized Signatory (Via JC Kabra & Associates)`}></textarea>
                        </div>
                        <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <button className="btn-outline" onClick={() => setDraftOpen(false)}>Refine Prompt Locally</button>
                            <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(document.getElementById('draft-reply-txt').value); addToast('Draft copied directly to OS clipboard successfully.'); setDraftOpen(false); }}><Check style={{ display: 'inline', marginRight: '4px' }} /> Copy Final Draft to Clipboard</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// -----------------------------------------------------

function LoginView({ onLogin, email, setEmail, password, setPassword }) {
    return (
        <div className="auth-wrapper animate-slide-down">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src="/logo.jpg" alt="JC Kabra & Associates" style={{ height: '120px', objectFit: 'contain', marginBottom: '1rem' }} />
                    <div className="text-muted font-semibold" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>Practice Management Portal</div>
                </div>
                <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><label className="text-muted font-semibold" style={{ display: 'block', marginBottom: '0.4rem' }}>Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus /></div>
                    <div><label className="text-muted font-semibold" style={{ display: 'block', marginBottom: '0.4rem' }}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
                    <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', width: '100%', fontSize: '1rem' }}>Secure Login</button>
                </form>
                <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                    <p className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Demo Accounts</p>
                    <div className="text-sm"><div><strong className="text-blue">Admin:</strong> admin@jckca.in</div><div style={{ marginTop: '0.4rem' }}><strong className="text-blue">Password:</strong> admin123</div></div>
                </div>
            </div>
        </div>
    );
}

// =========================================================================
// BILLING & ACCOUNT VIEW
// =========================================================================

function BillingAccountView({ setView, addToast }) {
    const [rechargeModal, setRechargeModal] = useState(null);

    const handleRecharge = (amount) => {
        addToast(`Successfully recharged ${rechargeModal.title} with ₹${amount}`, 'success');
        setRechargeModal(null);
    };

    return (
        <main className="main-content animate-slide-down" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn-icon" onClick={() => setView('homepage')}><ArrowLeft /></button>
                <h2 className="text-h1">Billing & Account</h2>
            </div>

            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                <AlertTriangle size={20} /> Based on your usage, you have 7 days of credits remaining for WhatsApp operations.
            </div>

            <div className="grid-2" style={{ gap: '2rem' }}>
                {/* AI Cost OCR */}
                <div className="table-card" style={{ padding: '2rem' }}>
                    <h3 className="section-title text-blue">AI Cost for OCR</h3>
                    <div className="text-h1" style={{ fontSize: '2.5rem', margin: '1rem 0' }}>₹1,250.00</div>
                    <div className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
                        <div><b>Utilization Last 1 Week:</b> 450 scans</div>
                        <div style={{ marginTop: '0.4rem' }}><b>Utilization Last 1 Month:</b> 1,200 scans</div>
                    </div>
                    <button className="btn-outline" style={{ width: '100%' }} onClick={() => setRechargeModal({ title: 'AI OCR Credits' })}>Recharge Balance</button>
                </div>

                {/* WhatsApp Cost */}
                <div className="table-card" style={{ padding: '2rem' }}>
                    <h3 className="section-title text-blue">WhatsApp Cost</h3>
                    <div className="text-h1" style={{ fontSize: '2.5rem', margin: '1rem 0' }}>₹450.00</div>
                    <div className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
                        <div><b>Remaining Capacity:</b> 900 messages</div>
                        <div style={{ marginTop: '0.4rem', color: 'var(--status-red)', fontWeight: 'bold' }}>(0.5 INR per message)</div>
                    </div>
                    <button className="btn-outline" style={{ width: '100%' }} onClick={() => setRechargeModal({ title: 'WhatsApp Balance' })}>Recharge Balance</button>
                </div>

                {/* SMS Cost */}
                <div className="table-card" style={{ padding: '2rem' }}>
                    <h3 className="section-title text-blue">SMS Cost</h3>
                    <div className="text-h1" style={{ fontSize: '2.5rem', margin: '1rem 0' }}>₹200.00</div>
                    <div className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
                        <div><b>Remaining Capacity:</b> ~1,333 messages</div>
                        <div style={{ marginTop: '0.4rem' }}>(0.15 INR per message)</div>
                    </div>
                    <button className="btn-outline" style={{ width: '100%' }} onClick={() => setRechargeModal({ title: 'SMS Balance' })}>Recharge Balance</button>
                </div>

                {/* Email Cost */}
                <div className="table-card" style={{ padding: '2rem' }}>
                    <h3 className="section-title text-blue">Email Cost</h3>
                    <div className="text-h1" style={{ fontSize: '2.5rem', margin: '1rem 0' }}>₹800.00</div>
                    <div className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
                        <div><b>Remaining Capacity:</b> ~15,000 emails</div>
                        <div style={{ marginTop: '0.4rem' }}>Pricing tier completely managed.</div>
                    </div>
                    <button className="btn-outline" style={{ width: '100%' }} onClick={() => setRechargeModal({ title: 'Email Node Balance' })}>Recharge Balance</button>
                </div>
            </div>

            {/* RECHARGE POPUP */}
            {rechargeModal && (
                <div className="modal-overlay" onClick={() => setRechargeModal(null)}>
                    <div className="modal-content animate-slide-down" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="text-h1">{rechargeModal.title}</h2>
                            <button className="btn-icon" onClick={() => setRechargeModal(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group">
                                <label>Top-up Amount (INR)</label>
                                <select id="recharge-amt" style={{ padding: '0.8rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <option value="500">₹500.00</option>
                                    <option value="1000">₹1,000.00</option>
                                    <option value="5000">₹5,000.00</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                            <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleRecharge(document.getElementById('recharge-amt').value)}>
                                <CreditCard size={16} style={{ display: 'inline', marginRight: '6px' }} /> Process Payment via RazorPay
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}

// =========================================================================
// USER MANAGEMENT VIEW
// =========================================================================

function UserManagementView({ setView, addToast, clients }) {
    const [staff, setStaff] = useState([
        { id: 1, name: 'Moksh', email: 'moksh@jckca.in', role: 'Admin', assigned: [1, 2, 3, 4] },
        { id: 2, name: 'Arpit', email: 'arpit@jckca.in', role: 'Admin', assigned: [3, 5, 8] },
        { id: 3, name: 'Riya Mehta', email: 'riya.mehta@jckca.in', role: 'User', assigned: [1, 2] },
        { id: 4, name: 'Rahul Sharma', email: 'rahul.s@jckca.in', role: 'User', assigned: [4] },
        { id: 5, name: 'Priya Iyer', email: 'priya.i@jckca.in', role: 'User', assigned: [] },
        { id: 6, name: 'Kushal Gupta', email: 'kushal.g@jckca.in', role: 'User', assigned: [6, 7] }
    ]);
    const [assignModal, setAssignModal] = useState(null); // holds user object targeted
    const [tempAssignments, setTempAssignments] = useState([]);

    const openAssign = (user) => {
        setAssignModal(user);
        setTempAssignments([...user.assigned]);
    };

    const toggleAssignment = (clientId) => {
        if (tempAssignments.includes(clientId)) {
            setTempAssignments(tempAssignments.filter(id => id !== clientId));
        } else {
            setTempAssignments([...tempAssignments, clientId]);
        }
    };

    const saveAssignments = () => {
        setStaff(staff.map(s => s.id === assignModal.id ? { ...s, assigned: tempAssignments } : s));
        addToast(`Client mapping routing securely saved dynamically for ${assignModal.name}.`, 'success');
        setAssignModal(null);
    };

    const handleDelete = (uid) => {
        setStaff(staff.filter(s => s.id !== uid));
        addToast('User completely wiped from network architecture payload natively.', 'success');
    };

    return (
        <main className="main-content animate-slide-down" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => setView('homepage')}><ArrowLeft /></button>
                    <div>
                        <h2 className="text-h1">User Management</h2>
                        <div className="text-muted font-semibold">Organize JCKCA Internal Associates Globally</div>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => addToast('Add Modal Prompt Initiated Native Hook')}><Users style={{ display: 'inline', marginRight: '8px' }} size={18} /> Add New User (JCKCA Staff)</button>
            </div>

            <div className="table-card">
                <table className="spreadsheet-table" style={{ border: 'none' }}>
                    <thead>
                        <tr>
                            <th>Associate Name / Email</th>
                            <th>Node Permissions</th>
                            <th>Active Mapped Clients</th>
                            <th>Administrative Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="font-semibold text-blue">{user.name}</div>
                                    <div className="text-sm text-muted">{user.email}</div>
                                </td>
                                <td>
                                    <span className={`badge ${user.role === 'Admin' ? 'badge-blue' : 'badge-grey'}`} style={{ fontSize: '0.85rem' }}>
                                        {user.role} Hierarchy Access
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => openAssign(user)}>
                                        Manage {user.assigned.length} Assurances <FileTerminal size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                    </button>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#4F46E5', borderColor: '#C7D2FE' }} title="Send Reset Magic Link" onClick={() => addToast('Password mapping reset vector fired via Mailgun.', 'success')}><Key size={14} style={{ display: 'inline', marginRight: '4px' }} /> Reset Auth</button>
                                        <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} title="Revoke Permissions completely" onClick={() => handleDelete(user.id)}><X size={14} style={{ display: 'inline', marginRight: '4px' }} /> Terminate</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {assignModal && (
                <div className="modal-overlay" onClick={() => setAssignModal(null)}>
                    <div className="modal-content animate-slide-down" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <h2 className="text-h1 text-blue" style={{ fontSize: '1.25rem' }}>Client Directory Routing Control</h2>
                                <div className="text-sm text-muted">Assigning mapped visibility limits directly anchoring {assignModal.name}</div>
                            </div>
                            <button className="btn-icon" onClick={() => setAssignModal(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {clients.map(client => {
                                    const isAssigned = tempAssignments.includes(client.id);
                                    return (
                                        <div key={client.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '8px', border: isAssigned ? '1px solid #C7D2FE' : '1px solid var(--border-color)', background: isAssigned ? '#EEF2FF' : 'white', cursor: 'pointer' }} onClick={() => toggleAssignment(client.id)}>
                                            <div>
                                                <div className="font-semibold text-blue">{client.companyName}</div>
                                                <div className="text-xs text-muted">Entity Tracker: {client.type} • Contact: {client.contactPerson}</div>
                                            </div>
                                            <div>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: isAssigned ? 'none' : '2px solid #D1D5DB', background: isAssigned ? '#4F46E5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {isAssigned && <Check size={16} color="white" strokeWidth={3} />}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <button className="btn-outline" onClick={() => setAssignModal(null)}>Discard Mapping</button>
                            <button className="btn-primary" onClick={saveAssignments}><CheckSquare style={{ display: 'inline', marginRight: '6px' }} /> Anchor Assurances & Save</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}


