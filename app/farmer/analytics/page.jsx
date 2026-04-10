import AnalyticsDashboard from '@/components/AnalyticsDashboard/AnalyticsDashboard';

export const metadata = {
  title: 'Analytics Dashboard | AgroLink',
  description: 'Actionable insights to maximize your farming profits and operations.',
};

export default function FarmerAnalyticsPage() {
  return (
    <div className="page-container">
      <AnalyticsDashboard defaultRole="farmer" />
    </div>
  );
}
