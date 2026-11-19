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

  const [configStatus, setConfigStatus] = useState('loading');
  const [googleSdkStatus, setGoogleSdkStatus] = useState('loading');
  const siteOrigin = window.location.origin;

  // Social Auth Config state
  const [authConfig, setAuthConfig] = useState({
    googleClientId: '',
    kakaoRestApiKey: '',
    kakaoRedirectUri: '',
    isGoogleConfigured: false,
    isKakaoConfigured: false,
    allowSimulation: false,
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

  // A failed request must not be reported as missing provider credentials.
  useEffect(() => {
    let isMounted = true;
    let timer = null;

    async function loadConfig(attempt = 1) {
      try {
        const config = await apiAuthGetConfig();
        if (isMounted) {
          setAuthConfig(config);
          setConfigStatus('ready');
        }
      } catch {
        if (!isMounted) return;
        if (attempt < 5) {
          timer = setTimeout(() => loadConfig(attempt + 1), 3000);
        } else {
          setConfigStatus('error');
        }
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
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
          logo_alignment: 'center',
          width: targetWidth,
          locale: 'en',
        });
        setGoogleSdkStatus('ready');
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
          clearTimeout(timeout);
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!isCancelled) setGoogleSdkStatus('error');
      }, 15000);

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

  const refreshAuthConfig = async () => {
    setError(null);
    setConfigStatus('loading');
    try {
      const fresh = await apiAuthGetConfig();
      setAuthConfig(fresh);
      setConfigStatus('ready');
      return fresh;
    } catch {
      setConfigStatus('error');
      setError('Sign-in services could not be reached. Please try again.');
      return null;
    }
  };

  const handleGoogleClick = async () => {
    const currentConfig = await refreshAuthConfig();
    if (!currentConfig) return;
    if (!currentConfig.isGoogleConfigured) {
      setActiveModalProvider('google');
      return;
    }
    if (googleSdkStatus !== 'ready' || !window.google?.accounts?.id) {
      setError('Google sign-in is still loading or has been blocked. Please reload the page and try again.');
      return;
    }
    window.google.accounts.id.prompt();
  };

  const handleKakaoClick = async () => {
    const currentConfig = await refreshAuthConfig();
    if (!currentConfig) return;
    if (!currentConfig.isKakaoConfigured || !currentConfig.kakaoRestApiKey) {
      setActiveModalProvider('kakao');
      return;
    }
    const state = crypto.randomUUID();
    const redirectUri = currentConfig.kakaoRedirectUri || `${siteOrigin}/oauth/callback/kakao`;
    sessionStorage.setItem('kakao_oauth_state', state);
    sessionStorage.setItem('kakao_oauth_redirect_uri', redirectUri);
    const params = new URLSearchParams({
      client_id: currentConfig.kakaoRestApiKey,
      redirect_uri: redirectUri,
      response_type: 'code',
      state
    });
    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
  };

  const handleSimulateSocialLogin = async (provider) => {
    if (!import.meta.env.DEV || !authConfig.allowSimulation) return;
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
          <Link to="/" className="auth-logo-link" aria-label="Return to HBK Homepage">
            <img src="/images/logo.png" alt="HBK Brand" width="132" height="30" />
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
              placeholder="e.g. reader@hbk.company.io or admin"
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

        {configStatus === 'loading' && (
          <p role="status">Loading sign-in options...</p>
        )}
        {configStatus === 'error' && (
          <p role="alert">Sign-in services could not be reached. Select a provider to retry.</p>
        )}
        {authConfig.isGoogleConfigured && googleSdkStatus === 'error' && (
          <p role="alert">Google sign-in could not load. Please reload the page or check your browser extensions.</p>
        )}

        {/* Federated Social Login Section */}
        <div className="social-auth-section" aria-label="Social sign in options">
          {/* Google Identity Services Container */}
          <div className="google-auth-wrap" ref={googleBtnContainerRef}>
            <button
              type="button"
              className="btn-social btn-google-official"
              onClick={handleGoogleClick}
              disabled={loading || socialLoading || configStatus === 'loading'}
              aria-label="Sign in with Google"
            >
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
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
              disabled={loading || socialLoading || configStatus === 'loading'}
              aria-label="Login with Kakao"
            >
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20" fill="#000000" aria-hidden="true">
                <path d="M12 3C6.477 3 2 6.477 2 10.77c0 2.775 1.865 5.21 4.685 6.565-.205.765-.745 2.775-.855 3.205-.135.535.195.53.41.385.17-.115 2.705-1.84 3.79-2.585.64.095 1.3.145 1.97.145 5.523 0 10-3.477 10-7.715C22 6.477 17.523 3 12 3z" />
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
                {activeModalProvider === 'google' ? 'Google Sign In' : 'Kakao Sign In'}
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
              <div className="modal-desc">
                {activeModalProvider === 'google' ? 'Google' : 'Kakao'} sign-in is currently unavailable.
                Please use your email and password or try again later.
              </div>

              {import.meta.env.DEV && (
                <div className="modal-dev-note">
                  <strong>Provider configuration</strong>
                  <p>For Render deployments, add credentials to the backend Web Service&apos;s Environment page and redeploy.</p>
                  {activeModalProvider === 'google' ? (
                    <ol className="modal-steps">
                      <li>Create a Web application client in Google Cloud Console.</li>
                      <li>Register the Authorized JavaScript origin <code>{siteOrigin}</code>.</li>
                      <li>Set <code>GOOGLE_CLIENT_ID</code> on the backend. This GIS callback flow uses the JavaScript origin.</li>
                    </ol>
                  ) : (
                    <ol className="modal-steps">
                      <li>Enable Kakao Login in Kakao Developers.</li>
                      <li>Register <code>{authConfig.kakaoRedirectUri || `${siteOrigin}/oauth/callback/kakao`}</code> as the redirect URI.</li>
                      <li>Set <code>KAKAO_REST_API_KEY</code>, <code>KAKAO_CLIENT_SECRET</code>, and <code>KAKAO_REDIRECT_URI</code> on the backend.</li>
                    </ol>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setActiveModalProvider(null)}
              >
                Cancel
              </button>
              {import.meta.env.DEV && authConfig.allowSimulation && (
                <button
                  type="button"
                  className="btn-modal-primary"
                  onClick={() => handleSimulateSocialLogin(activeModalProvider)}
                >
                  Simulate {activeModalProvider === 'google' ? 'Google' : 'Kakao'} Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
