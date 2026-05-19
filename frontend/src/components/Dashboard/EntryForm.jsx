// Author: Sarthak Goyal
import { useState, useEffect } from 'react';

const CATEGORIES = ['salary', 'groceries', 'utilities', 'entertainment', 'other'];

/**
 * EntryForm — modal form used for both adding and editing entries.
 * Props:
 *   entry    — if provided, pre-fills the form for editing
 *   onSave   — called with the form data object on submit
 *   onClose  — called when the modal should close
 *   loading  — disables the submit button while the API call is in flight
 */
export default function EntryForm({ entry, onSave, onClose, loading }) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    description: '',
    amount:      '',
    type:        'expense',
    category:    'groceries',
    date:        today,
  });
  const [error, setError] = useState('');

  // Pre-fill fields when editing an existing entry
  useEffect(() => {
    if (entry) {
      setForm({
        description: entry.description,
        amount:      entry.amount,
        type:        entry.type,
        category:    entry.category,
        date:        new Date(entry.date).toISOString().split('T')[0],
      });
    }
  }, [entry]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError('Amount must be a positive number.'); return;
    }
    if (!form.date) { setError('Date is required.'); return; }

    onSave({ ...form, amount: Number(form.amount) });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{entry ? 'Edit Entry' : 'Add New Entry'}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.grid}>
            <div className="field">
              <label htmlFor="description">Description</label>
              <input
                id="description" name="description" type="text"
                placeholder="e.g. Monthly Salary"
                maxLength={200}
                value={form.description} onChange={handleChange} required
              />
            </div>

            <div className="field">
              <label htmlFor="amount">Amount ($)</label>
              <input
                id="amount" name="amount" type="number"
                placeholder="0.00" min="0.01" step="0.01"
                value={form.amount} onChange={handleChange} required
              />
            </div>

            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date" name="date" type="date"
                value={form.date} onChange={handleChange} required
              />
            </div>

            <div className="field">
              <label htmlFor="type">Type</label>
              <select id="type" name="type" value={form.type} onChange={handleChange}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : entry ? 'Save Changes' : 'Add Entry'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
};
