import React, { useState } from 'react';
import { Lock, Mail, X, AlertCircle, Check, Key } from 'lucide-react';
import { ThemeSettings } from '../types';
import { COLOR_PALETTES } from '../utils/theme';
import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

interface LoginModalProps {
  settings: ThemeSettings;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export default function LoginModal({
  settings,
  onClose,
  onLoginSuccess
}: LoginModalProps) {
  const [email, setEmail] = useState('admin@travelbee.com');
  const [password, setPassword] = useState('password');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setSuccessMessage('Successfully signed in with Google!');
      setTimeout(() => {
        onLoginSuccess(result.user.email || 'editor@travelbee.com');
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setErrorMessage(err.message || 'Google sign-in failed. Please try again or use the demo credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Pre-check for local demo bypass to prevent calling Firebase Auth when offline or disabled
    if (email.trim() === 'admin@travelbee.com' && password === 'password') {
      setSuccessMessage('Bypassed with demo editor credentials!');
      setTimeout(() => {
        onLoginSuccess(email.trim());
        onClose();
      }, 1200);
      setIsLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // Register new user in Firebase Auth
        const creds = await createUserWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMessage('Editor account registered successfully!');
        setTimeout(() => {
          onLoginSuccess(creds.user.email || email);
          onClose();
        }, 1200);
      } else {
        // Sign in existing user in Firebase Auth
        const creds = await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMessage('Welcome back to Travel Bee CMS!');
        setTimeout(() => {
          onLoginSuccess(creds.user.email || email);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage('Email/Password login is not enabled in this Firebase project yet. Go to your Firebase Console under Auth > Sign-in Method to enable it, use Google Sign-In above, or use the offline-safe demo credentials.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Use admin@travelbee.com / password to bypass.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill demo login
  const handleQuickDemo = () => {
    setEmail('admin@travelbee.com');
    setPassword('password');
    setIsRegister(false);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          id="close-login-btn"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className={`mx-auto w-10 h-10 rounded-full ${palette.lightBg} ${palette.primaryText} flex items-center justify-center`}>
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">
            {isRegister ? 'Register Editor Account' : 'CMS Editor Authentication'}
          </h3>
          <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto">
            Authorized Travel Bee contributors and editors can gain dashboard access.
          </p>
        </div>

        {/* Notifications and Alerts */}
        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-xs bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0 text-green-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google Sign In Option */}
        {!isRegister && (
          <>
            <button
              id="google-signin-btn"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition duration-150 cursor-pointer text-xs sm:text-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.77z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.24A7.16 7.16 0 0 1 5 12c0-.79.13-1.57.38-2.31V6.54H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.39l4.11-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.18 2.12 1.21 5.62l4.11 3.15c.94-2.85 3.57-4.96 6.68-4.96z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 text-slate-300">
              <div className="h-px bg-slate-200 flex-grow"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">or use email</span>
              <div className="h-px bg-slate-200 flex-grow"></div>
            </div>
          </>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 font-semibold text-white rounded-xl shadow cursor-pointer transition ${
              isLoading ? 'opacity-70 cursor-not-allowed' : palette.primaryBg + ' ' + palette.primaryHover
            }`}
          >
            <span>{isLoading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}</span>
          </button>
        </form>

        {/* Bottom Switch Trigger & Demo bypass trigger */}
        <div className="space-y-4 pt-2 border-t border-slate-100 text-center text-xs text-slate-400 font-sans">
          <div className="flex justify-between items-center px-1">
            <button
              id="login-switch-mode"
              onClick={() => setIsRegister(!isRegister)}
              className="text-slate-500 hover:text-slate-800 font-semibold"
            >
              {isRegister ? 'Already have an account? Sign In' : 'Create new editor account'}
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-left border">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 text-[10px] uppercase">Demo Credentials</span>
              <button
                id="quick-demo-fill"
                onClick={handleQuickDemo}
                className={`text-[10px] font-bold hover:underline ${palette.primaryText}`}
              >
                Auto Fill
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-normal leading-relaxed">
              Use <strong className="text-slate-700">admin@travelbee.com</strong> &amp; password <strong className="text-slate-700">password</strong> to log in instantly. Works offline.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
