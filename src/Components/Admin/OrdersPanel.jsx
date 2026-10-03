import { Fragment, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatINR } from '../../utils/shipping';
import './OrdersPanel.css';

const ORDER_STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const FILTERS = [
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Unpaid / abandoned' },
  { id: 'all', label: 'All' },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('paid');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);

  const fetchOrders = async () => {
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (fetchError) {
      console.error(fetchError);
      setError('Could not load orders.');
    } else {
      setOrders(data);
      setError('');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // new orders / payment confirmations appear without refreshing
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id, order_status) => {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ order_status })
      .eq('id', id);
    if (updateError) setError("Couldn't update that order - please try again.");
    else fetchOrders();
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === 'paid' && o.payment_status !== 'paid') return false;
      if (filter === 'pending' && o.payment_status === 'paid') return false;
      if (!q) return true;
      return [o.order_number, o.customer_name, o.phone, o.email]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [orders, filter, search]);

  const newPaid = orders.filter((o) => o.payment_status === 'paid' && o.order_status === 'new').length;

  return (
    <div className="orders-panel">
      {error && <div className="admin-banner admin-banner-error">{error}</div>}

      <div className="admin-toolbar">
        <span>
          {loading ? 'Loading…' : `${visible.length} order${visible.length === 1 ? '' : 's'}`}
          {newPaid > 0 && <strong className="orders-new"> · {newPaid} new</strong>}
        </span>
        <input
          className="orders-search"
          type="search"
          placeholder="Search name, phone, email, order no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="orders-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={filter === f.id ? 'is-active' : ''}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <Fragment key={o.id}>
                <tr>
                  <td><strong>{o.order_number}</strong></td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>
                    {o.customer_name}
                    <br />
                    <a href={`tel:${o.phone}`}>{o.phone}</a>
                  </td>
                  <td>{formatINR(o.total)}</td>
                  <td>
                    <span className={`pay-badge pay-${o.payment_status}`}>{o.payment_status}</span>
                  </td>
                  <td>
                    <select
                      value={o.order_status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => setOpenId(openId === o.id ? null : o.id)}
                    >
                      {openId === o.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>

                {openId === o.id && (
                  <tr className="order-details-row">
                    <td colSpan={7}>
                      <div className="order-details">
                        <div>
                          <h4>Deliver to</h4>
                          <p>
                            {o.customer_name}<br />
                            {o.address_line}<br />
                            {o.city}, {o.state} - {o.pincode}
                          </p>
                          <p>
                            <a href={`tel:${o.phone}`}>{o.phone}</a><br />
                            <a href={`mailto:${o.email}`}>{o.email}</a>
                          </p>
                          {o.notes && <p><strong>Notes:</strong> {o.notes}</p>}
                        </div>
                        <div>
                          <h4>Items</h4>
                          <ul>
                            {(o.items || []).map((it, i) => (
                              <li key={i}>
                                {it.name}{it.color ? ` (${it.color})` : ''} &times; {it.qty}
                                {' - '}{formatINR(it.price * it.qty)}
                              </li>
                            ))}
                          </ul>
                          <p>
                            Subtotal {formatINR(o.subtotal)} · Shipping{' '}
                            {o.shipping > 0 ? formatINR(o.shipping) : 'Free'} ·{' '}
                            <strong>Total {formatINR(o.total)}</strong>
                          </p>
                          {o.razorpay_payment_id && (
                            <p className="order-ref">Razorpay payment: {o.razorpay_payment_id}</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty">No orders to show.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
