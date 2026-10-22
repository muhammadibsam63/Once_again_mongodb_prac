import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(14,165,233,0.3) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Dashboard</span>
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Manage your account with confidence
            </h1>
            <p className="text-brand-100 text-lg leading-relaxed">
              A secure, modern authentication experience built for production. Your data stays protected with industry-standard encryption and best practices.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm text-brand-200 mt-1">Secure by design</p>
              </div>
              <div>
                <p className="text-3xl font-bold">JWT</p>
                <p className="text-sm text-brand-200 mt-1">Token auth</p>
              </div>
              <div>
                <p className="text-3xl font-bold">HTTPS</p>
                <p className="text-sm text-brand-200 mt-1">Ready</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-brand-300">
            © {new Date().getFullYear()} Dashboard App. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-slate-50">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <LayoutDashboard className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="text-lg font-semibold text-slate-900">Dashboard</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
