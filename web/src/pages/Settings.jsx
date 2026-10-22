import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/authService';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import { Loader2, Lock, KeyRound } from 'lucide-react';

export default function Settings() {
  const toast = useToast();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 8)
      e.newPassword = 'Must be at least 8 characters';
    if (!form.confirmNewPassword) e.confirmNewPassword = 'Please confirm the new password';
    else if (form.newPassword !== form.confirmNewPassword)
      e.confirmNewPassword = 'Passwords do not match';
    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      e.newPassword = 'New password must be different from current';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
      });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="mt-1 text-slate-500 text-sm">
          Manage your account security settings.
        </p>
      </div>

      {/* Change password */}
      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
            <p className="text-xs text-slate-500">
              Requires your current password for verification
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="currentPassword" className="label">
            Current password
          </label>
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
            className={errors.currentPassword ? 'border-red-400' : ''}
          />
          {errors.currentPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="label">
            New password
          </label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
            className={errors.newPassword ? 'border-red-400' : ''}
          />
          {errors.newPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.newPassword}</p>
          )}
          <PasswordStrength password={form.newPassword} />
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="label">
            Confirm new password
          </label>
          <PasswordInput
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={form.confirmNewPassword}
            onChange={handleChange}
            autoComplete="new-password"
            className={errors.confirmNewPassword ? 'border-red-400' : ''}
          />
          {errors.confirmNewPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.confirmNewPassword}</p>
          )}
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Update password
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security note */}
      <div className="card p-5 border-amber-200 bg-amber-50">
        <p className="text-sm text-amber-800">
          <strong>Security tip:</strong> Use a unique password that you don&apos;t reuse on other sites. Your password is hashed with bcrypt and never stored in plain text.
        </p>
      </div>
    </div>
  );
}
