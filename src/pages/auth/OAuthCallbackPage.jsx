import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithKakao } = useAuth();

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

  const [error, setError] = useState(() => {
    if (errorParam) {
      return errorDesc || errorParam || 'Social authentication was cancelled or failed.';
    }
    if (!code) {
      return 'Missing authorization code from identity provider.';
    }
    return null;
  });

  useEffect(() => {
    if (error || !code) return;

    let isMounted = true;
    async function completeOAuth() {
      try {
        await loginWithKakao({ code, state });
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
  }, [code, state, error, loginWithKakao, navigate]);

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
