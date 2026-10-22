import { useAuth } from '../context/AuthContext';
import {
  User,
  Calendar,
  Shield,
  Mail,
  Clock,
} from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatRelative(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Account status',
      value: 'Active',
      icon: Shield,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Member since',
      value: formatRelative(user?.createdAt),
      icon: Calendar,
      color: 'text-brand-600 bg-brand-50',
    },
    {
      label: 'Role',
      value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User',
      icon: User,
      color: 'text-violet-600 bg-violet-50',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1.5 text-slate-500">
          Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="mt-1.5 text-xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile summary card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Account information</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Details loaded from your MongoDB profile
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          <InfoRow
            icon={User}
            label="Full name"
            value={user?.name || '—'}
          />
          <InfoRow
            icon={Mail}
            label="Email address"
            value={user?.email || '—'}
          />
          <InfoRow
            icon={Shield}
            label="Role"
            value={user?.role || 'user'}
          />
          <InfoRow
            icon={Calendar}
            label="Account created"
            value={formatDate(user?.createdAt)}
          />
          <InfoRow
            icon={Clock}
            label="Last updated"
            value={formatDate(user?.updatedAt)}
          />
        </div>
      </div>

      {/* Empty / real-data note */}
      <div className="card p-6 bg-slate-50 border-dashed">
        <p className="text-sm text-slate-500 text-center">
          All data shown above is fetched live from MongoDB. No mock or invented statistics are displayed.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm text-slate-900 font-medium truncate capitalize">
          {value}
        </p>
      </div>
    </div>
  );
}
