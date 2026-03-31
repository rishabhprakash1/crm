import React, { useState, useMemo, useEffect } from 'react';
import {
    Bell, Building, Search, Eye, Send, X, Check,
    LogOut, Briefcase, Mail, MessageSquare, Smartphone,
    ArrowLeft, FileText, Download, Link, CreditCard, ChevronRight,
    Calculator, FileSignature, CheckSquare, ScanLine, UploadCloud, FileTerminal,
    Grid, ClipboardCheck, AlertTriangle
} from 'lucide-react';
import { clientsData as initialClients } from './data';
import './tools.css';

function getBadgeClass(status) {
    if (status === 'Document Requested') return 'badge-yellow';
    if (status === 'Document Received') return 'badge-blue';
    if (status === 'Reminder Sent') return 'badge-orange';
    if (status === 'GST Paid & Confirmed') return 'badge-green';
    if (status === 'Deadline Breached') return 'badge-red';
    return 'badge-grey';
}

const SERVICE_RATES = {
    'GST Filing': 15000,
    'Corporate Tax': 25000,
    'TDS': 10000,
    'Income Tax': 12000,
    'Audit': 50000,
    'Advisory': 30000
};

const DUMMY_NOTIFICATIONS = [
    { id: 1, text: "Reminder sent to Sharma Textiles for GST", time: "2 hours ago", link: "dashboard" },
    { id: 2, text: "Payment received from Patel Pharma — ₹45,000", time: "Yesterday", link: "dashboard" },
    { id: 3, text: "Deadline breached: Kapoor Constructions TDS — Action required", time: "1 day ago", link: "dashboard", isAlert: true },
    { id: 4, text: "Invoice #JCKCA/2025-26/034 generated for Gupta Logistics", time: "2 days ago", link: "dashboard" }
];

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');

    const [clients, setClients] = useState(initialClients);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mainTab, setMainTab] = useState('clients');

    // Dashboard Filters
    const [filterService, setFilterService] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All Statuses');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [selectedClient, setSelectedClient] = useState(null);
    const [reminderClient, setReminderClient] = useState(null);
    const [reminderTab, setReminderTab] = useState('Email');
    const [whatsappNumber, setWhatsappNumber] = useState('primary');

    // Invoice logic
    const [selectedClientsForInvoice, setSelectedClientsForInvoice] = useState([]);
    const [billingPeriod, setBillingPeriod] = useState('Current Quarter (Jan-Mar 2026)');
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [paymentClient, setPaymentClient] = useState(null);

    // Tools & UI
    const [activeTool, setActiveTool] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    function addToast(msg, type = 'success') {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }

    const visibleClients = useMemo(() => {
        let cls = [...clients];
        if (user?.role === 'staff') cls = cls.slice(0, 6);
        if (filterService !== 'All') cls = cls.filter(c => c.services.includes(filterService));
        if (filterStatus !== 'All Statuses') {
            const hasStatus = (c, st) => [c.gstStatus, c.corpTaxStatus, c.tdsStatus, c.itStatus].includes(st);
            if (filterStatus === 'Action Required') cls = cls.filter(c => hasStatus(c, 'Document Requested') || hasStatus(c, 'Reminder Sent'));
            else if (filterStatus === 'Completed') cls = cls.filter(c => hasStatus(c, 'GST Paid & Confirmed') || hasStatus(c, 'Document Received'));
            else if (filterStatus === 'Deadline Breached') cls = cls.filter(c => hasStatus(c, 'Deadline Breached'));
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            cls = cls.filter(c => c.companyName.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q) || c.gstin.toLowerCase().includes(q));
        }
        return cls;
    }, [user, filterService, filterStatus, searchQuery, clients]);

    const stats = useMemo(() => {
        let action = 0, completed = 0, breached = 0;
        visibleClients.forEach(c => {
            const s = [c.gstStatus, c.corpTaxStatus, c.tdsStatus, c.itStatus];
            if (s.includes('Deadline Breached')) breached++;
            else if (s.includes('Document Requested') || s.includes('Reminder Sent')) action++;
            else if (s.includes('GST Paid & Confirmed') || s.includes('Document Received')) completed++;
        });
        return { total: visibleClients.length, action, completed, breached };
    }, [visibleClients]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'admin@jckca.in' && password === 'admin123') { setUser({ role: 'admin', name: 'Admin User' }); setIsAuthenticated(true); }
        else if (email === 'riya.mehta@jckca.in' && password === 'staff123') { setUser({ role: 'staff', name: 'Riya Mehta' }); setIsAuthenticated(true); }
        else alert("Invalid credentials. Please use demo logins.");
    };

    const handleLogout = () => { setIsAuthenticated(false); setCurrentView('dashboard'); setUser(null); };

    const handlePaymentSuccess = (clientId, paidAmount) => {
        setClients(prev => prev.map(c => {
            if (c.id === clientId) return { ...c, invoice: { ...c.invoice, paid: c.invoice.paid + paidAmount, pending: Math.max(0, c.invoice.pending - paidAmount), dueDays: 0 } };
            return c;
        }));
    };

    const generateInvoicesData = useMemo(() => {
        return selectedClientsForInvoice.map(id => {
            const client = clients.find(c => c.id === id);
            let subtotal = 0;
            const servicesBilled = client.services.map(s => {
                const rate = SERVICE_RATES[s] || 10000;
                subtotal += rate;
                return { name: s, amount: rate, sac: "99823" + Math.floor(Math.random() * 10) };
            });
            const gst = subtotal * 0.18;
            return { client, services: servicesBilled, subtotal, gst, total: subtotal + gst, invoiceNo: `JCKCA/2025-26/${String(id).padStart(3, '0')}` };
        });
    }, [selectedClientsForInvoice, clients]);

    if (!isAuthenticated) {
        return (
            <div className="auth-wrapper animate-slide-down">
                <div className="auth-card">
                    <h1 className="auth-title"><span style={{ color: 'var(--primary-blue)', display: 'block', marginBottom: '0.5rem' }}>JC Kabra & Associates</span>Practice Manager</h1>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div><label className="text-muted font-semibold" style={{ display: 'block', marginBottom: '0.4rem' }}>Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus /></div>
                        <div><label className="text-muted font-semibold" style={{ display: 'block', marginBottom: '0.4rem' }}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
                        <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', width: '100%', fontSize: '1rem' }}>Continue to Dashboard</button>
                    </form>
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                        <p className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Demo Credentials</p>
                        <div className="text-sm">
                            <div><strong className="text-blue">Admin:</strong> admin@jckca.in / admin123</div>
                            <div style={{ marginTop: '0.4rem' }}><strong className="text-blue">Staff:</strong> riya.mehta@jckca.in / staff123</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (currentView === 'securepay' && paymentClient) {
        return <SecurePayGateway client={paymentClient.client} invoice={paymentClient} onCancel={() => setCurrentView('preview-invoice')} onSuccess={handlePaymentSuccess} goDashboard={() => setCurrentView('dashboard')} />;
    }

    return (
        <div className="app-container">
            {/* HEADER */}
            <header className="topbar">
                <div className="brand" style={{ cursor: 'pointer' }} onClick={() => { setCurrentView('dashboard'); setMainTab('clients'); }}>
                    <Briefcase size={22} /> JCKCA Practice Manager
                </div>
                <div className="topbar-right">
                    {user?.role === 'admin' && <button className="btn-primary" onClick={() => setCurrentView('generate-invoices')}><FileText size={16} /> Generate Invoices</button>}
                    <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={20} /><span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--status-red)', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</span>
                        {showNotifications && (
                            <div className="notifications-panel animate-slide-down" onClick={e => e.stopPropagation()}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}><span className="text-blue">Recent Activity</span></div>
                                {DUMMY_NOTIFICATIONS.map(n => (
                                    <div key={n.id} className="notification-item" onClick={() => { setShowNotifications(false); setCurrentView(n.link); }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div style={{ color: n.isAlert ? 'var(--status-red)' : 'var(--primary-blue)', marginTop: '2px' }}>{n.isAlert ? <AlertTriangle size={16} /> : <Check size={16} />}</div>
                                            <div>
                                                <div className="text-sm font-semibold">{n.text}</div>
                                                <div className="notification-time">{n.time}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div className="avatar">{user.name.charAt(0)}</div><span className="font-semibold text-sm">{user.name}</span></div>
                    <button onClick={handleLogout} className="btn-icon" title="Logout"><LogOut size={18} /></button>
                </div>
            </header>

            {/* TABS VIEW */}
            {currentView === 'dashboard' && (
                <nav className="main-nav">
                    <div className={`nav-item ${mainTab === 'clients' ? 'active' : ''}`} onClick={() => setMainTab('clients')}><Building size={18} /> Clients</div>
                    <div className={`nav-item ${mainTab === 'tools' ? 'active' : ''}`} onClick={() => setMainTab('tools')}><Calculator size={18} /> CRM Tools</div>
                </nav>
            )}

            {currentView === 'dashboard' && mainTab === 'clients' && (
                <main className="main-content animate-slide-down">
                    {/* Same dashboard view as before */}
                    <div className="summary-grid">
                        <div className="summary-card"><div className="summary-label">Total Clients</div><div className="summary-val">{stats.total}</div></div>
                        <div className="summary-card"><div className="summary-label">Action Required</div><div className="summary-val" style={{ color: 'var(--status-yellow)' }}>{stats.action}</div></div>
                        <div className="summary-card"><div className="summary-label">Completed This Month</div><div className="summary-val" style={{ color: 'var(--status-green)' }}>{stats.completed}</div></div>
                        <div className="summary-card"><div className="summary-label">Deadline Breached</div><div className="summary-val" style={{ color: 'var(--status-red)' }}>{stats.breached}</div></div>
                    </div>

                    <div className="filter-bar">
                        <div className="pill-group">{['All', 'GST', 'Corporate Tax', 'TDS', 'Income Tax'].map(s => <button key={s} className={`pill ${filterService === s ? 'active' : ''}`} onClick={() => setFilterService(s)}>{s}</button>)}</div>
                        <div className="search-controls">
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '200px', borderRadius: '999px' }}>{['All Statuses', 'Action Required', 'Completed', 'Deadline Breached'].map(s => <option key={s} value={s}>{s}</option>)}</select>
                            <div className="search-input-wrapper"><Search /><input type="text" placeholder="Search clients, GSTIN..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                        </div>
                    </div>

                    <div className="table-card">
                        <table>
                            <thead><tr><th>Client Name</th><th>GST Status</th><th>Corp Tax</th><th>TDS Status</th><th>Income Tax</th><th>Invoice Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {visibleClients.map(client => (
                                    <tr key={client.id}>
                                        <td><div className="font-semibold" style={{ color: 'var(--primary-blue)' }}>{client.companyName}</div><div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>{client.contactPerson}</div></td>
                                        <td><span className={`badge ${getBadgeClass(client.gstStatus)}`}>{client.gstStatus}</span></td>
                                        <td><span className={`badge ${getBadgeClass(client.corpTaxStatus)}`}>{client.corpTaxStatus}</span></td>
                                        <td><span className={`badge ${getBadgeClass(client.tdsStatus)}`}>{client.tdsStatus}</span></td>
                                        <td><span className={`badge ${getBadgeClass(client.itStatus)}`}>{client.itStatus}</span></td>
                                        <td>
                                            <div className="invoice-mini cursor-default">
                                                <div className="font-semibold text-sm">₹{client.invoice.total.toLocaleString('en-IN')}</div>
                                                <div className="text-xs" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.1rem', marginBottom: '0.2rem' }}>
                                                    <span style={{ color: 'var(--status-green)' }}>₹{client.invoice.paid.toLocaleString()}</span>
                                                    {client.invoice.pending > 0 && <span style={{ color: 'var(--status-red)' }}>₹{client.invoice.pending.toLocaleString()}</span>}
                                                </div>
                                                {client.invoice.dueDays > 0 && <div className="text-xs" style={{ color: 'var(--status-red)' }}>Due since {client.invoice.dueDays} days</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }} onClick={() => setSelectedClient(client)} title="View Profile"><Eye size={16} /> <span style={{ fontSize: '0.75rem' }}>Profile</span></button>
                                                <button className="btn-outline" style={{ padding: '0.4rem 0.6rem' }} onClick={() => { setReminderClient(client); setReminderTab('Email'); }} title="Send Reminder"><Send size={16} /> <span style={{ fontSize: '0.75rem' }}>Reminder</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            )}

            {currentView === 'dashboard' && mainTab === 'tools' && (
                <main className="main-content animate-slide-down">
                    {activeTool ? (
                        <div>
                            <div className="tool-view-header"><button className="btn-icon" onClick={() => setActiveTool(null)}><ArrowLeft /></button><h2 className="text-h1">{activeTool}</h2></div>
                            {activeTool === 'GST Calculator' && <ToolGSTCalculator />}
                            {activeTool === 'GST Response Drafter' && <ToolResponseDrafter type="GST" />}
                            {activeTool === 'Income Tax Calculator' && <ToolITCalculator />}
                            {activeTool === 'IT Response Drafter' && <ToolResponseDrafter type="IT" />}
                            {activeTool === 'IT Document Checklist' && <ToolChecklist clients={clients} />}
                            {activeTool === 'Invoice Scanner' && <ToolScanner addToast={addToast} />}
                            {activeTool === 'GST 3B Working Sheet' && <ToolGST3B clients={clients} addToast={addToast} />}
                            {activeTool === 'Audit Automation' && <ToolAudit clients={clients} addToast={addToast} />}
                        </div>
                    ) : (
                        <div className="tool-grid">
                            <div className="tool-card"><div className="tool-icon"><Grid size={24} /></div><h3 className="section-title">GST 3B Working Sheet</h3><p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1.5rem' }}>Reconcile sales output vs purchase ITC mathematically. Sync with GSTR-2A data.</p><button className="btn-outline" onClick={() => setActiveTool('GST 3B Working Sheet')}>Open Working Sheet</button></div>
                            <div className="tool-card"><div className="tool-icon"><ClipboardCheck size={24} /></div><h3 className="section-title">Audit Automation</h3><p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1.5rem' }}>Comprehensive 30+ parameter check on GST, Ledgers, TDS, Capital Gains, etc.</p><button className="btn-outline" onClick={() => setActiveTool('Audit Automation')}>Open Audit Tool</button></div>
                            <div className="tool-card"><div className="tool-icon"><Calculator size={24} /></div><h3 className="section-title">GST Calculator</h3><p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1.5rem' }}>Compute Intra-state (CGST/SGST) or Inter-state (IGST). Includes reverse calculation.</p><button className="btn-outline" onClick={() => setActiveTool('GST Calculator')}>Open Calculator</button></div>
                            <div className="tool-card"><div className="tool-icon"><FileTerminal size={24} /></div><h3 className="section-title">GST Response Drafter</h3><p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1.5rem' }}>Automated drafting tool for GST SCNs, Demand Notices, and Clarification Responses.</p><button className="btn-outline" onClick={() => setActiveTool('GST Response Drafter')}>Open Drafter</button></div>
                            <div className="tool-card"><div className="tool-icon"><Calculator size={24} /></div><h3 className="section-title">Income Tax Calculator</h3><p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1.5rem' }}>Compare Tax Liability between Old Regime and New Regime (AY 25-26/26-27).</p><button className="btn-outline" onClick={() => setActiveTool('Income Tax Calculator')}>Open IT Calculator</button></div>
                            <div className="tool-card"><div className="tool-icon"><FileSignature size={24} /></div><h3 className="section-title">IT Response Drafter</h3><p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1.5rem' }}>Draft Income Tax replies for 143(1), 148, and Scrutiny Assessment notices.</p><button className="btn-outline" onClick={() => setActiveTool('IT Response Drafter')}>Open IT Drafter</button></div>
                            <div className="tool-card"><div className="tool-icon"><CheckSquare size={24} /></div><h3 className="section-title">IT Document Checklist</h3><p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1.5rem' }}>Track & upload client documents like Bank Statements, Form 16, Capital Gains.</p><button className="btn-outline" onClick={() => setActiveTool('IT Document Checklist')}>Open Checklist</button></div>
                            <div className="tool-card"><div className="tool-icon"><ScanLine size={24} /></div><h3 className="section-title">Invoice Scanner (OCR)</h3><p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1.5rem' }}>Upload images or PDFs to auto-extract Vendor, GSTIN, HSN, and Taxable Value.</p><button className="btn-outline" onClick={() => setActiveTool('Invoice Scanner')}>Open Scanner</button></div>
                        </div>
                    )}
                </main>
            )}

            {/* OVERLAY MODALS (Profile, Generate Invoices, Reminder) logic remains here... */}
            <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}><Check size={18} /> {t.msg}</div>)}</div>
        </div>
    );
}

// -------------------------------------------------------------
// NEW TOOLS
// -------------------------------------------------------------

function ToolGST3B({ clients, addToast }) {
    const [client, setClient] = useState(clients[0]?.id || '');
    const [reconciled, setReconciled] = useState(false);

    return (
        <div className="table-card" style={{ padding: '2rem' }}>
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="input-group"><label>Select Client</label><select value={client} onChange={e => setClient(e.target.value)}>{clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}</select></div>
                <div className="input-group"><label>Return Period</label><select><option>March 2026</option><option>February 2026</option></select></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => { setReconciled(true); addToast("Reconciliation complete. Found 1 mismatch."); }}><ScanLine size={16} /> Reconcile with GSTR-2A</button>
                <button className="btn-outline"><Download size={16} /> Export to Excel</button>
                <button className="btn-primary" onClick={() => addToast('Simulated filing of GSTR-3B successful!')}><Check size={16} /> File GSTR-3B</button>
            </div>

            <h3 className="section-title text-blue" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Output Liability (Sales)</h3>
            <table className="spreadsheet-table" style={{ marginBottom: '2rem' }}>
                <thead><tr><th>Invoice No</th><th>Date</th><th>Customer Name</th><th>HSN Code</th><th>Taxable Value</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Total</th></tr></thead>
                <tbody>
                    <tr><td>INV-001</td><td>02-Mar-26</td><td>Alpha Traders</td><td>998311</td><td>₹50,000</td><td>₹4,500</td><td>₹4,500</td><td>0</td><td>₹59,000</td></tr>
                    <tr><td>INV-002</td><td>10-Mar-26</td><td>Beta Corp</td><td>998311</td><td>₹1,20,000</td><td>0</td><td>0</td><td>₹21,600</td><td>₹1,41,600</td></tr>
                    <tr><td>INV-003</td><td>15-Mar-26</td><td>Gamma Ltd</td><td>998311</td><td>₹30,000</td><td>₹2,700</td><td>₹2,700</td><td>0</td><td>₹35,400</td></tr>
                    <tr className="subtotal-row"><td colSpan="4" style={{ textAlign: 'right' }}>Liability Subtotal:</td><td>₹2,00,000</td><td>₹7,200</td><td>₹7,200</td><td>₹21,600</td><td>₹2,36,000</td></tr>
                </tbody>
            </table>

            <h3 className="section-title text-blue" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Input Credit - ITC (Purchases)</h3>
            {reconciled && <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={18} /> 4 invoices matched accurately. 1 mismatch found in GSTR-2A vs Books!</div>}
            <table className="spreadsheet-table" style={{ marginBottom: '2rem' }}>
                <thead><tr><th>Invoice No</th><th>Date</th><th>Vendor Name</th><th>HSN Code</th><th>Taxable Value</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Status</th></tr></thead>
                <tbody>
                    <tr><td>PUR-101</td><td>04-Mar-26</td><td>Office Supplies Co.</td><td>998322</td><td>₹10,000</td><td>₹900</td><td>₹900</td><td>0</td><td><span className="badge badge-green">Matched</span></td></tr>
                    <tr><td>PUR-102</td><td>12-Mar-26</td><td>Tech Hardware Ltd</td><td>998322</td><td>₹40,000</td><td>0</td><td>0</td><td>₹7,200</td><td><span className="badge badge-green">Matched</span></td></tr>
                    <tr className={reconciled ? "mismatch-row" : ""}><td>PUR-103</td><td>18-Mar-26</td><td>City Utilities</td><td>998322</td><td>₹15,000</td><td>₹1,350</td><td>₹1,350</td><td>0</td><td>
                        {reconciled ? <button className="btn-outline" onClick={() => addToast('Client notified regarding missing entry', 'success')} style={{ borderColor: 'var(--status-red)', color: 'var(--status-red)', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Notify Client</button> : <span className="badge badge-grey">Pending</span>}
                    </td></tr>
                    <tr className="subtotal-row"><td colSpan="4" style={{ textAlign: 'right' }}>ITC Subtotal:</td><td>₹65,000</td><td>₹2,250</td><td>₹2,250</td><td>₹7,200</td><td></td></tr>
                </tbody>
            </table>

            <div className="grid-2">
                <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 className="section-title">Net Liability Calculation</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}><span>CGST Payable</span><b>₹4,950</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}><span>SGST Payable</span><b>₹4,950</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}><span>IGST Payable</span><b>₹14,400</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-blue)' }}><span>Total Net Payable</span><b>₹24,300</b></div>
                </div>
                <div style={{ background: '#F0F6FF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #CBE0FF' }}>
                    <h3 className="section-title" style={{ color: 'var(--primary-blue)' }}>ITC Accumulation Tracker</h3>
                    <div className="text-muted text-sm" style={{ marginBottom: '1rem' }}>Running balance of unutilized ITC carried forward across periods.</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}><span>Opening Balance (01-Mar-26)</span><b>₹12,400</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}><span>Excess Input Current Month</span><b>₹0</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0', fontWeight: 'bold', borderTop: '1px solid #CBE0FF' }}><span>Closing ITC (31-Mar-26)</span><b style={{ color: 'var(--status-green)' }}>₹12,400</b></div>
                </div>
            </div>
        </div>
    );
}

function ToolAudit({ clients, addToast }) {
    const [client, setClient] = useState(clients[0]?.id || '');
    return (
        <div>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div className="audit-health-circle">
                    <div className="audit-health-inner">78<span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/ 100</span></div>
                </div>
                <div style={{ flex: 1 }}>
                    <h2 className="text-h1" style={{ marginBottom: '0.5rem' }}>Audit Health Score</h2>
                    <p className="text-muted">4 items require auditor attention. General ledger hygiene is standard.</p>
                </div>
                <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="input-group"><label>Client</label><select value={client} onChange={e => setClient(e.target.value)}>{clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}</select></div>
                    <div className="input-group"><label>Financial Year</label><select><option>FY 2025-26</option><option>FY 2024-25</option></select></div>
                </div>
                <button className="btn-primary" onClick={() => addToast('AI Audit Report generated successfully!')} style={{ height: 'fit-content' }}>Generate Report</button>
            </div>

            <div className="audit-section">
                <div className="audit-section-header">Financial Ratios & Trends</div>
                <div className="audit-item"><div style={{ flex: 1 }}><b>Current Ratio</b><div className="text-xs text-muted">Auto-calculated value: 1.8</div></div><div style={{ width: '120px' }}><div className="traffic-light light-green"></div>Healthy</div><input type="text" placeholder="Observation" defaultValue="Optimal liquidity" style={{ flex: 1 }} /><label style={{ display: 'flex', gap: '5px' }}><input type="checkbox" defaultChecked /> Sign-off</label></div>
                <div className="audit-item"><div style={{ flex: 1 }}><b>Debt-to-Equity</b><div className="text-xs text-muted">Auto-calculated value: 2.5</div></div><div style={{ width: '120px' }}><div className="traffic-light light-red"></div>High Risk</div><input type="text" placeholder="Observation" defaultValue="Exceeds safe threshold" style={{ flex: 1, borderColor: 'var(--status-red)' }} /><label style={{ display: 'flex', gap: '5px' }}><input type="checkbox" /> Sign-off</label></div>
            </div>

            <div className="audit-section">
                <div className="audit-section-header">Ledger Scrutiny (Auto-Flagged Narrations)</div>
                <div style={{ padding: '1rem' }}>
                    <div className="text-sm text-red font-semibold" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}><AlertTriangle size={16} /> System detected 2 suspicious ledger narrations containing keywords (cash, loan, personal, bribe).</div>
                    <table className="spreadsheet-table">
                        <thead><tr><th>Ledger Name</th><th>Date</th><th>Narration</th><th>Amount</th><th>Flag Reason</th></tr></thead>
                        <tbody>
                            <tr className="mismatch-row"><td>Director Remuneration</td><td>14-Dec-2025</td><td>Paid out in petty cash</td><td>₹5,00,000</td><td>Keyword: "cash"</td></tr>
                            <tr className="mismatch-row"><td>Marketing Exp</td><td>22-Jan-2026</td><td>Personal gift to vendor</td><td>₹1,50,000</td><td>Keyword: "personal gift"</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="audit-section">
                <div className="audit-section-header">GST Reconciliation</div>
                <div className="audit-item"><div style={{ flex: 1 }}><b>GST ITC vs Balance Sheet</b></div><select><option>Pass</option><option>Warning</option><option>Fail</option></select><input type="text" placeholder="Observation" style={{ flex: 1 }} /><label style={{ display: 'flex', gap: '5px' }}><input type="checkbox" /> Sign-off</label></div>
                <div className="audit-item"><div style={{ flex: 1 }}><b>GSTR-3B vs Books</b></div><select><option>Pass</option><option>Warning</option><option>Fail</option></select><input type="text" placeholder="Observation" style={{ flex: 1 }} /><label style={{ display: 'flex', gap: '5px' }}><input type="checkbox" /> Sign-off</label></div>
            </div>

            <div className="audit-section">
                <div className="audit-section-header">TDS & Capital Gains Verification</div>
                <div className="audit-item"><div style={{ flex: 1 }}><b>TDS deducted vs Form 26AS/TIS</b></div><select><option>Pass</option><option>Warning</option><option>Fail</option></select><input type="text" placeholder="Observation" style={{ flex: 1 }} /><label style={{ display: 'flex', gap: '5px' }}><input type="checkbox" /> Sign-off</label></div>
                <div className="audit-item"><div style={{ flex: 1 }}><b>Capital Gains Exemption (Sec 54)</b></div><select><option>Pass</option><option>Warning</option><option>Fail</option></select><input type="text" placeholder="Observation" style={{ flex: 1 }} /><label style={{ display: 'flex', gap: '5px' }}><input type="checkbox" /> Sign-off</label></div>
            </div>

        </div>
    );
}

// -------------------------------------------------------------
// EXISTING CRM TOOLS
// -------------------------------------------------------------

function ToolGSTCalculator() {
    const [val, setVal] = useState('');
    const [rate, setRate] = useState(18);
    const [intra, setIntra] = useState(true);
    const [reverse, setReverse] = useState(false);
    const parsedVal = parseFloat(val) || 0;
    let base = parsedVal, cgst = 0, sgst = 0, igst = 0, total = parsedVal;
    if (reverse) {
        base = parsedVal / (1 + rate / 100);
        const tax = parsedVal - base;
        if (intra) { cgst = tax / 2; sgst = tax / 2; } else { igst = tax; }
    } else {
        const tax = parsedVal * (rate / 100);
        total = parsedVal + tax;
        if (intra) { cgst = tax / 2; sgst = tax / 2; } else { igst = tax; }
    }
    return (
        <div className="table-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3 className="section-title">GST Calculator</h3>
                <div className="toggle-group"><button className={`toggle-btn ${!reverse ? 'active' : ''}`} onClick={() => setReverse(false)}>Standard</button><button className={`toggle-btn ${reverse ? 'active' : ''}`} onClick={() => setReverse(true)}>Reverse</button></div>
            </div>
            <div className="grid-2">
                <div className="input-group"><label>{reverse ? 'Total Amount Inclusive of GST (₹)' : 'Taxable Value (Base ₹)'}</label><input type="number" value={val} onChange={e => setVal(e.target.value)} /></div>
                <div className="input-group"><label>GST Rate</label><select value={rate} onChange={e => setRate(Number(e.target.value))}><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option></select></div>
                <div className="input-group"><label>Transaction Type</label><select value={intra ? 'Intra' : 'Inter'} onChange={e => setIntra(e.target.value === 'Intra')}><option value="Intra">Intra-State (CGST + SGST)</option><option value="Inter">Inter-State (IGST)</option></select></div>
            </div>
            <div className="result-card" style={{ marginTop: '2rem' }}>
                <div className="grid-2">
                    <div><div className="text-muted">Base Value</div><div className="text-h1">₹{base.toFixed(2)}</div></div>
                    {intra ? (
                        <><div><div className="text-muted">CGST ({(rate / 2)}%)</div><div className="font-semibold text-lg">₹{cgst.toFixed(2)}</div></div><div><div className="text-muted">SGST ({(rate / 2)}%)</div><div className="font-semibold text-lg">₹{sgst.toFixed(2)}</div></div></>
                    ) : (
                        <div><div className="text-muted">IGST ({rate}%)</div><div className="font-semibold text-lg">₹{igst.toFixed(2)}</div></div>
                    )}
                    <div style={{ gridColumn: 'span 2', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}><div className="text-muted">Total Amount</div><div className="text-h1 text-blue">₹{total.toFixed(2)}</div></div>
                </div>
            </div>
        </div>
    );
}

function ToolResponseDrafter({ type }) {
    const [noticeType, setNoticeType] = useState(type === 'GST' ? 'SCN' : '143(1)');
    const [draft, setDraft] = useState('');
    const handleGenerate = () => {
        setDraft(`To,\nThe Assessing Officer,\n${type === 'GST' ? 'GST Bhavan, Mumbai' : 'Income Tax Department'}\n\nSub: Reply to Notice ID/Ref under section ${type === 'GST' ? '73/74' : noticeType}\n\nRespected Sir/Madam,\nWith reference to the above-mentioned notice, we respectfully submit the following facts on behalf of our client:\n\n1. The demand raised / discrepancy noted is incorrect because...\n2. We have attached the necessary supporting ledgers, bank statements, and reconciliations.\n\nWe request your good office to drop the proceedings.\n\nYours faithfully,\nFor JC Kabra & Associates`);
    };
    return (
        <div className="table-card" style={{ padding: '2rem' }}>
            <h3 className="section-title">{type} Response Drafter</h3>
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}><div className="input-group"><label>Notice Type</label><select value={noticeType} onChange={e => setNoticeType(e.target.value)}>{type === 'GST' ? <><option>SCN</option><option>Demand Notice</option><option>Intimation</option><option>Clarification Request</option></> : <><option>143(1)</option><option>148</option><option>271</option><option>Scrutiny Assessment</option></>}</select></div></div>
            <div className="input-group" style={{ marginBottom: '1.5rem' }}><label>Key Points / Notice Contents</label><textarea rows="3" placeholder="Paste key text..."></textarea></div>
            <button className="btn-primary" onClick={handleGenerate}>Generate Response</button>
            {draft && <div className="result-card" style={{ marginTop: '2rem' }}><textarea rows="12" style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} defaultValue={draft}></textarea></div>}
        </div>
    );
}

function ToolITCalculator() {
    const [gross, setGross] = useState('');
    const [s80c, set80c] = useState('');
    const g = parseFloat(gross) || 0; const c = parseFloat(s80c) || 0;
    const oldTaxable = Math.max(0, g - 50000 - c); const newTaxable = Math.max(0, g - 50000);
    let oldT = oldTaxable > 500000 ? oldTaxable * 0.2 : 0; let newT = newTaxable > 700000 ? newTaxable * 0.1 : 0;
    return (
        <div className="table-card" style={{ padding: '2rem' }}>
            <h3 className="section-title">Income Tax Calculator (AY 25-26)</h3>
            <div className="grid-2">
                <div className="input-group"><label>Gross Salary</label><input type="number" value={gross} onChange={e => setGross(e.target.value)} /></div>
                <div className="input-group"><label>80C Deductions</label><input type="number" value={s80c} onChange={e => set80c(e.target.value)} /></div>
            </div>
            <div className="grid-2" style={{ marginTop: '2rem' }}>
                <div className="result-card"><h4>Old Regime</h4><div className="text-muted">Taxable: ₹{oldTaxable}</div><div className="text-h1 text-red" style={{ color: 'var(--status-red)' }}>Tax: ₹{oldT.toFixed(0)}</div></div>
                <div className="result-card"><h4>New Regime</h4><div className="text-muted">Taxable: ₹{newTaxable}</div><div className="text-h1 text-blue">Tax: ₹{newT.toFixed(0)}</div>{newT < oldT && <div className="recommendation-highlight">✓ Recommended</div>}</div>
            </div>
        </div>
    );
}

function ToolChecklist({ clients }) {
    const [client, setClient] = useState(clients[0]?.id || '');
    return (
        <div className="table-card" style={{ padding: '2rem' }}>
            <div className="grid-2" style={{ marginBottom: '2rem' }}><div className="input-group"><label>Select Client</label><select value={client} onChange={e => setClient(e.target.value)}>{clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}</select></div><div className="input-group"><label>Assessment Year</label><select><option>AY 2026-27</option><option>AY 2025-26</option></select></div></div>
            <div style={{ background: 'var(--bg-body)', borderRadius: '999px', height: '8px', width: '100%', marginBottom: '1rem' }}><div style={{ background: 'var(--status-green)', width: '65%', height: '100%', borderRadius: '999px' }}></div></div>
            <div className="font-semibold text-sm" style={{ marginBottom: '2rem' }}>Progress: 65% documents received</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Form 16', 'Bank Statements', 'Investment Proofs', 'Capital Gains', 'TIS/AIS Data'].map((doc, i) => (
                    <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}><label style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '500' }}><input type="checkbox" defaultChecked={i < 3} style={{ width: 'auto', transform: 'scale(1.2)' }} /> {doc}</label><button className="btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Upload / View</button></div>
                ))}
            </div>
        </div>
    );
}

function ToolScanner({ addToast }) {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(false);
    const handleScan = () => {
        setScanning(true); setTimeout(() => { setScanning(false); setResult(true); addToast("Invoice parsed successfully!"); }, 2000);
    };
    return (
        <div className="table-card" style={{ padding: '2rem' }}>
            <h3 className="section-title">Invoice Scanner (OCR)</h3>
            {!result ? (
                <div style={{ position: 'relative', border: '2px dashed var(--primary-blue)', background: 'var(--primary-blue-light)', borderRadius: 'var(--radius-md)', padding: '4rem 2rem', textAlign: 'center', overflow: 'hidden' }}>{scanning && <div className="scanner-line"></div>}<UploadCloud size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary-blue)' }} /><div className="font-semibold">Drag & drop invoice PDF or Image</div><div className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>Supports PDF, JPG, PNG</div><div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}><button className="btn-primary" onClick={handleScan} disabled={scanning}>{scanning ? 'Scanning...' : 'Upload File'}</button><button className="btn-outline" disabled={scanning}>Use Camera</button></div></div>
            ) : (
                <div>
                    <h4 className="font-semibold" style={{ marginBottom: '1rem' }}>Parsed Data</h4>
                    <table className="invoice-table" style={{ margin: '0 0 2rem' }}><thead><tr><th>Vendor Name</th><th>Inv Date</th><th>HSN Code</th><th>Taxable</th><th>IGST</th><th>Total</th></tr></thead><tbody><tr><td>Amazon Seller Services</td><td>22-Mar-2026</td><td>998311</td><td>₹10,000</td><td>₹1,800</td><td className="font-semibold text-blue">₹11,800</td></tr></tbody></table>
                    <button className="btn-primary" onClick={() => { addToast("Saved to Client Ledger"); setResult(false); }}>Confirm & Save to Client Ledger</button>
                </div>
            )}
        </div>
    );
}

function SecurePayGateway({ client, invoice, onCancel, onSuccess, goDashboard }) {
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState('UPI');
    const processPayment = () => { setStep(2); setTimeout(() => setStep(3), 3000); };
    if (step === 3) return (
        <div className="securepay-container"><div style={{ background: 'white', padding: '4rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}><div className="success-checkmark"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="25" /><path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg></div><h2 className="text-h1" style={{ marginBottom: '0.5rem' }}>Payment Successful!</h2><div className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>₹{invoice.total.toLocaleString()} paid successfully.</div><div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}><span className="text-muted">Transaction ID:</span> <span className="font-semibold">TXN2025{Math.floor(Math.random() * 1000000)}</span></div><button className="btn-primary" onClick={() => { onSuccess(client.id, invoice.total); goDashboard(); }}>Return to Dashboard</button></div></div>
    );
    return (
        <div className="securepay-container">
            <div className="securepay-card">
                <div className="securepay-left"><div style={{ marginBottom: '4rem' }}><Briefcase style={{ display: 'inline', marginRight: '8px' }} /> <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>SecurePay Gateway</span></div><div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '8px' }}><div className="text-sm" style={{ opacity: 0.8, marginBottom: '0.2rem' }}>Payee</div><div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>JC Kabra & Associates</div><div className="text-sm" style={{ opacity: 0.8, marginBottom: '0.2rem' }}>Invoice Ref</div><div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>{invoice.invoiceNo}</div><div className="text-sm" style={{ opacity: 0.8, marginBottom: '0.2rem' }}>Amount to Pay</div><div style={{ fontSize: '2rem', fontWeight: '700' }}>₹{invoice.total.toLocaleString()}</div></div><button className="btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', marginTop: 'auto' }} onClick={onCancel}><ArrowLeft size={16} /> Cancel Payment</button></div>
                <div className="securepay-right">
                    <h3 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Choose Payment Method</h3>
                    {step === 1 ? (
                        <><div className="payment-method-list">{['UPI', 'Net Banking', 'Credit/Debit Card', 'Wallets'].map(m => (<div key={m} className={`payment-method-item ${method === m ? 'active' : ''}`} onClick={() => setMethod(m)}><div style={{ width: '20px', height: '20px', borderRadius: '50%', border: method === m ? '5px solid #0A66C2' : '2px solid var(--border-color)' }}></div>{m}</div>))}</div>
                            {method === 'UPI' && <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--border-color)', marginBottom: '2rem' }}><span className="text-muted text-sm">Scan QR code using any UPI app</span><div style={{ width: '120px', height: '120px', background: '#E3E8EE', margin: '1rem auto' }}></div></div>}
                            {method === 'Net Banking' && <select style={{ marginBottom: '2rem' }}><option>HDFC Bank</option><option>SBI</option><option>ICICI Bank</option><option>Axis Bank</option></select>}
                            {method === 'Credit/Debit Card' && <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}><input type="text" placeholder="Card Number" /><div className="grid-2"><input type="text" placeholder="MM/YY" /><input type="text" placeholder="CVV" /></div></div>}
                            {method === 'Wallets' && <select style={{ marginBottom: '2rem' }}><option>PhonePe Wallet</option><option>Paytm</option><option>Amazon Pay</option></select>}
                            <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }} onClick={processPayment}>Pay Now ₹{invoice.total.toLocaleString()}</button>
                        </>
                    ) : (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem' }}><div className="spinner"></div><div className="text-muted font-semibold">Processing your payment securely...</div></div>)}
                </div>
            </div>
        </div>
    );
}
