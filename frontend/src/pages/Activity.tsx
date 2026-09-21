import { useEffect, useState } from 'react';
import { Activity as ActivityIcon, History } from 'lucide-react';
import { activityApi } from '@/api/activityApi';
import { ActivityItem } from '@/components/activity/ActivityItem';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/common/Button';
import { ActivitySkeleton } from '@/components/common/Skeleton';
import type { ActivityLog } from '@/types/activity';

export default function Activity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError(false);
    activityApi
      .getAll()
      .then(setActivities)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <ErrorState
        message="We couldn't load your activity. Please try again."
        action={<Button onClick={loadData}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Activity</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A timeline of everything happening in your CloudVault.</p>
      </div>

      {loading ? (
        <div className="card p-6">
          <ActivitySkeleton />
        </div>
      ) : activities.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<ActivityIcon className="h-7 w-7" />}
            title="No activity yet"
            description="Your recent actions will appear here as you use CloudVault."
          />
        </div>
      ) : (
        <div className="card p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gray-100 dark:bg-surface-dark-border" />

            <div className="space-y-0">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
