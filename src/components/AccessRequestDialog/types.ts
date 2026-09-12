export type AccessRequestDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Which button opened this — forwarded to the server for the email body. */
  source?: string;
};

export type AccessRequestForm = {
  name: string;
  email: string;
  company: string;
  gitlabUsername: string;
  message: string;
};
