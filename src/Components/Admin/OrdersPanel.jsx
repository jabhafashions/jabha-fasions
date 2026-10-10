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

// supabase.functions.invoke hides the server's message inside error.context
async function readError(error, fallback) {
  try {
    const body = await error.context.json();
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('paid');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [ship, setShip] = useState(null); // shipping form: { order, courier, ..., resend, busy }
  const [notice, setNotice] = useState('');

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

  const handleStatusChange = (order, value) => {
    if (value === 'shipped' && order.order_status !== 'shipped') {
      if (order.payment_status !== 'paid') {
        setError('Only paid orders can be marked as shipped.');
        return;
      }
      openShipForm(order, false);
      return;
    }
    updateStatus(order.id, value);
  };

  const openShipForm = (order, resend) => {
    setError('');
    setNotice('');
    setShip({
      order,
      courier: order.courier || '',
      trackingNumber: order.tracking_number || '',
      trackingUrl: order.tracking_url || '',
      sendEmail: true,
      resend,
      busy: false,
    });
  };

  const submitShip = async (e) => {
    e.preventDefault();
    setShip((s) => ({ ...s, busy: true }));
    setError('');
    setNotice('');

    const { data, error: fnError } = await supabase.functions.invoke('send-shipped-email', {
      body: {
        orderId: ship.order.id,
        courier: ship.courier,
        trackingNumber: ship.trackingNumber,
        trackingUrl: ship.trackingUrl,
        sendEmail: ship.sendEmail,
        resend: ship.resend,
      },
    });

    if (fnError) {
      setError(await readError(fnError, "Couldn't update that order - please try again."));
      setShip((s) => ({ ...s, busy: false }));
      return;
    }

    if (data.emailSent) setNotice(`Marked as shipped. Email sent to ${ship.order.email}.`);
    else if (data.alreadySent) setNotice('Marked as shipped. The customer was already emailed earlier - use "Edit tracking / resend email" to send again.');
    else if (data.emailError) setNotice(`Marked as shipped, but the email was not sent. ${data.emailError}`);
    else setNotice('Marked as shipped (no email sent).');

    setShip(null);
    fetchOrders();
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
      {notice && <div className="admin-banner orders-notice">{notice}</div>}

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
                      onChange={(e) => handleStatusChange(o, e.target.value)}
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
                          {o.order_status === 'shipped' || o.tracking_number || o.courier ? (
                            <p>
                              <strong>Shipping:</strong>{' '}
                              {[o.courier, o.tracking_number].filter(Boolean).join(' - ') || 'No tracking details'}
                              {o.tracking_url && (
                                <> · <a href={o.tracking_url} target="_blank" rel="noreferrer">tracking link</a></>
                              )}
                              {o.order_status === 'shipped' && (
                                <>
                                  <br />
                                  <button
                                    type="button"
                                    className="btn order-resend"
                                    onClick={() => openShipForm(o, true)}
                                  >
                                    Edit tracking / resend email
                                  </button>
                                </>
                              )}
                            </p>
                          ) : null}
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
      {ship && (
        <div className="ship-overlay" onClick={() => !ship.busy && setShip(null)}>
          <form className="ship-modal" onClick={(e) => e.stopPropagation()} onSubmit={submitShip}>
            <h3>{ship.resend ? 'Edit tracking / resend email' : 'Mark as shipped'}</h3>
            <p className="ship-sub">
              Order {ship.order.order_number} &middot; {ship.order.customer_name}
            </p>

            <label>
              Courier (optional)
              <input
                value={ship.courier}
                maxLength={60}
                placeholder="e.g. DTDC, India Post, Delhivery"
                onChange={(e) => setShip({ ...ship, courier: e.target.value })}
              />
            </label>
            <label>
              Tracking number (optional)
              <input
                value={ship.trackingNumber}
                maxLength={80}
                onChange={(e) => setShip({ ...ship, trackingNumber: e.target.value })}
              />
            </label>
            <label>
              Tracking link (optional)
              <input
                type="url"
                value={ship.trackingUrl}
                maxLength={300}
                placeholder="https://..."
                onChange={(e) => setShip({ ...ship, trackingUrl: e.target.value })}
              />
            </label>
            <label className="ship-check">
              <input
                type="checkbox"
                checked={ship.sendEmail}
                onChange={(e) => setShip({ ...ship, sendEmail: e.target.checked })}
              />
              Email the customer ({ship.order.email})
            </label>

            <div className="ship-actions">
              <button type="button" className="btn" disabled={ship.busy} onClick={() => setShip(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-solid" disabled={ship.busy}>
                {ship.busy ? 'Saving…' : ship.resend ? 'Save & resend' : 'Mark shipped'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
