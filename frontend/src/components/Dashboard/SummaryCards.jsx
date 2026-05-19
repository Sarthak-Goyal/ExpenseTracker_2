/**
 * SummaryCards — shows total income, total expenses, and balance
 * computed from the currently visible (filtered) entries.
 */
export default function SummaryCards({ entries }) {
  let totalIncome  = 0;
  let totalExpense = 0;

  entries.forEach((e) => {
    if (e.type === 'income')  totalIncome  += Number(e.amount);
    if (e.type === 'expense') totalExpense += Number(e.amount);
  });

  const balance = totalIncome - totalExpense;

  const cards = [
    { label: 'Total Income',   value: totalIncome,  color: '#4b7a5f', bg: '#dce8df' },
    { label: 'Total Expenses', value: totalExpense, color: '#7a4b4b', bg: '#f5e6e6' },
    { label: 'Balance',        value: balance,      color: balance >= 0 ? '#4b7a5f' : '#7a4b4b', bg: '#f1f5f9' },
  ];

  return (
    <div style={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} style={{ ...styles.card, borderTopColor: card.color }}>
          <span style={styles.label}>{card.label}</span>
          <span style={{ ...styles.value, color: card.color }}>
            ${Math.abs(card.value).toFixed(2)}
            {card.label === 'Balance' && balance < 0 && ' (deficit)'}
          </span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: '#ffffff',
    borderRadius: 8,
    padding: '18px 20px',
    boxShadow: '0 1px 8px rgba(44,62,80,0.08)',
    borderTop: '3px solid transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b7280',
  },
  value: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
};
