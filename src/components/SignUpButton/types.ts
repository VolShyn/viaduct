import type { ButtonProps } from '@chakra-ui/react';

export type SignUpButtonProps = Omit<ButtonProps, 'asChild' | 'children'> & {
  label?: string;
  /** Carried to the signup screen so the email still says where this began. */
  source?: string;
  /** Hide the leading icon — for tight chrome like the nav bars. */
  hideIcon?: boolean;
  /** Navigation state for the link — `FROM_LANDING` so the screen can offer a way back. */
  state?: unknown;
};
