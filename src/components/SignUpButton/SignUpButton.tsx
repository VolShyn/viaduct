import { Button, Box } from '@chakra-ui/react';
import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { sanitizeSignupSource } from './helpers';
import type { SignUpButtonProps } from './types';

/*
 * Signing up is a screen, not a dialog.
 *
 * This used to open the access-request form wherever it stood. That made the
 * request the only way in, which stopped being true the moment Google arrived:
 * someone who could have had an account in one click was being handed a form
 * and a wait. The screen offers both and lets them choose.
 */
export default function SignUpButton({
  label,
  size = 'md',
  source = 'unknown',
  hideIcon = false,
  state,
  ...props
}: SignUpButtonProps) {
  const { t } = useTranslation();
  const from = sanitizeSignupSource(source);

  return (
    <Button
      asChild
      size={size}
      variant="outline"
      fontWeight="700"
      cursor="pointer"
      color="brand.text"
      borderColor="brand.solid"
      bg="transparent"
      _hover={{ bg: 'bg.brand.emphasis', color: 'fg.on.brand' }}
      {...props}
    >
      <RouterLink to={from ? `/signup?from=${from}` : '/signup'} state={state}>
        {hideIcon ? (
          <Box as="span" data-nav-compact-icon="" display="none" lineHeight={0}>
            <UserPlus size={size === 'sm' || size === 'xs' ? 14 : 16} />
          </Box>
        ) : (
          <UserPlus
            size={size === 'sm' || size === 'xs' ? 14 : 16}
            style={{ marginRight: 8 }}
          />
        )}
        <span data-nav-label="">{label ?? t('sign_up')}</span>
      </RouterLink>
    </Button>
  );
}
