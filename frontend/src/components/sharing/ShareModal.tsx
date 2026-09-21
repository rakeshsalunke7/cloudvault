import { useEffect, useState, type FormEvent } from 'react';

import {
  Check,
  Copy,
  Download,
  Eye,
  Link2,
  Mail,
  Share2,
} from 'lucide-react';

import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { sharingApi } from '@/api/sharingApi';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { useToast } from '@/components/common/Toast';

import type { FileEntity } from '@/types/file';
import type {
  SharePermission,
  ShareResponse,
} from '@/types/sharing';

interface ShareModalProps {
  file: FileEntity | null;
  open: boolean;
  onClose: () => void;
}

export function ShareModal({
  file,
  open,
  onClose,
}: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] =
    useState<SharePermission>('VIEW');

  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');

  const [createdShare, setCreatedShare] =
    useState<ShareResponse | null>(null);

  const [copied, setCopied] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (!open) {
      setEmail('');
      setPermission('VIEW');
      setError('');
      setCreatedShare(null);
      setCopied(false);
    }
  }, [open]);

  if (!file) {
    return null;
  }

  const invitationUrl =
    createdShare?.invitationToken
      ? `${window.location.origin}/invite/${createdShare.invitationToken}`
      : '';

  const handleShare = async (event: FormEvent) => {
    event.preventDefault();

    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Email address is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address');
      return;
    }

    setSharing(true);

    try {
      const response = await sharingApi.shareFile({
        fileId: file.id,
        sharedWithEmail: trimmedEmail,
        permission,
      });

      if (
        response.status === 'PENDING' &&
        response.invitationToken
      ) {
        setCreatedShare(response);

        showToast(
          'success',
          'Invitation link created'
        );

        return;
      }

      showToast(
        'success',
        `Shared with ${trimmedEmail}`
      );

      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Unable to share this file.'
        )
      );
    } finally {
      setSharing(false);
    }
  };

  const copyInvitationLink = async () => {
    if (!invitationUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        invitationUrl
      );

      setCopied(true);

      showToast(
        'success',
        'Invitation link copied'
      );

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      showToast(
        'error',
        'Unable to copy invitation link'
      );
    }
  };

  const handleClose = () => {
    if (sharing) {
      return;
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        createdShare
          ? 'Invitation created'
          : 'Share file'
      }
      description={file.originalName}
      size="sm"
      footer={
        createdShare ? (
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={sharing}
            >
              Cancel
            </Button>

            <Button
              onClick={handleShare}
              loading={sharing}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </>
        )
      }
    >
      {createdShare ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
              <Check className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-base font-semibold">
              Invitation link ready
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {createdShare.sharedWithEmail} can use this
              link to access the file after signing in
              with the invited email address.
            </p>
          </div>

          <div>
            <label
              htmlFor="invitationLink"
              className="mb-1.5 block text-sm font-medium"
            >
              Invitation link
            </label>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-surface-dark-border dark:bg-surface-dark-muted">
              <Link2 className="ml-1 h-4 w-4 shrink-0 text-gray-400" />

              <input
                id="invitationLink"
                readOnly
                value={invitationUrl}
                className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
              />

              <button
                type="button"
                onClick={copyInvitationLink}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}

                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/10">
            <p className="text-sm text-brand-700 dark:text-brand-300">
              This invitation expires in 7 days. Send
              the link to the recipient so they can
              accept the invitation.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-surface-dark-border">
            <div className="flex items-center gap-2">
              {createdShare.permission === 'VIEW' ? (
                <Eye className="h-4 w-4 text-brand-600" />
              ) : (
                <Download className="h-4 w-4 text-brand-600" />
              )}

              <span className="text-sm font-medium">
                {createdShare.permission === 'VIEW'
                  ? 'View only'
                  : 'View and download'}
              </span>
            </div>

            <span className="text-xs text-gray-500">
              {createdShare.sharedWithEmail}
            </span>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleShare}
          className="space-y-5"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="shareEmail"
              className="mb-1.5 block text-sm font-medium"
            >
              Email address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                id="shareEmail"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="input-base pl-10"
                placeholder="user@example.com"
                autoFocus
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium">
              Permission
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(
                ['VIEW', 'DOWNLOAD'] as SharePermission[]
              ).map((value) => {
                const active =
                  permission === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setPermission(value)
                    }
                    className={`rounded-lg border p-3 text-left transition ${
                      active
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-gray-200 dark:border-surface-dark-border'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {value === 'VIEW' ? (
                        <Eye className="h-4 w-4 text-brand-600" />
                      ) : (
                        <Download className="h-4 w-4 text-brand-600" />
                      )}

                      <span className="text-sm font-medium">
                        {value === 'VIEW'
                          ? 'View'
                          : 'Download'}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {value === 'VIEW'
                        ? 'Preview only'
                        : 'View and download'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}