export default function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase', met: /[a-z]/.test(password) },
  ];

  const score = checks.filter((c) => c.met).length;
  const levels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const textColors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-emerald-600'];

  const levelIndex = Math.max(0, score - 1);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? colors[levelIndex] : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[levelIndex]}`}>
        {levels[levelIndex]}
      </p>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li
            key={c.label}
            className={`text-xs flex items-center gap-1.5 ${
              c.met ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${c.met ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
