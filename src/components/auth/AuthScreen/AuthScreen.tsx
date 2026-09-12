import { trackEvent } from '@/analytics';
import { trackProductEvent } from '@/metrics';
import AppFooter from '@components/AppFooter';
import QglMark from '@components/QglMark';
import SupportDialog from '@components/SupportDialog';
import { useColorMode } from '@contexts/ColorModeContext';
import { Box, Button, Heading, Link, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, BookOpen, Mail } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { cameFromLanding, FROM_LANDING } from '@/features/auth/cameFrom';

type Props = {
  headline: string;
  support: string;
  /** The provider buttons — the only thing that differs between the two screens. */
  children: ReactNode;
  /** The other screen, offered top right the way the two halves of a door are. */
  switchTo: { to: string; label: string };
  /** Where a support message from this screen is reported as coming from. */
  source: string;
};

/**
 * The shell both auth screens wear.
 *
 * Signing in and signing up are two intentions, not two states of one form, so
 * they are two routes — but everything around the buttons is the same, and a
 * second copy of it would drift within a release.
 */
export default function AuthScreen({ headline, support, children, switchTo, source }: Props) {
  const { t } = useTranslation();
  const { chrome } = useColorMode();
  const [supportOpen, setSupportOpen] = useState(false);
  /* Only offered to someone who actually arrived from the landing page —
     otherwise "back" would point at a page they have never seen. */
  const location = useLocation();
  const fromLanding = cameFromLanding(location);

  return (
    <Box minH="100dvh" bg="bg.canvas" color="fg.default" display="flex" flexDirection="column">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="12px"
        px={{ base: '20px', md: '32px' }}
        pt="20px"
      >
        {fromLanding ? (
          <Link
            asChild
            fontSize="sm"
            fontWeight="600"
            color="fg.muted"
            _hover={{ color: 'brand.text' }}
            display="inline-flex"
            alignItems="center"
            gap="6px"
          >
            <RouterLink to="/">
              <ArrowLeft size={15} aria-hidden />
              {t('auth_back_to_site')}
            </RouterLink>
          </Link>
        ) : (
          <Box aria-hidden />
        )}
        <Button asChild size="sm" variant="outline" fontWeight="600" cursor="pointer">
          {/* The state rides along, so hopping between the two screens does not
              lose the way home. */}
          <RouterLink to={switchTo.to} state={fromLanding ? FROM_LANDING : undefined}>
            {switchTo.label}
          </RouterLink>
        </Button>
      </Box>

      <Box
        as="main"
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px="24px"
        py="40px"
      >
        <Box w="100%" maxW="400px">
          <VStack align="stretch" gap="24px">
            <Box>
              <Box display="inline-flex" alignItems="center" gap="12px" mb="20px">
                <Box aria-hidden flexShrink={0} lineHeight={0}>
                  <QglMark size={40} />
                </Box>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                  color="fg.muted"
                  lineHeight="1"
                >
                  Quiet Grid Labs
                </Text>
              </Box>
              <Heading
                as="h1"
                size="xl"
                letterSpacing="-0.02em"
                lineHeight="1.2"
                mb="10px"
                color="fg.default"
              >
                {headline}
              </Heading>
              <Text fontSize="md" color="fg.muted" lineHeight="1.65">
                {support}
              </Text>
            </Box>

            <VStack align="stretch" gap="10px">
              {children}
            </VStack>

            {/* The sentence promised two documents and linked to neither —
                which is also what Google's consent screen asks us for. */}
            <Text fontSize="xs" color={chrome.textMuted} textAlign="center" lineHeight="1.5">
              {t('auth_terms_before')}{' '}
              <Link asChild color="brand.text" fontWeight="600">
                <RouterLink to="/terms">{t('footer_terms')}</RouterLink>
              </Link>{' '}
              {t('auth_terms_and')}{' '}
              <Link asChild color="brand.text" fontWeight="600">
                <RouterLink to="/privacy">{t('footer_privacy')}</RouterLink>
              </Link>
              {t('auth_terms_after')}
            </Text>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="16px"
              flexWrap="wrap"
            >
              <Link
                asChild
                fontSize="sm"
                fontWeight="600"
                color="fg.muted"
                _hover={{ color: 'brand.text' }}
              >
                <RouterLink
                  to="/editor"
                  onClick={() => {
                    trackEvent('login_try_local');
                    trackProductEvent('landing.try_local');
                  }}
                >
                  {t('login_local')}
                </RouterLink>
              </Link>
              <Text color={chrome.textMuted} fontSize="sm" aria-hidden>
                ·
              </Text>
              <Link
                asChild
                fontSize="sm"
                fontWeight="600"
                color="fg.muted"
                display="inline-flex"
                alignItems="center"
                gap="6px"
                _hover={{ color: 'brand.text' }}
              >
                <RouterLink to="/docs">
                  <BookOpen size={14} />
                  {t('documentation')}
                </RouterLink>
              </Link>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="8px"
              flexWrap="wrap"
            >
              <Mail size={14} aria-hidden />
              <Link
                as="button"
                type="button"
                fontSize="sm"
                fontWeight="600"
                color="brand.text"
                _hover={{ textDecoration: 'underline' }}
                onClick={() => setSupportOpen(true)}
              >
                {t('footer_support')}
              </Link>
            </Box>
          </VStack>
        </Box>
      </Box>

      <SupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} source={source} />

      <AppFooter />
    </Box>
  );
}
