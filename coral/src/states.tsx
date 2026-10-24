import { Link } from '@mui/material';

export function loadError(error: { status?: number; message?: string } | null): string | null {
  if (!error) {
    return null;
  }
  if (error.status === 403) {
    return 'Your account cannot read Coral recommendations (recommendations.coral.zoorik.com) in this cluster.';
  }
  return error.message || 'Coral recommendations could not be read.';
}

export function NotInstalled() {
  return (
    <>
      Coral is not installed in this cluster. To connect it, see{' '}
      <Link href="https://zoorik.com/coral" target="_blank" rel="noopener noreferrer">
        zoorik.com/coral
      </Link>
      .
    </>
  );
}
