'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, User, Phone, Mail, Building2, Briefcase, ArrowLeft, CheckCircle, ChevronDown } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName:'', lastName:'', phone:'', email:'', area:'', project:'', department:'', directManager:'', areaManager:'' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.area || !form.project || !form.department) {
      setError('Please fill all required fields'); return;
    }
    setLoading(true); setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'success') { setDone(true); }
      else { setError(data.message || 'Registration failed'); }
    } catch { setError('Cannot connect to server'); }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-card-foreground mb-2">Request Submitted</h2>
          <p className="text-sm text-muted-foreground mb-6">Your registration has been submitted for review. You will be notified once approved.</p>
          <button onClick={() => router.push('/login')} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Back to Login</button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-input bg-card text-card-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full">
        <button onClick={() => router.push('/login')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="bg-card rounded-2xl border border-border shadow-xl">
          <div className="p-8 pb-6 text-center border-b border-border">
            <div className="inline-flex w-12 h-12 items-center justify-center rounded-xl bg-primary mb-3">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-card-foreground">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Fill in your details to request access</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {error && <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={form.firstName} onChange={e=>update('firstName',e.target.value)} placeholder="First name" className={'pl-10 ' + inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
                <input type="text" value={form.lastName} onChange={e=>update('lastName',e.target.value)} placeholder="Last name" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="tel" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+20 100 000 0000" className={'pl-10 ' + inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Work Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@company.com" className={'pl-10 ' + inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Area *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={form.area} onChange={e=>update('area',e.target.value)} placeholder="e.g. October" className={'pl-10 ' + inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Project *</label>
                <input type="text" value={form.project} onChange={e=>update('project',e.target.value)} placeholder="e.g. Golf Views" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={form.department} onChange={e=>update('department',e.target.value)} placeholder="e.g. Billing, Operations, Technical" className={'pl-10 ' + inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Direct Manager</label>
                <input type="text" value={form.directManager} onChange={e=>update('directManager',e.target.value)} placeholder="Manager name (optional)" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Area Manager</label>
                <input type="text" value={form.areaManager} onChange={e=>update('areaManager',e.target.value)} placeholder="Manager name (optional)" className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-semibold text-sm transition-all shadow-lg shadow-primary/20 mt-2">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
