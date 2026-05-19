// Author: Sarthak Goyal
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

/**
 * AdminPanel — accessible only to admin-role users.
 * Two tabs:
 *   1. Users    — list all users, change roles, delete accounts.
 *                 Clicking a username switches to the Activity tab
 *                 pre-filtered to that user's activity log.
 *   2. Activity — view all user activity logs, filterable by user.
 */
export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [tab, setTab]         = useState('users');

  // Users state
  const [users,        setUsers]        = useState([]);
  const [usersError,   setUsersError]   = useState('');
  const [usersLoading, setUsersLoading] = useState(true);

  // Activity state
  const [activity,        setActivity]        = useState([]);
  const [activityError,   setActivityError]   = useState('');
  const [activityLoading, setActivityLoading] = useState(false);
  const [filterUserId,    setFilterUserId]    = useState('');

  // ── Fetch users ────────────────────────────────────────────────
  async function fetchUsers() {
    setUsersLoading(true);
    setUsersError('');
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data);
    } catch (err) {
      setUsersError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  }

  // ── Fetch activity ─────────────────────────────────────────────
  async function fetchActivity() {
    setActivityLoading(true);
    setActivityError('');
    try {
      const params = filterUserId ? `?user_id=${filterUserId}` : '';
      const { data } = await api.get(`/admin/activity${params}`);
      setActivity(data.data);
    } catch (err) {
      setActivityError(err.response?.data?.message || 'Failed to load activity.');
    } finally {
      setActivityLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { if (tab === 'activity') fetchActivity(); }, [tab, filterUserId]);

  /**
   * Clicking a username in the Users tab navigates directly to the
   * Activity tab pre-filtered to that user's activity log.
   */
  function viewUserActivity(userId) {
    setFilterUserId(String(userId));
    setTab('activity');
  }

  // ── Change a user's role ───────────────────────────────────────
  async function handleRoleChange(userId, newRole) {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.');
    }
  }

  // ── Delete a user account ──────────────────────────────────────
  async function handleDeleteUser(userId, username) {
    if (!window.confirm(`Delete user "${username}"? This will also delete all their entries.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('en-AU', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const actionColors = {
    login:    '#dce8df',
    logout:   '#f1f5f9',
    register: '#dce4eb',
    create:   '#e8f0dc',
    update:   '#ebe8dc',
    delete:   '#f5e6e6',
  };

  const filteredUser = users.find((u) => String(u.id) === String(filterUserId));

  return (
    <div className="page-wide">
      <h1 style={{ marginBottom: 20 }}>Admin Panel</h1>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['users', 'activity'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}
          >
            {t === 'users' ? ' Users' : ' Activity Log'}
          </button>
        ))}
      </div>

      {/* ── Users Tab ─────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="card">
          <div style={styles.tabHeader}>
            <h2>User Accounts</h2>
            <span className="text-muted">{users.length} total</span>
          </div>

          {usersError   && <div className="alert alert-error mt-2">{usersError}</div>}
          {usersLoading && <p className="empty-state">Loading users…</p>}

          {!usersLoading && (
            <div className="table-wrapper mt-2">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <button
                          onClick={() => viewUserActivity(u.id)}
                          style={styles.usernameBtn}
                          title={`View ${u.username}'s activity log`}
                        >
                          {u.username}
                        </button>
                        {u.id === currentUser.id && (
                          <span style={styles.youBadge}> (you)</span>
                        )}
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td className="text-muted">{new Date(u.created_at).toLocaleDateString('en-AU')}</td>
                      <td>
                        {u.id !== currentUser.id ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                            >
                              {u.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Activity Tab ───────────────────────────────────────── */}
      {tab === 'activity' && (
        <div className="card">
          <div style={styles.tabHeader}>
            <div>
              <h2>Activity Log</h2>
              {filteredUser && (
                <p style={styles.filterLabel}>
                  Showing activity for <strong>{filteredUser.username}</strong>
                  <button
                    onClick={() => setFilterUserId('')}
                    style={styles.clearFilter}
                    title="Show all users"
                  >
                    × Clear filter
                  </button>
                </p>
              )}
            </div>
            {/* Refresh button removed — only the user filter dropdown remains */}
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              style={{ width: 180, padding: '6px 10px' }}
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>

          {activityError   && <div className="alert alert-error mt-2">{activityError}</div>}
          {activityLoading && <p className="empty-state">Loading activity…</p>}

          {!activityLoading && activity.length === 0 && (
            <p className="empty-state">No activity found.</p>
          )}

          {!activityLoading && activity.length > 0 && (
            <div className="table-wrapper mt-2">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((a) => (
                    <tr key={a.id}>
                      <td className="text-muted" style={{ fontSize: '0.83rem', whiteSpace: 'nowrap' }}>
                        {formatDate(a.created_at)}
                      </td>
                      <td>
                        <button
                          onClick={() => setFilterUserId(String(a.user_id || filterUserId))}
                          style={styles.usernameBtn}
                          title="Filter to this user"
                        >
                          {a.username}
                        </button>
                      </td>
                      <td>
                        <span style={{
                          ...styles.actionBadge,
                          background: actionColors[a.action] || '#f1f5f9',
                        }}>
                          {a.action}
                        </span>
                      </td>
                      <td className="text-muted">{a.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  tabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 16,
    borderBottom: '2px solid #e2e8f0',
  },
  tab: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    cursor: 'pointer',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: '#6b7280',
    transition: 'color 0.15s',
  },
  activeTab: {
    color: '#2c3e50',
    borderBottomColor: '#2c3e50',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  usernameBtn: {
    background: 'transparent',
    border: 'none',
    color: '#2c3e50',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    textDecorationColor: '#9ca3af',
  },
  youBadge: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: 400,
  },
  actionBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: '0.78rem',
    fontWeight: 600,
    textTransform: 'capitalize',
    color: '#2c3e50',
  },
  filterLabel: {
    fontSize: '0.83rem',
    color: '#6b7280',
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  clearFilter: {
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: 4,
    color: '#6b7280',
    fontSize: '0.78rem',
    cursor: 'pointer',
    padding: '1px 7px',
  },
};