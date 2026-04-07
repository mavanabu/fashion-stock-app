import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { optionsApi } from '../api';

const DEL_FIELDS_ORDER_KEY = 'del_fields_order';

const DEL_FIELDS_ALL = [
  { key: 'total_order_value',             label: 'Total Order Value' },
  { key: 'total_order_quantity',           label: 'Total Order Quantity' },
  { key: 'paid_amount',                    label: 'Paid Amount' },
  { key: 'invoice_date',                   label: 'Invoice Date' },
  { key: 'delivery_amount_1',              label: 'Delivery Amount' },
  { key: 'delivery_qty_1',                 label: 'Delivery Qty' },
  { key: 'balance_amount',                 label: 'Balance Amount' },
  { key: 'balance_qty',                    label: 'Balance Qty' },
  { key: 'payment_status_del_1',           label: 'Payment Status Del.' },
  { key: 'actual_payment_date_1',          label: 'Actual Payment Date' },
  { key: 'total_pallets_boxes_1',          label: 'Total N of Pallets/Boxes' },
  { key: 'total_volume_m3_1',              label: 'Total Volume M3' },
  { key: 'weight_1',                       label: 'Weight KG' },
  { key: 'transport_company_1',            label: 'Transport Company' },
  { key: 'transport_price_1',              label: 'Transport Price' },
  { key: 'confirmation_date_forwarder_1',  label: 'Conf. Date to Forwarder' },
  { key: 'pickup_date_1',                  label: 'Pick-up Date' },
  { key: 'departure_date_1',               label: 'Departure Date' },
  { key: 'eta_1',                          label: 'ETA' },
  { key: 'actual_arrival_date_1',          label: 'Actual Arrival Date' },
  { key: 'truck_number_1',                 label: 'Truck Number' },
  { key: 'transport_invoice_n_1',          label: 'Transportation Invoice N' },
  { key: 'transport_invoice_status_1',     label: 'Transportation Invoice Status' },
  { key: 'delay_reason_1',                 label: 'Delay Reason' },
  { key: 'confirmation_date_shipper_1',    label: 'Confirmation Date to Shipper' },
  { key: 'documents_receiving_date_1',     label: 'Documents Receiving Date' },
];

function loadSavedOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEL_FIELDS_ORDER_KEY));
    if (!Array.isArray(saved) || saved.length === 0) return DEL_FIELDS_ALL;
    const byKey = Object.fromEntries(DEL_FIELDS_ALL.map(f => [f.key, f]));
    const ordered = saved.map(k => byKey[k]).filter(Boolean);
    const savedSet = new Set(saved);
    DEL_FIELDS_ALL.forEach(f => { if (!savedSet.has(f.key)) ordered.push(f); });
    return ordered;
  } catch {
    return DEL_FIELDS_ALL;
  }
}

function DelFieldsEditor() {
  const [fields, setFields] = useState(loadSavedOrder);
  const [savedMsg, setSavedMsg] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItem = useRef(null);

  const handleDragStart = (i) => { dragItem.current = i; };
  const handleDragEnter = (i) => { setDragOverIndex(i); };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverIndex === null || dragItem.current === dragOverIndex) {
      dragItem.current = null;
      setDragOverIndex(null);
      return;
    }
    const next = [...fields];
    const [moved] = next.splice(dragItem.current, 1);
    next.splice(dragOverIndex, 0, moved);
    dragItem.current = null;
    setDragOverIndex(null);
    setFields(next);
  };

  const handleSave = () => {
    localStorage.setItem(DEL_FIELDS_ORDER_KEY, JSON.stringify(fields.map(f => f.key)));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleReset = () => {
    setFields(DEL_FIELDS_ALL);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e0f3', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #f0eef8',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to right, #faf9fe, #f5f3ff)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⠿</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1c1433' }}>Del Tab Field Order</h3>
            <p style={{ margin: 0, fontSize: 11, color: '#a89fc0' }}>Drag rows to reorder fields in every Del tab</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleReset}
            style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#f0eef8', color: '#6b5f82', border: '1px solid #e5e0f3', borderRadius: 8 }}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: savedMsg ? 'rgba(5,150,105,0.1)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: savedMsg ? '#059669' : '#fff',
              border: savedMsg ? '1px solid rgba(5,150,105,0.3)' : 'none', borderRadius: 8,
              boxShadow: savedMsg ? 'none' : '0 3px 10px rgba(124,58,237,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {savedMsg ? '✓ Saved!' : 'Save Order'}
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {fields.map((field, i) => (
          <div
            key={field.key}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 14px', borderRadius: 9,
              background: dragOverIndex === i ? '#f0eef8' : '#f8f7fc',
              border: `1.5px solid ${dragOverIndex === i ? '#8b5cf6' : '#ede9f6'}`,
              cursor: 'grab', transition: 'background 0.1s, border-color 0.1s',
              userSelect: 'none',
            }}
          >
            <span style={{ color: '#c4b8d8', fontSize: 16, lineHeight: 1, letterSpacing: -1, fontWeight: 700 }}>⠿</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a89fc0', minWidth: 22, textAlign: 'right' }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: '#1c1433', fontWeight: 500 }}>{field.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const OPTION_TYPES = [
  { key: 'brands', label: 'Brands', icon: '🏷️', placeholder: 'Add brand…' },
  { key: 'seasons', label: 'Seasons', icon: '🌸', placeholder: 'e.g. SS25, AW25…' },
  { key: 'stores', label: 'Stores', icon: '🏪', placeholder: 'Add store…' },
  { key: 'collections', label: 'Collections', icon: '👗', placeholder: 'Add collection…' },
  { key: 'payment_terms', label: 'Payment Terms', icon: '💳', placeholder: 'e.g. 30 days, Proforma…' },
  { key: 'transport_companies', label: 'Transport Companies', icon: '🚚', placeholder: 'Add transport company…' },
  { key: 'weight_measurements', label: 'Weight Measurements', icon: '⚖️', placeholder: 'e.g. kg, lbs, ton…' },
];

function OptionGroup({ typeKey, label, icon, placeholder }) {
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [error, setError] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const fileRef = useRef();

  const load = useCallback(async () => {
    const data = await optionsApi.list(typeKey);
    setItems(Array.isArray(data) ? data : []);
  }, [typeKey]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);
    const data = await optionsApi.create(typeKey, newName.trim());
    if (data.error) {
      setError(data.error);
    } else {
      setNewName('');
      await load();
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    setError(null);
    const result = await optionsApi.delete(typeKey, id);
    if (result?.error) { setError(result.error); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirmId(null);
  };

  const handleExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    setUploadMsg(null);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const names = rows.flat().map(v => v?.toString().trim()).filter(Boolean);
      if (names.length === 0) { setError('No values found in file.'); setUploading(false); return; }
      const result = await optionsApi.bulk(typeKey, names);
      if (result.error) { setError(result.error); }
      else {
        setUploadMsg(`${result.length} item${result.length !== 1 ? 's' : ''} imported`);
        await load();
        setTimeout(() => setUploadMsg(null), 3000);
      }
    } catch {
      setError('Failed to read file.');
    }
    setUploading(false);
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #e5e0f3',
      overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.15s',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f0eef8',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to right, #faf9fe, #f5f3ff)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>{icon}</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1c1433' }}>{label}</h3>
            <p style={{ margin: 0, fontSize: 11, color: '#a89fc0' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#7c3aed',
            background: 'rgba(124,58,237,0.1)', padding: '4px 10px', borderRadius: 20,
            border: '1px solid rgba(124,58,237,0.15)',
          }}>{items.length}</span>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} style={{ display: 'none' }} />
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            title="Import from Excel"
            style={{
              padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
              background: uploading ? '#f0eef8' : 'rgba(5,150,105,0.08)',
              color: uploading ? '#a89fc0' : '#059669',
              border: '1px solid rgba(5,150,105,0.2)', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {uploading ? '⏳ Importing…' : '📥 Excel'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1, padding: '9px 13px', border: '1.5px solid #e5e0f3',
              borderRadius: 9, fontSize: 13, outline: 'none',
              background: '#faf9fe', color: '#1c1433', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#8b5cf6'}
            onBlur={e => e.target.style.borderColor = '#e5e0f3'}
          />
          <button
            type="submit" disabled={adding || !newName.trim()}
            style={{
              padding: '9px 18px',
              background: adding || !newName.trim() ? '#e5e0f3' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: adding || !newName.trim() ? '#a89fc0' : '#fff',
              border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700,
              cursor: adding || !newName.trim() ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
              boxShadow: adding || !newName.trim() ? 'none' : '0 3px 10px rgba(124,58,237,0.3)',
            }}
          >
            {adding ? '…' : 'Add'}
          </button>
        </form>

        {error && <p style={{ color: '#e11d48', fontSize: 12, margin: '0 0 10px', padding: '8px 12px', background: 'rgba(225,29,72,0.06)', borderRadius: 7 }}>{error}</p>}
        {uploadMsg && <p style={{ color: '#059669', fontSize: 12, margin: '0 0 10px', padding: '8px 12px', background: 'rgba(5,150,105,0.06)', borderRadius: 7 }}>✓ {uploadMsg}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#a89fc0' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📭</div>
              <p style={{ margin: 0, fontSize: 13 }}>No {label.toLowerCase()} yet</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', padding: '8px 12px',
              borderRadius: 9, background: '#f8f7fc', border: '1px solid #ede9f6',
              transition: 'background 0.1s',
            }}>
              <span style={{ flex: 1, fontSize: 13, color: '#1c1433', fontWeight: 500 }}>{item.name}</span>
              {confirmId === item.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#6b5f82' }}>Delete?</span>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '2px 10px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Yes</button>
                  <button onClick={() => setConfirmId(null)} style={{ padding: '2px 10px', background: '#f0eef8', color: '#6b5f82', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>No</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b8d8', fontSize: 16, padding: '2px 4px', borderRadius: 5, lineHeight: 1, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e11d48'}
                  onMouseLeave={e => e.currentTarget.style.color = '#c4b8d8'}
                >×</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Options() {
  const [activeSection, setActiveSection] = useState('lists');

  const tabStyle = (key) => ({
    padding: '10px 20px', border: 'none', background: 'transparent',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    color: activeSection === key ? '#7c3aed' : '#6b5f82',
    borderBottom: `2px solid ${activeSection === key ? '#7c3aed' : 'transparent'}`,
    marginBottom: -1, transition: 'all 0.15s',
  });

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1c1433', letterSpacing: '-0.5px' }}>Options</h1>
        <p style={{ margin: '4px 0 0', color: '#6b5f82', fontSize: 14 }}>
          Manage dropdown options and Del tab layout
        </p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e5e0f3', marginBottom: 28 }}>
        <button style={tabStyle('lists')} onClick={() => setActiveSection('lists')}>Lists</button>
        <button style={tabStyle('del_fields')} onClick={() => setActiveSection('del_fields')}>Del Fields Order</button>
      </div>

      {activeSection === 'lists' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
          {OPTION_TYPES.map(t => (
            <OptionGroup key={t.key} typeKey={t.key} label={t.label} icon={t.icon} placeholder={t.placeholder} />
          ))}
        </div>
      )}

      {activeSection === 'del_fields' && (
        <div style={{ maxWidth: 560 }}>
          <DelFieldsEditor />
        </div>
      )}
    </div>
  );
}
