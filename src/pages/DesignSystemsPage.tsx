import {
  findDesignSystemByName,
  isUiElement,
  listDesignSystems,
  type DesignSystemRecord,
  type DesignTokenRecord,
  type ModelWithDesignSystems,
  type UiExtras,
} from '@/types/c4Extensions';
import { useFlatC4Store } from '@archivisio/c4-modelizer-sdk';
import DesignSystemEditDialog from '@components/common/DesignSystemEditDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';
import FieldHint from '@components/common/FieldHint';
import DesignSourceKindIcon, {
  designSourceDisplayRef,
} from '@components/common/DesignSourceKindIcon';
import { ToolbarIconButton, TOOLBAR_ICON_SIZE } from '@components/common/ToolbarIconButton';
import { useGlassSurface } from '@theme/glassSurfaces';
import { MANAGER_BAR_MIN_H, SIDE_PANEL_INSET } from '@theme/sidePanelLayout';
import { mergeReadValues, mergeTokens, parsePastedTokens } from '@utils/designTokens';
import { designReadApi } from '@shared/api';
import { figmaErrorText } from '@utils/figmaErrors';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Text,
  Textarea,
  VStack,
  chakra,
} from '@chakra-ui/react';
import { Check, Copy, DownloadCloud, Palette, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const RowButton = chakra('button');

const TOKEN_TYPES = ['color', 'space', 'radius', 'type', 'shadow', 'other'] as const;

type Props = {
  initialSelectedName?: string | null;
  canWrite?: boolean;
  /** Absent for a local model: reading a file goes through the server. */
  projectId?: string;
  onRequestClose: () => void;
};

const GROUP_ORDER: DesignTokenRecord['type'][] = [
  'color',
  'space',
  'radius',
  'type',
  'shadow',
  'other',
];

/** A swatch for a colour, its value for everything else. */
function TokenMark({ token }: { token: DesignTokenRecord }) {
  if (token.type === 'color' && token.value) {
    return (
      <Box
        w="26px"
        h="26px"
        borderRadius="6px"
        flexShrink={0}
        bg={token.value}
        borderWidth="1px"
        borderColor="border.glass"
      />
    );
  }
  return (
    <Box
      w="26px"
      h="26px"
      borderRadius="6px"
      flexShrink={0}
      bg="bg.subtle"
      display="grid"
      placeItems="center"
      fontSize="9px"
      fontFamily="mono"
      color="fg.subtle"
    >
      {token.value?.replace(/px$/, '') || '—'}
    </Box>
  );
}

/**
 * What a design system holds, read rather than administered.
 *
 * The technical name sits small on the right because it is needed once — when
 * reading code, or when telling an agent which grey to use. The count of
 * places a value is used is the number that turns a list of colours into a
 * picture of what the project actually leans on.
 */
export default function DesignSystemsPage({
  initialSelectedName,
  canWrite = true,
  projectId,
  onRequestClose,
}: Props) {
  const { t, i18n } = useTranslation();
  const glass = useGlassSurface();
  const model = useFlatC4Store((s) => s.model);
  const setModel = useFlatC4Store((s) => s.setModel);
  const [editing, setEditing] = useState<DesignSystemRecord | 'new' | null>(null);
  const [removing, setRemoving] = useState<DesignSystemRecord | null>(null);
  /* Values are edited against a local draft and written once, on Done: the
     model goes out over Yjs on every write, and a keystroke is not a change to
     the project. It also keeps the inputs mounted, which is what a row keyed
     by its own contents cost me the first time round. */
  const [draft, setDraft] = useState<DesignTokenRecord[] | null>(null);
  const [pasted, setPasted] = useState('');
  const [pasting, setPasting] = useState(false);
  const [reading, setReading] = useState(false);
  const [readNote, setReadNote] = useState<string | null>(null);
  const [copiedSource, setCopiedSource] = useState(false);

  const formatWhen = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString(i18n.language);
  };

  const copySource = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSource(true);
      window.setTimeout(() => setCopiedSource(false), 1500);
    } catch {
      /* clipboard may be denied; leave the short path visible to copy by hand */
    }
  };

  const systems = useMemo(
    () => listDesignSystems(model as ModelWithDesignSystems),
    [model]
  );
  const [selectedName, setSelectedName] = useState(initialSelectedName ?? null);

  useEffect(() => {
    if (selectedName && findDesignSystemByName(model as ModelWithDesignSystems, selectedName)) {
      return;
    }
    setSelectedName(systems[0]?.name ?? null);
  }, [systems, selectedName, model]);

  /* Switching systems drops the draft rather than carrying it across — an
     unsaved row belongs to the system it was typed under. */
  useEffect(() => {
    setDraft(null);
    setPasting(false);
    setPasted('');
    setReadNote(null);
    setCopiedSource(false);
  }, [selectedName]);

  const selected: DesignSystemRecord | null = useMemo(
    () => findDesignSystemByName(model as ModelWithDesignSystems, selectedName ?? undefined),
    [model, selectedName]
  );

  /* Which front ends are built in each system, and how many designed elements
     sit inside them — the answer to "does this still matter". */
  const usage = useMemo(() => {
    const map = new Map<string, { containers: number; elements: number }>();
    for (const container of model.containers) {
      const name = (container as typeof container & UiExtras).designSystem?.trim();
      if (!name) continue;
      const entry = map.get(name) ?? { containers: 0, elements: 0 };
      entry.containers += 1;
      entry.elements += model.components.filter(
        (component) => component.containerId === container.id && isUiElement(component)
      ).length;
      map.set(name, entry);
    }
    return map;
  }, [model]);

  /* The whole collection at once, the way the domains panel writes its own —
     the model is one document, and Yjs carries it from here. */
  const persist = (next: DesignSystemRecord[]) =>
    setModel({ ...model, designSystems: next } as typeof model & ModelWithDesignSystems);

  const saveSystem = (record: DesignSystemRecord) => {
    const list = listDesignSystems(model as ModelWithDesignSystems);
    const at = list.findIndex((s) => s.id === record.id);
    persist(at < 0 ? [...list, record] : list.map((s) => (s.id === record.id ? record : s)));
    setSelectedName(record.name);
    setEditing(null);
  };

  const removeSystem = (record: DesignSystemRecord) => {
    /* The name stays on the containers that used it: a system removed by
       mistake must not silently unbind everything inside them. */
    persist(listDesignSystems(model as ModelWithDesignSystems).filter((s) => s.id !== record.id));
    setRemoving(null);
  };

  const startEditingValues = () => {
    setDraft(selected?.tokens ?? []);
    setPasting(false);
    setPasted('');
  };

  const commitValues = () => {
    if (!selected || !draft) return;
    const tokens = draft.filter((token) => token.name.trim());
    persist(
      listDesignSystems(model as ModelWithDesignSystems).map((s) =>
        s.id === selected.id ? { ...s, tokens } : s
      )
    );
    setDraft(null);
  };

  const patchToken = (index: number, patch: Partial<DesignTokenRecord>) =>
    setDraft((prev) =>
      (prev ?? []).map((token, i) => (i === index ? { ...token, ...patch } : token))
    );

  /**
   * Fill the draft from the system's own Figma file.
   *
   * Named styles are merged straight in — a name a designer gave a colour has
   * already settled the argument this panel exists to settle. Values nobody
   * named are appended with the name the server proposed, which is a guess
   * from the layer it sits on and is left in an editable row rather than
   * written: the whole point of a vocabulary is that the names were chosen.
   */
  const readFromFigma = async () => {
    if (!projectId || !selected) return;
    setReading(true);
    setReadNote(null);
    try {
      const found = await designReadApi.readDesignSystemValues(projectId, selected.name);
      let merged = { named: 0, guessed: 0 };
      setDraft((prev) => {
        const out = mergeReadValues(
          prev ?? selected.tokens ?? [],
          found.tokens as DesignTokenRecord[],
          found.suggestions as (DesignTokenRecord & { uses?: number; where?: string[] })[],
          (uses, where) =>
            t('design_systems_read_uses', { count: uses, where: where.join(', ') })
        );
        merged = { named: out.named, guessed: out.guessed };
        return out.tokens;
      });
      setReadNote(t('design_systems_read_found', { ...merged, file: found.file?.name ?? '' }));
    } catch (err) {
      setReadNote(figmaErrorText(err));
    } finally {
      setReading(false);
    }
  };

  const applyPasted = () => {
    const found = parsePastedTokens(pasted);
    if (!found.length) return;
    setDraft((prev) => mergeTokens(prev ?? [], found));
    setPasted('');
    setPasting(false);
  };

  const groups = useMemo(() => {
    const byType = new Map<string, DesignTokenRecord[]>();
    for (const token of selected?.tokens ?? []) {
      const key = token.type ?? 'other';
      byType.set(key, [...(byType.get(key) ?? []), token]);
    }
    return GROUP_ORDER.filter((type) => byType.has(type ?? 'other')).map((type) => ({
      type: type ?? 'other',
      tokens: byType.get(type ?? 'other') ?? [],
    }));
  }, [selected]);

  return (
    <Box h="100%" display="flex" flexDirection="column" overflow="hidden" color="fg.default">
      <HStack
        px="12px"
        minH={MANAGER_BAR_MIN_H}
        py="10px"
        gap="12px"
        align="center"
        justify="space-between"
        flexShrink={0}
        {...glass.floatBar}
        mt={SIDE_PANEL_INSET}
      >
        <HStack gap="8px" minW={0}>
          <Box color="fg.muted" lineHeight={0}>
            <Palette size={15} />
          </Box>
          <Text fontSize="sm" fontWeight="600" lineClamp={1}>
            {t('design_systems_title')}
          </Text>
        </HStack>
        <HStack gap="8px" align="center">
          {canWrite ? (
            <Button
              size="sm"
              variant="ghost"
              borderRadius="full"
              data-testid="design-systems-new"
              onClick={() => setEditing('new')}
            >
              <Plus size={TOOLBAR_ICON_SIZE} />
              {t('design_systems_new')}
            </Button>
          ) : null}
          <ToolbarIconButton
            title={t('close')}
            aria-label={t('close')}
            data-testid="design-systems-close"
            onClick={onRequestClose}
          >
            <X size={TOOLBAR_ICON_SIZE} />
          </ToolbarIconButton>
        </HStack>
      </HStack>

      {systems.length === 0 ? (
        <Box flex="1" mt={SIDE_PANEL_INSET} p="24px" {...glass.editorPanel}>
          <VStack align="start" gap="8px" maxW="520px">
            <Text fontSize="sm" fontWeight="700">
              {t('design_systems_empty')}
            </Text>
            <Text fontSize="sm" color="fg.muted" lineHeight="1.6">
              {t('design_systems_empty_hint')}
            </Text>
            {canWrite ? (
              <Button size="sm" borderRadius="full" mt="4px" onClick={() => setEditing('new')}>
                <Plus size={14} />
                {t('design_systems_new')}
              </Button>
            ) : null}
          </VStack>
        </Box>
      ) : (
        <HStack align="stretch" flex="1" minH={0} overflow="hidden" gap={SIDE_PANEL_INSET} mt={SIDE_PANEL_INSET}>
          <Box
            w={{ base: '200px', md: '240px' }}
            flexShrink={0}
            overflowY="auto"
            p="10px"
            css={glass.scrollbar}
            {...glass.editorPanel}
          >
            <VStack align="stretch" gap="2px">
              {systems.map((system) => {
                const used = usage.get(system.name);
                const active = system.name === selectedName;
                return (
                  <RowButton
                    key={system.id}
                    type="button"
                    textAlign="left"
                    px="10px"
                    py="8px"
                    borderRadius="8px"
                    bg={active ? 'bg.list.selected' : 'transparent'}
                    _hover={{ bg: active ? 'bg.list.selected' : 'bg.list.hover' }}
                    onClick={() => setSelectedName(system.name)}
                  >
                    <HStack gap="8px" align="start" minW={0}>
                      <Box flexShrink={0} mt="2px" lineHeight={0}>
                        <DesignSourceKindIcon kind={system.source?.kind} size={14} />
                      </Box>
                      <Box minW={0}>
                        <Text fontSize="sm" fontWeight="600" lineClamp={1}>
                          {system.name}
                        </Text>
                        <Text fontSize="xs" color="fg.subtle" lineClamp={1}>
                          {t('design_systems_usage', {
                            values: system.tokens?.length ?? 0,
                            containers: used?.containers ?? 0,
                            elements: used?.elements ?? 0,
                          })}
                        </Text>
                      </Box>
                    </HStack>
                  </RowButton>
                );
              })}
            </VStack>
          </Box>

          <Box
            flex="1"
            minW={0}
            overflowY="auto"
            p="16px"
            css={glass.scrollbar}
            {...glass.editorPanel}
          >
            {selected ? (
              <VStack align="stretch" gap="16px">
                <HStack justify="space-between" align="start" gap="12px">
                  <VStack align="start" gap="6px" minW={0}>
                    <HStack gap="5px" align="center" minW={0}>
                      <Text fontSize="lg" fontWeight="600" lineClamp={1}>
                        {selected.name}
                      </Text>
                      <FieldHint text={t('design_systems_hint')} />
                    </HStack>
                    {selected.source?.ref ? (
                      <VStack align="start" gap="2px" minW={0} w="full">
                        <HStack gap="6px" align="center" minW={0} maxW="100%">
                          <Box flexShrink={0} lineHeight={0}>
                            <DesignSourceKindIcon kind={selected.source.kind} size={14} />
                          </Box>
                          <Text fontSize="xs" color="fg.subtle" lineClamp={1} title={selected.source.ref}>
                            {t('design_systems_source', {
                              kind: selected.source.kind ?? 'source',
                              ref: designSourceDisplayRef(selected.source.kind, selected.source.ref),
                            })}
                          </Text>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            flexShrink={0}
                            aria-label={t('design_systems_copy_source')}
                            title={
                              copiedSource
                                ? t('design_systems_source_copied')
                                : t('design_systems_copy_source')
                            }
                            data-testid="design-systems-copy-source"
                            onClick={() => void copySource(selected.source!.ref!)}
                          >
                            {copiedSource ? <Check size={12} /> : <Copy size={12} />}
                          </IconButton>
                        </HStack>
                        {selected.readAt ? (
                          <Text fontSize="xs" color="fg.subtle" pl="20px">
                            {t('design_read_at', { when: formatWhen(selected.readAt) })}
                          </Text>
                        ) : null}
                      </VStack>
                    ) : (
                      <Text fontSize="xs" color="fg.subtle">
                        {selected.tokens?.length
                          ? t('design_systems_by_hand')
                          : t('design_systems_no_source')}
                      </Text>
                    )}
                  </VStack>
                  {canWrite ? (
                    <HStack gap="4px" flexShrink={0}>
                      {draft ? (
                        <Button
                          size="sm"
                          borderRadius="full"
                          data-testid="design-values-done"
                          onClick={commitValues}
                        >
                          <Check size={14} />
                          {t('design_systems_values_done')}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          borderRadius="full"
                          data-testid="design-values-edit"
                          onClick={startEditingValues}
                        >
                          <Pencil size={13} />
                          {t('design_systems_values_edit')}
                        </Button>
                      )}
                      <ToolbarIconButton
                        title={t('edit')}
                        aria-label={t('edit')}
                        data-testid="design-systems-edit"
                        onClick={() => setEditing(selected)}
                      >
                        <Pencil size={TOOLBAR_ICON_SIZE} />
                      </ToolbarIconButton>
                      <ToolbarIconButton
                        title={t('delete')}
                        aria-label={t('delete')}
                        onClick={() => setRemoving(selected)}
                      >
                        <Trash2 size={TOOLBAR_ICON_SIZE} />
                      </ToolbarIconButton>
                    </HStack>
                  ) : null}
                </HStack>

                {draft ? (
                  /* Full width, because five fields in a dialog column is what
                     the first attempt looked like. */
                  <VStack align="stretch" gap="10px">
                    <HStack gap="8px">
                      <Button
                        size="xs"
                        variant="outline"
                        borderRadius="full"
                        data-testid="design-values-add"
                        onClick={() =>
                          setDraft((prev) => [...(prev ?? []), { name: '', value: '', type: 'color' }])
                        }
                      >
                        <Plus size={12} />
                        {t('design_systems_add_value')}
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        data-testid="design-values-paste"
                        onClick={() => setPasting((prev) => !prev)}
                      >
                        {t('design_systems_paste')}
                      </Button>
                      {/* Only where there is a file to read and a server to
                          ask: a local model has neither. */}
                      {projectId && selected?.source?.kind === 'figma' && selected.source.ref ? (
                        <Button
                          size="xs"
                          variant="ghost"
                          loading={reading}
                          data-testid="design-values-read"
                          onClick={() => void readFromFigma()}
                        >
                          <DownloadCloud size={12} />
                          {t('design_systems_read')}
                        </Button>
                      ) : null}
                    </HStack>

                    {readNote ? (
                      <Text fontSize="xs" color="fg.subtle" data-testid="design-values-read-note">
                        {readNote}
                      </Text>
                    ) : null}

                    {pasting ? (
                      <VStack align="stretch" gap="6px">
                        <Textarea
                          rows={5}
                          fontFamily="mono"
                          fontSize="xs"
                          value={pasted}
                          placeholder={t('design_systems_paste_placeholder')}
                          data-testid="design-values-paste-area"
                          onChange={(e) => setPasted(e.target.value)}
                        />
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="fg.subtle">
                            {t('design_systems_paste_help')}
                          </Text>
                          <Button
                            size="xs"
                            disabled={!parsePastedTokens(pasted).length}
                            data-testid="design-values-paste-apply"
                            onClick={applyPasted}
                          >
                            {t('design_systems_paste_apply', {
                              count: parsePastedTokens(pasted).length,
                            })}
                          </Button>
                        </HStack>
                      </VStack>
                    ) : null}

                    <VStack align="stretch" gap="4px">
                      {draft.map((token, index) => (
                        /* Keyed by position: a row keyed by its own text is a
                           new row on every keystroke, and the caret goes with
                           the old one. */
                        <HStack key={index} gap="8px" align="center">
                          {token.type === 'color' ? (
                            <chakra.input
                              type="color"
                              w="30px"
                              h="32px"
                              p="0"
                              flexShrink={0}
                              borderRadius="6px"
                              borderWidth="1px"
                              borderColor="border.glass"
                              bg="transparent"
                              cursor="pointer"
                              _hover={{ borderColor: 'border.strong' }}
                              value={
                                /^#[0-9a-f]{6}$/i.test(token.value ?? '') ? token.value : '#000000'
                              }
                              onChange={(e) => patchToken(index, { value: e.target.value })}
                            />
                          ) : (
                            <Box w="30px" flexShrink={0} />
                          )}
                          <Input
                            size="sm"
                            flex="0 0 200px"
                            fontFamily="mono"
                            fontSize="xs"
                            value={token.name}
                            placeholder={t('design_systems_value_name')}
                            onChange={(e) => patchToken(index, { name: e.target.value })}
                          />
                          <Input
                            size="sm"
                            flex="0 0 140px"
                            fontFamily="mono"
                            fontSize="xs"
                            value={token.value ?? ''}
                            placeholder={t('design_systems_value_value')}
                            onChange={(e) => patchToken(index, { value: e.target.value })}
                          />
                          <chakra.select
                            flex="0 0 120px"
                            h="32px"
                            px="8px"
                            fontSize="xs"
                            borderRadius="8px"
                            borderWidth="1px"
                            borderColor="border.input"
                            bg="bg.dialog"
                            color="fg.default"
                            value={token.type ?? 'other'}
                            onChange={(e) =>
                              patchToken(index, {
                                type: e.target.value as DesignTokenRecord['type'],
                              })
                            }
                          >
                            {TOKEN_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {t(`design_token_group_${type}`)}
                              </option>
                            ))}
                          </chakra.select>
                          <Input
                            size="sm"
                            flex="1"
                            minW="120px"
                            fontSize="xs"
                            value={token.description ?? ''}
                            placeholder={t('design_systems_value_description')}
                            onChange={(e) => patchToken(index, { description: e.target.value })}
                          />
                          <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label={t('delete')}
                            onClick={() =>
                              setDraft((prev) => (prev ?? []).filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 size={13} />
                          </IconButton>
                        </HStack>
                      ))}
                    </VStack>

                    <Text fontSize="xs" color="fg.subtle" lineHeight="1.5">
                      {t('design_systems_values_by_hand')}
                    </Text>
                  </VStack>
                ) : groups.length === 0 ? (
                  <Text fontSize="sm" color="fg.muted">
                    {t('design_systems_no_values')}
                  </Text>
                ) : (
                  groups.map((group) => (
                    <VStack key={group.type} align="stretch" gap="8px">
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        letterSpacing="0.04em"
                        textTransform="uppercase"
                        color="fg.subtle"
                      >
                        {t(`design_token_group_${group.type}`)}
                      </Text>
                      <VStack align="stretch" gap="2px">
                        {group.tokens.map((token) => (
                          <HStack
                            key={token.name}
                            gap="12px"
                            px="10px"
                            py="8px"
                            borderRadius="8px"
                            _hover={{ bg: 'bg.list.hover' }}
                          >
                            <TokenMark token={token} />
                            <Text fontSize="sm" flexShrink={0} minW="180px">
                              {token.description || token.name}
                            </Text>
                            <Text
                              fontFamily="mono"
                              fontSize="xs"
                              color="fg.muted"
                              flexShrink={0}
                              minW="150px"
                            >
                              {token.name}
                            </Text>
                            <Text fontFamily="mono" fontSize="xs" color="fg.subtle" flexShrink={0}>
                              {token.value || ''}
                            </Text>
                            {typeof token.uses === 'number' ? (
                              <Text
                                flexGrow={1}
                                textAlign="right"
                                fontSize="xs"
                                color="fg.subtle"
                                fontVariantNumeric="tabular-nums"
                              >
                                {t('design_systems_uses', { count: token.uses })}
                              </Text>
                            ) : null}
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  ))
                )}
              </VStack>
            ) : null}
          </Box>
        </HStack>
      )}

      {editing ? (
        <DesignSystemEditDialog
          open
          system={editing === 'new' ? null : editing}
          onSave={saveSystem}
          onClose={() => setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(removing)}
        title={t('design_systems_remove_title')}
        content={t('design_systems_remove_confirm', { name: removing?.name ?? '' })}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        onCancel={() => setRemoving(null)}
        onConfirm={() => removing && removeSystem(removing)}
      />
    </Box>
  );
}
