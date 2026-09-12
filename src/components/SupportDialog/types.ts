import type { SupportTopic } from '@shared/api';

export type SupportDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Which link opened this — forwarded to the server for the email body. */
  source?: string;
};

export type SupportForm = {
  name: string;
  email: string;
  topic: SupportTopic;
  message: string;
};
