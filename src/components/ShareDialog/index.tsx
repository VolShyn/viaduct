export default function ShareDialog(_props: {
  open?: boolean;
  onClose?: () => void;
  projectId?: string;
  onPublished?: (payload: { projectId: string; shareLink: { url: string } }) => void;
  [key: string]: unknown;
}) {
  return null;
}
