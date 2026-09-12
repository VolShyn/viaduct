import systemContextDark from '@assets/marketing/system-context-dark.webp';
import systemContextLight from '@assets/marketing/system-context-light.webp';
import containersDark from '@assets/marketing/containers-dark.webp';
import containersLight from '@assets/marketing/containers-light.webp';
import docsShotDark from '@assets/marketing/docs-dark.webp';
import docsShotLight from '@assets/marketing/docs-light.webp';
import sequenceDark from '@assets/marketing/sequence-dark.webp';
import sequenceLight from '@assets/marketing/sequence-light.webp';
import schemaDark from '@assets/marketing/schema-dark.webp';
import schemaLight from '@assets/marketing/schema-light.webp';
import flowsDark from '@assets/marketing/flows-dark.webp';
import flowsLight from '@assets/marketing/flows-light.webp';
import catalogDark from '@assets/marketing/catalog-dark.webp';
import catalogLight from '@assets/marketing/catalog-light.webp';
import changeSetsDark from '@assets/marketing/change-sets-dark.webp';
import changeSetsLight from '@assets/marketing/change-sets-light.webp';
import changeSetNewDark from '@assets/marketing/change-set-new-dark.webp';
import changeSetNewLight from '@assets/marketing/change-set-new-light.webp';
import shareDark from '@assets/marketing/share-dark.webp';
import shareLight from '@assets/marketing/share-light.webp';
import flowPlayerDark from '@assets/marketing/flow-player-dark.mp4';
import flowPlayerLight from '@assets/marketing/flow-player-light.mp4';
import flowPlayerDarkPoster from '@assets/marketing/flow-player-dark-poster.webp';
import flowPlayerLightPoster from '@assets/marketing/flow-player-light-poster.webp';
import AppFooter, { SUPPORT_EMAIL } from '@components/AppFooter';
import GlassNav from '@components/landing/GlassNav';
import SupportDialog from '@components/SupportDialog';
import { useColorMode } from '@contexts/ColorModeContext';
import { usePageScroll } from '@hooks/usePageScroll';
import { fieldSurfaceFlatStyles } from '@theme/formStyles';
import { MCP_ORIGIN, MCP_URL, SITE_URL } from '@/seo';
import {
  Box,
  Button,
  Heading,
  IconButton,
  Image,
  Input,
  Link,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react';
import { MessageSquare, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';


const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'model-entry-point', label: 'The model is the entry point' },
  { id: 'documentation', label: 'Documentation on elements' },
  { id: 'sequences', label: 'Sequence diagrams' },
  { id: 'relationship-tracing', label: 'Following a relationship' },
  { id: 'er-api', label: 'ER models & API details' },
  { id: 'magic-flows', label: 'Magic flows' },
  { id: 'collaboration-export', label: 'Collaboration & export' },
  { id: 'assistant', label: 'The AI assistant & its allowance' },
  { id: 'limits', label: 'What this does not solve' },
  { id: 'mcp-cursor', label: 'MCP for Cursor & Claude' },
  { id: 'change-sets', label: 'Change sets: handing work to an agent' },
  { id: 'rest-api', label: 'REST API' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'contact', label: 'Contact' },
] as const;

function Section({
  id,
  title,
  hidden,
  children,
}: {
  id: string;
  title: string;
  hidden?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box as="section" id={id} scrollMarginTop="96px" display={hidden ? 'none' : undefined}>
      <Heading as="h2" size="md" mb="10px" color="fg.default">
        {title}
      </Heading>
      <Box color="fg.muted" fontSize="sm" lineHeight="1.7">
        {children}
      </Box>
    </Box>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <Box as="li" ms="18px" mb="6px" listStyleType="disc">
      {children}
    </Box>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <Box
      as="pre"
      my="10px"
      px="14px"
      py="12px"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.subtle"
      fontSize="xs"
      lineHeight="1.55"
      overflowX="auto"
      whiteSpace="pre"
      fontFamily="mono"
      color="fg.default"
    >
      {children}
    </Box>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text mt="14px" mb="6px" fontWeight="600" color="fg.default">
      {children}
    </Text>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <Box
      as="blockquote"
      my="12px"
      ps="14px"
      borderLeftWidth="3px"
      borderColor="brand.emphasis"
      color="fg.default"
      fontStyle="italic"
      fontSize="sm"
      lineHeight="1.65"
    >
      {children}
    </Box>
  );
}

type ShotPair = { dark: string; light: string };

/** Screenshot of the app, matched to the reader's theme. */
function DocShot({
  src,
  alt,
  caption,
}: {
  src: ShotPair;
  alt: string;
  caption: string;
}) {
  const { mode } = useColorMode();
  return (
    <Box as="figure" my="16px" m={0}>
      <Box
        borderRadius="12px"
        borderWidth="1px"
        borderColor="border.glass"
        overflow="hidden"
        boxShadow="panel"
        bg="bg.dialog"
        lineHeight={0}
      >
        <Image
          src={mode === 'light' ? src.light : src.dark}
          alt={alt}
          w="100%"
          h="auto"
          display="block"
          loading="lazy"
          aspectRatio={1.6}
        />
      </Box>
      <Text as="figcaption" mt="8px" fontSize="xs" color="fg.muted">
        {caption}
      </Text>
    </Box>
  );
}

/** Screen recording — muted, looping, and still for reduced-motion readers. */
function DocMotion({
  src,
  poster,
  alt,
  caption,
}: {
  src: ShotPair;
  poster: ShotPair;
  alt: string;
  caption: string;
}) {
  const { mode } = useColorMode();
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const video = mode === 'light' ? src.light : src.dark;
  const still = mode === 'light' ? poster.light : poster.dark;

  return (
    <Box as="figure" my="16px" m={0}>
      <Box
        borderRadius="12px"
        borderWidth="1px"
        borderColor="border.glass"
        overflow="hidden"
        boxShadow="panel"
        bg="bg.dialog"
        lineHeight={0}
      >
        {reduced ? (
          <Image src={still} alt={alt} w="100%" h="auto" display="block" loading="lazy" />
        ) : (
          <Box
            as="video"
            // @ts-expect-error — Chakra forwards media attributes as-is.
            src={video}
            poster={still}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={alt}
            w="100%"
            h="auto"
            display="block"
          />
        )}
      </Box>
      <Text as="figcaption" mt="8px" fontSize="xs" color="fg.muted">
        {caption}
      </Text>
    </Box>
  );
}

const SHOTS = {
  systemContext: { dark: systemContextDark, light: systemContextLight },
  containers: { dark: containersDark, light: containersLight },
  docs: { dark: docsShotDark, light: docsShotLight },
  sequence: { dark: sequenceDark, light: sequenceLight },
  schema: { dark: schemaDark, light: schemaLight },
  flows: { dark: flowsDark, light: flowsLight },
  catalog: { dark: catalogDark, light: catalogLight },
  changeSets: { dark: changeSetsDark, light: changeSetsLight },
  changeSetNew: { dark: changeSetNewDark, light: changeSetNewLight },
  share: { dark: shareDark, light: shareLight },
  flowPlayer: { dark: flowPlayerDark, light: flowPlayerLight },
  flowPlayerPoster: { dark: flowPlayerDarkPoster, light: flowPlayerLightPoster },
} as const;

function TocLink({
  id,
  label,
  active,
}: {
  id: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={`#${id}`}
      display="block"
      px="10px"
      py="6px"
      borderRadius="md"
      fontSize="sm"
      fontWeight={active ? '700' : '500'}
      color={active ? 'fg.default' : 'fg.muted'}
      bg={active ? 'bg.muted' : 'transparent'}
      borderLeftWidth="2px"
      borderColor={active ? 'brand.emphasis' : 'transparent'}
      _hover={{ color: 'fg.default', bg: 'bg.list.hover' }}
    >
      {label}
    </Link>
  );
}

/**
 * Search over the rendered page rather than a hand-kept index: every section
 * registers its element, and a query keeps the ones whose text matches. Nothing
 * to forget to update when a paragraph is rewritten.
 */
function useDocsSearch() {
  const [query, setQuery] = useState('');
  const sections = useRef(new Map<string, HTMLElement>());
  const [matches, setMatches] = useState<Set<string> | null>(null);

  const register = useCallback((id: string, node: HTMLElement | null) => {
    if (node) sections.current.set(id, node);
    else sections.current.delete(id);
  }, []);

  useEffect(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      setMatches(null);
      return;
    }
    const found = new Set<string>();
    for (const [id, node] of sections.current) {
      if ((node.textContent || '').toLowerCase().includes(needle)) found.add(id);
    }
    setMatches(found);
  }, [query]);

  const isVisible = useCallback(
    (id: string) => matches === null || matches.has(id),
    [matches]
  );

  return { query, setQuery, register, isVisible, matchCount: matches?.size ?? null };
}

/** Highlights the section currently under the header. */
function useActiveSection(ids: readonly string[], enabled: boolean) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    );
    for (const id of ids) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [ids, enabled]);

  return active;
}

export default function DocsPage() {
  const { chrome } = useColorMode();
  const { t } = useTranslation();
  const location = useLocation();
  const [supportOpen, setSupportOpen] = useState(false);
  usePageScroll();

  /* Arriving at /docs#mcp-cursor from inside the app is a client-side route
     change, so the browser never scrolls to the fragment on its own. */
  useEffect(() => {
    const id = location.hash.slice(1);
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, [location.hash]);

  const search = useDocsSearch();
  const sectionIds = useMemo(() => TOC.map((item) => item.id), []);
  const activeSection = useActiveSection(sectionIds, search.matchCount === null);
  const visibleToc = TOC.filter((item) => search.isVisible(item.id));

  return (
    <Box minH="100dvh" bg="bg.canvas" color="fg.default">
      {/* The same bar as the landing and the integrations page. The docs used
          to wear their own, with a back-arrow and a "Help" label, which made
          walking between two pages of one site feel like leaving it. */}
      <GlassNav />

      <Box
        as="main"
        maxW="1100px"
        mx="auto"
        px="24px"
        py="40px"
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: '220px 1fr' }}
        gap={{ base: '24px', md: '40px' }}
        alignItems="start"
      >
        <Box
          as="nav"
          aria-label="Documentation"
          position={{ md: 'sticky' }}
          top={{ md: '88px' }}
          borderWidth={{ base: '1px', md: '0' }}
          borderColor="border.default"
          borderRadius="lg"
          p={{ base: '10px', md: '0' }}
          bg={{ base: 'bg.muted', md: 'transparent' }}
        >
          <Box position="relative" mb="12px">
            <Box
              position="absolute"
              left="10px"
              top="50%"
              transform="translateY(-50%)"
              color="fg.subtle"
              pointerEvents="none"
              aria-hidden
            >
              <Search size={14} />
            </Box>
            <Input
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              placeholder="Search the docs"
              aria-label="Search the documentation"
              size="sm"
              h="34px"
              ps="30px"
              pe={search.query ? '30px' : undefined}
              {...fieldSurfaceFlatStyles(chrome)}
            />
            {search.query ? (
              <IconButton
                aria-label="Clear search"
                size="xs"
                variant="ghost"
                position="absolute"
                right="4px"
                top="50%"
                transform="translateY(-50%)"
                color="fg.muted"
                onClick={() => search.setQuery('')}
              >
                <X size={13} />
              </IconButton>
            ) : null}
          </Box>

          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color={chrome.textMuted}
            mb="8px"
            px="10px"
          >
            {search.matchCount === null
              ? 'On this page'
              : `${search.matchCount} of ${TOC.length} sections`}
          </Text>
          <VStack align="stretch" gap="2px">
            {visibleToc.map((item) => (
              <TocLink
                key={item.id}
                id={item.id}
                label={item.label}
                active={search.matchCount === null && item.id === activeSection}
              />
            ))}
            {visibleToc.length === 0 ? (
              <Text fontSize="sm" color="fg.muted" px="10px">
                Nothing matches “{search.query}”.
              </Text>
            ) : null}
          </VStack>
        </Box>

        <VStack
          align="stretch"
          gap="36px"
          ref={(node: HTMLDivElement | null) => {
            if (!node) return;
            for (const item of TOC) {
              search.register(item.id, node.querySelector(`#${item.id}`));
            }
          }}
        >
          <Box id="overview" scrollMarginTop="96px" display={search.isVisible('overview') ? undefined : 'none'}>
            <Heading as="h1" size="2xl" mb="10px" letterSpacing="-0.02em">
              Architecture documentation that stays attached to the model
            </Heading>
            <Text color="fg.muted" fontSize="md" lineHeight="1.7" mb="12px">
              Architecture documentation often exists, but it is still hard to use.
            </Text>
            <Text color="fg.muted" fontSize="sm" lineHeight="1.7" mb="12px">
              There is a system diagram in one place, service documentation in another, a sequence
              diagram somewhere in a wiki, and an ER diagram in a database tool. Then an
              architectural review raises a deceptively simple question:
            </Text>
            <Quote>Which endpoint and internal component actually handle this interaction?</Quote>
            <Text color="fg.muted" fontSize="sm" lineHeight="1.7" mb="12px">
              At that point, people reconstruct the answer from memory, browser tabs, and source
              code.
            </Text>
            <Text color="fg.muted" fontSize="sm" lineHeight="1.7" mb="12px">
              I have spent more than fifteen years in software engineering and about a decade
              working with system design. I have used whiteboards, documentation platforms, UML
              tools, C4 tooling, and diagram-as-code workflows. None of these tools is inherently
              bad. But I repeatedly ran into the same gap: the architectural model, the explanation,
              and the interaction flow were separate artifacts.
            </Text>
            <Text color="fg.muted" fontSize="sm" lineHeight="1.7" mb="12px">
              So I built a small tool to explore a different approach: use a C4 model as the
              navigation layer, and attach the surrounding knowledge to the model itself.
            </Text>
            <Text color="fg.muted" fontSize="sm" lineHeight="1.7" mb="12px">
              The result is{' '}
              <Link href={SITE_URL} color="brand.text" fontWeight="600">
                Viaduct
              </Link>
              : a browser-based editor where a system model can contain Markdown documentation,
              PlantUML sequence diagrams, ER diagrams, API endpoint details, and relationships that
              can be traced across levels.
            </Text>
            <Text color="fg.muted" fontSize="sm" lineHeight="1.7">
              This is not a claim that one tool can replace every architecture practice. It is a
              practical attempt to reduce the distance between a diagram and the information
              required to act on it.
            </Text>
          </Box>

          <Separator borderColor="border.default" />

          <Section id="model-entry-point" title="The model is the entry point" hidden={!search.isVisible('model-entry-point')}>
            <Text mb="10px">The editor follows the familiar four C4 levels:</Text>
            <Box as="ol" mb="12px" ps="4px">
              <Box as="li" ms="18px" mb="8px" listStyleType="decimal">
                <Text as="span" fontWeight="600" color="fg.default">
                  System Context
                </Text>{' '}
                — the system boundary, users, and external dependencies.
              </Box>
              <Box as="li" ms="18px" mb="8px" listStyleType="decimal">
                <Text as="span" fontWeight="600" color="fg.default">
                  Containers
                </Text>{' '}
                — applications, databases, web frontends, and other deployable or executable units.
              </Box>
              <Box as="li" ms="18px" mb="8px" listStyleType="decimal">
                <Text as="span" fontWeight="600" color="fg.default">
                  Components
                </Text>{' '}
                — controllers, services, adapters, endpoints, and internal building blocks.
              </Box>
              <Box as="li" ms="18px" mb="8px" listStyleType="decimal">
                <Text as="span" fontWeight="600" color="fg.default">
                  Code
                </Text>{' '}
                — classes, interfaces, functions, or other implementation-level objects where that
                detail is useful.
              </Box>
            </Box>
            <Text mb="12px">
              A small but important clarification: a{' '}
              <Text as="span" fontStyle="italic">
                container
              </Text>{' '}
              in C4 does not mean a Docker container. It is a high-level runtime or data-store
              boundary such as an API application, a PostgreSQL database, or a single-page web
              application.
            </Text>

            <DocShot
              src={SHOTS.systemContext}
              alt="System context diagram: an internet banking system surrounded by an identity provider, a mainframe, an e-mail system, a payment network and fraud analytics"
              caption="Level 1 — system context. Every arrow carries a label and a technology."
            />

            <Text mb="12px">
              The point of these layers is not to document everything to the same depth. In most
              systems, Context, Container, and selected Component diagrams are enough. I only use
              the Code level for the parts that are genuinely hard to understand, risky to change,
              or important for onboarding.
            </Text>

            <DocShot
              src={SHOTS.containers}
              alt="Container diagram with people, a gateway, an API, a cache, an event bus, a datastore and a worker"
              caption="Level 2 — containers of one system. Colour comes from the technology; datastores are cylinders and people are actors."
            />
          </Section>

          <Section id="documentation" title="Documentation belongs to an element" hidden={!search.isVisible('documentation')}>
            <Text mb="12px">A node on a diagram is rarely self-explanatory.</Text>
            <Text mb="12px">
              For example, an{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                Internet Banking System
              </Text>{' '}
              node might need an owner, a business boundary, a list of external integrations, data
              constraints, or links to operational documentation. An API application needs different
              information: responsibilities, deployment details, contracts, and important scenarios.
            </Text>
            <Text mb="12px">
              In the editor, Markdown documentation is attached directly to an element. The card
              indicates when documentation exists, and opening the card opens the relevant document
              rather than sending the reader on a search through a knowledge base.
            </Text>

            <DocShot
              src={SHOTS.docs}
              alt="Documentation editor: Markdown source on the left, live preview with a rendered table on the right"
              caption="The documentation editor — Markdown on the left, live preview on the right, with blocks that insert a stored sequence diagram or an API endpoint."
            />

            <Text>
              This is deliberately unglamorous. Markdown is familiar, portable, and easy to keep
              under review. The useful part is not the editor itself; it is the fact that the
              documentation has an explicit architectural home.
            </Text>
          </Section>

          <Section id="sequences" title="A sequence diagram should not be an orphan" hidden={!search.isVisible('sequences')}>
            <Text mb="12px">
              Sequence diagrams explain behavior, while a C4 diagram explains structure. Teams
              usually need both.
            </Text>
            <Text mb="12px">
              For an API application, I can attach PlantUML sequence diagrams that describe the
              flows handled by that application. Participants are selected from the current C4
              layer, which prevents a sequence diagram from mixing unrelated levels of abstraction.
            </Text>

            <DocShot
              src={SHOTS.sequence}
              alt="Sequence editor with PlantUML source beside the rendered interaction diagram"
              caption="PlantUML on the left, the rendered diagram on the right; participants are validated against the current C4 level."
            />

            <Text mb="12px">
              The editor supports{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                group
              </Text>{' '}
              and{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                alt
              </Text>{' '}
              folding for long flows. The same sequence diagram can also be embedded in the Markdown
              documentation of the element it belongs to.
            </Text>
            <Text>
              That gives a reader a more useful path than a wiki link: start with the API
              application, read what it does, and inspect a specific interaction without losing
              context.
            </Text>
          </Section>

          <Section id="relationship-tracing" title="Following a relationship into the system" hidden={!search.isVisible('relationship-tracing')}>
            <Text mb="12px">The feature I find most useful is relationship tracing.</Text>
            <Text mb="12px">
              Imagine a container-level relationship between a single-page application and an API
              application. The arrow tells us that the frontend calls the API, but it does not
              answer the question an engineer will ask next:
            </Text>
            <Quote>Which API endpoints, controllers, or services participate in this relationship?</Quote>
            <Text mb="12px">
              A relationship can be associated with relevant components in the target container.
              From the relationship menu, the user can then open the component view with those
              components highlighted.
            </Text>

            <DocShot
              src={SHOTS.catalog}
              alt="Service catalog listing every container grouped by kind, with Magic flow counts"
              caption="The service catalog reaches the same information from the other side: every service by kind, with the flows it takes part in."
            />

            <Text mb="8px">
              For a review, this makes it possible to move through a path such as:
            </Text>
            <CodeBlock>{`SPA → API Application → Auth Service → endpoint / internal component`}</CodeBlock>
            <Text>
              without manually searching multiple diagrams. It is not full runtime tracing, and it
              does not replace observability. It is architecture navigation: a way to record how the
              team believes a dependency is implemented.
            </Text>
          </Section>

          <Section id="er-api" title="ER models and API details" hidden={!search.isVisible('er-api')}>
            <Text mb="12px">
              A database container can open an ER editor. Tables can have their own documentation,
              which is useful for recording ownership, retention requirements, migration rules, or
              the meaning of an overloaded field.
            </Text>

            <DocShot
              src={SHOTS.schema}
              alt="ER schema of a PostgreSQL container: users, sessions, accounts and transactions joined by foreign keys"
              caption="Double-clicking a datastore opens its tables, columns and foreign keys — inside the container they belong to."
            />

            <Text mb="12px">
              At the Component level, the tool also includes an{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                API Endpoint
              </Text>{' '}
              element. It is intentionally different from a normal component: it does not have a
              Code child level, but it can hold request, response, and header definitions.
            </Text>
            <Text>
              The goal is not to compete with a complete OpenAPI workflow. It is to give an
              important architectural entry point a place in the model, particularly when reviewing
              a cross-container integration.
            </Text>
          </Section>

          <Section id="magic-flows" title="Magic flows" hidden={!search.isVisible('magic-flows')}>
            <Text mb="12px">
              A C4 diagram shows what exists. It does not show what happens when a customer presses
              a button. A <Text as="span" fontWeight="600" color="fg.default">Magic flow</Text> is
              that missing piece: an ordered walk through the model, built from the elements and
              connections that are already there.
            </Text>

            <StepTitle>What a flow is made of</StepTitle>
            <Box as="ul" mb="12px">
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Steps</Text> — each names a hop:
                where it starts, where it ends, and which connection it uses.
              </Bullet>
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Stages</Text> — steps marked as
                parallel play together, so a fan-out reads as a fan-out instead of a queue.
              </Bullet>
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Attachments</Text> — the docs,
                sequence diagrams and API endpoints that explain a particular hop.
              </Bullet>
            </Box>

            <DocShot
              src={SHOTS.flows}
              alt="Magic flow editor listing flows, their ordered steps and the properties of one hop"
              caption="The flow editor: flows on the left, steps in the middle, and the participants and connection of the selected hop on the right."
            />

            <StepTitle>Playing a flow</StepTitle>
            <Text mb="12px">
              Press play and the flow runs on the diagram itself: everything dims except the current
              hop, the camera follows the request, and arrow keys step back and forth. It is the
              fastest way to answer “what does this request actually touch?” — during a review, an
              incident, or someone’s first week.
            </Text>

            <DocMotion
              src={SHOTS.flowPlayer}
              poster={SHOTS.flowPlayerPoster}
              alt="The Magic flow player stepping through a payment: each hop lights up while the rest of the diagram dims"
              caption="Playing “Payment leaves the bank” — step 3 of 7, from the API application to PostgreSQL."
            />

            <StepTitle>From a flow to a sequence diagram</StepTitle>
            <Text mb="12px">
              A flow can generate a PlantUML sequence diagram from its own steps, so the interaction
              exists in both forms without being maintained twice. Regenerating overwrites the
              generated diagram and leaves your hand-written ones alone.
            </Text>
            <Text>
              Open flows from the <Text as="span" fontFamily="mono" fontSize="xs">Instruments</Text>{' '}
              menu, or from the flow badge on any card that takes part in one.
            </Text>
          </Section>

          <Section
            id="collaboration-export"
            title="Collaboration and export"
            hidden={!search.isVisible('collaboration-export')}
          >
            <DocShot
              src={SHOTS.share}
              alt="Share dialog with per-person access levels and a shareable link"
              caption="Sharing a project: invite by name or hand out a link, with view or edit access."
            />
            <Text mb="12px">
              The editor can be used locally in a browser without signing in. Authenticated users
              can save projects in the cloud and share them with groups. When multiple people work
              on a project, the canvas shows active users and lets you jump to the area where a
              collaborator is currently working.
            </Text>
            <Text mb="12px">
              Projects can be exported as JSON. An individual element can be exported as a ZIP
              archive containing its child elements, relationships, documentation, and PlantUML
              artifacts.
            </Text>
            <Text>
              There is also an MCP server for authenticated users, intended to provide architecture
              context to tools such as Cursor or Claude Code. I see this as context for discussion
              and implementation assistance, not as a substitute for engineering judgement.
              Sensitive data and secrets should never be included in exported or LLM-provided
              context. Setup details are in{' '}
              <Link href="#mcp-cursor" color="brand.text" fontWeight="600">
                MCP for Cursor
              </Link>{' '}
              below.
            </Text>
          </Section>

          <Section
            id="assistant"
            title="The AI assistant, and how its allowance is counted"
            hidden={!search.isVisible('assistant')}
          >
            <Text mb="12px">
              Two jobs in the editor are dull, mechanical and therefore never done: writing the
              description of an element nobody described, and reading the whole model looking for
              what is wrong with it. The assistant does those. It runs on our provider, so there is
              no key to obtain and nothing to configure — you sign in and the buttons are there.
            </Text>

            <StepTitle>What it can do</StepTitle>
            <Box as="ul" mb="12px">
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Describe an element</Text> — the{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">✨</Text> button beside the character
                count in any element panel. It reads the element, its parent and the elements it
                talks to; it does not read your code.
              </Bullet>
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Review the model</Text> — the{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">✨</Text> button in the toolbar opens
                a panel that reports what is undescribed, what nothing talks to, what looks like the
                same job done twice, and the shapes that tend to hurt later: a datastore several
                services write into directly, a service everything depends on, a dependency cycle.
              </Bullet>
            </Box>

            <StepTitle>Nothing is applied on its own</StepTitle>
            <Text mb="12px">
              A suggested description is shown to you and lands in the model only when you press
              <Text as="span" fontWeight="600" color="fg.default"> Use it</Text>. Findings are
              read-only: each one names a real element, clicking it takes the canvas to that element,
              and what to do about it stays your decision. A finding that names something not in
              your model is discarded before you see it — the panel says how many were discarded, so
              you can judge how much the assistant is inventing.
            </Text>
            <Text mb="12px">
              A review is stored with the project, not with your browser: it survives a reload, and
              your colleagues read the review you already paid for instead of running it again. It
              is a snapshot, so the panel says when it was taken.
            </Text>

            <StepTitle>How the allowance is counted</StepTitle>
            <Text mb="12px">
              Every account gets an allowance for the calendar month, and it starts fresh on the
              first. Spending is measured in <Text as="span" fontWeight="600" color="fg.default">units</Text>,
              not in requests: a call costs one unit per token sent and eight per token written back,
              because that is the ratio the provider charges. This is why the assistant is careful
              with its output — descriptions are capped at 120 characters and a review at a dozen
              findings.
            </Text>
            <Box as="ul" mb="12px">
              <Bullet>
                A description costs roughly a thousand units; a review of a sixty-element model about
                twelve thousand. In practice a review is about ten descriptions.
              </Bullet>
              <Bullet>
                Before a call the worst case is held back, and the difference is returned the moment
                the answer arrives. That is why a review can be refused while a description still
                goes through — the two ask for different amounts, and the message says which case you
                are in: <Text as="span" fontStyle="italic">used up</Text> means nothing is left,{' '}
                <Text as="span" fontStyle="italic">not enough left for this</Text> means a smaller
                request would still work.
              </Bullet>
              <Bullet>
                Asking twice for the same thing is free. An answer is kept against the exact context
                it was written for, so pressing the button again on an unchanged element costs
                nothing. Change the element — or any of its neighbours — and it is a new question.
              </Bullet>
              <Bullet>
                Guests can draw, but not use the assistant: the calls cost real money, so they need
                an account behind them.
              </Bullet>
            </Box>
            <Text>
              When the allowance runs out the buttons say so and stop; nothing else in the editor is
              affected, and the next month starts clean.
            </Text>
          </Section>

          <Section id="limits" title="What this tool does not solve" hidden={!search.isVisible('limits')}>
            <Text mb="10px">I want to be explicit about the limits.</Text>
            <Box as="ul" mb="12px">
              <Bullet>
                It does not automatically prove that the architecture model matches production.
              </Bullet>
              <Bullet>
                It does not replace ADRs, OpenAPI/AsyncAPI, source code, or observability.
              </Bullet>
              <Bullet>It does not mean every class deserves a C4 Code-level diagram.</Bullet>
              <Bullet>
                It does not eliminate the human work of keeping documentation current.
              </Bullet>
            </Box>
            <Text>
              What it tries to do is give that human work a better structure: one place to navigate
              from a system boundary to a specific interaction, component, document, or data model.
            </Text>
          </Section>

          <Section id="mcp-cursor" title="MCP for Cursor & Claude" hidden={!search.isVisible('mcp-cursor')}>
            <Text mb="10px">
              Viaduct ships an{' '}
              <Text as="span" fontWeight="600" color="fg.default">
                MCP server
              </Text>{' '}
              so Cursor, Claude Code, Claude Desktop — any MCP client — can pull live architecture
              context into another codebase: systems and services, API endpoints (method, path, headers, request,
              response), markdown documentation, and PlantUML sequence diagrams.
            </Text>
            <Text mb="10px">
              The server is{' '}
              <Text as="span" fontWeight="600" color="fg.default">
                hosted
              </Text>{' '}
              at{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                {MCP_URL}
              </Text>
              . Nothing to clone, nothing to install — point your client at the URL and send your
              token with it. Each request carries its own token, so the server never holds anyone’s
              credentials.
            </Text>

            <StepTitle>What you need</StepTitle>
            <Box as="ul" mb="8px">
              <Bullet>Signed-in access to Viaduct (organization account).</Bullet>
              <Bullet>An MCP client: Cursor, Claude Code, Claude Desktop, or any other.</Bullet>
            </Box>

            <StepTitle>1. Create a personal API token</StepTitle>
            <Text mb="8px">
              Sign in, then open the{' '}
              <Text as="span" fontWeight="600" color="fg.default">
                gear next to your username
              </Text>{' '}
              in the top-right toolbar → <b>Account settings</b> → <b>Create token</b>. The dialog
              also copies a ready-made{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                mcp.json
              </Text>{' '}
              entry with the token already in it.
            </Text>
            <Box as="ul" mb="8px">
              <Bullet>
                The token is shown{' '}
                <Text as="span" fontWeight="600" color="fg.default">
                  once
                </Text>
                . The server keeps only a hash, so a lost token is reissued, never recovered.
              </Bullet>
              <Bullet>
                One token per client. Creating another leaves the existing ones working, so
                adding a second editor never signs the first one out.
              </Bullet>
              <Bullet>
                <b>Config</b> next to a token downloads the file its client expects — Cursor,
                Claude Code or Claude Desktop, each in the right shape. A token you just created
                comes out with the value already in it; an older one leaves a placeholder to
                paste over, since the value itself was never stored.
              </Bullet>
              <Bullet>
                <b>Revoke</b> next to a token cuts off that client alone, without touching the
                others or your browser session.
              </Bullet>
              <Bullet>
                Tokens do not expire and are independent of your browser session, which ends after
                four hours of inactivity. The list shows when each was last used, so a client that
                was never wired up correctly is easy to spot.
              </Bullet>
            </Box>
            <Text mb="8px">
              The same thing over HTTP, if you would rather script it. The cookie value comes from
              DevTools → Application / Storage → Cookies →{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                c4_uid
              </Text>
              ; copy it and run the command in one go, since it is only valid for four hours.
            </Text>
            <CodeBlock>{`curl -sS -X POST '${SITE_URL}/api/auth/api-token' \\
  -H 'Cookie: c4_uid=PASTE_COOKIE_VALUE' \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"Claude Code"}'`}</CodeBlock>
            <Text mb="8px">Example response:</Text>
            <CodeBlock>{`{
  "id": "5f0c…",
  "token": "c4pat_…",
  "name": "Claude Code",
  "createdAt": "2026-…",
  "expiresAt": null,
  "hint": "Store this token in your MCP client config…"
}`}</CodeBlock>
            <Text mb="8px">
              To list what the account has — names, creation and last use, never the tokens
              themselves:
            </Text>
            <CodeBlock>{`curl -sS '${SITE_URL}/api/auth/api-token' \\
  -H 'Cookie: c4_uid=PASTE_COOKIE_VALUE'`}</CodeBlock>
            <Text mb="8px">To revoke one by id, or every token on the account:</Text>
            <CodeBlock>{`curl -sS -X DELETE '${SITE_URL}/api/auth/api-token/TOKEN_ID' \\
  -H 'Cookie: c4_uid=PASTE_COOKIE_VALUE'

curl -sS -X DELETE '${SITE_URL}/api/auth/api-token' \\
  -H 'Cookie: c4_uid=PASTE_COOKIE_VALUE'`}</CodeBlock>

            <StepTitle>2a. Configure Cursor</StepTitle>
            <Text mb="8px">
              Add a server entry to{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                ~/.cursor/mcp.json
              </Text>{' '}
              (global) or{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                .cursor/mcp.json
              </Text>{' '}
              in a project:
            </Text>
            <CodeBlock>{`{
  "mcpServers": {
    "viaduct": {
      "url": "${MCP_URL}",
      "headers": {
        "Authorization": "Bearer c4pat_PASTE_TOKEN_HERE"
      }
    }
  }
}`}</CodeBlock>
            <Text mb="8px">
              Reload MCP in Cursor (Customize / MCP settings, or restart Cursor). Confirm the server
              shows as connected.
            </Text>

            <StepTitle>2b. Configure Claude Code</StepTitle>
            <Text mb="8px">
              Claude Code reads MCP servers from a{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                .mcp.json
              </Text>{' '}
              file at the root of the project you are working in — commit it and everyone on the
              repository gets the same architecture context:
            </Text>
            <CodeBlock>{`{
  "mcpServers": {
    "viaduct": {
      "type": "http",
      "url": "${MCP_URL}",
      "headers": {
        "Authorization": "Bearer c4pat_PASTE_TOKEN_HERE"
      }
    }
  }
}`}</CodeBlock>
            <Text mb="8px">
              If you do commit it, keep your own token out of the file — it is a personal
              credential, and a shared one lets everybody act as you.
            </Text>
            <Text mb="8px">
              The same thing from the terminal, without editing files by hand:
            </Text>
            <CodeBlock>{`claude mcp add --transport http viaduct ${MCP_URL} \\
  --header "Authorization: Bearer c4pat_PASTE_TOKEN_HERE"`}</CodeBlock>
            <Text mb="8px">
              Then run{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                /mcp
              </Text>{' '}
              inside Claude Code to check the server is connected and to see the tools it exposes.
            </Text>

            <StepTitle>2c. Configure Claude Desktop</StepTitle>
            <Text mb="8px">
              Claude Desktop keeps its servers in a config file — Settings → Developer → Edit
              config opens it, or edit it directly:
            </Text>
            <Box as="ul" mb="8px">
              <Bullet>
                macOS:{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  ~/Library/Application Support/Claude/claude_desktop_config.json
                </Text>
              </Bullet>
              <Bullet>
                Windows:{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  %APPDATA%\Claude\claude_desktop_config.json
                </Text>
              </Bullet>
            </Box>
            <Text mb="8px">
              Recent versions add a remote server under Settings → Connectors → Add custom
              connector, which only asks for the URL. If your build has no Connectors screen, use
              the config file with a local bridge instead — Claude Desktop’s config file understands
              commands, not URLs:
            </Text>
            <CodeBlock>{`{
  "mcpServers": {
    "viaduct": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote", "${MCP_URL}",
        "--header", "Authorization: Bearer c4pat_PASTE_TOKEN_HERE"
      ]
    }
  }
}`}</CodeBlock>
            <Text mb="8px">
              Restart the app after saving.
            </Text>

            <StepTitle>3. Quick smoke test</StepTitle>
            <Box as="ul" mb="8px">
              <Bullet>
                Ask the agent to run{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_whoami
                </Text>{' '}
                — you should see your username.
              </Bullet>
              <Bullet>
                Then{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_project_access
                </Text>{' '}
                and{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_project_context
                </Text>{' '}
                for a project you own or can edit.
              </Bullet>
              <Bullet>
                Not connecting? Check the server itself first — this needs no client and no token:{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  curl {MCP_ORIGIN}/healthz
                </Text>
                .
              </Bullet>
            </Box>

            <StepTitle>Available tools</StepTitle>
            <Box as="ul" mb="8px">
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_whoami
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_list_projects
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_project_access
                </Text>{' '}
                — auth and edit rights (`canEdit`)
              </Bullet>
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_project_context
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_get_element
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_search
                </Text>{' '}
                — read model / docs / sequences
              </Bullet>
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_create_element
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_update_element
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_delete_element
                </Text>{' '}
                — write architecture (requires edit)
              </Bullet>
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_upsert_connection
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_upsert_doc
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_upsert_sequence
                </Text>{' '}
                — edges, markdown, PlantUML (requires edit)
              </Bullet>
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_list_change_sets
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_get_implementation_bundle
                </Text>
                ,{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_report_progress
                </Text>{' '}
                — implement a{' '}
                <Link href="#change-sets" color="brand.text" fontWeight="600">
                  change set
                </Link>{' '}
                and report what is finished
              </Bullet>
            </Box>

            <StepTitle>How it behaves day to day</StepTitle>
            <Box as="ul" mb="8px">
              <Bullet>
                Write tools refuse projects where your share is view-only.
              </Bullet>
              <Bullet>
                Your token travels with each request and is never stored on the server. Revoking it
                in Account settings cuts off every client at once.
              </Bullet>
              <Bullet>
                Useful prompt:{' '}
                <Text as="span" fontStyle="italic" color="fg.default">
                  “Check c4_project_access, then use c4_create_element / c4_upsert_doc for project
                  &lt;id&gt;.”
                </Text>
              </Bullet>
              <Bullet>
                Treat the token like a password — do not commit it to git.
              </Bullet>
            </Box>
          </Section>

          <Section
            id="change-sets"
            title="Change sets: handing work to an agent"
            hidden={!search.isVisible('change-sets')}
          >
            <Text mb="12px">
              An agent that reads the live model is aiming at a moving target: someone renames a
              container while it works, and half its assumptions quietly expire. A{' '}
              <Text as="span" fontWeight="600" color="fg.default">
                change set
              </Text>{' '}
              is a piece of work written against a{' '}
              <Text as="span" fontWeight="600" color="fg.default">
                pinned version
              </Text>{' '}
              — one that cannot move while the work is being done.
            </Text>

            <StepTitle>What a change set holds</StepTitle>
            <Box as="ul" mb="12px">
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Intent</Text> — one sentence:
                what is being built.
              </Bullet>
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Version</Text> — the pinned
                revision the work stands on. Everything the agent reads comes from it.
              </Bullet>
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Scope</Text> — the elements this
                work may touch. The picker offers what actually changed in that version compared to
                the previous pinned one, plus their parents, so a system can cover its children
                without listing each of them.
              </Bullet>
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Constraints</Text> — framework,
                persistence, reliability patterns, and what is forbidden. Decisions already made,
                so the agent does not re-make them.
              </Bullet>
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Acceptance criteria</Text> —
                each gets an{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  ac_…
                </Text>{' '}
                id that a test name cites. This is what makes “done” a fact rather than a claim.
              </Bullet>
              <Bullet>
                <Text as="span" fontWeight="600" color="fg.default">Base code ref</Text> — the
                commit the implementation starts from, when you know it.
              </Bullet>
            </Box>

            <DocShot
              src={SHOTS.changeSets}
              alt="Change set catalog: work filtered by status on the left, and one change set open with its criteria, reported commits, scope and constraints"
              caption="A change set in flight: two of four criteria proven, three commits reported against them by the agent, and the constraints it must respect."
            />

            <StepTitle>1. Pin a version, then write the change set</StepTitle>
            <Text mb="8px">
              Cut a version from the rail at the bottom-left of the canvas — a change set can only
              stand on a pinned one, because an automatic snapshot may be evicted and take the work
              with it. A version identical to the previous one is refused: there is nothing in it to
              implement.
            </Text>
            <Text mb="8px">
              Then open <Text as="span" fontFamily="mono" fontSize="xs">Instruments</Text> →{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">Change sets</Text> (or the same entry
              from the version rail) and press <b>New change set</b>. The catalog lists everything
              the project has, filtered by status.
            </Text>

            <DocShot
              src={SHOTS.changeSetNew}
              alt="New change set form: intent, the pinned version, scope picked from that version's diff, constraints and acceptance criteria"
              caption="Writing one: the scope list offers only what changed in this version, so the boundary is picked from real work rather than from the whole model."
            />

            <StepTitle>2. Hand it over</StepTitle>
            <Text mb="8px">
              Open the change set and press{' '}
              <Text as="span" fontWeight="600" color="fg.default">
                Copy agent handoff
              </Text>
              . You get a prompt with both ids already in it — paste it into Cursor, Claude Code, or
              anything else wired to the{' '}
              <Link href="#mcp-cursor" color="brand.text" fontWeight="600">
                MCP server
              </Link>
              . It tells the agent to:
            </Text>
            <Box as="ul" mb="8px">
              <Bullet>
                mark the work started, then fetch{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_get_implementation_bundle
                </Text>{' '}
                — a scoped diff of that revision against the previous pinned version, with the
                contracts, neighbours, flows and documentation of the elements in scope, and nothing
                else from the graph;
              </Bullet>
              <Bullet>
                treat the bundle as the specification — if something in it is wrong or missing, say
                so rather than editing the model mid-flight;
              </Bullet>
              <Bullet>
                write a test per criterion with its{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  ac_…
                </Text>{' '}
                id in the test name;
              </Bullet>
              <Bullet>
                call{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_report_progress
                </Text>{' '}
                after each finished piece, with the summary, the criterion it proves and the commit
                sha.
              </Bullet>
            </Box>
            <Text mb="8px">
              Endpoints arrive with their protocol spelled out, so an agent knows whether it is
              implementing a request/response call or a channel:
            </Text>
            <CodeBlock>{`"contract": {
  "protocol": "websocket",
  "method": "WS",
  "path": "/ws/orders",
  "response": "order.created message, one per accepted order"
}`}</CodeBlock>

            <StepTitle>3. Watch it move</StepTitle>
            <Text mb="8px">
              Status is derived from evidence, never announced: a change set is a{' '}
              <b>draft</b> until work is reported against it, <b>implementing</b> from the first
              report, and <b>done</b> when every criterion has evidence behind it. Nobody has to
              remember to close it.
            </Text>
            <Text mb="8px">
              The catalog updates itself while you watch — the server pushes each change over the
              collaboration socket, with a poll behind it for sessions that have no socket. Leave it
              open on a second monitor and you can see commits landing against criteria without
              touching the page.
            </Text>
            <Text mb="8px">
              Only a draft can be deleted. Past that point the change set carries the record of work
              that actually happened — criteria cited by tests, commits reported against them — and
              throwing it away would erase that.
            </Text>

            <StepTitle>Tools an agent uses</StepTitle>
            <Box as="ul" mb="8px">
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_list_change_sets
                </Text>{' '}
                — what work exists and where it stands.
              </Bullet>
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_get_implementation_bundle
                </Text>{' '}
                — the specification for one change set, pinned to its revision.
              </Bullet>
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_report_progress
                </Text>{' '}
                — one finished piece: summary, criterion, commit ref.
              </Bullet>
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  c4_set_change_set_status
                </Text>{' '}
                — for the transitions evidence cannot make on its own.
              </Bullet>
            </Box>
            <Text fontSize="sm" color={chrome.textMuted}>
              Change sets belong to accounts: a project opened through a share link can be read and
              edited, but its versions and change sets stay out of reach.
            </Text>
          </Section>

          <Section id="rest-api" title="REST API" hidden={!search.isVisible('rest-api')}>
            <Text mb="12px">
              The same endpoints the MCP server uses are public under{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                /api/v1
              </Text>
              . Authenticate with the personal access token from Settings → MCP access, the one
              your editor already holds:
            </Text>
            <CodeBlock>{`curl ${SITE_URL}/api/v1/projects \\
  -H "Authorization: Bearer c4pat_…"`}</CodeBlock>
            <Text mb="12px">
              A token carries scopes.{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                read
              </Text>{' '}
              covers every GET;{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                write
              </Text>{' '}
              is needed for anything that changes something, and a token without it is answered 403{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                insufficient_scope
              </Text>
              . Issue a read-only one for CI and dashboards — it cannot touch the model even if it
              leaks.
            </Text>
            <Box as="ul" mb="12px">
              <Bullet>
                Every failure carries a code and a sentence:{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  {'{ "error": "not_found", "message": "…" }'}
                </Text>
                .
              </Bullet>
              <Bullet>
                600 requests per minute per token. Over it, 429 with{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  Retry-After
                </Text>
                .
              </Bullet>
              <Bullet>
                Collections that can grow take{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  limit
                </Text>{' '}
                and{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  cursor
                </Text>
                , and answer with{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  next_cursor
                </Text>
                . Ask for neither and you get the list whole.
              </Bullet>
              <Bullet>
                The unversioned{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  /api
                </Text>{' '}
                paths are what this application calls and are free to change. Build against{' '}
                <Text as="span" fontFamily="mono" fontSize="xs">
                  /api/v1
                </Text>
                .
              </Bullet>
            </Box>
            <Text mb="12px">
              Every endpoint, with its parameters and responses, is on the{' '}
              <Link
                href="/api-reference.html"
                color="brand.text"
                target="_blank"
                rel="noopener noreferrer"
              >
                API reference
              </Link>
              .
            </Text>
            <Text fontSize="sm" color={chrome.textMuted}>
              That page reads the OpenAPI document at{' '}
              <Link
                href={`${SITE_URL}/api/v1/openapi.json`}
                color="brand.text"
                target="_blank"
                rel="noopener noreferrer"
              >
                /api/v1/openapi.json
              </Link>{' '}
              — point a client generator at the same URL, or open it in any viewer you prefer.
            </Text>
          </Section>

          <Section id="webhooks" title="Webhooks" hidden={!search.isVisible('webhooks')}>
            <Text mb="12px">
              A project can post its changes to your endpoint. Add one on the webhooks button in
              the editor rail — it is the owner's to set, since it decides where a copy of every
              change goes. Events:
            </Text>
            <Box as="ul" mb="12px">
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  element.created / updated / deleted
                </Text>{' '}
                — systems, containers, components and code elements.
              </Bullet>
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  connection.created / updated / deleted
                </Text>
                .
              </Bullet>
              <Bullet>
                <Text as="span" fontFamily="mono" fontSize="xs">
                  change_set.status_changed
                </Text>{' '}
                — the one a pipeline usually waits for.
              </Bullet>
            </Box>
            <Text mb="12px">
              Events arrive after the model settles, not on every keystroke, and say what changed
              rather than carrying the whole model. When one lands, ask the API for the current
              state of what it names.
            </Text>
            <CodeBlock>{`POST /your/endpoint
X-Viaduct-Event: element.updated
X-Viaduct-Timestamp: 1788370155
X-Viaduct-Signature: 9f2b…

{
  "event": "element.updated",
  "project_id": "…",
  "resource_id": "…",
  "occurred_at": "2026-09-02T18:00:00.000Z",
  "actor_id": "…",
  "before": { "id": "…", "name": "Billing", "level": "system" },
  "after":  { "id": "…", "name": "Billing API", "level": "system" }
}`}</CodeBlock>
            <Text mb="12px">
              Verify before you trust it. The signature is HMAC-SHA256 over{' '}
              <Text as="span" fontFamily="mono" fontSize="xs">
                timestamp.body
              </Text>{' '}
              with the secret shown once when the webhook is created:
            </Text>
            <CodeBlock>{`const signed = \`\${req.headers['x-viaduct-timestamp']}.\${rawBody}\`;
const mine = crypto.createHmac('sha256', SECRET).update(signed).digest('hex');
const fresh = Math.abs(Date.now() / 1000 - Number(req.headers['x-viaduct-timestamp'])) < 300;
if (!fresh || mine !== req.headers['x-viaduct-signature']) return res.sendStatus(400);`}</CodeBlock>
            <Text fontSize="sm" color={chrome.textMuted}>
              Non-2xx answers are retried five times over an hour, widening the gap each time; an
              endpoint that keeps failing is switched off and says so in its delivery log, which
              the dialog shows. Endpoints must be https and public — an address on a private
              network is refused when you add it and again before every delivery.
            </Text>
          </Section>

          <Section id="contact" title="Contact" hidden={!search.isVisible('contact')}>
            <Text mb="10px">Questions, feedback or support — write to Quiet Grid Labs:</Text>
            <Button
              size="sm"
              variant="outline"
              color="fg.brand.emphasis"
              borderColor="border.brand.emphasis"
              bg="transparent"
              _hover={{ bg: 'bg.brand.emphasis', color: 'fg.on.brand' }}
              onClick={() => setSupportOpen(true)}
            >
              <MessageSquare size={15} />
              {t('support_title')}
            </Button>
            <Text fontSize="sm" color={chrome.textMuted} mt="8px">
              Or email {SUPPORT_EMAIL} directly.
            </Text>
          </Section>

          <Text fontSize="sm" color={chrome.textMuted} mt="8px">
            Need the editor again?{' '}
            <Link asChild color="brand.text" fontWeight="600">
              <RouterLink to="/">Open Viaduct</RouterLink>
            </Link>
          </Text>
        </VStack>
      </Box>

      <SupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} source="docs_contact" />

      <AppFooter />

    </Box>
  );
}
