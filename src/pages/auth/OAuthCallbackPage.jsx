import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithKakao, loginWithGoogle } = useAuth();

  const isGoogle = location.pathname.includes('/google');

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

  // Parse credential from query or hash fragment (standard in Google GIS redirect flow)
  const hashParams = typeof window !== 'undefined' && window.location.hash
    ? new URLSearchParams(window.location.hash.replace(/^#/, ''))
    : null;
  const credential = searchParams.get('credential') ||
    searchParams.get('id_token') ||
    (hashParams ? (hashParams.get('credential') || hashParams.get('id_token')) : null);

  const [error, setError] = useState(() => {
    if (errorParam) {
      return errorDesc || errorParam || 'Social authentication was cancelled or failed.';
    }
    if (!code && !credential) {
      return `Missing authorization token or code from ${isGoogle ? 'Google' : 'Kakao'} provider.`;
    }
    return null;
  });

  useEffect(() => {
    if (error) return;
    if (!code && !credential) return;

    let isMounted = true;
    async function completeOAuth() {
      try {
        if (isGoogle) {
          const tokenOrCode = credential || code;
          await loginWithGoogle(tokenOrCode);
        } else {
          // Send the exact origin-aware redirectUri used during the authorization request
          const redirectUri = `${window.location.origin}/oauth/callback/kakao`;
          await loginWithKakao({ code, state, redirectUri });
        }
        if (isMounted) {
          navigate('/account', { replace: true });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to complete third-party sign-in.');
        }
      }
    }

    completeOAuth();

    return () => {
      isMounted = false;
    };
  }, [code, state, credential, isGoogle, error, loginWithKakao, loginWithGoogle, navigate]);

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo-link">
              <img src="/images/logo.png" alt="HBK Brand" width="132" height="30" />
            </Link>
            <h1 className="auth-title">Sign In Failed</h1>
            <p className="auth-subtitle">We could not complete your social authentication.</p>
          </div>

          <div className="auth-error-alert" role="alert">
            <span>{error}</span>
          </div>

          <div className="auth-links-section" style={{ marginTop: '24px' }}>
            <Link to="/login" className="btn-auth-submit" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <LoadingSpinner />
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', marginTop: '24px', letterSpacing: '0.05em' }}>
          Completing Authentication
        </h2>
        <p style={{ color: '#888', marginTop: '8px', fontSize: '0.9rem' }}>
          Finalizing secure token exchange and provisioning your HBK reader session...
        </p>
      </div>
    </div>
  );
}
