import { Button, Card } from '@/components/common';

export const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <Card padding="large">
          <h3>🛒 Cart Summary</h3>
          <p><strong>Items:</strong> 0</p>
          <p><strong>Total:</strong> $0.00</p>
          <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
            (Demo data - cart functionality would be implemented using Zedux atoms)
          </p>
        </Card>

        <Card padding="large">
          <h3>👤 Account</h3>
          <p><strong>Status:</strong> Demo Mode</p>
          <p><strong>Token:</strong> ✓ (Demo)</p>
          <Button 
            onClick={() => alert('Logout demo')} 
            variant="secondary" 
            size="small"
          >
            Logout
          </Button>
        </Card>

        <Card padding="large">
          <h3>📊 Demo Statistics</h3>
          <p>This is a demonstration of the React project structure with:</p>
          <ul style={{ fontSize: '14px', color: '#6b7280' }}>
            <li>Zedux state management</li>
            <li>Three-layer architecture</li>
            <li>Type-safe services</li>
            <li>Centralized business logic</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};