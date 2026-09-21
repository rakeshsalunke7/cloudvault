import { useEffect, useState } from 'react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

import { authApi } from '@/api/authApi';

import { Logo } from '@/components/common/Logo';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import {
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const OAUTH_CODE_PREFIX =
  'cloudvault_oauth_code_';

const PENDING_INVITE_KEY =
  'cloudvault_pending_invite';

export default function OAuthSuccess() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const { login, token } =
    useAuth();

  const [status, setStatus] =
    useState<
      'processing' | 'success' | 'error'
    >('processing');

  const [errorMessage, setErrorMessage] =
    useState('');

  useEffect(() => {
    const code =
      searchParams.get('code');

    if (!code) {
      setStatus('error');

      setErrorMessage(
        'No authentication code received. Please try signing in again.'
      );

      return;
    }

    if (token) {
      const pendingInvite =
        sessionStorage.getItem(
          PENDING_INVITE_KEY
        );

      if (pendingInvite) {
        sessionStorage.removeItem(
          PENDING_INVITE_KEY
        );

        navigate(
          `/invite/${encodeURIComponent(
            pendingInvite
          )}`,
          {
            replace: true,
          }
        );
      } else {
        navigate('/dashboard', {
          replace: true,
        });
      }

      return;
    }

    const storageKey =
      `${OAUTH_CODE_PREFIX}${code}`;

    const exchangeStarted =
      sessionStorage.getItem(
        storageKey
      );

    if (
      exchangeStarted ===
      'processing'
    ) {
      return;
    }

    if (
      exchangeStarted ===
      'completed'
    ) {
      const pendingInvite =
        sessionStorage.getItem(
          PENDING_INVITE_KEY
        );

      if (pendingInvite) {
        sessionStorage.removeItem(
          PENDING_INVITE_KEY
        );

        navigate(
          `/invite/${encodeURIComponent(
            pendingInvite
          )}`,
          {
            replace: true,
          }
        );
      } else {
        navigate('/dashboard', {
          replace: true,
        });
      }

      return;
    }

    sessionStorage.setItem(
      storageKey,
      'processing'
    );

    let cancelled = false;

    const completeOAuthLogin =
      async () => {
        try {
          const response =
            await authApi.exchangeOAuthCode(
              code
            );

          if (
            !response.token ||
            response.token.trim() === ''
          ) {
            throw new Error(
              'No authentication token received.'
            );
          }

          await login(
            response.token
          );

          sessionStorage.setItem(
            storageKey,
            'completed'
          );

          if (cancelled) {
            return;
          }

          setStatus('success');

          window.setTimeout(() => {
            if (cancelled) {
              return;
            }

            const pendingInvite =
              sessionStorage.getItem(
                PENDING_INVITE_KEY
              );

            if (pendingInvite) {
              sessionStorage.removeItem(
                PENDING_INVITE_KEY
              );

              navigate(
                `/invite/${encodeURIComponent(
                  pendingInvite
                )}`,
                {
                  replace: true,
                }
              );
            } else {
              navigate('/dashboard', {
                replace: true,
              });
            }
          }, 800);
        } catch (error) {
          sessionStorage.removeItem(
            storageKey
          );

          if (cancelled) {
            return;
          }

          console.error(
            'Google OAuth exchange failed:',
            error
          );

          setStatus('error');

          setErrorMessage(
            'Failed to complete Google sign-in. Please try again.'
          );
        }
      };

    completeOAuthLogin();

    return () => {
      cancelled = true;
    };
  }, [
    searchParams,
    login,
    navigate,
    token,
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light-subtle dark:bg-surface-dark">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="card flex w-full max-w-sm flex-col items-center px-8 py-10 text-center animate-scale-in">

        {status === 'processing' && (
          <>
            <LoadingSpinner size={36} />

            <h1 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Completing sign in...
            </h1>

            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              Connecting your Google account
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-400 animate-scale-in">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h1 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Welcome to CloudVault
            </h1>

            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h1 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sign-in failed
            </h1>

            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/login')
              }
              className="mt-5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}