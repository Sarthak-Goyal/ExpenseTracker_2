// Author: Sarthak Goyal
/**
 * EntryTable — renders the list of expense/income entries.
 * Props:
 *   entries  — array of entry objects (may include isNew: true)
 *   onEdit   — called with the entry object when Edit is clicked
 *   onDelete — called with the entry id when Delete is confirmed
 */
export default function EntryTable({ entries, onEdit, onDelete }) {
  if (entries.length === 0) {
    return <p className="empty-state">No entries found. Add one above!</p>;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  function handleDelete(entry) {
    if (window.confirm(`Delete "${entry.description}"? This cannot be undone.`)) {
      onDelete(entry.id);
    }
  }

  return (
    <>
      {/* No flash animation — new entry row stays solid green with NEW badge */}
      <style>{`
        .row-new {
          background: #dce8df;
          position: relative;
        }
        .row-new td:first-child::before {
          content: 'NEW';
          display: inline-block;
          background: #4b7a5f;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 1px 6px;
          border-radius: 4px;
          margin-right: 8px;
          vertical-align: middle;
        }
      `}</style>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className={entry.isNew ? 'row-new' : ''}
              >
                <td>{entry.description}</td>
                <td style={{ fontWeight: 600, color: entry.type === 'income' ? '#4b7a5f' : '#7a4b4b' }}>
                  ${Number(entry.amount).toFixed(2)}
                </td>
                <td>
                  <span className={`badge badge-${entry.type}`}>{entry.type}</span>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{entry.category}</td>
                <td style={{ color: '#6b7280', fontSize: '0.87rem' }}>{formatDate(entry.date)}</td>
                <td>
                  <div style={styles.actions}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onEdit(entry)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const styles = {
  actions: { display: 'flex', gap: 6 },
};