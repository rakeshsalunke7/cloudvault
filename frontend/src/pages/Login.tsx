import {
  useState,
  type FormEvent,
} from 'react';

import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/common/Button';
import { GoogleButton } from '@/components/auth/GoogleButton';

import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/authApi';

import { getApiErrorMessage } from '@/utils/errorHandler';

import type { LoginRequest } from '@/types/auth';

export default function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const inviteToken =
    searchParams.get('invite');

  const [form, setForm] =
    useState<LoginRequest>({
      email: '',
      password: '',
    });

  const [errors, setErrors] =
    useState<{
      email?: string;
      password?: string;
    }>({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [apiError, setApiError] =
    useState('');

  const validate = (): boolean => {
    const e: typeof errors = {};

    if (!form.email) {
      e.email = 'Email is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      e.email =
        'Enter a valid email address';
    }

    if (!form.password) {
      e.password =
        'Password is required';
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (
    ev: FormEvent
  ) => {
    ev.preventDefault();

    setApiError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const res =
        await authApi.login(form);

      await login(res.token);

      if (inviteToken) {
        navigate(
          `/invite/${encodeURIComponent(
            inviteToken
          )}`,
          { replace: true }
        );
      } else {
        navigate('/dashboard', {
          replace: true,
        });
      }
    } catch (err) {
      setApiError(
        getApiErrorMessage(
          err,
          'Unable to sign in. Please check your credentials.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your secure cloud storage."
      footer={
        <>
          Don't have an account?{' '}
          <Link
            to={
              inviteToken
                ? `/register?invite=${encodeURIComponent(
                    inviteToken
                  )}`
                : '/register'
            }
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Create one
          </Link>
        </>
      }
    >
      {inviteToken && (
        <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
          Please sign in with the account that received
          this file invitation.
        </div>
      )}

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 animate-slide-down">
          {apiError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className={`input-base pl-10 ${
                errors.email
                  ? 'input-error'
                  : ''
              }`}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              id="password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className={`input-base px-10 ${
                errors.password
                  ? 'input-error'
                  : ''
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) => !value
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.password}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500/20 dark:border-surface-dark-border dark:bg-surface-dark-muted"
          />
          Remember me
        </label>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={submitting}
        >
          Sign In

          {!submitting && (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200 dark:bg-surface-dark-border" />

        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          OR
        </span>

        <div className="h-px flex-1 bg-gray-200 dark:bg-surface-dark-border" />
      </div>

      <GoogleButton />
    </AuthLayout>
  );
}