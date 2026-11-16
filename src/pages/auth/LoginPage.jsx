import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiAuthGetConfig } from '../../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, loginWithKakao } = useAuth();
  const googleBtnContainerRef = useRef(null);

  const from = location.state?.from;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(() => (
    searchParams.get('error') ? decodeURIComponent(searchParams.get('error')) : null
  ));
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  // Social Auth Config state
  const [authConfig, setAuthConfig] = useState({
    googleClientId: '',
    kakaoRestApiKey: '',
    kakaoRedirectUri: '',
    isGoogleConfigured: false,
    isKakaoConfigured: false,
  });

  // Modal for unconfigured OAuth guide / developer testing
  const [activeModalProvider, setActiveModalProvider] = useState(null);

  const handlePostLoginNavigation = useCallback((userRole) => {
    if (userRole === 'admin') {
      if (from && from.startsWith('/admin') && from !== '/admin/login') {
        navigate(from, { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } else {
      if (from && !from.startsWith('/admin') && from !== '/login' && from !== '/account') {
        navigate(from, { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [from, navigate]);

  // Load backend OAuth configuration
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const config = await apiAuthGetConfig();
        if (isMounted && config) {
          setAuthConfig(config);
        }
      } catch (err) {
        console.warn('Could not fetch OAuth configuration:', err);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize official Google Identity Services if client ID is configured and SDK is loaded
  useEffect(() => {
    if (!authConfig.isGoogleConfigured || !authConfig.googleClientId) return;
    if (!googleBtnContainerRef.current) return;

    let isCancelled = false;

    const renderGoogleButton = () => {
      if (isCancelled || !googleBtnContainerRef.current) return false;
      if (typeof window === 'undefined' || !window.google?.accounts?.id) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: authConfig.googleClientId,
          callback: async (response) => {
            if (!response?.credential) return;
            setSocialLoading(true);
            setError(null);
            try {
              const data = await loginWithGoogle(response.credential);
              handlePostLoginNavigation(data?.user?.role);
            } catch (err) {
              setError(err.message || 'Google authentication failed.');
            } finally {
              setSocialLoading(false);
            }
          },
        });

        // Compute current container width to match Kakao button exactly
        const containerWidth = googleBtnContainerRef.current.offsetWidth || 350;
        const targetWidth = Math.max(200, Math.min(Math.floor(containerWidth), 400));

        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: targetWidth,
          locale: 'en',
        });
        return true;
      } catch (err) {
        console.warn('Google Identity Services render failed:', err);
        return false;
      }
    };

    if (!renderGoogleButton()) {
      const interval = setInterval(() => {
        if (renderGoogleButton()) {
          clearInterval(interval);
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 5000);

      return () => {
        isCancelled = true;
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    const handleResize = () => {
      renderGoogleButton();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, [authConfig.isGoogleConfigured, authConfig.googleClientId, loginWithGoogle, handlePostLoginNavigation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide your email/username and password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await login(identifier.trim(), password);
      handlePostLoginNavigation(data?.user?.role);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email/username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (authConfig.isGoogleConfigured && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setActiveModalProvider('google');
    }
  };

  const handleKakaoClick = () => {
    if (authConfig.isKakaoConfigured && authConfig.kakaoRestApiKey) {
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('kakao_oauth_state', state);
      const redirectUri = authConfig.kakaoRedirectUri || `${window.location.origin}/oauth/callback/kakao`;
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${authConfig.kakaoRestApiKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    } else {
      setActiveModalProvider('kakao');
    }
  };

  const handleSimulateSocialLogin = async (provider) => {
    setActiveModalProvider(null);
    setSocialLoading(true);
    setError(null);

    try {
      if (provider === 'google') {
        const dummySub = `g_demo_${Date.now()}`;
        const data = await loginWithGoogle(null, {
          sub: dummySub,
          email: `google.reader.${dummySub.slice(-4)}@gmail.com`,
          name: 'Elena Rostova',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
        });
        handlePostLoginNavigation(data?.user?.role);
      } else if (provider === 'kakao') {
        const dummyId = String(Date.now()).slice(-8);
        const data = await loginWithKakao({
          testProfile: {
            id: dummyId,
            email: `kakao.reader.${dummyId.slice(-4)}@kakao.com`,
            name: 'Minji Park',
            picture: '/images/avatars/user.svg'
          }
        });
        handlePostLoginNavigation(data?.user?.role);
      }
    } catch (err) {
      setError(err.message || 'Simulation sign-in failed.');
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo-link" aria-label="Return to PRISM Homepage">
            <img src="/images/logo.png" alt="PRISM Brand" width="132" height="30" />
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to continue exploring
          </p>
        </div>

        {error && (
          <div className="auth-error-alert" role="alert" aria-live="assertive">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Standard Email / Username Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-username">Email Address or Username</label>
            <input
              id="login-username"
              name="username"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. reader@prism.company.io or admin"
              autoComplete="username"
              disabled={loading || socialLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading || socialLoading}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading || socialLoading || !identifier.trim() || !password}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Minimal Divider */}
        <div className="auth-divider" aria-hidden="true">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <span className="auth-divider-line" />
        </div>

        {/* Federated Social Login Section */}
        <div className="social-auth-section" aria-label="Social sign in options">
          {/* Google Identity Services Container */}
          <div className="google-auth-wrap" ref={googleBtnContainerRef}>
            <button
              type="button"
              className="btn-social btn-google-official"
              onClick={handleGoogleClick}
              disabled={loading || socialLoading}
              aria-label="Sign in with Google"
            >
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span className="social-text">Sign in with Google</span>
            </button>
          </div>

          {/* Kakao Official Button */}
          <div className="kakao-auth-wrap">
            <button
              type="button"
              className="btn-social btn-kakao-official"
              onClick={handleKakaoClick}
              disabled={loading || socialLoading}
              aria-label="Login with Kakao"
            >
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20" fill="#000000" aria-hidden="true">
                <path d="M12 3C6.477 3 2 6.477 2 10.77c0 2.775 1.865 5.21 4.685 6.565-.205.765-.745 2.775-.855 3.205-.135.535.195.53.41.385.17-.115 2.705-1.84 3.79-2.585.64.095 1.3.145 1.97.145 5.523 0 10-3.477 10-7.715C22 6.477 17.523 3 12 3z"/>
              </svg>
              <span className="social-text">Login with Kakao</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="auth-links-section">
          <p className="auth-switch-text">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-accent-link">
              Create Account
            </Link>
          </p>
        </div>

        <div className="auth-footer">
          <Link to="/" className="auth-back-home">&larr; Return to Public Website</Link>
        </div>
      </div>

      {/* Provider Setup / Simulation Modal */}
      {activeModalProvider && (
        <div className="auth-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-provider-title">
          <div className="auth-modal-card">
            <div className="modal-header">
              <h3 id="modal-provider-title" className="modal-title">
                {activeModalProvider === 'google' ? 'Google OAuth Configuration' : 'Kakao OAuth Configuration'}
              </h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setActiveModalProvider(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">
                {activeModalProvider === 'google' ? (
                  <>
                    The Google Client ID is not configured yet in <code>server/.env</code>.
                    <br /><br />
                    To activate live Google Identity Services in production:
                    <ol className="modal-steps">
                      <li>Create an OAuth 2.0 Web Client ID in <strong>Google Cloud Console</strong>.</li>
                      <li>Add Authorized JavaScript Origin: <code>http://localhost:5173</code></li>
                      <li>Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in <code>server/.env</code>.</li>
                    </ol>
                  </>
                ) : (
                  <>
                    The Kakao REST API Key is not configured yet in <code>server/.env</code>.
                    <br /><br />
                    To activate live Kakao Login in production:
                    <ol className="modal-steps">
                      <li>Register an application in <strong>Kakao Developers</strong>.</li>
                      <li>Enable Kakao Login and add Redirect URI: <code>http://localhost:5173/oauth/callback/kakao</code></li>
                      <li>Set <code>KAKAO_REST_API_KEY</code> and <code>KAKAO_CLIENT_SECRET</code> in <code>server/.env</code>.</li>
                    </ol>
                  </>
                )}
              </p>

              <div className="modal-dev-note">
                <strong>Development &amp; Verification Mode</strong>
                <p>
                  You can immediately simulate a verified {activeModalProvider === 'google' ? 'Google' : 'Kakao'} reader sign-in to test role assignment, session issuance, and reader account provisioning.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setActiveModalProvider(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => handleSimulateSocialLogin(activeModalProvider)}
              >
                Simulate {activeModalProvider === 'google' ? 'Google' : 'Kakao'} Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
