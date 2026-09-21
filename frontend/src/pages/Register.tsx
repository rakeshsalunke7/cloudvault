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
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from 'lucide-react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/common/Button';
import { GoogleButton } from '@/components/auth/GoogleButton';

import { authApi } from '@/api/authApi';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { useToast } from '@/components/common/Toast';

import type { RegisterRequest } from '@/types/auth';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(
  password: string
): PasswordStrength {
  let score = 0;

  if (password.length >= 8) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  }

  if (/[0-9]/.test(password)) {
    score++;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }

  const map = [
    {
      label: 'Too short',
      color: 'bg-gray-300',
    },
    {
      label: 'Weak',
      color: 'bg-red-400',
    },
    {
      label: 'Fair',
      color: 'bg-amber-400',
    },
    {
      label: 'Good',
      color: 'bg-blue-400',
    },
    {
      label: 'Strong',
      color: 'bg-green-500',
    },
  ];

  return {
    score,
    ...map[score],
  };
}

export default function Register() {
  const navigate = useNavigate();

  const { showToast } =
    useToast();

  const [searchParams] =
    useSearchParams();

  const inviteToken =
    searchParams.get('invite');

  const [form, setForm] =
    useState<
      RegisterRequest & {
        confirmPassword: string;
      }
    >({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

  const [errors, setErrors] =
    useState<Record<string, string>>(
      {}
    );

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [apiError, setApiError] =
    useState('');

  const strength =
    getPasswordStrength(
      form.password
    );

  const validate = (): boolean => {
    const e: Record<
      string,
      string
    > = {};

    if (!form.fullName.trim()) {
      e.fullName =
        'Full name is required';
    }

    if (!form.email) {
      e.email =
        'Email is required';
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
    } else if (
      form.password.length < 8
    ) {
      e.password =
        'Password must be at least 8 characters';
    }

    if (
      form.confirmPassword !==
      form.password
    ) {
      e.confirmPassword =
        'Passwords do not match';
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
      await authApi.register({
        fullName:
          form.fullName,
        email:
          form.email,
        password:
          form.password,
      });

      showToast(
        'success',
        'Account created successfully. Please sign in.'
      );

      if (inviteToken) {
        navigate(
          `/login?invite=${encodeURIComponent(
            inviteToken
          )}`,
          {
            replace: true,
          }
        );
      } else {
        navigate('/login', {
          replace: true,
        });
      }
    } catch (err) {
      setApiError(
        getApiErrorMessage(
          err,
          'Unable to create account. Please try again.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your CloudVault account"
      subtitle="Start storing your files securely in the cloud."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to={
              inviteToken
                ? `/login?invite=${encodeURIComponent(
                    inviteToken
                  )}`
                : '/login'
            }
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Sign in
          </Link>
        </>
      }
    >
      {inviteToken && (
        <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
          Create your account using the email address
          that received this invitation.
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
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Full Name
          </label>

          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={(e) =>
                setForm({
                  ...form,
                  fullName:
                    e.target.value,
                })
              }
              className={`input-base pl-10 ${
                errors.fullName
                  ? 'input-error'
                  : ''
              }`}
              placeholder="John Doe"
              autoComplete="name"
              autoFocus
            />
          </div>

          {errors.fullName && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="reg-email"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
              className={`input-base pl-10 ${
                errors.email
                  ? 'input-error'
                  : ''
              }`}
              placeholder="you@example.com"
              autoComplete="email"
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
            htmlFor="reg-password"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              id="reg-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password:
                    e.target.value,
                })
              }
              className={`input-base px-10 ${
                errors.password
                  ? 'input-error'
                  : ''
              }`}
              placeholder="At least 8 characters"
              autoComplete="new-password"
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

          {form.password.length >
            0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map(
                  (i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= strength.score
                          ? strength.color
                          : 'bg-gray-200 dark:bg-surface-dark-border'
                      }`}
                    />
                  )
                )}
              </div>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {strength.label}
              </span>
            </div>
          )}

          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              id="confirmPassword"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={
                form.confirmPassword
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword:
                    e.target.value,
                })
              }
              className={`input-base pl-10 ${
                errors.confirmPassword
                  ? 'input-error'
                  : ''
              }`}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />

            {form.confirmPassword &&
              form.confirmPassword ===
                form.password && (
                <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
              )}
          </div>

          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={submitting}
        >
          Create Account

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

      <GoogleButton label="Continue with Google" />
    </AuthLayout>
  );
}