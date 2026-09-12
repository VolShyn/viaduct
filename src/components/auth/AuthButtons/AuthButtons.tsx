import { trackEvent } from '@/analytics';
import { trackProductEvent } from '@/metrics';
import { rememberProvider, type AuthProvider } from '@/features/auth/lastProvider';
import GithubMark from '@components/auth/GithubMark';
import GoogleMark from '@components/auth/GoogleMark';
import { useColorMode } from '@contexts/ColorModeContext';
import { Box, Badge, Button, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

function providerHref(
  base: string,
  returnTo: string | null,
  intent?: 'login' | 'signup'
): string {
  const params = new URLSearchParams();
  if (returnTo) params.set('returnTo', returnTo);
  /* OAuth sends the same request from both screens; this is what tells the
     callback whether it may create an account. It is signed into the state on
     the way out, so it cannot be edited in the address bar. */
  if (intent) params.set('intent', intent);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/** The badge on whichever button worked last time. */
function LastUsed() {
  const { t } = useTranslation();
  return (
    <Badge
      ml="8px"
      px="6px"
      py="1px"
      borderRadius="4px"
      fontSize="10px"
      fontWeight="700"
      letterSpacing="0.04em"
      textTransform="uppercase"
      colorPalette="brand"
      variant="subtle"
    >
      {t('auth_last_used')}
    </Badge>
  );
}

type ButtonProps = {
  returnTo: string | null;
  label: string;
  lastUsed?: boolean;
};

/** Both OAuth buttons: the intent is what lets the callback tell the screens apart. */
type OAuthButtonProps = ButtonProps & {
  /** `signup` is the only one allowed to create an account. */
  intent: 'login' | 'signup';
};

/**
 * White, not branded. Google's guidelines want their mark on a light ground,
 * and a four-colour glyph on our orange goes muddy — the button still reads as
 * the primary action because white against this canvas is the loudest thing
 * on it.
 */
export function GoogleAuthButton({ returnTo, label, lastUsed, intent }: OAuthButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      h="48px"
      fontWeight="700"
      fontSize="md"
      cursor="pointer"
      bg="#ffffff"
      color="#1f1f1f"
      borderWidth="1px"
      borderColor="rgba(0, 0, 0, 0.16)"
      _hover={{ bg: '#f2f2f2' }}
      data-testid="auth-google"
    >
      <a
        href={providerHref('/api/auth/google', returnTo, intent)}
        onClick={() => {
          rememberProvider('google');
          trackEvent('login_google');
          trackProductEvent('auth.login_google');
        }}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        <GoogleMark />
        {label}
        {lastUsed ? <LastUsed /> : null}
      </a>
    </Button>
  );
}

/**
 * GitHub, in the same shape as Google and one step quieter: outline rather
 * than white, so the two OAuth buttons do not compete for the same weight and
 * the eye still lands on one of them first. The mark is monochrome, so it
 * takes the button's ink in either colour mode.
 */
export function GithubAuthButton({ returnTo, label, lastUsed, intent }: OAuthButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      h="48px"
      variant="outline"
      fontWeight="700"
      fontSize="md"
      cursor="pointer"
      data-testid="auth-github"
    >
      <a
        href={providerHref('/api/auth/github', returnTo, intent)}
        onClick={() => {
          rememberProvider('github');
          trackEvent('login_github');
          trackProductEvent('auth.login_github');
        }}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        <GithubMark />
        {label}
        {lastUsed ? <LastUsed /> : null}
      </a>
    </Button>
  );
}

/** The organisation's GitLab — the same door it has always been. */
export function SsoAuthButton({ returnTo, label, lastUsed }: ButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      h="48px"
      variant="outline"
      fontWeight="700"
      fontSize="md"
      cursor="pointer"
      data-testid="auth-sso"
    >
      <a
        href={providerHref('/api/auth/gitlab', returnTo)}
        onClick={() => {
          rememberProvider('gitlab');
          trackEvent('login_gitlab');
          trackProductEvent('auth.login_gitlab');
        }}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        {label}
        {lastUsed ? <LastUsed /> : null}
      </a>
    </Button>
  );
}

/** A rule with a word in it, so the second option reads as an alternative. */
export function AuthDivider() {
  const { t } = useTranslation();
  const { chrome } = useColorMode();
  return (
    <Box display="flex" alignItems="center" gap="12px" py="2px">
      <Box flex="1" h="1px" bg="border.default" />
      <Text fontSize="xs" color={chrome.textMuted}>
        {t('auth_or')}
      </Text>
      <Box flex="1" h="1px" bg="border.default" />
    </Box>
  );
}

export type { AuthProvider };
