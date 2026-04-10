'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

export default function FarmerPayments() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [fetchError, setFetchError] = useState(null);

  // Auth guard
  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  const fetchPayments = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/farmer/payments?farmerId=${user.id}`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data.payments);
        setTotalReceived(json.data.totalReceived);
        setPendingAmount(json.data.pendingAmount);
        setFetchError(null);
      }
    } catch {
      setFetchError('Failed to load payments. Retrying…');
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Poll every 30 seconds for live updates
  useEffect(() => {
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  if (loading || !user) return null;

  const formatDate = (iso) =>
    new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const formatMethod = (method) => {
    if (!method) return 'Online';
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">💳 Payments &amp; Earnings</h1>

      {fetchError && (
        <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{fetchError}</p>
      )}

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--leaf), #3d6a34)', color: 'white' }}>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Total Received</p>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.2rem' }}>₹{totalReceived.toLocaleString('en-IN')}</h2>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--harvest), #b37324)', color: 'white' }}>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Pending Payments</p>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.2rem' }}>₹{pendingAmount.toLocaleString('en-IN')}</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem' }}>Payments clear 24h after delivery confirmation</p>
        </div>
      </div>

      {/* ── Payment History Table ────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #ede8e0' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--soil)' }}>Payment History</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Amount (₹)</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--bark)' }}>
                    No payments received yet. Payments appear here once a buyer completes checkout for your produce.
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p._id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.paidAt)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      #{p.orderId.toString().slice(-8).toUpperCase()}
                    </td>
                    <td>{p.buyerName}</td>
                    <td>{p.crop}</td>
                    <td>{p.quantity} {p.unit}</td>
                    <td style={{ fontWeight: 600 }}>₹{p.amount.toLocaleString('en-IN')}</td>
                    <td>{formatMethod(p.method)}</td>
                    <td>
                      {p.status === 'paid' ? (
                        <span style={{
                          background: '#d4edda', color: '#155724',
                          padding: '2px 10px', borderRadius: '12px',
                          fontSize: '0.8rem', fontWeight: 600,
                        }}>
                          Paid
                        </span>
                      ) : (
                        <StatusBadge status={p.status} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
