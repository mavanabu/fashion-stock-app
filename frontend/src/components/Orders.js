import { useState, useEffect, useCallback } from 'react';
import { ordersApi, optionsApi } from '../api';
import OrderModal from './OrderModal';

const STATUS_LABELS = { unpaid: 'Unpaid', deposit_paid: 'Deposit Paid', fully_paid: 'Fully Paid' };
const STATUS_COLORS = {
  unpaid: { background: 'rgba(225,29,72,0.1)', color: '#e11d48', border: '1px solid rgba(225,29,72,0.2)' },
  deposit_paid: { background: 'rgba(217,119,6,0.1)', color: '#d97706', border: '1px solid rgba(217,119,6,0.2)' },
  fully_paid: { background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' },
};

const fmt = (n) => n != null ? Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB') : '—';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [options, setOptions] = useState({});
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);

  const sortSeasons = (seasons) => {
    const rank = (name) => {
      const m = name.match(/^(SS|FW)(\d+)$/i);
      if (!m) return [-9999, 0];
      return [parseInt(m[2], 10), m[1].toUpperCase() === 'FW' ? 0 : 1];
    };
    return [...seasons].sort((a, b) => {
      const [ya, sa] = rank(a.name);
      const [yb, sb] = rank(b.name);
      return ya !== yb ? yb - ya : sa - sb;
    });
  };

  const loadOptions = useCallback(async () => {
    const types = ['brands', 'seasons', 'stores', 'collections', 'payment_terms', 'transport_companies', 'weight_measurements'];
    const results = await Promise.all(types.map(t => optionsApi.list(t)));
    const opts = {};
    types.forEach((t, i) => { opts[t] = Array.isArray(results[i]) ? results[i] : []; });
    opts.seasons = sortSeasons(opts.seasons);
    setOptions(opts);
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await ordersApi.list();
    if (data.error) setError(data.error);
    else setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadOrders(); loadOptions(); }, [loadOrders, loadOptions]);

  const handleSave = async (form) => {
    const result = modal.mode === 'add'
      ? await ordersApi.create(form)
      : await ordersApi.update(modal.order.id, form);
    if (result.error) return result.error;
    await loadOrders();
    setModal(null);
    return null;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    await ordersApi.delete(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const filtered = orders.filter(o => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return [o.brand?.name, o.season?.name, o.store?.name, o.collection?.name]
      .some(v => v?.toLowerCase().includes(s));
  });


  const thStyle = {
    padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6b5f82',
    borderBottom: '1px solid #e5e0f3', whiteSpace: 'nowrap', background: '#f8f7fc',
  };

  return (
    <div style={{ padding: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1c1433', letterSpacing: '-0.5px' }}>
            Delivery Orders
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b5f82', fontSize: 14 }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          style={{
            padding: '11px 22px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: '#fff', border: 'none', borderRadius: 10,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.5)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'}
        >
          <span style={{ fontSize: 16 }}>+</span> New Order
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a89fc0', fontSize: 15 }}>🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by brand, season, store or collection…"
          style={{
            padding: '11px 14px 11px 40px', border: '1.5px solid #e5e0f3',
            borderRadius: 10, fontSize: 14, width: 380, outline: 'none',
            background: '#fff', color: '#1c1433',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = '#8b5cf6'}
          onBlur={e => e.target.style.borderColor = '#e5e0f3'}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b5f82' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading orders…
        </div>
      ) : error ? (
        <div style={{ color: '#e11d48', padding: 16, background: 'rgba(225,29,72,0.06)', borderRadius: 10, border: '1px solid rgba(225,29,72,0.15)' }}>{error}</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e0f3', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 40 }}></th>
                  <th style={thStyle}>Brand</th>
                  <th style={thStyle}>Season</th>
                  <th style={thStyle}>Store</th>
                  <th style={thStyle}>Collection</th>
                  <th style={thStyle}>Payment Terms</th>
                  <th style={thStyle}>Del</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 64, textAlign: 'center', color: '#6b5f82' }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {search ? 'No orders match your search' : 'No orders yet'}
                      </div>
                      <div style={{ fontSize: 13, color: '#a89fc0' }}>
                        {!search && 'Click "+ New Order" to get started'}
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((o) => {
                  const parts = (Array.isArray(o.parts) ? o.parts : []).filter(p =>
                    p.ordered_amount || p.delivery_amount || p.deposit_payment ||
                    p.delivery_qty || p.actual_delivery_date || p.invoice_date || p.payment_status
                  );
                  const isOpen = expanded[o.id];
                  const isHovered = hoveredRow === o.id;
                  return (
                    <>
                      <tr
                        key={o.id}
                        onMouseEnter={() => setHoveredRow(o.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          borderBottom: isOpen ? 'none' : '1px solid #f0eef8',
                          background: isHovered ? '#faf9fe' : '#fff',
                          transition: 'background 0.1s',
                        }}
                      >
                        <td style={{ padding: '12px 8px 12px 16px' }}>
                          {parts.length > 0 && (
                            <button onClick={() => toggleExpand(o.id)} style={{
                              background: isOpen ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.06)',
                              border: '1px solid rgba(124,58,237,0.15)',
                              cursor: 'pointer', color: '#7c3aed',
                              fontSize: 10, padding: '3px 6px', borderRadius: 6,
                              fontWeight: 700, lineHeight: 1, transition: 'all 0.15s',
                            }}>
                              {isOpen ? '▼' : '▶'}
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1c1433' }}>{o.brand?.name || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#6b5f82' }}>{o.season?.name || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#1c1433' }}>{o.store?.name || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#6b5f82' }}>{o.collection?.name || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#6b5f82' }}>{o.payment_term?.name || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: 'rgba(124,58,237,0.08)', color: '#7c3aed',
                            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                            border: '1px solid rgba(124,58,237,0.15)',
                          }}>
                            {parts.length} del{parts.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                          <button
                            onClick={() => setModal({ mode: 'edit', order: o })}
                            style={{
                              padding: '5px 14px', background: 'transparent',
                              border: '1.5px solid #e5e0f3', borderRadius: 7,
                              fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 6,
                              color: '#4a3f5c', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.color = '#7c3aed'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0f3'; e.currentTarget.style.color = '#4a3f5c'; }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(o.id)}
                            style={{
                              padding: '5px 14px', background: 'transparent',
                              border: '1.5px solid rgba(225,29,72,0.2)', borderRadius: 7,
                              fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              color: '#e11d48', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(225,29,72,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>

                      {/* Expanded parts */}
                      {isOpen && parts.length > 0 && (
                        <tr key={o.id + '-parts'} style={{ borderBottom: '1px solid #e5e0f3' }}>
                          <td colSpan={8} style={{ padding: '0 0 0 56px', background: 'linear-gradient(to right, #f5f3ff, #faf9ff)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid #ede9fe' }}>
                                  {['Part', 'Ordered Amt', 'Delivery Amt', 'Deposit', 'Del. Qty', 'Status', 'Del. Date', 'Invoice Date'].map((h, i) => (
                                    <th key={i} style={{
                                      padding: '9px 12px',
                                      textAlign: i > 0 && i < 5 ? 'right' : 'left',
                                      fontSize: 10, fontWeight: 700,
                                      textTransform: 'uppercase', letterSpacing: '0.5px',
                                      color: '#8b5cf6', whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {parts.map((p, pi) => (
                                  <tr key={pi} style={{ borderBottom: '1px solid #ede9fe' }}>
                                    <td style={{ padding: '9px 12px', fontWeight: 700, color: '#7c3aed' }}>
                                      <span style={{ background: 'rgba(124,58,237,0.1)', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>
                                        Del {p.part}
                                      </span>
                                    </td>
                                    <td style={{ padding: '9px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#1c1433' }}>{fmt(p.ordered_amount)}</td>
                                    <td style={{ padding: '9px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#1c1433' }}>{fmt(p.delivery_amount)}</td>
                                    <td style={{ padding: '9px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#1c1433' }}>{fmt(p.deposit_payment)}</td>
                                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#1c1433' }}>{p.delivery_qty ?? '—'}</td>
                                    <td style={{ padding: '9px 12px' }}>
                                      {p.payment_status ? (
                                        <span style={{ ...STATUS_COLORS[p.payment_status], padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                                          {STATUS_LABELS[p.payment_status]}
                                        </span>
                                      ) : '—'}
                                    </td>
                                    <td style={{ padding: '9px 12px', color: '#6b5f82', whiteSpace: 'nowrap' }}>{fmtDate(p.actual_delivery_date)}</td>
                                    <td style={{ padding: '9px 12px', color: '#6b5f82', whiteSpace: 'nowrap' }}>{fmtDate(p.invoice_date)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr style={{ background: 'rgba(124,58,237,0.07)', borderTop: '2px solid #ede9fe' }}>
                                  <td style={{ padding: '10px 12px', fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Total
                                  </td>
                                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#1c1433', fontVariantNumeric: 'tabular-nums' }}>
                                    {fmt(parts.reduce((s, p) => s + Number(p.ordered_amount || 0), 0))}
                                  </td>
                                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#2563eb', fontVariantNumeric: 'tabular-nums' }}>
                                    {fmt(parts.reduce((s, p) => s + Number(p.delivery_amount || 0), 0))}
                                  </td>
                                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                                    {fmt(parts.reduce((s, p) => s + Number(p.deposit_payment || 0), 0))}
                                  </td>
                                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#d97706' }}>
                                    {parts.reduce((s, p) => s + Number(p.delivery_qty || 0), 0).toLocaleString()}
                                  </td>
                                  <td colSpan={3} />
                                </tr>
                              </tfoot>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <OrderModal mode={modal.mode} order={modal.order} options={options} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
