import AnalyticsDashboard from '@/components/AnalyticsDashboard/AnalyticsDashboard';

export const metadata = {
  title: 'Analytics Dashboard | AgroLink',
  description: 'Smart procurement insights and farmer performance tracking.',
};

export default function BuyerAnalyticsPage() {
  return (
    <div className="page-container">
      <AnalyticsDashboard defaultRole="buyer" />
    </div>
  );
}
