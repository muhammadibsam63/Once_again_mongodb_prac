import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/authService';
import { Loader2, Save, User } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const e_ = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      e_.name = 'Name must be at least 2 characters';
    }
    if (form.name.trim().length > 50) {
      e_.name = 'Name cannot exceed 50 characters';
    }
    setErrors(e_);
    if (Object.keys(e_).length > 0) return;

    setLoading(true);
    try {
      const data = await userService.updateProfile({
        name: form.name.trim(),
        avatar: form.avatar.trim(),
      });
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = form.name
    ? form.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile</h1>
        <p className="mt-1 text-slate-500 text-sm">
          Update your personal information. Changes are saved to MongoDB.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
        {/* Avatar preview */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-semibold shrink-0 overflow-hidden">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{form.name || 'Your name'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className={`input ${errors.name ? 'border-red-400' : ''}`}
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="avatar" className="label">
            Avatar URL <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="avatar"
            name="avatar"
            type="url"
            value={form.avatar}
            onChange={handleChange}
            className="input"
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Paste a direct image URL. Leave empty to use initials.
          </p>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Read-only info */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Account details</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-900 font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Role</dt>
            <dd className="text-slate-900 font-medium capitalize">{user?.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Member since</dt>
            <dd className="text-slate-900 font-medium">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
