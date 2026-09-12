import { Box, Link, Text } from '@chakra-ui/react';
import { useAuth } from '@contexts/AuthContext';
import { isGuestUser } from '@shared/api';
import SupportDialog from '@components/SupportDialog';
import QuackDuck from '@components/QuackDuck';
import { memo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { APP_FOOTER_HEIGHT, APP_FOOTER_Z } from '@theme/sidePanelLayout';
import { useTranslation } from 'react-i18next';
import { SUPPORT_EMAIL } from './constants';
import FooterColumn from './FooterColumn';
import FooterLink from './FooterLink';
import type { AppFooterProps } from './types';

/**
 * Site footer.
 *
 * Two shapes for two jobs. `bar` is the strip under the editor, where the
 * footer is chrome and has to stay out of the way. `page` is the ordinary
 * end of a public page: columns of links, then a rule and the small print —
 * which is where anyone looking for the terms or the privacy policy will
 * look first, having found them nowhere else.
 */
function AppFooter({ variant = 'page' }: AppFooterProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  /* Signing up is the one thing an account holder cannot be asked to do.
     A guest still can — that is the whole point of the guest. */
  const signedIn = Boolean(user && !isGuestUser(user));
  const isBar = variant === 'bar';
  const [supportOpen, setSupportOpen] = useState(false);
  const source = isBar ? 'editor_footer' : 'page_footer';
  const year = new Date().getFullYear();

  if (isBar) {
    return (
      <Box
        as="footer"
        flexShrink={0}
        position="relative"
        zIndex={APP_FOOTER_Z}
        h={APP_FOOTER_HEIGHT}
        minH={APP_FOOTER_HEIGHT}
        borderTopWidth="1px"
        borderColor="border.default"
        bg="bg.nav"
        px="16px"
        display="flex"
        alignItems="center"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="8px"
          flexWrap="wrap"
          fontSize="xs"
          color="fg.muted"
          w="full"
        >
          {/* Support belongs beside the name it supports; the far side of the
              bar is for the one thing being asked of the visitor. */}
          <Box display="inline-flex" alignItems="center" gap="8px">
            <Text as="span">{t('footer_brand')}</Text>
            <Text as="span" aria-hidden>
              ·
            </Text>
            <Link
              as="button"
              type="button"
              color="brand.text"
              fontWeight="600"
              _hover={{ textDecoration: 'underline' }}
              onClick={() => setSupportOpen(true)}
            >
              {t('footer_support')}
            </Link>
          </Box>
          {signedIn ? null : (
            <Link
              asChild
              color="brand.text"
              fontWeight="600"
              _hover={{ textDecoration: 'underline' }}
            >
              <RouterLink to={`/signup?from=${source}`}>{t('sign_up')}</RouterLink>
            </Link>
          )}
        </Box>
        <SupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} source={source} />
      </Box>
    );
  }

  return (
    <Box
      as="footer"
      flexShrink={0}
      borderTopWidth="1px"
      borderColor="border.default"
      px={{ base: '20px', md: '48px' }}
      pt={{ base: '32px', md: '48px' }}
      pb="24px"
    >
      <Box maxW="1120px" mx="auto">
        <Box
          display="flex"
          flexWrap="wrap"
          gap={{ base: '28px', md: '48px' }}
          justifyContent="space-between"
        >
          <Box maxW="300px" minW="220px">
            <Box display="inline-flex" alignItems="center" gap="8px" mb="10px">
              <Box aria-hidden display="inline-flex">
                <QuackDuck size={18} />
              </Box>
              <Text fontWeight="700" color="fg.default">
                {t('footer_brand')}
              </Text>
            </Box>
            <Text fontSize="sm" color="fg.muted" lineHeight="1.7">
              {t('footer_tagline')}
            </Text>
          </Box>

          <FooterColumn title={t('footer_col_product')}>
            <FooterLink to="/editor">{t('footer_editor')}</FooterLink>
            <FooterLink to="/docs">{t('footer_docs')}</FooterLink>
            {signedIn ? null : (
              <FooterLink to={`/signup?from=${source}`}>{t('sign_up')}</FooterLink>
            )}
          </FooterColumn>

          <FooterColumn title={t('footer_col_company')}>
            <FooterLink onClick={() => setSupportOpen(true)}>{t('footer_support')}</FooterLink>
            <Link
              href={`mailto:${SUPPORT_EMAIL}`}
              color="fg.muted"
              fontSize="sm"
              _hover={{ color: 'brand.text', textDecoration: 'none' }}
            >
              {SUPPORT_EMAIL}
            </Link>
          </FooterColumn>

          <FooterColumn title={t('footer_col_legal')}>
            <FooterLink to="/terms">{t('footer_terms')}</FooterLink>
            <FooterLink to="/privacy">{t('footer_privacy')}</FooterLink>
          </FooterColumn>
        </Box>

        <Box
          mt={{ base: '28px', md: '40px' }}
          pt="16px"
          borderTopWidth="1px"
          borderColor="border.default"
          display="flex"
          flexWrap="wrap"
          gap="12px"
          justifyContent="space-between"
          alignItems="center"
          fontSize="xs"
          color="fg.subtle"
        >
          <Text as="span">{t('footer_rights', { year })}</Text>
          <Box display="inline-flex" gap="16px">
            <Link
              asChild
              color="fg.subtle"
              _hover={{ color: 'brand.text', textDecoration: 'none' }}
            >
              <RouterLink to="/terms">{t('footer_terms')}</RouterLink>
            </Link>
            <Link
              asChild
              color="fg.subtle"
              _hover={{ color: 'brand.text', textDecoration: 'none' }}
            >
              <RouterLink to="/privacy">{t('footer_privacy')}</RouterLink>
            </Link>
          </Box>
        </Box>
      </Box>

      <SupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} source={source} />
    </Box>
  );
}

export default memo(AppFooter);
