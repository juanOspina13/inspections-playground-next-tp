import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { DashboardPage } from '@/components/pages/DashboardPage';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
