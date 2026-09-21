import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  FileText,
  ShieldCheck,
  Clock,
  User,
  AlertCircle,
  Loader2,
  LogIn,
  UserPlus,
  CheckCircle,
} from 'lucide-react';

import { sharingApi } from '@/api/sharingApi';

import { Button } from '@/components/common/Button';

import { useAuth } from '@/context/AuthContext';

import type {
  InvitationResponse,
} from '@/types/sharing';

export default function Invitation() {
  const { token } =
    useParams();

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const [
    invitation,
    setInvitation,
  ] =
    useState<InvitationResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [accepting, setAccepting] =
    useState(false);

  const [error, setError] =
    useState('');

  const [accepted, setAccepted] =
    useState(false);

  useEffect(() => {
    if (!token) {
      setError(
        'Invalid invitation link.'
      );

      setLoading(false);

      return;
    }

    sharingApi
      .getInvitation(token)
      .then(setInvitation)
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          'This invitation is invalid or has expired.';

        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  async function handleAccept() {
    if (!token) {
      return;
    }

    setAccepting(true);
    setError('');

    try {
      await sharingApi.acceptInvitation(
        token
      );

      setAccepted(true);

      window.setTimeout(() => {
        navigate('/shared', {
          replace: true,
        });
      }, 1200);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Unable to accept this invitation.';

      setError(message);
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading invitation...
          </p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-surface-dark">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
            Invitation unavailable
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {error}
          </p>

          <Button
            className="mt-6"
            onClick={() =>
              navigate('/')
            }
          >
            Go to CloudVault
          </Button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const permissionLabel =
    invitation.permission ===
    'DOWNLOAD'
      ? 'View and download'
      : 'Preview only';

  const expiresText =
    invitation.expiresAt
      ? new Date(
          invitation.expiresAt
        ).toLocaleDateString(
          undefined,
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }
        )
      : 'No expiration';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-surface-dark">
      <div className="w-full max-w-lg">

        {/* Branding */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            CloudVault
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Secure file sharing
          </p>
        </div>

        <div className="card overflow-hidden">

          {/* Header */}
          <div className="border-b border-gray-100 p-6 dark:border-surface-dark-border">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  You've been invited
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Someone shared a file with you
                </p>
              </div>
            </div>
          </div>

          {/* File */}
          <div className="p-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-surface-dark-border dark:bg-surface-dark-muted">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <FileText className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100"
                    title={
                      invitation.fileName
                    }
                  >
                    {invitation.fileName}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {permissionLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mt-6 space-y-4">

              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />

                <div>
                  <p className="text-xs text-gray-400">
                    Shared by
                  </p>

                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {
                      invitation.ownerEmail
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-gray-400" />

                <div>
                  <p className="text-xs text-gray-400">
                    Permission
                  </p>

                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {permissionLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />

                <div>
                  <p className="text-xs text-gray-400">
                    Invitation expires
                  </p>

                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {expiresText}
                  </p>
                </div>
              </div>
            </div>

            {/* Recipient */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-surface-dark-muted">
              <p className="text-xs text-gray-400">
                Shared with
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {
                  invitation.recipientEmail
                }
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Accepted */}
            {accepted ? (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-500/20 dark:bg-green-500/10">
                <CheckCircle className="mx-auto h-6 w-6 text-green-600 dark:text-green-400" />

                <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
                  Invitation accepted!
                </p>

                <p className="mt-1 text-xs text-green-600 dark:text-green-500">
                  Opening Shared with me...
                </p>
              </div>
            ) : (
              <div className="mt-6">

                {user ? (
                  <Button
                    className="w-full"
                    onClick={
                      handleAccept
                    }
                    loading={accepting}
                    disabled={accepting}
                  >
                    Accept invitation
                  </Button>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">

                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(
                          `/login?invite=${encodeURIComponent(
                            token || ''
                          )}`
                        )
                      }
                    >
                      <LogIn className="h-4 w-4" />
                      Log in
                    </Button>

                    <Button
                      onClick={() =>
                        navigate(
                          `/register?invite=${encodeURIComponent(
                            token || ''
                          )}`
                        )
                      }
                    >
                      <UserPlus className="h-4 w-4" />
                      Create account
                    </Button>

                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}