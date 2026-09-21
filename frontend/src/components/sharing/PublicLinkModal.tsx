import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Link2,
  Loader2,
  Trash2,
} from 'lucide-react';

import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { sharingApi } from '@/api/sharingApi';
import { useToast } from '@/components/common/Toast';
import { getApiErrorMessage } from '@/utils/errorHandler';

import type { FileEntity } from '@/types/file';
import type { PublicLink } from '@/types/sharing';

interface PublicLinkModalProps {
  file: FileEntity | null;
  open: boolean;
  onClose: () => void;
}

export function PublicLinkModal({
  file,
  open,
  onClose,
}: PublicLinkModalProps) {
  const [link, setLink] =
    useState<PublicLink | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [revoking, setRevoking] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const { showToast } = useToast();

  /*
   * Load the active public link whenever
   * the modal is opened.
   */
  useEffect(() => {
    if (!open || !file) {
      return;
    }

    const loadPublicLink = async () => {
      setLoading(true);
      setCopied(false);

      try {
        const existingLink =
          await sharingApi.getPublicLink(file.id);

        setLink(existingLink);
      } catch {
        /*
         * No active public link is expected to
         * result in an error from the backend.
         *
         * In that case, simply show the
         * "Create link" state.
         */
        setLink(null);
      } finally {
        setLoading(false);
      }
    };

    loadPublicLink();
  }, [open, file]);

  if (!file) {
    return null;
  }

  const publicUrl = link
    ? `${window.location.origin}/shared/${link.token}`
    : '';

  const create = async () => {
    setCreating(true);

    try {
      const createdLink =
        await sharingApi.createPublicLink(file.id);

      setLink(createdLink);

      showToast(
        'success',
        'Public link created'
      );
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(
          err,
          'Could not create public link'
        )
      );
    } finally {
      setCreating(false);
    }
  };

  const revoke = async () => {
    if (!link) {
      return;
    }

    setRevoking(true);

    try {
      await sharingApi.revokePublicLink(link.id);

      setLink(null);
      setCopied(false);

      showToast(
        'success',
        'Public link revoked'
      );
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(
          err,
          'Could not revoke public link'
        )
      );
    } finally {
      setRevoking(false);
    }
  };

  const copy = async () => {
    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        publicUrl
      );

      setCopied(true);

      showToast(
        'success',
        'Link copied'
      );

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      showToast(
        'error',
        'Could not copy link'
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Public link"
      description={file.originalName}
      size="md"
      footer={
        loading ? null : link ? (
          <>
            <Button
              variant="danger"
              onClick={revoke}
              loading={revoking}
            >
              <Trash2 className="h-4 w-4" />
              Revoke access
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              disabled={revoking}
            >
              Close
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={create}
              loading={creating}
            >
              <Link2 className="h-4 w-4" />
              Create link
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </Button>
          </>
        )
      }
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      ) : link ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-500/20 dark:bg-green-500/10">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Public link is active
            </p>

            <p className="mt-1 text-xs text-green-600 dark:text-green-500">
              Anyone with this link can access the file.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-surface-dark-border dark:bg-surface-dark-muted">
            <Link2 className="h-4 w-4 shrink-0 text-gray-400" />

            <input
              readOnly
              value={publicUrl}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />

            <button
              type="button"
              onClick={copy}
              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}

              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Anyone with this link can access the file
            while the link is active.
          </p>
        </div>
      ) : (
        <div className="py-8 text-center">
          <Link2 className="mx-auto h-8 w-8 text-brand-500" />

          <p className="mt-3 text-sm font-medium">
            No public link
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Create a link to share this file
            without requiring an account.
          </p>
        </div>
      )}
    </Modal>
  );
}