import { supportApi } from '@shared/api';
import { trackEvent } from '@/analytics';
import { trackProductEvent } from '@/metrics';
import { SUPPORT_EMAIL } from '@components/AppFooter/constants';
import QuackDuck from '@components/QuackDuck';
import QuackSpinner from '@components/QuackSpinner';
import ThemedTextField from '@components/common/ThemedTextField';
import { DIALOG_PAD } from '@components/common/BaseEditDialog';
import { useGlassSurface } from '@theme/glassSurfaces';
import { Box, Button, Dialog, HStack, Input, Portal, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMAIL_RE, EMPTY_ACCESS_REQUEST_FORM } from './constants';
import type { AccessRequestDialogProps, AccessRequestForm } from './types';

/**
 * Invite-only signup form. Replaces the old `mailto:` template — the request
 * goes to the API, which stores it and mails support@.
 */
export default function AccessRequestDialog({
  open,
  onClose,
  source = 'unknown',
}: AccessRequestDialogProps) {
  const { t } = useTranslation();
  const glass = useGlassSurface();
  const [form, setForm] = useState<AccessRequestForm>(EMPTY_ACCESS_REQUEST_FORM);
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<AccessRequestForm | null>(null);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_ACCESS_REQUEST_FORM);
      setWebsite('');
      setError(null);
      setSent(null);
      setSending(false);
    }
  }, [open]);

  const set = (key: keyof AccessRequestForm) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async () => {
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      setError(t('access_request_required'));
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError(t('access_request_invalid_email'));
      return;
    }

    setSending(true);
    setError(null);
    try {
      await supportApi.requestAccess({
        name,
        email,
        company: form.company.trim(),
        gitlabUsername: form.gitlabUsername.trim(),
        message: form.message.trim(),
        source,
        website,
      });
      trackEvent('access_request_sent', { placement: source });
      trackProductEvent('landing.access_request_sent');
      setSent({ ...form, name, email });
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      setError(
        t(status === 429 ? 'access_request_throttled' : 'access_request_failed', {
          email: SUPPORT_EMAIL,
        })
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => {
        if (!d.open) onClose();
      }}
      placement="center"
      size="sm"
    >
      <Portal>
        <Dialog.Backdrop bg={glass.backdrop} zIndex={1790} />
        <Dialog.Positioner zIndex={1800}>
          <Dialog.Content
            data-testid="access-request-dialog"
            color="fg.default"
            maxW="460px"
            w="calc(100% - 32px)"
            {...glass.dialog}
          >
            <Dialog.Header
              px={DIALOG_PAD.headerPx}
              pt={DIALOG_PAD.headerPt}
              pb={DIALOG_PAD.headerPb}
            >
              <HStack gap="12px" align="center">
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="10px"
                  display="grid"
                  placeItems="center"
                  flexShrink={0}
                  borderWidth="1px"
                  borderColor="border.glass"
                >
                  <QuackDuck size={24} />
                </Box>
                <Dialog.Title fontWeight="600">
                  {sent ? t('access_request_done_title') : t('access_request_title')}
                </Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.Body px={DIALOG_PAD.bodyPx} py="8px">
              {sent ? (
                <Text color="fg.muted" lineHeight="1.6">
                  {t('access_request_done_body', { name: sent.name, email: sent.email })}
                </Text>
              ) : (
                <VStack align="stretch" gap="12px">
                  <Text fontSize="sm" color="fg.muted" lineHeight="1.55">
                    {t('access_request_intro')}
                  </Text>

                  <ThemedTextField
                    label={t('access_request_name')}
                    value={form.name}
                    onChange={set('name')}
                    required
                    autoFocus
                    data-testid="access-request-name"
                  />
                  <ThemedTextField
                    label={t('access_request_email')}
                    value={form.email}
                    onChange={set('email')}
                    type="email"
                    required
                    data-testid="access-request-email"
                  />
                  <ThemedTextField
                    label={t('access_request_company')}
                    value={form.company}
                    onChange={set('company')}
                    placeholder={t('access_request_optional')}
                  />
                  <ThemedTextField
                    label={t('access_request_gitlab')}
                    value={form.gitlabUsername}
                    onChange={set('gitlabUsername')}
                    placeholder={t('access_request_optional')}
                  />
                  <ThemedTextField
                    label={t('access_request_message')}
                    value={form.message}
                    onChange={set('message')}
                    multiline
                    minRows={3}
                    placeholder={t('access_request_optional')}
                  />

                  {/* Honeypot — hidden from people, catnip for bots. */}
                  <Box
                    as="span"
                    position="absolute"
                    left="-9999px"
                    aria-hidden
                    pointerEvents="none"
                  >
                    <Input
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </Box>

                  {error && (
                    <Text color="red.400" fontSize="sm">
                      {error}
                    </Text>
                  )}
                </VStack>
              )}
            </Dialog.Body>

            <Dialog.Footer
              gap="8px"
              px={DIALOG_PAD.footerPx}
              py={DIALOG_PAD.footerPy}
              justifyContent="flex-end"
            >
              {sent ? (
                <Button
                  onClick={onClose}
                  bg="bg.brand.emphasis"
                  color="fg.on.brand"
                  borderWidth="0"
                  _hover={{ bg: 'bg.brand.emphasis.hover' }}
                >
                  {t('close')}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={onClose} disabled={sending}>
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={() => void submit()}
                    loading={sending}
                    loadingText={t('access_request_sending')}
                    spinner={<QuackSpinner size="sm" color="currentColor" />}
                    bg="bg.brand.emphasis"
                    color="fg.on.brand"
                    borderWidth="0"
                    _hover={{ bg: 'bg.brand.emphasis.hover' }}
                    data-testid="access-request-submit"
                  >
                    {t('access_request_submit')}
                  </Button>
                </>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
