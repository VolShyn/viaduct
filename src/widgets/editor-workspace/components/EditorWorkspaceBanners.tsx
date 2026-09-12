import { isGuestUser, loginPagePath, type User } from '@shared/api';
import type { ProjectSnapshot } from '@features/versions';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import QuackSpinner from '@components/QuackSpinner';
import { useTranslation } from 'react-i18next';

type Props = {
  viewingVersion: boolean;
  versionMeta: ProjectSnapshot | null;
  projectMode: boolean;
  user: User | null;
  viewOnly: boolean;
  onBackToLive: () => void;
  onSignIn: () => void;
};

export default function EditorWorkspaceBanners({
  viewingVersion,
  versionMeta,
  projectMode,
  user,
  viewOnly,
  onBackToLive,
  onSignIn,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      {viewingVersion && versionMeta && (
        <HStack
          position="fixed"
          top="64px"
          left="50%"
          transform="translateX(-50%)"
          zIndex={1640}
          px="14px"
          py="7px"
          gap="12px"
          borderRadius="10px"
          bg="bg.brand.emphasis.subtle"
          backdropFilter="blur(16px)"
          borderWidth="1px"
          borderColor="border.brand.emphasis"
          flexWrap="wrap"
          maxW="min(92vw, 620px)"
        >
          <Text fontSize="sm" color="fg.default">
            <Text as="span" fontWeight="700">
              {versionMeta.name}
            </Text>{' '}
            · {new Date(versionMeta.created_at ?? Date.now()).toLocaleDateString()}
          </Text>
          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color="fg.brand.emphasis"
          >
            {t('version_view_readonly')}
          </Text>
          <Button
            size="xs"
            variant="outline"
            color="fg.brand.emphasis"
            borderColor="border.brand.emphasis"
            onClick={onBackToLive}
          >
            {t('version_view_back')}
          </Button>
        </HStack>
      )}

      {projectMode && isGuestUser(user) && (
        <HStack
          position="fixed"
          top="64px"
          left="50%"
          transform="translateX(-50%)"
          zIndex={1640}
          px="12px"
          py="6px"
          gap="12px"
          borderRadius="10px"
          bg="rgba(80, 32, 0, 0.82)"
          backdropFilter="blur(16px)"
          borderWidth="1px"
          borderColor="orange.700"
          flexWrap="wrap"
          maxW="min(92vw, 560px)"
        >
          <Text fontSize="sm" color="orange.100">
            {viewOnly ? 'Viewing' : 'Editing'} as{' '}
            <Text as="span" fontWeight="700">
              {user?.name || user?.username}
            </Text>
          </Text>
          {/* Goes to the login page, which offers every provider and a way to
              register — naming one of them here promised the wrong thing. */}
          <Button
            size="xs"
            variant="outline"
            borderColor="orange.400"
            color="orange.100"
            onClick={onSignIn}
            data-testid="guest-banner-login"
          >
            {t('sign_in')}
          </Button>
        </HStack>
      )}

    </>
  );
}

export function EditorWorkspaceLoading() {
  return (
    <Box h="100vh" display="grid" placeItems="center" bg="bg.canvas">
      <QuackSpinner size="xl" />
    </Box>
  );
}

export function EditorWorkspaceLoadError({
  loadError,
  user,
  projectId,
  onOpenProjects,
}: {
  loadError: string;
  user: User | null;
  projectId: string | undefined;
  onOpenProjects: () => void;
}) {
  return (
    <Box
      h="100vh"
      display="grid"
      placeItems="center"
      bg="bg.canvas"
      color="fg.default"
      gap="16px"
    >
      <Text>{loadError}</Text>
      {!user && (
        <Button asChild>
          <a href={loginPagePath(projectId ? `/projects/${projectId}` : undefined)}>Sign in</a>
        </Button>
      )}
      <Button variant="ghost" color="brand.text" onClick={onOpenProjects}>
        My projects
      </Button>
    </Box>
  );
}
