import { useState, useRef, useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: '' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'deposit_paid', label: 'Deposit Paid' },
  { value: 'fully_paid', label: 'Fully Paid' },
];

const emptyInfo = () => ({
  brand_id: '', season_id: '', store_id: '', collection_id: '', payment_terms_id: '',
  total_order_value_status: '', deposit_payments_only: '',
});

const emptyPart = (part) => ({
  ordered_amount: null, delivery_amount: null, deposit_payment: null,
  delivery_qty: null, payment_status: '',
  actual_delivery_date: '', invoice_date: '', part: String(part),
  delivery_amount_1: null, delivery_qty_1: null, invoice_date_del_1: '',
  payment_status_del_1: '', actual_payment_date_1: '',
  total_pallets_boxes_1: null, total_volume_m3_1: null, weight_1: null,
  weight_measurement_1: '', transport_company_1: '', transport_price_1: null,
  confirmation_date_forwarder_1: '', pickup_date_1: '', departure_date_1: '',
  eta_1: '', actual_arrival_date_1: '', truck_number_1: '',
  transport_invoice_n_1: '', transport_invoice_status_1: '', delay_reason_1: '',
});

const partHasData = (p) => p &&
  (p.ordered_amount || p.delivery_amount || p.delivery_qty ||
   p.deposit_payment || p.actual_delivery_date || p.invoice_date);

const inputStyle = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e5e0f3',
  borderRadius: 9, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  background: '#faf9fe', color: '#1c1433', transition: 'border-color 0.15s',
};

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b5f82', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Sel({ value, onChange, opts = [], placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
      <option value="">{placeholder}</option>
      {opts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  );
}

function SearchSelect({ value, onChange, opts = [], placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const selected = opts.find(o => o.id === value);
  const filtered = opts.filter(o => o.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (o) => { onChange(o.id); setQuery(''); setOpen(false); };
  const handleClear = (e) => { e.stopPropagation(); onChange(''); setQuery(''); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        style={{
          ...inputStyle, display: 'flex', alignItems: 'center', cursor: 'pointer',
          justifyContent: 'space-between', userSelect: 'none',
        }}
      >
        <span style={{ color: selected ? '#1c1433' : '#a89fc0', fontSize: 13 }}>
          {selected ? selected.name : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {selected && (
            <span onClick={handleClear} style={{ color: '#a89fc0', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>×</span>
          )}
          <span style={{ color: '#a89fc0', fontSize: 10 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: '#fff', border: '1.5px solid #8b5cf6', borderRadius: 9,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4, overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0eef8' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', padding: '6px 10px', border: '1px solid #e5e0f3',
                borderRadius: 7, fontSize: 13, outline: 'none', background: '#faf9fe',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '10px 14px', color: '#a89fc0', fontSize: 13 }}>No results</div>
            ) : filtered.map(o => (
              <div
                key={o.id}
                onClick={() => handleSelect(o)}
                style={{
                  padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                  background: o.id === value ? 'rgba(124,58,237,0.08)' : 'transparent',
                  color: o.id === value ? '#7c3aed' : '#1c1433',
                  fontWeight: o.id === value ? 600 : 400,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (o.id !== value) e.currentTarget.style.background = '#f8f7fc'; }}
                onMouseLeave={e => { if (o.id !== value) e.currentTarget.style.background = 'transparent'; }}
              >
                {o.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FocusInput(props) {
  return (
    <input
      {...props}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = '#8b5cf6'}
      onBlur={e => e.target.style.borderColor = '#e5e0f3'}
    />
  );
}

export default function OrderModal({ mode, order, options, onSave, onClose }) {
  const [editInfo, setEditInfo] = useState(() => mode === 'edit' && order ? {
    brand_id: order.brand_id || '',
    season_id: order.season_id || '',
    store_id: order.store_id || '',
    collection_id: order.collection_id || '',
    payment_terms_id: order.payment_terms_id || '',
    total_order_value_status: order.total_order_value_status || '',
    deposit_payments_only: order.deposit_payments_only || '',
  } : null);

  const [editParts, setEditParts] = useState(() => {
    if (mode !== 'edit' || !order) return [1,2,3,4,5,6].map(emptyPart);
    const existing = Array.isArray(order.parts) ? order.parts : [];
    return [1,2,3,4,5,6].map((n, i) => existing[i] ? { ...emptyPart(n), ...existing[i] } : emptyPart(n));
  });

  const [info, setInfo] = useState(emptyInfo);
  const [parts, setParts] = useState(() => [1,2,3,4,5,6].map(emptyPart));
  const [activeTab, setActiveTab] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const currentInfo = mode === 'edit' ? editInfo : info;
  const currentParts = mode === 'edit' ? editParts : parts;

  const setInfoField = (k, v) => {
    if (mode === 'edit') setEditInfo(prev => ({ ...prev, [k]: v }));
    else setInfo(prev => ({ ...prev, [k]: v }));
  };

  const setPartField = (k, v) => {
    if (mode === 'edit') setEditParts(prev => prev.map((p, i) => i === activeTab ? { ...p, [k]: v } : p));
    else setParts(prev => prev.map((p, i) => i === activeTab ? { ...p, [k]: v } : p));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (mode === 'edit') {
      const err = await onSave({ ...editInfo, parts: editParts });
      if (err) { setError(err); setSaving(false); }
      return;
    }

    const filled = parts.filter(partHasData);
    if (filled.length === 0) {
      setError('Fill in at least one Del tab before saving.');
      setSaving(false);
      return;
    }
    const err = await onSave({ ...info, parts: filled });
    if (err) { setError(err); setSaving(false); return; }
  };

  const TABS = [
    { id: -1, label: 'Info' },
    ...[0,1,2,3,4,5].map(i => ({ id: i, label: `Del ${i + 1}` })),
  ];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(13, 9, 31, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 1100,
        maxHeight: '92vh', overflow: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 26px', borderBottom: '1px solid #f0eef8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 2,
          borderRadius: '16px 16px 0 0',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1c1433', letterSpacing: '-0.3px' }}>
              {mode === 'add' ? 'New Order' : 'Edit Order'}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b5f82' }}>
              {mode === 'add' ? 'Fill in the details across tabs' : 'Update order details'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#f0eef8', border: 'none', width: 32, height: 32, borderRadius: '50%',
            fontSize: 18, cursor: 'pointer', color: '#6b5f82', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #f0eef8',
          padding: '0 20px', position: 'sticky', top: 69,
          background: '#fff', zIndex: 1, overflowX: 'auto', gap: 2,
        }}>
          {TABS.map(tab => {
            const filled = tab.id === -1
              ? (currentInfo?.brand_id || currentInfo?.season_id || currentInfo?.store_id)
              : partHasData(currentParts[tab.id]);
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{
                padding: '12px 14px', border: 'none', background: 'transparent',
                fontSize: 13, fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap',
                color: isActive ? '#7c3aed' : filled ? '#1c1433' : '#a89fc0',
                borderBottom: `2px solid ${isActive ? '#7c3aed' : 'transparent'}`,
                marginBottom: -1, cursor: 'pointer', position: 'relative',
                transition: 'all 0.15s',
              }}>
                {tab.label}
                {filled && !isActive && (
                  <span style={{
                    position: 'absolute', top: 8, right: 5,
                    width: 5, height: 5, borderRadius: '50%', background: '#8b5cf6',
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} style={{ padding: 26 }}>

          {/* Info tab */}
          {activeTab === -1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Brand">
                <SearchSelect value={currentInfo.brand_id} onChange={v => setInfoField('brand_id', v)} opts={options.brands} placeholder="Search brand…" />
              </Field>
              <Field label="Season">
                <SearchSelect value={currentInfo.season_id} onChange={v => setInfoField('season_id', v)} opts={options.seasons} placeholder="Search season…" />
              </Field>
              <Field label="Store">
                <SearchSelect value={currentInfo.store_id} onChange={v => setInfoField('store_id', v)} opts={options.stores} placeholder="Search store…" />
              </Field>
              <Field label="Collection">
                <SearchSelect value={currentInfo.collection_id} onChange={v => setInfoField('collection_id', v)} opts={options.collections} placeholder="Search collection…" />
              </Field>
              <Field label="Payment Terms">
                <Sel value={currentInfo.payment_terms_id} onChange={v => setInfoField('payment_terms_id', v)} opts={options.payment_terms} placeholder="Select terms" />
              </Field>
              <Field label="Total Order Value">
                <div style={{
                  ...inputStyle, display: 'flex', alignItems: 'center',
                  background: '#f0eef8', color: '#7c3aed', fontWeight: 700, fontSize: 14,
                }}>
                  {currentParts.reduce((s, p) => s + Number(p.ordered_amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </Field>
              <Field label="Total Order Value Status">
                <select value={currentInfo.total_order_value_status} onChange={e => setInfoField('total_order_value_status', e.target.value)} style={inputStyle}>
                  <option value="">— Select —</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </Field>
              <Field label="Deposit Payments Only">
                <FocusInput type="number" step="0.01" min="0" value={currentInfo.deposit_payments_only}
                  onChange={e => setInfoField('deposit_payments_only', e.target.value)} placeholder="0.00" />
              </Field>
            </div>
          )}

          {/* Part tabs */}
          {activeTab >= 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
              <Field label="Ordered Amount">
                <FocusInput type="number" step="0.01" min="0" value={currentParts[activeTab].ordered_amount}
                  onChange={e => setPartField('ordered_amount', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Delivery Amount">
                <FocusInput type="number" step="0.01" min="0" value={currentParts[activeTab].delivery_amount}
                  onChange={e => setPartField('delivery_amount', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Deposit Payment">
                <FocusInput type="number" step="0.01" min="0" value={currentParts[activeTab].deposit_payment}
                  onChange={e => setPartField('deposit_payment', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Delivery Qty">
                <FocusInput type="number" step="1" min="0" value={currentParts[activeTab].delivery_qty}
                  onChange={e => setPartField('delivery_qty', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Payment Status">
                <select value={currentParts[activeTab].payment_status} onChange={e => setPartField('payment_status', e.target.value)} style={inputStyle}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Actual Delivery Date">
                <FocusInput type="date" value={currentParts[activeTab].actual_delivery_date}
                  onChange={e => setPartField('actual_delivery_date', e.target.value)} />
              </Field>
              <Field label="Invoice Date">
                <FocusInput type="date" value={currentParts[activeTab].invoice_date}
                  onChange={e => setPartField('invoice_date', e.target.value)} />
              </Field>
              <Field label="1st Delivery Amount">
                <FocusInput type="number" step="0.01" min="0" value={currentParts[activeTab].delivery_amount_1}
                  onChange={e => setPartField('delivery_amount_1', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="1st Delivery Qty">
                <FocusInput type="number" step="1" min="0" value={currentParts[activeTab].delivery_qty_1}
                  onChange={e => setPartField('delivery_qty_1', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Invoice Date Del.">
                <FocusInput type="date" value={currentParts[activeTab].invoice_date_del_1}
                  onChange={e => setPartField('invoice_date_del_1', e.target.value)} />
              </Field>
              <Field label="Payment Status Del.">
                <select value={currentParts[activeTab].payment_status_del_1} onChange={e => setPartField('payment_status_del_1', e.target.value)} style={inputStyle}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Actual Payment Date">
                <FocusInput type="date" value={currentParts[activeTab].actual_payment_date_1}
                  onChange={e => setPartField('actual_payment_date_1', e.target.value)} />
              </Field>
              <Field label="Total N of Pallets/Boxes">
                <FocusInput type="number" step="1" min="0" value={currentParts[activeTab].total_pallets_boxes_1}
                  onChange={e => setPartField('total_pallets_boxes_1', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Total Volume M3">
                <FocusInput type="number" step="0.01" min="0" value={currentParts[activeTab].total_volume_m3_1}
                  onChange={e => setPartField('total_volume_m3_1', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Weight">
                <FocusInput type="number" step="0.01" min="0" value={currentParts[activeTab].weight_1}
                  onChange={e => setPartField('weight_1', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Weight Measurement">
                <SearchSelect value={currentParts[activeTab].weight_measurement_1} onChange={v => setPartField('weight_measurement_1', v)} opts={options.weight_measurements || []} placeholder="Select measurement…" />
              </Field>
              <Field label="Transport Company">
                <SearchSelect value={currentParts[activeTab].transport_company_1} onChange={v => setPartField('transport_company_1', v)} opts={options.transport_companies || []} placeholder="Search company…" />
              </Field>
              <Field label="Transport Price">
                <FocusInput type="number" step="0.01" min="0" value={currentParts[activeTab].transport_price_1}
                  onChange={e => setPartField('transport_price_1', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Confirmation Date to Forwarder">
                <FocusInput type="date" value={currentParts[activeTab].confirmation_date_forwarder_1}
                  onChange={e => setPartField('confirmation_date_forwarder_1', e.target.value)} />
              </Field>
              <Field label="Pick-up Date">
                <FocusInput type="date" value={currentParts[activeTab].pickup_date_1}
                  onChange={e => setPartField('pickup_date_1', e.target.value)} />
              </Field>
              <Field label="Departure Date">
                <FocusInput type="date" value={currentParts[activeTab].departure_date_1}
                  onChange={e => setPartField('departure_date_1', e.target.value)} />
              </Field>
              <Field label="ETA">
                <FocusInput type="date" value={currentParts[activeTab].eta_1}
                  onChange={e => setPartField('eta_1', e.target.value)} />
              </Field>
              <Field label="Actual Arrival Date">
                <FocusInput type="date" value={currentParts[activeTab].actual_arrival_date_1}
                  onChange={e => setPartField('actual_arrival_date_1', e.target.value)} />
              </Field>
              <Field label="Truck Number">
                <FocusInput type="text" value={currentParts[activeTab].truck_number_1}
                  onChange={e => setPartField('truck_number_1', e.target.value)} placeholder="" />
              </Field>
              <Field label="Transportation Invoice N">
                <FocusInput type="text" value={currentParts[activeTab].transport_invoice_n_1}
                  onChange={e => setPartField('transport_invoice_n_1', e.target.value)} placeholder="" />
              </Field>
              <Field label="Transportation Invoice Status">
                <FocusInput type="text" value={currentParts[activeTab].transport_invoice_status_1}
                  onChange={e => setPartField('transport_invoice_status_1', e.target.value)} placeholder="" />
              </Field>
              <Field label="Delay Reason">
                <FocusInput type="text" value={currentParts[activeTab].delay_reason_1}
                  onChange={e => setPartField('delay_reason_1', e.target.value)} placeholder="" />
              </Field>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 18, padding: '10px 14px', background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, color: '#e11d48', fontSize: 13 }}>
              {error}
            </div>
          )}

          {mode === 'add' && (
            <p style={{ fontSize: 12, color: '#a89fc0', margin: '14px 0 0' }}>
              {parts.filter(partHasData).length} of 6 parts filled — all saved as one order.
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 22px', background: '#f0eef8',
              border: '1.5px solid #e5e0f3', borderRadius: 9,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#4a3f5c',
            }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{
              padding: '10px 26px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 9,
              fontSize: 13, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              boxShadow: saving ? 'none' : '0 4px 14px rgba(124,58,237,0.35)',
            }}>
              {saving ? 'Saving…' : mode === 'add' ? 'Create Order' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
