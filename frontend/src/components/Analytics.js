import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api';

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_LABELS = { unpaid: 'Unpaid', deposit_paid: 'Deposit Paid', fully_paid: 'Fully Paid' };
const STATUS_COLORS = { unpaid: '#e11d48', deposit_paid: '#d97706', fully_paid: '#059669' };

function StatCard({ label, value, sub, gradient, icon }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #e5e0f3',
      padding: '20px 22px', position: 'relative', overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: gradient || 'rgba(124,58,237,0.08)',
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#a89fc0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#1c1433', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#a89fc0', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function HBar({ label, value, max, color, fmtFn }) {
  const pct = max > 0 ? Math.max(3, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#1c1433', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color: '#6b5f82', fontWeight: 600 }}>{fmtFn ? fmtFn(value) : value}</span>
      </div>
      <div style={{ background: '#f0eef8', borderRadius: 20, height: 7, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 20,
          background: color || '#7c3aed',
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #e5e0f3',
      padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    }}>
      <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: '#1c1433', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
      </h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await ordersApi.list();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ padding: 80, textAlign: 'center', color: '#6b5f82' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
      Loading analytics…
    </div>
  );

  const allParts = orders.flatMap(o => (Array.isArray(o.parts) ? o.parts.map(p => ({ ...p, order: o })) : []));

  const totalOrdered = allParts.reduce((s, p) => s + Number(p.ordered_amount || 0), 0);
  const totalDelivery = allParts.reduce((s, p) => s + Number(p.delivery_amount || 0), 0);
  const totalDeposit = allParts.reduce((s, p) => s + Number(p.deposit_payment || 0), 0);
  const totalQty = allParts.reduce((s, p) => s + Number(p.delivery_qty || 0), 0);
  const outstanding = totalOrdered - totalDelivery;

  const statusGroups = {};
  allParts.forEach(p => { const s = p.payment_status || 'unpaid'; statusGroups[s] = (statusGroups[s] || 0) + 1; });
  const maxStatus = Math.max(...Object.values(statusGroups), 1);

  const brandGroups = {};
  orders.forEach(o => { const n = o.brand?.name || 'Unknown'; brandGroups[n] = (brandGroups[n] || 0) + 1; });
  const brandEntries = Object.entries(brandGroups).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxBrand = Math.max(...brandEntries.map(e => e[1]), 1);

  const seasonGroups = {};
  orders.forEach(o => { const n = o.season?.name || 'Unknown'; seasonGroups[n] = (seasonGroups[n] || 0) + 1; });
  const seasonEntries = Object.entries(seasonGroups).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxSeason = Math.max(...seasonEntries.map(e => e[1]), 1);

  const brandAmounts = {};
  orders.forEach(o => {
    const n = o.brand?.name || 'Unknown';
    const total = (o.parts || []).reduce((s, p) => s + Number(p.ordered_amount || 0), 0);
    brandAmounts[n] = (brandAmounts[n] || 0) + total;
  });
  const brandAmountEntries = Object.entries(brandAmounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxBrandAmt = Math.max(...brandAmountEntries.map(e => e[1]), 1);

  const paidCount = statusGroups['fully_paid'] || 0;
  const paymentRate = allParts.length > 0 ? Math.round((paidCount / allParts.length) * 100) : 0;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1c1433', letterSpacing: '-0.5px' }}>Analytics</h1>
        <p style={{ margin: '4px 0 0', color: '#6b5f82', fontSize: 14 }}>
          {orders.length} orders · {allParts.filter(p => p.ordered_amount || p.delivery_qty).length} parts with data
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon="📦" label="Total Orders" value={orders.length} sub={`${allParts.length} parts total`} gradient="rgba(124,58,237,0.08)" />
        <StatCard icon="💰" label="Ordered Amount" value={`€${fmt(totalOrdered)}`} gradient="rgba(139,92,246,0.1)" />
        <StatCard icon="🚚" label="Delivery Amount" value={`€${fmt(totalDelivery)}`} gradient="rgba(37,99,235,0.08)" />
        <StatCard icon="🏦" label="Deposit Collected" value={`€${fmt(totalDeposit)}`} gradient="rgba(5,150,105,0.08)" />
        <StatCard
          icon="⚠️" label="Outstanding"
          value={`€${fmt(outstanding)}`}
          sub="Ordered − Delivered"
          gradient={outstanding > 0 ? "rgba(225,29,72,0.08)" : "rgba(5,150,105,0.08)"}
        />
        <StatCard icon="📐" label="Total Del. Qty" value={totalQty.toLocaleString()} sub="units across all parts" gradient="rgba(217,119,6,0.08)" />
        <StatCard
          icon="✅" label="Payment Rate"
          value={`${paymentRate}%`}
          sub="fully paid parts"
          gradient={paymentRate >= 75 ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)"}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Section icon="💳" title="Payment Status">
          {Object.keys(STATUS_LABELS).map(s => (
            <HBar key={s} label={STATUS_LABELS[s]} value={statusGroups[s] || 0} max={maxStatus} color={STATUS_COLORS[s]} />
          ))}
          {allParts.length === 0 && <p style={{ color: '#a89fc0', fontSize: 13, textAlign: 'center' }}>No data yet</p>}
        </Section>

        <Section icon="🌸" title="Orders by Season">
          {seasonEntries.length === 0
            ? <p style={{ color: '#a89fc0', fontSize: 13, textAlign: 'center' }}>No data yet</p>
            : seasonEntries.map(([name, count]) => (
              <HBar key={name} label={name} value={count} max={maxSeason} color="#06b6d4" />
            ))}
        </Section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Section icon="🏷️" title="Orders by Brand">
          {brandEntries.length === 0
            ? <p style={{ color: '#a89fc0', fontSize: 13, textAlign: 'center' }}>No data yet</p>
            : brandEntries.map(([name, count]) => (
              <HBar key={name} label={name} value={count} max={maxBrand} color="#8b5cf6" />
            ))}
        </Section>

        <Section icon="💰" title="Ordered Amount by Brand">
          {brandAmountEntries.length === 0
            ? <p style={{ color: '#a89fc0', fontSize: 13, textAlign: 'center' }}>No data yet</p>
            : brandAmountEntries.map(([name, amt]) => (
              <HBar key={name} label={name} value={amt} max={maxBrandAmt} color="#f59e0b"
                fmtFn={(v) => `€${fmt(v)}`} />
            ))}
        </Section>
      </div>
    </div>
  );
}
