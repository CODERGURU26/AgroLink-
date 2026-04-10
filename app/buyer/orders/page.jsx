'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

export default function BuyerOrders() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'buyer')) router.push('/login');
  }, [user, loading, router]);

  const fetchOrders = () => {
    if (!user) return;
    fetch(`/api/orders?buyerId=${user.id}`)
      .then(r => r.json())
      .then(setOrders)
      .catch(() => { });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading || !user) return null;

  // Tab grouping:
  // "Active Deliveries" = confirmed (paid, farmer working) + in_progress (packed/in transit)
  // "Pending" = pending + payment_pending (awaiting payment)
  // "Completed" = completed (delivered)
  const tabFilter = (order) => {
    if (tab === 'active') return order.status === 'confirmed' || order.status === 'in_progress';
    if (tab === 'pending') return order.status === 'pending' || order.status === 'payment_pending';
    if (tab === 'completed') return order.status === 'completed';
    return false;
  };

  const tabCount = (t) => {
    if (t === 'active') return orders.filter(o => o.status === 'confirmed' || o.status === 'in_progress').length;
    if (t === 'pending') return orders.filter(o => o.status === 'pending' || o.status === 'payment_pending').length;
    if (t === 'completed') return orders.filter(o => o.status === 'completed').length;
    return 0;
  };

  const filtered = orders.filter(tabFilter);

  const TAB_LABELS = {
    active: 'Active Deliveries',
    pending: 'Pending',
    completed: 'Completed',
  };

  const getStatusLabel = (status, paymentStatus) => {
    if (status === 'payment_pending') return 'Awaiting Payment';
    if (status === 'confirmed') return 'Confirmed — In Processing';
    if (status === 'in_progress') return 'In Transit';
    if (status === 'completed') return 'Delivered';
    return status;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">📦 Procurement Orders</h1>

      <div className="tabs">
        {['active', 'pending', 'completed'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
            <span style={{ marginLeft: '0.4rem', fontSize: '0.8rem', opacity: 0.6 }}>
              ({tabCount(t)})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--bark)' }}>
          No {TAB_LABELS[tab].toLowerCase()} orders right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(order => {
            const totalAmount = order.totalAmount || (order.agreedPrice * order.quantity);
            return (
              <div key={order._id} className="card card-order">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--soil)' }}>{order.crop} supplied by {order.farmerName}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>{order.farmerDistrict}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <StatusBadge status={getStatusLabel(order.status, order.paymentStatus)} />
                    {order.paymentStatus === 'paid' ? (
                      <span style={{
                        background: '#d4edda', color: '#155724',
                        padding: '2px 10px', borderRadius: '12px',
                        fontSize: '0.75rem', fontWeight: 600,
                      }}>Paid</span>
                    ) : (
                      <StatusBadge status="Pending Payment" />
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--bark)', marginBottom: '0.75rem', flexWrap: 'wrap', padding: '0.5rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                  <span>Qty: <strong>{order.quantity}{order.unit === 'kg' ? 'kg' : 'q'}</strong></span>
                  <span>Price: <strong>₹{order.agreedPrice?.toLocaleString('en-IN')}/{order.unit === 'kg' ? 'kg' : 'q'}</strong></span>
                  <span>Total: <strong style={{ color: 'var(--leaf)' }}>₹{totalAmount.toLocaleString('en-IN')}</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link href={`/buyer/track/${order._id}`} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                    🚚 Track Delivery
                  </Link>
                  {tab === 'completed' && order.paymentStatus === 'paid' && (
                    <Link href={`/buyer/rate/${order._id}`} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                      ⭐ Rate Farmer
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
