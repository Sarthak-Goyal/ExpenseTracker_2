// Author: Sarthak Goyal
import { useState, useEffect, useCallback, useRef } from 'react';
import api          from '../../services/api';
import SummaryCards from './SummaryCards';
import EntryTable   from './EntryTable';
import EntryForm    from './EntryForm';
import TrendsChart  from './TrendsChart';

/**
 * Dashboard — the main user page.
 *
 * Live search — no flicker:
 *   We keep a separate `searchValue` (what the user types) from the
 *   `debouncedSearch` (what actually triggers the API call). The table
 *   only re-renders when real data arrives — never goes blank mid-type.
 *
 * New entry flash:
 *   After a successful add, the new entry is injected at the TOP of the
 *   list immediately with isNew:true. After 5 seconds the flag is cleared
 *   and fetchEntries() re-runs to sort it into its correct date position.
 */
export default function Dashboard() {
  const [entries,      setEntries]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [showForm,     setShowForm]     = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Two-stage search: typed value vs debounced value sent to API
  const [searchValue,    setSearchValue]    = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [type,     setType]     = useState('all');
  const [category, setCategory] = useState('all');

  // Cancel token ref — abort stale in-flight requests
  const abortRef = useRef(null);

  // Timer ref for the new-entry flash
  const flashTimerRef = useRef(null);

  // Debounce: only update debouncedSearch 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchValue), 400);
    return () => clearTimeout(t);
  }, [searchValue]);

  /**
   * Fetch entries from the API.
   * Cancels the previous in-flight request before starting a new one,
   * so stale responses can never overwrite fresh results — eliminating flicker.
   */
  const fetchEntries = useCallback(async () => {
    // Cancel any previous fetch still in flight
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const params = new URLSearchParams({
        search:   debouncedSearch,
        type,
        category,
      });
      const { data } = await api.get(`/entries?${params}`, {
        signal: abortRef.current.signal,
      });
      // Replace entries — no flicker because we never set entries to []
      setEntries((prev) => {
        // If there's a flashing new entry, keep it at the top temporarily
        const flashingEntry = prev.find((e) => e.isNew);
        if (flashingEntry) {
          const rest = data.data.filter((e) => e.id !== flashingEntry.id);
          return [flashingEntry, ...rest];
        }
        return data.data;
      });
      setLoading(false);
    } catch (err) {
      // Ignore aborted requests — they are intentional cancellations
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError(err.response?.data?.message || 'Failed to load entries. Is the server running?');
      setLoading(false);
    }
  }, [debouncedSearch, type, category]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  /**
   * Create a new entry.
   * On success: inject it at the top with isNew:true immediately,
   * then after 5 seconds clear the flag and refetch to sort it by date.
   */
  const handleAdd = useCallback(async (formData) => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/entries', formData);
      const newEntry = { ...data.data, isNew: true };

      // Clear any existing flash timer from a previous add
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);

      // Immediately put the new entry at the top
      setEntries((prev) => [newEntry, ...prev.filter((e) => !e.isNew)]);
      setShowForm(false);

      // After 3 seconds: remove the isNew flag and refetch sorted data
      flashTimerRef.current = setTimeout(() => {
        setEntries((prev) => prev.map((e) => e.id === newEntry.id ? { ...e, isNew: false } : e));
        fetchEntries();
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add entry.');
    } finally {
      setSaving(false);
    }
  }, [fetchEntries]);

  /** Update an existing entry */
  const handleUpdate = useCallback(async (formData) => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/entries/${editingEntry.id}`, formData);
      setEditingEntry(null);
      fetchEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update entry.');
    } finally {
      setSaving(false);
    }
  }, [editingEntry, fetchEntries]);

  /** Delete an entry by id */
  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/entries/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete entry.');
    }
  }, []);

  // Cleanup flash timer on unmount
  useEffect(() => () => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
  }, []);

  return (
    <div className="page">
      <div style={styles.header}>
        <h1>My Expenses</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add Entry
        </button>
      </div>

      {error && <div className="alert alert-error mt-2">{error}</div>}

      <SummaryCards entries={entries} />

      {/* Filters + live search */}
      <div className="card" style={styles.filters}>
        <input
          type="text"
          placeholder="Search entries…"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={styles.searchInput}
          aria-label="Search entries"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={styles.select}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
          <option value="all">All Categories</option>
          <option value="salary">Salary</option>
          <option value="groceries">Groceries</option>
          <option value="utilities">Utilities</option>
          <option value="entertainment">Entertainment</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Entries table — no opacity toggle, no blank flashes */}
      <div className="card mt-2">
        {loading
          ? <p className="empty-state">Loading…</p>
          : <EntryTable
              entries={entries}
              onEdit={(entry) => setEditingEntry(entry)}
              onDelete={handleDelete}
            />
        }
      </div>

      <TrendsChart entries={entries} />

      {showForm && (
        <EntryForm
          onSave={handleAdd}
          onClose={() => setShowForm(false)}
          loading={saving}
        />
      )}

      {editingEntry && (
        <EntryForm
          entry={editingEntry}
          onSave={handleUpdate}
          onClose={() => setEditingEntry(null)}
          loading={saving}
        />
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filters: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '14px 20px',
  },
  searchInput: { flex: '1 1 200px', minWidth: 160 },
  select:      { flex: '0 1 160px', width: 'auto' },
};
