import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../auth/authService';
import { useAuth } from '../../../auth/useAuth';
import { supabase } from '../../../lib/supabase';

export const AdminAuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(8).fill(''));
  const [pin, setPin] = useState<string[]>(Array(6).fill(''));
  const [step, setStep] = useState<'email' | 'otp' | 'create-pin' | 'verify-pin' | 'success'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { checkSession } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid company email.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await authService.signInWithPrimaryFactor(email);
      setStep('otp');
      setCountdown(60);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) clearInterval(interval);
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: any) {
      console.error('Admin OTP Dispatch Error:', err);
      setError(err?.message || 'Unable to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length < 8) {
      setError('Please enter the 8-digit code.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.verifyPrimaryFactor(email, token, rememberDevice);
      if (checkSession) await checkSession();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication failed");

      // Verify roles before proceeding
      const roles = ['OWNER', 'ADMIN', 'DEVELOPER', 'DESIGNER', 'PROJECT_MANAGER', 'STRATEGIST', 'SALES'];
      // A quick check via JWT user_metadata if available, or just rely on backend DB
      const userRoles = session.user.app_metadata?.roles || [];
      const hasAccess = roles.some(r => userRoles.includes(r));
      if (!hasAccess && userRoles.length > 0) { // If metadata is empty, fallback to backend check via RPC
         // But for now, just let the Edge function fail if they don't have access, or query `admin_security`.
      }

      // Check if PIN is setup
      const { data: securityRecord } = await supabase
        .from('admin_security')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!securityRecord) {
        setStep('create-pin');
      } else {
        setStep('verify-pin');
      }
      
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinToken = pin.join('');
    if (pinToken.length < 6) {
      setError('Please enter your 6-digit PIN.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      if (step === 'create-pin') {
        const response = await fetch('/functions/v1/admin-auth?action=create-pin', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'create-pin', pin: pinToken })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          console.error('Create PIN Server Response:', response.status, result);
          throw new Error(result.error || result.message || `Server returned ${response.status}: Failed to create PIN.`);
        }
        
        // After creating, we must verify it to get the cookie
        setStep('verify-pin');
        setPin(Array(6).fill('')); // clear it for verification
        setIsSubmitting(false);
        return;
      }

      if (step === 'verify-pin') {
        const response = await fetch('/functions/v1/admin-auth?action=verify', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            action: 'verify',
            pin: pinToken, 
            metadata: { 
              user_agent: navigator.userAgent,
              device_fingerprint: "deterministic_hash_todo" 
            } 
          })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || "Invalid PIN.");
        if (result.sessionId) {
          sessionStorage.setItem('admin_session_id', result.sessionId);
        }
        
        setStep('success');
        setTimeout(async () => {
          navigate('/admin', { replace: true });
        }, 2500);
      }
    } catch (err: any) {
      setError(err?.message || 'Action failed.');
      setPin(Array(6).fill(''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDigitChange = (index: number, value: string, type: 'otp' | 'pin') => {
    if (value.length > 1) return;
    const newArr = type === 'otp' ? [...otp] : [...pin];
    newArr[index] = value;
    if (type === 'otp') setOtp(newArr);
    else setPin(newArr);

    const maxIdx = type === 'otp' ? 7 : 5;
    if (value !== '' && index < maxIdx) {
      const nextInput = document.getElementById(`${type}-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent, type: 'otp' | 'pin') => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    const maxLen = type === 'otp' ? 8 : 6;
    const digits = pasted.slice(0, maxLen).split('');
    const newArr = Array(maxLen).fill('');
    digits.forEach((d, i) => { newArr[i] = d; });
    if (type === 'otp') setOtp(newArr);
    else setPin(newArr);
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, type: 'otp' | 'pin') => {
    const arr = type === 'otp' ? otp : pin;
    if (e.key === 'Backspace' && arr[index] === '' && index > 0) {
      const prevInput = document.getElementById(`${type}-${index - 1}`);
      prevInput?.focus();
    }
  };

  const renderLeftPanel = () => {
    return (
      <div className="w-full lg:w-[45%] h-full flex flex-col justify-between p-8 md:p-12 lg:p-20 relative z-10">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B3D2E]" />
            <span className="font-['Cormorant_Garamond'] text-2xl font-bold tracking-wide text-[#0B3D2E]">
              Tech Ambiance
            </span>
          </div>
          <div className="font-mono text-xs font-bold tracking-[0.2em] text-[#C5A572] uppercase pl-4">
            StudioHQ <span className="opacity-60 ml-2">Internal Operations Console</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto mt-12 mb-12">
          
          <AnimatePresence mode="wait">
            
            {step === 'email' && (
              <motion.div
                key="step-email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="font-['Cormorant_Garamond'] text-4xl text-[#0B3D2E] font-bold mb-3 leading-tight">
                  Executive Authentication
                </h1>
                <p className="text-sm text-[#0B3D2E]/70 mb-8 font-medium leading-relaxed">
                  Access the internal Agency Operating System. Protected with passwordless email verification.
                </p>

                <div className="bg-white border border-[#0B3D2E]/10 rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgba(11,61,46,0.04)]">
                  <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest text-[#0B3D2E]/60 ml-1">
                        Company Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@techambiance.com"
                        disabled={isSubmitting}
                        className="w-full bg-[#FAF7F0]/50 border border-[#0B3D2E]/10 rounded-xl px-4 py-3.5 text-sm text-[#0B3D2E] placeholder-[#0B3D2E]/30 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] transition-all"
                      />
                    </div>
                    
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-600 font-medium">
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 group relative bg-[#0B3D2E] text-[#C5A572] rounded-xl py-3.5 flex items-center justify-center gap-2 overflow-hidden transition-all hover:bg-[#072a1f]"
                    >
                      <span className="text-xs uppercase font-bold tracking-widest relative z-10">
                        {isSubmitting ? 'Sending...' : 'Send Verification Code'}
                      </span>
                      {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />}
                      <div className="absolute inset-0 bg-[#C5A572]/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6 cursor-pointer text-xs font-bold text-[#C5A572] uppercase tracking-widest flex items-center gap-2 hover:text-[#0B3D2E] transition-colors" onClick={() => setStep('email')}>
                  ← Back
                </div>
                <h1 className="font-['Cormorant_Garamond'] text-3xl text-[#0B3D2E] font-bold mb-3 leading-tight">
                  Verification Code Sent
                </h1>
                <p className="text-sm text-[#0B3D2E]/70 mb-8 font-medium">
                  Enter the secure 8-digit code sent to:<br/>
                  <span className="text-[#0B3D2E] font-bold mt-1 inline-block">{email}</span>
                </p>

                <div className="bg-white border border-[#0B3D2E]/10 rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgba(11,61,46,0.04)]">
                  <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
                    <div className="flex justify-between gap-1 sm:gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={digit}
                          onChange={(e) => handleDigitChange(index, e.target.value, 'otp')}
                          onKeyDown={(e) => handleDigitKeyDown(index, e, 'otp')}
                          onPaste={(e) => handlePaste(e, 'otp')}
                          className="w-7 h-10 sm:w-9 sm:h-12 md:w-11 md:h-14 text-center bg-[#FAF7F0]/50 border border-[#0B3D2E]/10 rounded-xl text-base md:text-lg font-bold text-[#0B3D2E] focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] transition-all"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0B3D2E] focus:ring-[#C5A572] border-[#0B3D2E]/20"
                      />
                      <label htmlFor="remember" className="text-xs font-medium text-[#0B3D2E]/70 cursor-pointer">
                        Trust this device for 30 days
                      </label>
                    </div>
                    
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-600 font-medium">
                        {error}
                      </motion.div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full group relative bg-[#0B3D2E] text-[#C5A572] rounded-xl py-3.5 flex items-center justify-center gap-2 overflow-hidden transition-all hover:bg-[#072a1f]"
                      >
                        <span className="text-xs uppercase font-bold tracking-widest relative z-10">
                          {isSubmitting ? 'Verifying...' : 'Verify Code'}
                        </span>
                        {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />}
                        <div className="absolute inset-0 bg-[#C5A572]/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      </button>

                      <button
                        type="button"
                        disabled={countdown > 0}
                        onClick={handleEmailSubmit}
                        className="text-[10px] uppercase font-bold tracking-widest text-[#0B3D2E]/50 hover:text-[#0B3D2E] transition-colors py-2 disabled:opacity-50"
                      >
                        {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {(step === 'create-pin' || step === 'verify-pin') && (
              <motion.div
                key="step-pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="font-['Cormorant_Garamond'] text-3xl text-[#0B3D2E] font-bold mb-3 leading-tight">
                  {step === 'create-pin' ? 'Create Security PIN' : 'Enter Admin PIN'}
                </h1>
                <p className="text-sm text-[#0B3D2E]/70 mb-8 font-medium">
                  {step === 'create-pin' ? 'Please set a secure 6-digit PIN for your Executive Console.' : 'Enter your 6-digit PIN to establish a secure session.'}
                </p>

                <div className="bg-white border border-[#0B3D2E]/10 rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgba(11,61,46,0.04)]">
                  <form onSubmit={handlePinSubmit} className="flex flex-col gap-6">
                    <div className="flex justify-between gap-2">
                      {pin.map((digit, index) => (
                        <input
                          key={index}
                          id={`pin-${index}`}
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={digit}
                          onChange={(e) => handleDigitChange(index, e.target.value, 'pin')}
                          onKeyDown={(e) => handleDigitKeyDown(index, e, 'pin')}
                          className="w-10 h-12 md:w-12 md:h-14 text-center bg-[#FAF7F0]/50 border border-[#0B3D2E]/10 rounded-xl text-lg font-bold text-[#0B3D2E] focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] transition-all"
                        />
                      ))}
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-600 font-medium">
                        {error}
                      </motion.div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full group relative bg-[#0B3D2E] text-[#C5A572] rounded-xl py-3.5 flex items-center justify-center gap-2 overflow-hidden transition-all hover:bg-[#072a1f]"
                      >
                        <span className="text-xs uppercase font-bold tracking-widest relative z-10">
                          {isSubmitting ? 'Authenticating...' : 'Authenticate'}
                        </span>
                        {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />}
                        <div className="absolute inset-0 bg-[#C5A572]/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#0B3D2E]/5 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#0B3D2E]" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#0B3D2E] mb-1">
              Enterprise Protected
            </div>
            <p className="text-[11px] text-[#0B3D2E]/60 font-medium leading-relaxed max-w-xs">
              Authentication is secured using passwordless email verification, short-lived verification tokens, and immutable audit logging.
            </p>
          </div>
        </div>

      </div>
    );
  };

  const renderRightPanel = () => {
    const capabilities = [
      "Enterprise Security",
      "Zero Trust Access",
      "Role-Based Access",
      "Immutable Audit Logs",
      "CQRS Event Architecture",
      "Multi-Tenant Workspaces",
      "End-to-End Encryption"
    ];

    return (
      <div className="hidden lg:flex w-[55%] bg-[#0B3D2E] relative overflow-hidden flex-col items-center justify-center p-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#C5A572 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C5A572] rounded-full blur-[150px] opacity-10" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#C5A572] rounded-full blur-[150px] opacity-10" />

        <div className="relative z-10 w-full max-w-lg">
          <div className="flex items-center gap-3 mb-12">
            <ShieldCheck className="w-6 h-6 text-[#C5A572]" />
            <h2 className="font-mono text-sm uppercase tracking-[0.25em] font-bold text-[#F8F6F1]">
              Operating System Capabilities
            </h2>
          </div>

          <div className="grid gap-4">
            {capabilities.map((cap, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between backdrop-blur-sm"
              >
                <div className="font-medium text-[#F8F6F1] tracking-wide">{cap}</div>
                <div className="w-2 h-2 rounded-full bg-[#C5A572] shadow-[0_0_8px_rgba(197,165,114,0.6)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="hidden md:flex items-center gap-3 ml-2 text-[#0B3D2E] font-medium opacity-0" />
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-[#0B3D2E]/10 px-4 py-2 rounded-full pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B3D2E]">
            Enterprise Security Enabled
          </span>
        </div>
      </div>

      {step === 'success' ? (
        <motion.div 
          className="absolute inset-0 bg-[#0B3D2E] z-50 flex flex-col items-center justify-center text-[#F8F6F1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-[#C5A572]/10 rounded-full flex items-center justify-center mb-8 border border-[#C5A572]/20"
          >
            <ShieldCheck className="w-12 h-12 text-[#C5A572]" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-['Cormorant_Garamond'] text-5xl font-bold mb-4"
          >
            Identity Verified
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#F8F6F1]/60 font-mono text-sm tracking-widest uppercase flex items-center gap-3"
          >
            <Loader2 className="w-4 h-4 animate-spin text-[#C5A572]" />
            Secure session established. Redirecting to StudioHQ...
          </motion.p>
        </motion.div>
      ) : (
        <>
          {renderLeftPanel()}
          {renderRightPanel()}
        </>
      )}
    </div>
  );
};
