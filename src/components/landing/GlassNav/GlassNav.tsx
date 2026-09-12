import { trackEvent } from '@/analytics';
import { trackProductEvent } from '@/metrics';
import QuackDuck from '@components/QuackDuck';
import SignUpButton from '@components/SignUpButton';
import { FROM_LANDING } from '@/features/auth/cameFrom';
import { useAuth } from '@contexts/AuthContext';
import { useColorMode } from '@contexts/ColorModeContext';
import ConfirmDialog from '@components/common/ConfirmDialog';
import { useGlassSurface } from '@theme/glassSurfaces';
import { loginPagePath } from '@shared/api';
import { Box, Button, HStack, IconButton, Link, Text } from '@chakra-ui/react';
import { ArrowRight, BookOpen, LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

/**
 * The bar every public page wears.
 *
 * Shared rather than copied so that walking from the landing page to the
 * integrations page does not change the furniture under the reader — a header
 * that rearranges itself between two pages of the same site reads as having
 * left the site.
 */
/**
 * Where "open the editor" should land for someone who came from it.
 *
 * The toolbar stores the path it left on its way to the docs, so a reader who
 * opened help from a project goes back to that project rather than to the
 * editor's front door. Anything that is not a path of ours is ignored: this is
 * a value from storage, and an absolute URL in it would be an open redirect.
 */
function editorReturnPath(): string {
  try {
    const stored = sessionStorage.getItem('c4-docs-return');
    if (stored && /^\/[^/]/.test(stored)) return stored;
  } catch {
    /* A browser that refuses storage just gets the default. */
  }
  return '/editor';
}

/** True once the page has moved at all — the bar only earns its fill then. */
function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const read = () => setScrolled(window.scrollY > threshold);
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, [threshold]);
  return scrolled;
}

export default function GlassNav() {
  const glass = useGlassSurface();
  const { t } = useTranslation();
  const { mode, toggleColorMode } = useColorMode();
  const themeLabel = mode === 'light' ? t('landing_theme_dark') : t('landing_theme_light');
  const scrolled = useScrolled();
  /*
   * The same bar signed in or out, with the one part that has to differ: a
   * reader who already has an account is not offered one. The landing page
   * never sees this branch — it sends an authenticated visitor to the editor —
   * but the docs and the integrations page are read by both.
   */
  const { user, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex={100}
      px={{ base: '20px', md: '40px' }}
      py="10px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="16px"
      /*
       * At rest the bar is not there: no fill, no rule, no blur, so the dot
       * grid runs under the logo and the page starts at the top of the window
       * rather than under a strip. The fill arrives the moment anything
       * scrolls beneath it, which is when it has content to separate itself
       * from — the transition is on the properties that change, so the two
       * states cross-fade instead of snapping.
       */
      {...(scrolled
        ? glass.floatBar
        : {
            bg: 'transparent',
            borderColor: 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: 'none',
          })}
      transition="background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, backdrop-filter 180ms ease"
      borderRadius="0"
      borderTopWidth="0"
      borderLeftWidth="0"
      borderRightWidth="0"
    >
      {/* The wordmark goes home, the way a wordmark does everywhere else —
          on the integrations page it was the only thing that looked like a
          way back and was not one. */}
      <Link
        asChild
        display="inline-flex"
        alignItems="center"
        gap="10px"
        _hover={{ textDecoration: 'none', opacity: 0.85 }}
      >
        <RouterLink to="/" aria-label="Viaduct home">
          {/* The duck, not the letter mark. `qgl` names the company and needs
              a paragraph before it means anything; the duck is what people
              already point at, and it is the same yellow in both themes on
              purpose — a rubber duck that changed colour with the theme would
              stop being a rubber duck. */}
          <QuackDuck size={28} title="Viaduct" />
          <Text fontWeight="800" fontSize="md" color="fg.default" letterSpacing="-0.02em">
            Viaduct
          </Text>
        </RouterLink>
      </Link>
      <HStack gap="8px">
        {/* One link, not a menu: the page it opens is the menu. A dropdown
            here made a reader choose before they had seen the options. */}
        <Link
          asChild
          fontSize="sm"
          fontWeight="600"
          color="fg.muted"
          _hover={{ color: 'fg.default' }}
          px="2px"
        >
          <RouterLink
            to="/integrations"
            onClick={() => trackEvent('landing_integrations')}
          >
            {t('landing_nav_integrations')}
          </RouterLink>
        </Link>
        <Link
          asChild
          fontSize="sm"
          fontWeight="600"
          color="fg.muted"
          _hover={{ color: 'fg.default' }}
          px="2px"
        >
          <RouterLink to="/docs" onClick={() => trackEvent('landing_docs')}>
            <BookOpen size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: '-2px' }} />
            {t('landing_nav_docs')}
          </RouterLink>
        </Link>
        <IconButton
          aria-label={themeLabel}
          title={themeLabel}
          onClick={toggleColorMode}
          size="sm"
          variant="ghost"
          h="32px"
          minW="32px"
          color="fg.muted"
          borderRadius="10px"
          cursor="pointer"
          _hover={{ bg: 'bg.subtle.hover', color: 'fg.default' }}
        >
          {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </IconButton>
        {user ? (
          <>
            <Button
              asChild
              size="sm"
              h="32px"
              px="14px"
              variant="ghost"
              color="fg.muted"
              fontWeight="600"
              borderRadius="10px"
              _hover={{ bg: 'bg.muted', color: 'fg.default' }}
              cursor="pointer"
            >
              <RouterLink to={editorReturnPath()}>
                {t('landing_nav_open_editor')}
                <ArrowRight size={14} aria-hidden style={{ marginLeft: 6 }} />
              </RouterLink>
            </Button>
            <Text
              fontSize="sm"
              color="fg.muted"
              fontWeight="600"
              maxW="140px"
              truncate
              display={{ base: 'none', md: 'block' }}
            >
              {user.username}
            </Text>
            <IconButton
              aria-label="Log out"
              title="Log out"
              onClick={() => setConfirmLogout(true)}
              size="sm"
              variant="ghost"
              h="32px"
              minW="32px"
              color="fg.muted"
              borderRadius="10px"
              cursor="pointer"
              _hover={{ bg: 'bg.subtle.hover', color: 'fg.default' }}
            >
              <LogOut size={16} />
            </IconButton>
          </>
        ) : (
          <>
            <SignUpButton
              size="sm"
              source="landing_nav"
              state={FROM_LANDING}
              hideIcon
              h="32px"
              px="14px"
              borderRadius="10px"
              fontSize="sm"
            />
            <Button
              asChild
              size="sm"
              h="32px"
              px="14px"
              /* Quiet on purpose: the page has one accent now, and it is the
                 door that opens without an account. */
              variant="ghost"
              color="fg.muted"
              fontWeight="600"
              borderRadius="10px"
              _hover={{ bg: 'bg.muted', color: 'fg.default' }}
              cursor="pointer"
            >
              <RouterLink to={loginPagePath()} state={FROM_LANDING} onClick={() => {
                trackEvent('landing_signin', { placement: 'nav' });
                trackProductEvent('landing.signin');
              }}>
                {t('landing_cta_primary')}
              </RouterLink>
            </Button>
          </>
        )}
      </HStack>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        content="You are about to leave this session. Are you sure you want to log out?"
        onCancel={() => {
          if (loggingOut) return;
          setConfirmLogout(false);
        }}
        onConfirm={() => {
          setLoggingOut(true);
          void logout()
            .then(() => setConfirmLogout(false))
            .finally(() => setLoggingOut(false));
        }}
        confirmText="Yes, log out"
        cancelText="Cancel"
        confirmLoading={loggingOut}
      />
    </Box>
  );
}
