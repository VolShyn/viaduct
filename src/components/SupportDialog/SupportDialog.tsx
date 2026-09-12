import { supportApi } from '@shared/api';
import { trackEvent } from '@/analytics';
import { SUPPORT_EMAIL } from '@components/AppFooter/constants';
import QuackDuck from '@components/QuackDuck';
import QuackSpinner from '@components/QuackSpinner';
import ThemedTextField from '@components/common/ThemedTextField';
import { DIALOG_PAD } from '@components/common/BaseEditDialog';
import { useGlassSurface } from '@theme/glassSurfaces';
import { Box, Button, Dialog, HStack, Input, Portal, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMAIL_RE, EMPTY_SUPPORT_FORM, TOPICS } from './constants';
import type { SupportDialogProps, SupportForm } from './types';

/**
 * Support and feedback form. Same shape as the access request — it goes to the
 * API, which stores it and mails support@, rather than opening a mail client
 * the visitor may not have configured.
 */
export default function SupportDialog({
  open,
  onClose,
  source = 'unknown',
}: SupportDialogProps) {
  const { t } = useTranslation();
  const glass = useGlassSurface();
  const [form, setForm] = useState<SupportForm>(EMPTY_SUPPORT_FORM);
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<SupportForm | null>(null);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_SUPPORT_FORM);
      setWebsite('');
      setError(null);
      setSent(null);
      setSending(false);
    }
  }, [open]);

  const set = (key: 'name' | 'email' | 'message') => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setError(t('support_required'));
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError(t('support_invalid_email'));
      return;
    }

    setSending(true);
    setError(null);
    try {
      await supportApi.sendSupportMessage({
        name,
        email,
        topic: form.topic,
        message,
        source,
        website,
      });
      trackEvent('support_message_sent', { placement: source, topic: form.topic });
      setSent({ ...form, name, email, message });
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      setError(
        t(status === 429 ? 'support_throttled' : 'support_failed', { email: SUPPORT_EMAIL })
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
            data-testid="support-dialog"
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
                  {sent ? t('support_done_title') : t('support_title')}
                </Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.Body px={DIALOG_PAD.bodyPx} py="8px">
              {sent ? (
                <Text color="fg.muted" lineHeight="1.6">
                  {t('support_done_body', { name: sent.name, email: sent.email })}
                </Text>
              ) : (
                <VStack align="stretch" gap="12px">
                  <Text fontSize="sm" color="fg.muted" lineHeight="1.55">
                    {t('support_intro')}
                  </Text>

                  <Box>
                    <Text fontSize="xs" color="fg.muted" mb="6px">
                      {t('support_topic')}
                    </Text>
                    <HStack gap="6px" flexWrap="wrap">
                      {TOPICS.map(({ value, labelKey }) => {
                        const active = form.topic === value;
                        return (
                          <Button
                            key={value}
                            size="xs"
                            h="28px"
                            px="12px"
                            borderRadius="999px"
                            variant="outline"
                            fontWeight={active ? '700' : '500'}
                            color={active ? 'brand.text' : 'fg.muted'}
                            borderColor={active ? 'brand.solid' : 'border.default'}
                            bg={active ? 'bg.brand.subtle' : 'transparent'}
                            _hover={{ bg: active ? 'bg.brand.muted' : 'bg.list.hover' }}
                            aria-pressed={active}
                            onClick={() => setForm((prev) => ({ ...prev, topic: value }))}
                          >
                            {t(labelKey)}
                          </Button>
                        );
                      })}
                    </HStack>
                  </Box>

                  <ThemedTextField
                    label={t('support_name')}
                    value={form.name}
                    onChange={set('name')}
                    required
                    autoFocus
                    data-testid="support-name"
                  />
                  <ThemedTextField
                    label={t('support_email')}
                    value={form.email}
                    onChange={set('email')}
                    type="email"
                    required
                    data-testid="support-email"
                  />
                  <ThemedTextField
                    label={t('support_message')}
                    value={form.message}
                    onChange={set('message')}
                    multiline
                    minRows={4}
                    required
                    placeholder={t('support_message_placeholder')}
                    data-testid="support-message"
                  />

                  {/* Honeypot — hidden from people, catnip for bots. */}
                  <Box as="span" position="absolute" left="-9999px" aria-hidden pointerEvents="none">
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
                    loadingText={t('support_sending')}
                    spinner={<QuackSpinner size="sm" color="currentColor" />}
                    bg="bg.brand.emphasis"
                    color="fg.on.brand"
                    borderWidth="0"
                    _hover={{ bg: 'bg.brand.emphasis.hover' }}
                    data-testid="support-submit"
                  >
                    {t('support_submit')}
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
