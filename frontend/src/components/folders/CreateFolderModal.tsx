import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Folder as FolderIcon } from 'lucide-react';

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function CreateFolderModal({ open, onClose, onCreate }: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await onCreate(name.trim());
      setName('');
      onClose();
    } catch {
      setError('Failed to create folder. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New folder"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={creating} disabled={!name.trim()}>
            <FolderIcon className="h-4 w-4" />
            Create
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <label htmlFor="folderName" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Folder name
        </label>
        <input
          id="folderName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`input-base ${error ? 'input-error' : ''}`}
          placeholder="My new folder"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
        />
        {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </Modal>
  );
}
