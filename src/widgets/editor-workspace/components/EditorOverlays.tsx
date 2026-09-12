import DesignSystemsPage from '@/pages/DesignSystemsPage';
import DataFlowsPage from '@/pages/DataFlowsPage';
import ServiceCatalogPage from '@/pages/ServiceCatalogPage';
import { closeCatalogOverlay } from '@plugins/service-catalog/uiState';
import { closeDesignSystemsOverlay } from '@/state/designSystemsOverlay';
import { closeDataFlowManager } from '@plugins/data-flows/uiState';
import {
  APP_FOOTER_OFFSET,
  SIDE_PANEL_INSET,
  WORKSPACE_CONTENT_TOP,
  WORKSPACE_EDITOR_Z,
} from '@theme/sidePanelLayout';
import { Box } from '@chakra-ui/react';
import type { CompareOverlaySession } from '@/state/compareOverlay';

type OverlayFrameProps = {
  children: React.ReactNode;
  /** Keep the tree mounted but off-screen so the next open paints immediately. */
  hidden?: boolean;
};

function OverlayFrame({ children, hidden = false }: OverlayFrameProps) {
  return (
    <Box
      position="absolute"
      top={WORKSPACE_CONTENT_TOP}
      left={SIDE_PANEL_INSET}
      right={SIDE_PANEL_INSET}
      bottom={`calc(${APP_FOOTER_OFFSET} + ${SIDE_PANEL_INSET})`}
      zIndex={WORKSPACE_EDITOR_Z}
      display={hidden ? 'none' : undefined}
      aria-hidden={hidden || undefined}
      pointerEvents={hidden ? 'none' : undefined}
    >
      <Box h="100%" overflow="hidden">
        {children}
      </Box>
    </Box>
  );
}

type Props = {
  /** Kept for call-site compatibility; Community has no projects manager. */
  projectsOpen: boolean;
  onCloseProjects: () => void;
  onGoLocal?: () => void;
  projectMode: boolean;
  projectId: string | undefined;
  canWrite: boolean;
  canAdminister: boolean;
  viewOnly: boolean;
  versionsAvailable: boolean;
  catalogOverlay: { selectedId?: string | null } | null;
  changeSetsOverlay: { selectedId?: string | null } | null;
  branchesOverlay: { selectedId?: string | null } | null;
  compareOverlay: CompareOverlaySession;
  domainsOverlay: { selectedId?: string | null } | null;
  designSystemsOverlay: { selectedName?: string | null } | null;
  dataFlowManager: { flowId?: string | null; stepId?: string | null } | null;
};

export default function EditorOverlays({
  projectMode,
  projectId,
  viewOnly,
  catalogOverlay,
  designSystemsOverlay,
  dataFlowManager,
}: Props) {
  return (
    <>
      {catalogOverlay ? (
        <OverlayFrame>
          <ServiceCatalogPage
            projectMode={projectMode}
            embedded
            initialSelectedId={catalogOverlay.selectedId ?? null}
            onRequestClose={() => closeCatalogOverlay()}
          />
        </OverlayFrame>
      ) : null}

      {designSystemsOverlay ? (
        <OverlayFrame>
          <DesignSystemsPage
            initialSelectedName={designSystemsOverlay.selectedName ?? null}
            canWrite={projectMode ? !viewOnly : true}
            projectId={projectId}
            onRequestClose={() => closeDesignSystemsOverlay()}
          />
        </OverlayFrame>
      ) : null}

      {dataFlowManager ? (
        <OverlayFrame>
          <DataFlowsPage
            projectMode={projectMode}
            embedded
            initialFlowId={dataFlowManager.flowId ?? null}
            initialStepId={dataFlowManager.stepId ?? null}
            canWriteOverride={projectMode ? !viewOnly : true}
            onRequestClose={() => closeDataFlowManager()}
          />
        </OverlayFrame>
      ) : null}
    </>
  );
}
