import { BarChart3, HeartHandshake, PiggyBank } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useGetCharityReportQuery } from '../../store/api/adminApiSlice';
import { getApiErrorMessage, normalizeApiList } from '../../store/api/apiUtils';

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return `GBP ${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminCharityReportPage() {
  const { data: reportResponse, isLoading, error } = useGetCharityReportQuery();

  const totalDonated = reportResponse?.totalDonated ?? reportResponse?.overview?.totalDonated ?? 0;
  const charities = normalizeApiList(reportResponse?.charities ?? reportResponse, 'charities');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Failed to load charity report"
        description={getApiErrorMessage(error, 'Please check your connection and permissions.')}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <HeartHandshake className="text-emerald-500" />
          Charity Report
        </h1>
        <p className="text-zinc-500 mt-1">Track donation performance and partner impact across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Total Donated</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{formatCurrency(totalDonated)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Partner Charities</p>
          <p className="mt-2 text-2xl font-black text-zinc-900">{charities.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Average Per Charity</p>
          <p className="mt-2 text-2xl font-black text-violet-600">
            {formatCurrency(charities.length ? totalDonated / charities.length : 0)}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">Charity Contribution Breakdown</h2>
        </div>

        {charities.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {charities.map((charity) => {
              const received = Number(charity.totalReceived ?? charity.totalDonated ?? 0);
              const share = totalDonated > 0 ? (received / totalDonated) * 100 : 0;

              return (
                <div key={charity._id || charity.name} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-zinc-900">{charity.name || 'Unnamed charity'}</p>
                      <p className="text-sm text-zinc-500">{charity.website || 'No website'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900">{formatCurrency(received)}</p>
                      <p className="text-xs text-zinc-500">{share.toFixed(1)}% share</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-zinc-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, Math.max(0, share))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16">
            <EmptyState
              icon={PiggyBank}
              title="No report data yet"
              description="Donation records will appear once contributions are processed."
            />
          </div>
        )}
      </Card>
    </div>
  );
}
