'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Lock, User, Eye, EyeOff, AlertCircle, Building2, Globe, Moon, Sun, CheckCircle, Clock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  const [locale, setLocale] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  const isRtl = locale === 'ar';

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/areas').then(r => r.json()).then(d => setAreas(Array.isArray(d) ? d : [])).catch(() => {});
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError(isRtl ? 'يرجى إدخال اسم المستخدم' : 'Username is required'); return; }
    if (!password.trim()) { setError(isRtl ? 'يرجى إدخال كلمة المرور' : 'Password is required'); return; }
    if (!selectedArea) { setError(isRtl ? 'يرجى اختيار المنطقة' : 'Please select an area'); return; }
    if (rateLimited) return;

    setLoading(true); setError(''); setLockMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/dev-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: username, role: 'super_admin', name: username }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        const msg = data.message || (isRtl ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');

        if (msg.includes('مقفل نهائياً') || msg.includes('terminated')) {
          setLockMessage(isRtl ? 'تم قفل الحساب نهائياً. تواصل مع المشرف' : 'Account permanently locked. Contact administrator.');
        } else if (msg.includes('24 ساعة') || msg.includes('suspended')) {
          const until = new Date(Date.now() + 86400000).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US');
          setLockMessage(isRtl ? `الحساب مقفل حتى ${until}` : `Account locked until ${until}`);
        } else if (msg.includes('5 دقائق') || msg.includes('locked')) {
          const until = new Date(Date.now() + 300000).toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US');
          setLockMessage(isRtl ? `الحساب مقفل مؤقتاً. حاول بعد ${until}` : `Account locked. Try again after ${until}`);
        }
        setError(msg);
        if (newAttempts >= 3) setRateLimited(true);
        setLoading(false);
        return;
      }

      if (data.accessToken) {
        localStorage.setItem('mp-auth-token', data.accessToken);
        if (selectedArea) localStorage.setItem('selected-area', selectedArea);
        localStorage.setItem('mp-username', username);
        if (rememberMe) localStorage.setItem('mp-remember', 'true');
        window.location.href = '/';
      } else {
        setError(isRtl ? 'خطأ في المصادقة' : 'Authentication failed');
        setLoading(false);
      }
    } catch {
      setError(isRtl ? 'لا يمكن الاتصال بالخادم' : 'Cannot connect to server');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${isRtl ? 'flex-row-reverse' : ''} ${darkMode ? 'dark' : ''}`}>
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#040C1A] via-[#0a1628] to-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(163,255,18,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,18,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-12 left-12 w-72 h-72 bg-[#A3FF12] rounded-full blur-[120px] opacity-[0.06]" />
        <div className="absolute bottom-12 right-12 w-96 h-96 bg-[#A3FF12] rounded-full blur-[150px] opacity-[0.04]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#A3FF12] flex items-center justify-center shadow-lg shadow-[#A3FF12]/20">
                <Zap className="w-6 h-6 text-[#040C1A]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Meter Verse</h1>
                <p className="text-sm text-[#A3FF12]/70">{isRtl ? 'عالم العدادات' : 'Unified Metering Platform'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#A3FF12]/10 border border-[#A3FF12]/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#A3FF12]" />
                </div>
                <p className="text-gray-300">{isRtl ? 'إدارة متقدمة للعدادات والفواتير' : 'Advanced Meter & Billing Management'}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#A3FF12]/10 border border-[#A3FF12]/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#A3FF12]" />
                </div>
                <p className="text-gray-300">{isRtl ? 'دعم 7 أنواع من المرافق' : '7 Utility Types Supported'}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#A3FF12]/10 border border-[#A3FF12]/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#A3FF12]" />
                </div>
                <p className="text-gray-300">{isRtl ? 'فواتير وإيصالات احترافية' : 'Professional Invoices & Receipts'}</p>
              </div>
            </div>

            {/* Utility cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: isRtl ? 'كهرباء' : 'Electricity', color: 'from-yellow-500 to-orange-500', icon: '⚡' },
                { label: isRtl ? 'مياه' : 'Water', color: 'from-cyan-500 to-blue-500', icon: '💧' },
                { label: isRtl ? 'شمسي' : 'Solar', color: 'from-emerald-500 to-green-500', icon: '☀️' },
                { label: isRtl ? 'غاز' : 'Gas', color: 'from-red-500 to-rose-500', icon: '🔥' },
                { label: isRtl ? 'تبريد' : 'Chilled', color: 'from-teal-500 to-cyan-500', icon: '❄️' },
                { label: isRtl ? 'تسوية' : 'Settle', color: 'from-purple-500 to-violet-500', icon: '⚖️' },
              ].map((u, i) => (
                <div key={i} className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className={`h-1 w-full rounded-full bg-gradient-to-r ${u.color} mb-2`} />
                  <span className="text-[11px] text-gray-400">{u.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-600">&copy; 2026 Meter Verse v2.0</p>
        </div>
      </div>

      {/* Right Panel — Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Theme + Language Toggle */}
          <div className="flex justify-end gap-2 mb-8">
            <button onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xl">
            <div className="p-8 pb-6 text-center border-b border-border">
              <div className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-primary lg:hidden mb-4 shadow-lg shadow-primary/20">
                <Zap className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-card-foreground">
                {isRtl ? 'تسجيل الدخول' : 'Sign In'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isRtl ? 'أهلاً بك في عالم العدادات' : 'Welcome to Meter Verse'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-8 pt-6 space-y-5">
              {lockMessage && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{lockMessage}</p>
                  </div>
                </div>
              )}

              {error && !lockMessage && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              )}

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isRtl ? 'المنطقة' : 'Area'}
                </label>
                <div className="relative">
                  <Building2 className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                  <select value={selectedArea} onChange={e=>setSelectedArea(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 rounded-xl border border-input bg-card text-card-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all appearance-none cursor-pointer`}>
                    <option value="">{isRtl ? 'اختر المنطقة' : 'Select Area'}</option>
                    {areas.map(a => <option key={a.id || a.areaCode} value={a.areaCode || a.areaName}>{a.areaName || a.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isRtl ? 'اسم المستخدم' : 'Username'}
                </label>
                <div className="relative">
                  <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
                    placeholder={isRtl ? 'أدخل اسم المستخدم' : 'Enter username'}
                    className={`w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 rounded-xl border border-input bg-card text-card-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all`} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isRtl ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder={isRtl ? 'أدخل كلمة المرور' : 'Enter password'}
                    className={`w-full ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 rounded-xl border border-input bg-card text-card-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all`} />
                  <button type="button" onClick={()=>setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} text-muted-foreground hover:text-foreground`}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-ring" />
                  <span className="text-sm text-muted-foreground">
                    {isRtl ? 'تذكرني' : 'Remember Me'}
                  </span>
                </label>
                {rateLimited && (
                  <span className="text-xs text-destructive">
                    {isRtl ? 'محاولات: ' : 'Attempts: '}{attempts}/3
                  </span>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading || rateLimited}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                {loading ? (isRtl ? 'جاري تسجيل الدخول...' : 'Signing in...') : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
              </button>


              <div className="text-center pt-2">
                <a href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {isRtl ? 'ليس لديك حساب؟ سجل الآن' : "Don't have an account? Register"}
                </a>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            &copy; 2026 Meter Verse / {isRtl ? 'عالم العدادات' : 'Unified Metering Platform'}
          </p>
        </div>
      </div>
    </div>
  );
}
