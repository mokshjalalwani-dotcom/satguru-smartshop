import { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './index.css';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Product {
  product_id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}
interface CartItem { product: Product; qty: number; }
interface SaleRecord {
  id: string; customer: string; paymentMethod: string;
  total: number; items: number; date: string; invoiceUrl?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const GST_RATE = 0.18;
const PAY_METHODS = ['Cash', 'UPI', 'Card', 'NetBanking'];
const fmtINR = (n: number) =>
  '₹' + Math.round(n).toLocaleString('en-IN');

// ─── Icons (inline SVG, zero deps) ───────────────────────────────────────────
const Icon = {
  Search:   () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Cart:     () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Plus:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  Minus:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>,
  Trash:    () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Check:    () => <svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Download: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  User:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Receipt:  () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Loader:   () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  X:        () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Grid:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
};

// ─── Clock component ──────────────────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--muted)', letterSpacing: 2 }}>
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'success'|'error'; onClose: ()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'error' ? '#2A0E0E' : '#0E1F0E';
  const border = type === 'error' ? 'var(--danger)' : 'var(--success)';
  const dot = type === 'error' ? 'var(--danger)' : 'var(--success)';
  return (
    <div className="slide-in" style={{ position:'fixed', top:24, right:24, zIndex:9999, display:'flex', alignItems:'center', gap:12,
      background: bg, border:`1px solid ${border}`, borderRadius:16, padding:'14px 20px', boxShadow:'0 20px 60px rgba(0,0,0,0.5)', maxWidth:320 }}>
      <span style={{ width:8, height:8, borderRadius:'50%', background: dot, flexShrink:0, animation:'ping 1s ease infinite' }} />
      <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', flex:1 }}>{msg}</span>
      <button onClick={onClose} style={{ color:'var(--muted)', display:'flex' }}><Icon.X /></button>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, cartQty, onAdd, onRemove }: {
  product: Product; cartQty: number;
  onAdd: ()=>void; onRemove: ()=>void;
}) {
  const low = product.stock <= 5;
  return (
    <div className="fade-in" onClick={() => { if(product.stock > 0) onAdd() }} style={{
      background: 'var(--surface2)', border: cartQty > 0 ? '1.5px solid var(--accent)' : '1px solid var(--border)',
      borderRadius: 20, padding: '18px 16px', display:'flex', flexDirection:'column', gap:10,
      transition: 'all .2s', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', position:'relative', overflow:'hidden',
      opacity: product.stock === 0 ? 0.5 : 1, minHeight: 160
    }} onMouseEnter={e => { if(product.stock > 0) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(245,166,35,0.05)'; } }} onMouseLeave={e => { e.currentTarget.style.borderColor = cartQty > 0 ? 'var(--accent)' : 'var(--border)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
      {cartQty > 0 && (
        <div style={{ position:'absolute', top:0, right:0, width:0, height:0,
          borderLeft:'36px solid transparent', borderTop:'36px solid var(--accent)' }} />
      )}
      {cartQty > 0 && (
        <span style={{ position:'absolute', top:4, right:4, fontSize:9, fontWeight:900, color:'#000', lineHeight:1 }}>{cartQty}</span>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:1.5,
          color:'var(--accent)', background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.2)',
          padding:'4px 10px', borderRadius:8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.category}</span>
        <span style={{ fontSize:9, fontWeight:700, color: low ? 'var(--danger)' : 'var(--muted)', letterSpacing:1, flexShrink:0 }}>
          {product.stock} left
        </span>
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:12, fontWeight:800, color:'var(--text)', lineHeight:1.4, marginBottom:6 }}>{product.name}</p>
        <p style={{ fontSize:18, fontWeight:900, color:'var(--text)' }}>{fmtINR(product.price)}</p>
      </div>
      {cartQty > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ flex:1, padding:'8px 0', borderRadius:12, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--danger)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.2)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(239,68,68,0.1)')}><Icon.Minus /></button>
          <span style={{ fontSize:14, fontWeight:900, color:'var(--accent)', minWidth:20, textAlign:'center' }}>{cartQty}</span>
          <button onClick={(e) => { e.stopPropagation(); onAdd(); }} style={{ flex:1, padding:'8px 0', borderRadius:12, background:'rgba(245,166,35,0.15)', border:'1px solid rgba(245,166,35,0.3)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(245,166,35,0.25)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(245,166,35,0.15)')}><Icon.Plus /></button>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [customer, setCustomer] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [checking, setChecking] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [successModal, setSuccessModal] = useState<SaleRecord|null>(null);
  const [history, setHistory] = useState<SaleRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [upiId, setUpiId] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Load products & config
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((data: any[]) => {
        setProducts(data.map(p => ({
          product_id: p.product_id, name: p.name,
          price: p.price, stock: p.stock, category: p.category || 'Electronics',
        })).filter(p => p.stock > 0));
      })
      .catch(() => showToast('Failed to load products', 'error'))
      .finally(() => setLoading(false));

    fetch('/api/settings?key=upi_id')
      .then(r => r.json())
      .then(data => { if(data && data.value) setUpiId(data.value); })
      .catch(() => {});
  }, []);

  const showToast = (msg: string, type: 'success'|'error' = 'success') =>
    setToast({ msg, type });

  // Cart helpers
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.product_id === product.product_id);
      if (ex) {
        if (ex.qty >= product.stock) { showToast(`Only ${product.stock} units in stock`, 'error'); return prev; }
        return prev.map(i => i.product.product_id === product.product_id ? {...i, qty: i.qty+1} : i);
      }
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev =>
      prev.map(i => i.product.product_id === productId ? {...i, qty: i.qty-1} : i).filter(i => i.qty > 0)
    );
  }, []);

  const deleteFromCart = (productId: string) =>
    setCart(prev => prev.filter(i => i.product.product_id !== productId));

  // Calculations
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const gstAmt   = Math.round(subtotal * GST_RATE);
  const total    = subtotal + gstAmt;
  const totalUnits = cart.reduce((s, i) => s + i.qty, 0);

  // Derived data
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Keyboard shortcut: F2 = focus search, Enter = checkout, Escape = clear cart
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'Escape') setCart([]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Download helper
  const downloadPDF = (url: string, saleId: string) => {
    const a = document.createElement('a');
    a.href = url; a.download = `invoice_${saleId}.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0 || checking) return;
    setChecking(true);
    try {
      const payload = {
        customer: customer.trim() || 'Walk-in Customer',
        payment_method: payMethod,
        items: cart.map(i => ({
          product_id: i.product.product_id,
          product_name: i.product.name,
          quantity: i.qty,
          unit_price: i.product.price,
          line_total: i.product.price * i.qty,
        })),
        subtotal,
        gst_amount: gstAmt,
        total_price: total,
      };
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const sale: SaleRecord = {
        id: data.sale_id,
        customer: payload.customer,
        paymentMethod: payMethod,
        total, items: totalUnits,
        date: new Date().toLocaleString('en-IN'),
        invoiceUrl: data.invoiceUrl,
      };
      setHistory(prev => [sale, ...prev.slice(0, 19)]);
      setCart([]);
      setCustomer('');
      setSuccessModal(sale);

      // Refetch products to dynamically decrement stock UI
      fetch('/api/products')
        .then(r => r.json())
        .then(data => {
            const mapped = data.map((p: any) => ({
                product_id: p.product_id, name: p.name, price: p.price, stock: p.stock, category: p.category || 'Electronics'
            }));
            setProducts(mapped.filter((p: any) => p.stock > 0));
        }).catch(err => console.warn('Background POS catalog refresh failed', err));

      // Auto-download PDF
      if (data.invoiceUrl) setTimeout(() => downloadPDF(data.invoiceUrl, data.sale_id), 600);
    } catch (err: any) {
      showToast('Checkout failed: ' + (err.message || 'Server error'), 'error');
    } finally {
      setChecking(false);
    }
  };

  // ── Styles (CSS-in-JS for POS portal with no tailwind) ─────────────────────
  const S = {
    root: { display:'flex', flexDirection:'column' as const, height:'100vh', overflow:'hidden', background:'var(--bg)' },
    // Top bar
    topbar: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px',
      height:56, background:'var(--surface)', borderBottom:'1px solid var(--border)', flexShrink:0 },
    topLogo: { display:'flex', alignItems:'center', gap:12 },
    logoMark: { width:32, height:32, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:'#000' },
    logoText: { fontSize:15, fontWeight:900, letterSpacing:-0.5, color:'var(--text)' },
    logoSub:  { fontSize:9, fontWeight:700, color:'var(--muted)', letterSpacing:2, textTransform:'uppercase' as const, marginTop:-2 },
    // Main split
    main: { display:'flex', flex:1, overflow:'hidden' },
    // Left panel
    left: { flex:1, display:'flex', flexDirection:'column' as const, overflow:'hidden', borderRight:'1px solid var(--border)' },
    leftBar: { display:'flex', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 },
    searchWrap: { flex:1, display:'flex', alignItems:'center', gap:10, background:'var(--surface2)', borderRadius:12, padding:'0 14px', border:'1px solid var(--border)', height:40 },
    searchInput: { flex:1, fontSize:12, fontWeight:600, color:'var(--text)', background:'none', '::placeholder': { color:'var(--muted)' } },
    catBar: { display:'flex', gap:8, padding:'10px 20px', borderBottom:'1px solid var(--border)', overflowX:'auto' as const, flexShrink:0 },
    productGrid: { flex:1, overflowY:'auto' as const, padding:'16px 18px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(185px, 1fr))', gap:14, alignContent:'start' },
    // Right panel
    right: { width:380, display:'flex', flexDirection:'column' as const, overflow:'hidden', background:'var(--surface)', flexShrink:0 },
    cartHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 },
    cartItems: { flex:1, overflowY:'auto' as const, padding:'12px 16px', display:'flex', flexDirection:'column' as const, gap:8 },
    cartEmpty: { flex:1, display:'flex', flexDirection:'column' as const, alignItems:'center', justifyContent:'center', opacity:0.2, gap:12 },
    cartItemRow: { display:'flex', alignItems:'center', gap:10, background:'var(--surface2)', borderRadius:14, padding:'10px 12px', border:'1px solid var(--border)' },
    footer: { borderTop:'1px solid var(--border)', padding:'14px 18px', display:'flex', flexDirection:'column' as const, gap:12, flexShrink:0 },
    // Inputs
    inputWrap: { display:'flex', alignItems:'center', gap:8, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:'0 12px', height:40 },
    // Pay buttons
    payMethods: { display:'flex', gap:6 },
    // Totals
    totalBox: { background:'var(--surface2)', borderRadius:16, padding:'14px', border:'1px solid var(--border)' },
    totalRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
    totalDivider: { height:1, background:'var(--border)', margin:'10px 0' },
    // Checkout btn
    checkoutBtn: { width:'100%', padding:'14px', borderRadius:14, background:'var(--accent)', color:'#000', fontSize:12, fontWeight:900, textTransform:'uppercase' as const, letterSpacing:2, display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all .2s', cursor:'pointer' },
  };

  return (
    <div style={S.root}>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Success Modal */}
      {successModal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="zoom-in" style={{ background:'var(--surface)', border:'1px solid rgba(245,166,35,0.25)', borderRadius:28, padding:'40px 36px', maxWidth:380, width:'90%', textAlign:'center', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'var(--accent)', borderRadius:'28px 28px 0 0' }} />
            <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--accent)' }}>
              <Icon.Check />
            </div>
            <h2 style={{ fontSize:22, fontWeight:900, color:'var(--text)', marginBottom:4 }}>Sale Complete!</h2>
            <p style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:2, marginBottom:20 }}>
              Invoice: <span style={{ color:'var(--accent)' }}>{successModal.id}</span>
            </p>
            <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:16, padding:'16px', marginBottom:20, border:'1px solid var(--border)' }}>
              <p style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:4 }}>Customer</p>
              <p style={{ fontSize:16, fontWeight:800, color:'var(--text)', marginBottom:12 }}>{successModal.customer}</p>
              <p style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:4 }}>Amount Paid ({successModal.paymentMethod})</p>
              <p style={{ fontSize:32, fontWeight:900, color:'var(--text)', letterSpacing:-1 }}>{fmtINR(successModal.total)}</p>
            </div>
            <p style={{ fontSize:10, color:'var(--muted)', marginBottom:20 }}>PDF invoice is downloading automatically…</p>
            <div style={{ display:'flex', gap:12 }}>
              {successModal.invoiceUrl && (
                <button onClick={() => downloadPDF(successModal.invoiceUrl!, successModal.id)} style={{ flex:1, padding:'12px', borderRadius:12, background:'var(--accent)', color:'#000', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Icon.Download /> Re-download PDF
                </button>
              )}
              <button onClick={() => setSuccessModal(null)} style={{ flex:1, padding:'12px', borderRadius:12, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', fontSize:11, fontWeight:800 }}>
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div style={{ position:'fixed', inset:0, zIndex:900, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', justifyContent:'flex-end' }} onClick={() => setShowHistory(false)}>
          <div className="slide-in" style={{ width:360, height:'100%', background:'var(--surface)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:'20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:14, fontWeight:900, color:'var(--text)' }}>Session History</span>
              <button onClick={() => setShowHistory(false)} style={{ color:'var(--muted)' }}><Icon.X /></button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px' }}>
              {history.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px 0', color:'var(--muted)', fontSize:11 }}>No sales yet this session</div>
              ) : history.map(s => (
                <div key={s.id} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:14, padding:'14px', marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div>
                      <p style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{s.customer}</p>
                      <p style={{ fontSize:9, color:'var(--muted)', letterSpacing:1 }}>{s.id}</p>
                    </div>
                    <span style={{ fontSize:14, fontWeight:900, color:'var(--accent)' }}>{fmtINR(s.total)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:9, color:'var(--muted)' }}>{s.date} · {s.items} units · {s.paymentMethod}</span>
                    {s.invoiceUrl && (
                      <button onClick={() => downloadPDF(s.invoiceUrl!, s.id)} style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, fontWeight:700, color:'var(--accent)', background:'rgba(245,166,35,0.1)', padding:'4px 10px', borderRadius:8, border:'1px solid rgba(245,166,35,0.2)' }}>
                        <Icon.Download /> PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header style={S.topbar}>
        <div style={S.topLogo}>
          <div style={S.logoMark}>S</div>
          <div>
            <p style={S.logoText}>SmartShop</p>
            <p style={S.logoSub}>Point of Sale Terminal</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <Clock />
          {history.length > 0 && (
            <button onClick={() => setShowHistory(true)} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:'var(--muted)', background:'var(--surface2)', border:'1px solid var(--border)', padding:'6px 14px', borderRadius:10 }}>
              <Icon.Receipt /> History ({history.length})
            </button>
          )}
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--success)', boxShadow:'0 0 6px var(--success)' }} />
          <span style={{ fontSize:10, fontWeight:700, color:'var(--muted)', letterSpacing:1 }}>ONLINE</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={S.main}>

        {/* ── Left: Product Catalog ───────────────────────────────── */}
        <section style={S.left}>
          {/* Search + count */}
          <div style={S.leftBar}>
            <div style={S.searchWrap}>
              <span style={{ color:'var(--muted)', display:'flex' }}><Icon.Search /></span>
              <input
                ref={searchRef}
                style={S.searchInput}
                placeholder="Search products… (F2)"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button onClick={() => setSearch('')} style={{ color:'var(--muted)', display:'flex' }}><Icon.X /></button>}
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:'var(--muted)', whiteSpace:'nowrap' }}>
              {loading ? '…' : `${filtered.length} / ${products.length} items`}
            </span>
          </div>

          {/* Category Pills */}
          <div style={S.catBar}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding:'6px 14px', borderRadius:20, fontSize:10, fontWeight:800, whiteSpace:'nowrap',
                textTransform:'uppercase', letterSpacing:1.5, transition:'all .15s',
                background: activeCategory === cat ? 'var(--accent)' : 'var(--surface2)',
                color: activeCategory === cat ? '#000' : 'var(--muted)',
                border: activeCategory === cat ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div style={S.productGrid}>
            {loading ? (
              <div style={{ gridColumn:'1/-1', display:'flex', alignItems:'center', justifyContent:'center', gap:12, padding:'60px 0', color:'var(--muted)' }}>
                <Icon.Loader /> Loading catalog…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'var(--muted)', fontSize:12 }}>
                No products found
              </div>
            ) : filtered.map(p => {
              const cartEntry = cart.find(i => i.product.product_id === p.product_id);
              return (
                <ProductCard
                  key={p.product_id}
                  product={p}
                  cartQty={cartEntry?.qty ?? 0}
                  onAdd={() => addToCart(p)}
                  onRemove={() => removeFromCart(p.product_id)}
                />
              );
            })}
          </div>
        </section>

        {/* ── Right: Cart + Checkout ──────────────────────────────── */}
        <aside style={S.right}>
          {/* Cart header */}
          <div style={S.cartHeader}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(245,166,35,0.12)', border:'1px solid rgba(245,166,35,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)' }}>
                <Icon.Cart />
              </div>
              <span style={{ fontSize:14, fontWeight:900, color:'var(--text)', textTransform:'uppercase', letterSpacing:-0.5 }}>Cart</span>
            </div>
            {cart.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:10, fontWeight:800, color:'var(--muted)', background:'var(--surface2)', border:'1px solid var(--border)', padding:'3px 10px', borderRadius:20 }}>
                  {totalUnits} units
                </span>
                <button onClick={() => setCart([])} style={{ fontSize:9, fontWeight:800, color:'var(--danger)', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', padding:'4px 10px', borderRadius:8, textTransform:'uppercase', letterSpacing:1 }}>Clear</button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div style={S.cartItems}>
            {cart.length === 0 ? (
              <div style={S.cartEmpty}>
                <Icon.Grid />
                <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:2 }}>Cart empty</span>
                <span style={{ fontSize:9, color:'var(--muted)' }}>Click a product to add</span>
              </div>
            ) : cart.map(item => (
              <div key={item.product.product_id} style={S.cartItemRow}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:2 }}>{item.product.name}</p>
                  <p style={{ fontSize:11, fontWeight:900, color:'var(--accent)' }}>{fmtINR(item.product.price * item.qty)}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(0,0,0,0.3)', borderRadius:10, padding:'4px 6px', border:'1px solid var(--border)' }}>
                  <button onClick={() => removeFromCart(item.product.product_id)} style={{ width:22, height:22, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', transition:'all .15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)';e.currentTarget.style.color='var(--danger)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--muted)'}}><Icon.Minus /></button>
                  <span style={{ fontSize:12, fontWeight:900, color:'var(--text)', minWidth:18, textAlign:'center' }}>{item.qty}</span>
                  <button onClick={() => addToCart(item.product)} style={{ width:22, height:22, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', transition:'all .15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(245,166,35,0.2)';e.currentTarget.style.color='var(--accent)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--muted)'}}><Icon.Plus /></button>
                </div>
                <button onClick={() => deleteFromCart(item.product.product_id)} style={{ color:'var(--muted)', display:'flex', padding:4, borderRadius:6, transition:'all .15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.color='var(--danger)'}}
                  onMouseLeave={e=>{e.currentTarget.style.color='var(--muted)'}}><Icon.Trash /></button>
              </div>
            ))}
          </div>

          {/* Footer: Customer + Payment + Totals + Checkout */}
          <div style={S.footer}>
            {/* Customer name */}
            <div style={S.inputWrap}>
              <span style={{ color:'var(--muted)', display:'flex' }}><Icon.User /></span>
              <input
                style={{ flex:1, fontSize:12, fontWeight:600, color:'var(--text)' }}
                placeholder="Customer name (optional)"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
              />
            </div>

            {/* Payment method */}
            <div style={S.payMethods}>
              {PAY_METHODS.map(pm => (
                <button key={pm} onClick={() => setPayMethod(pm)} style={{
                  flex:1, padding:'8px 0', borderRadius:10, fontSize:9, fontWeight:800,
                  textTransform:'uppercase', letterSpacing:1, transition:'all .15s',
                  background: payMethod === pm ? 'var(--accent)' : 'var(--surface2)',
                  color: payMethod === pm ? '#000' : 'var(--muted)',
                  border: payMethod === pm ? '1px solid var(--accent)' : '1px solid var(--border)',
                }}>{pm}</button>
              ))}
            </div>

            {payMethod === "UPI" && cart.length > 0 && upiId && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', background:'rgba(0,0,0,0.4)', borderRadius:16, padding:14, border:'1px solid rgba(245,166,35,0.2)', marginBottom:14 }}>
                <span style={{ fontSize:9, fontWeight:800, color:'var(--accent)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:10 }}>Scan to Pay {fmtINR(total)}</span>
                <div style={{ background:'#fff', padding:10, borderRadius:12 }}>
                  <QRCodeSVG 
                    value={`upi://pay?pa=${upiId}&pn=Satguru%20SmartShop&am=${total}&cu=INR`}
                    size={110}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>
                <span style={{ fontSize:8, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginTop:8 }}>UPI ID: {upiId}</span>
              </div>
            )}

            {/* Totals */}
            <div style={S.totalBox}>
              <div style={S.totalRow}>
                <span style={{ fontSize:11, color:'var(--muted)', fontWeight:600 }}>Subtotal</span>
                <span style={{ fontSize:12, fontWeight:800, color:'var(--text)' }}>{fmtINR(subtotal)}</span>
              </div>
              <div style={S.totalRow}>
                <span style={{ fontSize:11, color:'var(--muted)', fontWeight:600 }}>GST (18%)</span>
                <span style={{ fontSize:12, fontWeight:800, color:'var(--text)' }}>{fmtINR(gstAmt)}</span>
              </div>
              <div style={S.totalDivider} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, fontWeight:800, color:'var(--accent)', textTransform:'uppercase', letterSpacing:2 }}>Total</span>
                <span style={{ fontSize:26, fontWeight:900, color:'var(--text)', letterSpacing:-1 }}>{fmtINR(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || checking}
              style={{ ...S.checkoutBtn, opacity: cart.length === 0 ? 0.3 : 1, cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if(cart.length > 0) e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
            >
              {checking ? <><Icon.Loader /> Processing…</> : <><Icon.Cart /> Checkout & Print Invoice</>}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
