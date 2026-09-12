/**
 * Public landing page — shown only to unauthenticated visitors.
 * Authenticated users are redirected straight to the editor.
 * Styled to match the app's glassmorphism aesthetic.
 */
import AppFooter from '@components/AppFooter';
import LandingIntro from '@components/LandingIntro';
import JsonSnippet from '@components/common/JsonSnippet';
import DesignSourceKindIcon from '@components/common/DesignSourceKindIcon';
import DotGrid from '@components/landing/DotGrid';
import GlassNav from '@components/landing/GlassNav';
import { prefetchWorkspace } from '@plugins/prefetchWorkspace';
import { useAuth } from '@contexts/AuthContext';
import { useColorMode } from '@contexts/ColorModeContext';
import { usePageScroll } from '@hooks/usePageScroll';
import { trackEvent } from '@/analytics';
import { trackProductEvent } from '@/metrics';
import { loginPagePath } from '@shared/api';
import { FROM_LANDING } from '@/features/auth/cameFrom';
import { FAQ } from '@/content/faq';
import { DEMO_SHARE_URL } from '@/content/demoModel';
import systemContextDark from '@assets/marketing/system-context-dark.webp';
import systemContextLight from '@assets/marketing/system-context-light.webp';
import containersDark from '@assets/marketing/containers-dark.webp';
import containersLight from '@assets/marketing/containers-light.webp';
import schemaDark from '@assets/marketing/schema-dark.webp';
import schemaLight from '@assets/marketing/schema-light.webp';
import docsDark from '@assets/marketing/docs-dark.webp';
import docsLight from '@assets/marketing/docs-light.webp';
import sequenceDark from '@assets/marketing/sequence-dark.webp';
import sequenceLight from '@assets/marketing/sequence-light.webp';
import flowsDark from '@assets/marketing/flows-dark.webp';
import flowsLight from '@assets/marketing/flows-light.webp';
import changeSetsDark from '@assets/marketing/change-sets-dark.webp';
import changeSetsLight from '@assets/marketing/change-sets-light.webp';
import drillDownDark from '@assets/marketing/drill-down-dark.mp4';
import drillDownLight from '@assets/marketing/drill-down-light.mp4';
import drillDownDarkPoster from '@assets/marketing/drill-down-dark-poster.webp';
import drillDownLightPoster from '@assets/marketing/drill-down-light-poster.webp';
import flowPlayerDark from '@assets/marketing/flow-player-dark.mp4';
import flowPlayerLight from '@assets/marketing/flow-player-light.mp4';
import flowPlayerDarkPoster from '@assets/marketing/flow-player-dark-poster.webp';
import flowPlayerLightPoster from '@assets/marketing/flow-player-light-poster.webp';
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Avatar,
  Link,
  Marquee,
  Stack,
  Text,
} from '@chakra-ui/react';
import { TESTIMONIALS, type Testimonial } from '@/content/testimonials';
import QuackSpinner from '@components/QuackSpinner';
import {
  ArrowRight,
  Download,
  KeyRound,
  Play,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Link as RouterLink, useLocation } from 'react-router-dom';

// ─── Dot grid background (SVG, matches FlowCanvas dots) ──────────────────────


// ─── Glass nav ────────────────────────────────────────────────────────────────



// ─── Product shots ────────────────────────────────────────────────────────────

/** Framed screenshot — the app's own glass edge, so it reads as a window. */
function Shot({
  src,
  alt,
  eager,
}: {
  src: string;
  alt: string;
  eager?: boolean;
}) {
  return (
    <Box
      borderRadius="14px"
      borderWidth="1px"
      borderColor="border.glass"
      overflow="hidden"
      boxShadow="float"
      bg="bg.dialog"
      lineHeight={0}
    >
      <Image
        src={src}
        alt={alt}
        w="100%"
        h="auto"
        display="block"
        loading={eager ? 'eager' : 'lazy'}
        // The captures are 1800×1125 (16:10) — reserve the box to avoid reflow.
        aspectRatio={1.6}
      />
    </Box>
  );
}

/** True while the visitor has asked the OS to keep motion down. */
/* Read on the first render, not after it: a state that starts wrong mounts the
   video for one frame, and one frame is enough for the browser to start
   fetching an mp4 nobody asked for. Measured — two requests on a phone. */
function matches(query: string): boolean {
  return typeof window !== 'undefined' && window.matchMedia(query).matches;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => matches('(prefers-reduced-motion: reduce)'));
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Screen recording in the same frame as the stills. It ships as a muted looping
 * video rather than a GIF — a tenth of the bytes at a higher resolution, and it
 * can hold still for people who asked for reduced motion.
 */
/** True on a narrow screen — where an autoplaying video is somebody's data. */
function useNarrowScreen(): boolean {
  const [narrow, setNarrow] = useState(() => matches('(max-width: 767px)'));
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    setNarrow(query.matches);
    const onChange = (event: MediaQueryListEvent) => setNarrow(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

/**
 * Screen recording in the same frame as the stills. It ships as a muted looping
 * video rather than a GIF — a tenth of the bytes at a higher resolution, and it
 * can hold still for people who asked for reduced motion.
 *
 * On a phone it holds still by default too. Two clips playing themselves on a
 * metered connection is a cost the reader never agreed to, and a page that
 * moves in three places at once on a small screen is harder to read, not
 * easier. The poster is the same frame the video starts on, so pressing play
 * continues the picture rather than replacing it.
 */
function Motion({
  src,
  poster,
  alt,
}: {
  src: string;
  poster: string;
  alt: string;
}) {
  const reduced = useReducedMotion();
  const narrow = useNarrowScreen();
  const [asked, setAsked] = useState(false);
  const { t } = useTranslation();
  const still = (reduced || narrow) && !asked;

  return (
    <Box
      borderRadius="14px"
      borderWidth="1px"
      borderColor="border.glass"
      overflow="hidden"
      boxShadow="float"
      bg="bg.dialog"
      lineHeight={0}
      position="relative"
    >
      {still ? (
        <>
          <Image src={poster} alt={alt} w="100%" h="auto" display="block" loading="lazy" />
          {/* Offered, not forced: reduced motion means do not move on your own,
              not refuse to move when asked. */}
          <Button
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            variant="ghost"
            borderRadius="0"
            cursor="pointer"
            aria-label={t('landing_play')}
            onClick={() => setAsked(true)}
            _hover={{ bg: 'blackAlpha.300' }}
          >
            <Box
              display="inline-flex"
              alignItems="center"
              gap="8px"
              px="14px"
              py="8px"
              borderRadius="999px"
              bg="bg.brand.emphasis"
              color="fg.on.brand"
              fontWeight="700"
              fontSize="sm"
            >
              <Play size={14} aria-hidden />
              {t('landing_play')}
            </Box>
          </Button>
        </>
      ) : (
        <Box
          as="video"
          // @ts-expect-error — Chakra passes media attributes straight through.
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          /* Nothing is fetched until it is going to be watched. */
          preload={narrow ? 'none' : 'metadata'}
          aria-label={alt}
          w="100%"
          h="auto"
          display="block"
        />
      )}
    </Box>
  );
}

function FeatureTabs({
  items,
}: {
  items: Array<{ id: string; label: string; body: string; shot: React.ReactNode }>;
}) {
  const [active, setActive] = useState(items[0]?.id);
  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <Box maxW="1120px" mx="auto">
      <HStack
        gap="6px"
        mb="24px"
        flexWrap="wrap"
        justify={{ base: 'flex-start', md: 'center' }}
        role="tablist"
      >
        {items.map((item) => {
          const selected = item.id === current.id;
          return (
            <Button
              key={item.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              id={`tab-${item.id}`}
              onClick={() => setActive(item.id)}
              size="sm"
              h="36px"
              px="16px"
              borderRadius="10px"
              borderWidth="1px"
              fontWeight="600"
              cursor="pointer"
              bg={selected ? 'bg.muted' : 'transparent'}
              borderColor={selected ? 'border.strong' : 'transparent'}
              color={selected ? 'fg.default' : 'fg.muted'}
              _hover={{ color: 'fg.default', bg: 'bg.muted' }}
            >
              {item.label}
            </Button>
          );
        })}
      </HStack>

      <Stack
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: '24px', lg: '48px' }}
        align="center"
        id={`panel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${current.id}`}
      >
        <Box flex="1" minW={0} maxW={{ base: '100%', lg: '380px' }}>
          <Text fontSize="md" color="fg.muted" lineHeight="1.7">
            {current.body}
          </Text>
        </Box>
        <Box flex="1.3" minW={0} w="100%">
          {current.shot}
        </Box>
      </Stack>
    </Box>
  );
}

/** Alternating text/screenshot band. */
/**
 * Section number and name, in the tool's own monospace.
 *
 * The orange all-caps eyebrow that used to sit here shouted on every section
 * and so marked none of them; the accent is reserved for things you can click.
 */
/** Their initials, for the cards that have no portrait. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Whole stars only — half a star is a precision this page does not have. */
function Rating({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <HStack gap="2px" aria-label={`${filled} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        /* The colour lives on the wrapper: these are semantic tokens, which
           Chakra resolves on its own props and not inside an inline `color`
           on an SVG — the stars came out plain white. The icon inherits. */
        <Box
          key={i}
          as="span"
          display="inline-flex"
          /* The amber that reads as "look here" — a rating in the muted brand
             ink looked like four grey smudges. */
          color={i < filled ? 'fg.brand.emphasis' : 'fg.subtle'}
        >
          {/* Empty stars keep their outline rather than disappearing, so four
              out of five reads as four out of five and not as four. */}
          <Star size={13} aria-hidden fill={i < filled ? 'currentColor' : 'none'} />
        </Box>
      ))}
    </HStack>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <Box
      w={{ base: '280px', md: '360px' }}
      p="20px"
      /* No outline: the card is already a lighter tone than the section, and
         a rule around every quote turned the band into a row of boxes. */
      borderRadius="12px"
      bg="bg.subtle"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      gap="14px"
      h="100%"
    >
      <Box>
        <Box mb="10px">
          <Rating value={item.rating} />
        </Box>
        <Text fontSize="sm" color="fg.default" lineHeight="1.7">
          {item.quote}
        </Text>
      </Box>
      <HStack gap="10px">
        <Avatar.Root
          size="sm"
          flexShrink={0}
          bg="bg.brand.subtle"
          color="fg.brand.emphasis"
        >
          {/* The fallback is what most cards show: initials need nobody's
              permission, and a stock face on a real quote is a small lie. */}
          <Avatar.Fallback fontSize="xs" fontWeight="700">
            {initials(item.name)}
          </Avatar.Fallback>
          {/* Not `loading="lazy"`: Ark keeps the image hidden until it fires
              `load`, and a lazy image that is `display: none` never gets round
              to loading — every card sat on its initials. They are 2KB each. */}
          {item.avatar ? <Avatar.Image src={item.avatar} alt="" /> : null}
        </Avatar.Root>
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="700" color="fg.default" truncate>
            {item.name}
          </Text>
          <Text fontSize="xs" color="fg.subtle" fontFamily="mono" truncate>
            {item.role}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}

/**
 * One scrolling row of quotes.
 *
 * `autoFill` is what keeps the row continuous when there are fewer cards than
 * the viewport is wide, and the pair of edges fades the ends into the section
 * so nothing appears to be cut off mid-word. It stops under the pointer,
 * because a quote that scrolls away while it is being read is a quote nobody
 * finishes.
 */
function TestimonialRow({
  items,
  reverse,
  speed,
  paused,
  label,
}: {
  items: Testimonial[];
  reverse?: boolean;
  speed: number;
  paused: boolean;
  label: string;
}) {
  /* `undefined` rather than `false`: a `paused` value of any kind makes the
     marquee controlled, and a controlled `false` overrides the machine's own
     pause — the row then ran straight through the pointer. Only reduced
     motion takes the wheel. */
  const pausedProp = paused || undefined;
  if (!items.length) return null;
  return (
    <Marquee.Root
      speed={speed}
      reverse={reverse}
      autoFill
      pauseOnInteraction
      paused={pausedProp}
      spacing="16px"
      translations={{ root: label }}
      w="full"
    >
      <Marquee.Viewport>
        <Marquee.Content>
          {items.map((item) => (
            <Marquee.Item key={item.quote} h="100%">
              <TestimonialCard item={item} />
            </Marquee.Item>
          ))}
        </Marquee.Content>
      </Marquee.Viewport>
      <Marquee.Edge side="start" />
      <Marquee.Edge side="end" />
    </Marquee.Root>
  );
}

function SectionLabel({ index, label }: { index: number; label: string }) {
  return (
    <HStack gap="10px" mb="14px" color="fg.subtle">
      <Text fontFamily="mono" fontSize="xs">
        {String(index).padStart(2, '0')}
      </Text>
      <Box h="1px" w="24px" bg="border.default" aria-hidden />
      <Text fontFamily="mono" fontSize="xs" letterSpacing="0.04em">
        {label}
      </Text>
    </HStack>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Heading
      as="h2"
      fontSize={{ base: '2xl', md: '3xl' }}
      fontWeight="800"
      letterSpacing="-0.025em"
      lineHeight="1.2"
      mb="14px"
      maxW="20ch"
      color="fg.default"
    >
      {children}
    </Heading>
  );
}

function FeatureSection({
  index,
  eyebrow,
  title,
  body,
  shot,
  flip,
}: {
  index: number;
  eyebrow: string;
  title: string;
  body: string;
  shot: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <Box as="section" px={{ base: '20px', md: '48px' }} py={{ base: '48px', md: '72px' }}>
      <Stack
        direction={{ base: 'column', lg: flip ? 'row-reverse' : 'row' }}
        gap={{ base: '28px', lg: '56px' }}
        align="center"
        maxW="1120px"
        mx="auto"
      >
        <Box flex="1" minW={0} maxW={{ base: '100%', lg: '440px' }}>
          <SectionLabel index={index} label={eyebrow} />
          <SectionHeading>{title}</SectionHeading>
          <Text fontSize="md" color="fg.muted" lineHeight="1.7">
            {body}
          </Text>
        </Box>
        <Box flex="1.15" minW={0} w="100%">
          {shot}
        </Box>
      </Stack>
    </Box>
  );
}

/**
 * A section that argues with an artefact instead of a screenshot: the text the
 * tool actually produces, set as text. Nothing else on the page looks like it,
 * which is the point — the rhythm has to break somewhere.
 */
function SpecSection({
  index,
  eyebrow,
  title,
  body,
  caption,
  code,
}: {
  index: number;
  eyebrow: string;
  title: string;
  body: string;
  caption: string;
  code: string;
}) {
  return (
    <Box
      as="section"
      px={{ base: '20px', md: '48px' }}
      py={{ base: '48px', md: '72px' }}
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="bg.muted"
    >
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: '28px', lg: '64px' }}
        align="start"
        maxW="1120px"
        mx="auto"
      >
        <Box flex="1" minW={0} maxW={{ base: '100%', lg: '420px' }}>
          <SectionLabel index={index} label={eyebrow} />
          <SectionHeading>{title}</SectionHeading>
          <Text fontSize="md" color="fg.muted" lineHeight="1.7">
            {body}
          </Text>
        </Box>
        <Box flex="1.2" minW={0} w="100%">
          <JsonSnippet
            code={code}
            fontFamily="mono"
            fontSize={{ base: '11px', md: 'xs' }}
            lineHeight="1.75"
            color="fg.muted"
            bg="bg.canvas"
            borderRadius="10px"
            p={{ base: '14px', md: '20px' }}
            overflowX="auto"
          />
          <Text fontFamily="mono" fontSize="xs" color="fg.subtle" mt="10px">
            {caption}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}

/**
 * The Figma integration, said once and briefly.
 *
 * Two earlier versions of this section showed the machinery: first the stored
 * contract as text, then a mock of an element's design panel. Both answered a
 * question nobody on a landing page is asking yet. What a visitor wants to
 * know here is whether this thing talks to the tool their designers use, and
 * what they get for connecting it — three sentences, and then out of the way.
 * The panel, the format and the node ids are what the product is for; they
 * belong where somebody has already decided to try it.
 */
function DesignSection({ index }: { index: number }) {
  const { t } = useTranslation();
  const points = [
    { title: t('landing_design_point_1_title'), body: t('landing_design_point_1') },
    { title: t('landing_design_point_2_title'), body: t('landing_design_point_2') },
    { title: t('landing_design_point_3_title'), body: t('landing_design_point_3') },
  ];

  return (
    <Box
      as="section"
      id="figma"
      scrollMarginTop="96px"
      px={{ base: '20px', md: '48px' }}
      py={{ base: '56px', md: '80px' }}
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="bg.muted"
    >
      <Box maxW="1120px" mx="auto">
        <HStack gap="10px" mb="14px" color="fg.subtle">
          <Text fontFamily="mono" fontSize="xs">
            {String(index).padStart(2, '0')}
          </Text>
          <Box h="1px" w="24px" bg="border.default" aria-hidden />
          {/* The mark, because the word alone makes a reader check whether
              this is really the tool they use. */}
          <DesignSourceKindIcon kind="figma" size={14} />
          <Text fontFamily="mono" fontSize="xs" letterSpacing="0.04em">
            {t('landing_design_eyebrow')}
          </Text>
        </HStack>

        <Stack
          direction={{ base: 'column', lg: 'row' }}
          gap={{ base: '20px', lg: '56px' }}
          align={{ base: 'start', lg: 'baseline' }}
          mb={{ base: '28px', md: '40px' }}
        >
          <Box flex="1" minW={0}>
            <SectionHeading>{t('landing_design_title')}</SectionHeading>
          </Box>
          <Text flex="1" minW={0} fontSize="md" color="fg.muted" lineHeight="1.7">
            {t('landing_design_body')}
          </Text>
        </Stack>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: '20px', md: '32px' }}
          align="stretch"
        >
          {points.map((point) => (
            <Box key={point.title} flex="1" minW={0}>
              <Box h="2px" w="28px" bg="border.strong" mb="12px" aria-hidden />
              <Text fontSize="sm" fontWeight="700" color="fg.default" mb="6px">
                {point.title}
              </Text>
              <Text fontSize="sm" color="fg.muted" lineHeight="1.65">
                {point.body}
              </Text>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

/**
 * A real export, trimmed to fit: what a container's endpoints become when the
 * server assembles them. Shown as text on purpose — this is the artefact the
 * page is talking about, and a screenshot of it would say less.
 */
const OPENAPI_SAMPLE = `{
  "openapi": "3.1.0",
  "info": { "title": "Accounts API", "version": "1.4.0" },
  "paths": {
    "/api/accounts/{id}": {
      "get": {
        "operationId": "getAccount",
        "summary": "Get account",
        "parameters": [
          { "name": "id", "in": "path", "required": true,
            "schema": { "type": "string" }, "example": "acc_42" }
        ],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": {
            "example": { "id": "acc_42", "currency": "EUR" } } } },
          "404": { "description": "No account with that id" }
        }
      }
    }
  }
}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { t } = useTranslation();
  const { search } = useLocation();
  const { user, loading } = useAuth();
  const { mode } = useColorMode();
  const reducedMotion = useReducedMotion();
  usePageScroll();

  /* Two rows, split down the middle, so neither is a copy of the other going
     the other way. With three quotes or fewer there is only a top row — one
     sparse band beats two half-empty ones. */
  const splitAt = TESTIMONIALS.length > 3 ? Math.ceil(TESTIMONIALS.length / 2) : TESTIMONIALS.length;
  const topRowTestimonials = TESTIMONIALS.slice(0, splitAt);
  const bottomRowTestimonials = TESTIMONIALS.slice(splitAt);

  /* Count a real landing visit — not the auth spinner, not a bounce through to
     /editor for someone already signed in. */
  useEffect(() => {
    if (loading || user) return;
    trackProductEvent('landing.opened');
  }, [loading, user]);

  const dotColor =
    mode === 'light' ? 'rgba(100,80,60,0.18)' : 'rgba(180,160,220,0.14)';

  /* Screenshots follow the visitor's theme — a light shot on a dark page (or the
     reverse) reads as a foreign screenshot pasted in. */
  const shots =
    mode === 'light'
      ? {
          hero: systemContextLight,
          containers: containersLight,
          schema: schemaLight,
          docs: docsLight,
          sequence: sequenceLight,
          flows: flowsLight,
          changeSets: changeSetsLight,
          drillDown: drillDownLight,
          drillDownPoster: drillDownLightPoster,
          flowPlayer: flowPlayerLight,
          flowPlayerPoster: flowPlayerLightPoster,
        }
      : {
          hero: systemContextDark,
          containers: containersDark,
          schema: schemaDark,
          docs: docsDark,
          sequence: sequenceDark,
          flows: flowsDark,
          changeSets: changeSetsDark,
          drillDown: drillDownDark,
          drillDownPoster: drillDownDarkPoster,
          flowPlayer: flowPlayerDark,
          flowPlayerPoster: flowPlayerDarkPoster,
        };

  if (loading) {
    return (
      <Box h="100%" minH="100dvh" display="grid" placeItems="center" bg="bg.canvas">
        <QuackSpinner size="xl" />
      </Box>
    );
  }

  /*
   * Authenticated users skip the landing entirely — carrying the query with
   * them. After signing in the provider drops the browser here with
   * `?projects=1`, and dropping it turned "here are your projects" into an
   * empty canvas, which is the blank page this screen exists to avoid.
   */
  if (user) {
    return <Navigate to={`/editor${search}`} replace />;
  }

  return (
    <Box
      minH="100dvh"
      bg="bg.canvas"
      color="fg.default"
      display="flex"
      flexDirection="column"
    >
      <LandingIntro />

      <GlassNav />

      <Box as="main" flex="1" display="flex" flexDirection="column">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <Box
          as="section"
          position="relative"
          px={{ base: '20px', md: '48px' }}
          pt={{ base: '72px', md: '100px' }}
          pb={{ base: '64px', md: '88px' }}
          overflow="hidden"
        >
          <DotGrid dotColor={dotColor} />

          <Box maxW="1120px" mx="auto" position="relative">
            <Text
              fontFamily="mono"
              fontSize="xs"
              color="fg.subtle"
              letterSpacing="0.04em"
              mb="20px"
            >
              {t('landing_eyebrow')}
            </Text>

            <Heading
              as="h1"
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="800"
              letterSpacing="-0.03em"
              lineHeight="1.08"
              mb="22px"
              maxW="16ch"
              color="fg.default"
            >
              {t('landing_headline')}
            </Heading>

            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="fg.muted"
              lineHeight="1.7"
              maxW="56ch"
              mb="32px"
            >
              {t('landing_subheadline')}
            </Text>

            {/* CTAs */}
            {/* The accent belongs to the door that opens without an account —
                signing in is the step after someone has seen the thing. */}
            <HStack gap="12px" flexWrap="wrap">
              <Button
                asChild
                size="lg"
                h="48px"
                px="24px"
                fontWeight="700"
                fontSize="md"
                bg="bg.brand.emphasis"
                color="fg.on.brand"
                borderWidth="0"
                borderRadius="10px"
                _hover={{ bg: 'bg.brand.emphasis.hover' }}
                cursor="pointer"
              >
                <RouterLink
                  to="/editor"
                  onMouseEnter={prefetchWorkspace}
                  onFocus={prefetchWorkspace}
                  onClick={() => {
                    trackEvent('landing_try_local');
                    trackProductEvent('landing.try_local');
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {t('landing_cta_local')}
                  <ArrowRight size={18} aria-hidden />
                </RouterLink>
              </Button>

              <Button
                asChild
                size="lg"
                h="48px"
                px="24px"
                fontWeight="600"
                fontSize="md"
                variant="outline"
                borderColor="border.glass"
                color="fg.default"
                borderRadius="10px"
                _hover={{ bg: 'bg.muted' }}
                cursor="pointer"
              >
                <RouterLink
                  to={loginPagePath()}
                  state={FROM_LANDING}
                  onClick={() => {
                    trackEvent('landing_signin', { placement: 'hero' });
                    trackProductEvent('landing.signin');
                  }}
                >
                  {t('landing_cta_primary')}
                </RouterLink>
              </Button>
            </HStack>

            <Text fontFamily="mono" fontSize="xs" color="fg.subtle" mt="16px">
              {t('landing_cta_local_hint')}
            </Text>
          </Box>

          {/* Hero shot — the product, at the first scroll position. */}
          <Box maxW="1120px" mx="auto" mt={{ base: '40px', md: '56px' }} position="relative">
            <Shot src={shots.hero} alt={t('landing_shot_hero_alt')} eager />
          </Box>
        </Box>

        <FeatureSection
          index={1}
          eyebrow={t('landing_levels_eyebrow')}
          title={t('landing_levels_title')}
          body={t('landing_levels_body')}
          shot={
            <Motion
              src={shots.drillDown}
              poster={shots.drillDownPoster}
              alt={t('landing_levels_alt')}
            />
          }
        />

        <FeatureSection
          index={2}
          flip
          eyebrow={t('landing_tech_eyebrow')}
          title={t('landing_tech_title')}
          body={t('landing_tech_body')}
          shot={<Shot src={shots.containers} alt={t('landing_tech_alt')} />}
        />

        {/* ── What a model can carry ─────────────────────────────────────── */}
        <Box as="section" px={{ base: '20px', md: '48px' }} py={{ base: '48px', md: '72px' }}>
          <Box maxW="1120px" mx="auto" mb="32px">
            <SectionLabel index={3} label={t('landing_tabs_eyebrow')} />
            <SectionHeading>{t('landing_tabs_title')}</SectionHeading>
          </Box>

          <FeatureTabs
            items={[
              {
                id: 'docs',
                label: t('landing_tab_docs'),
                body: t('landing_tab_docs_body'),
                shot: <Shot src={shots.docs} alt={t('landing_tab_docs_alt')} />,
              },
              {
                id: 'sequence',
                label: t('landing_tab_sequence'),
                body: t('landing_tab_sequence_body'),
                shot: <Shot src={shots.sequence} alt={t('landing_tab_sequence_alt')} />,
              },
              {
                id: 'schema',
                label: t('landing_tab_schema'),
                body: t('landing_tab_schema_body'),
                shot: <Shot src={shots.schema} alt={t('landing_tab_schema_alt')} />,
              },
            ]}
          />
        </Box>

        {/* ── Testimonials ───────────────────────────────────────────────── */}
        {TESTIMONIALS.length ? (
          <Box
            as="section"
            px={{ base: '20px', md: '48px' }}
            py={{ base: '56px', md: '80px' }}
            borderTopWidth="1px"
            borderColor="border.default"
            overflow="hidden"
          >
            <Box maxW="1120px" mx="auto" mb="28px">
              <SectionLabel index={4} label={t('landing_voices_eyebrow')} />
              <SectionHeading>{t('landing_voices_title')}</SectionHeading>
              <Text fontSize="md" color="fg.muted" lineHeight="1.7" maxW="56ch">
                {t('landing_voices_body')}
              </Text>
            </Box>
            {/* Full bleed, not clamped to the text column: the rows read as one
                continuous band across the page rather than as a widget, and
                the fades land on the window edge instead of mid-padding. */}
            <Stack gap="16px" mx={{ base: '-20px', md: '-48px' }}>
              <TestimonialRow
                items={topRowTestimonials}
                speed={28}
                paused={reducedMotion}
                label={t('landing_voices_eyebrow')}
              />
              {bottomRowTestimonials.length ? (
                <TestimonialRow
                  items={bottomRowTestimonials}
                  reverse
                  speed={22}
                  paused={reducedMotion}
                  label={t('landing_voices_eyebrow')}
                />
              ) : null}
            </Stack>
          </Box>
        ) : null}

        {/* ── Magic flows ────────────────────────────────────────────────── */}
        <Box
          as="section"
          px={{ base: '20px', md: '48px' }}
          py={{ base: '56px', md: '80px' }}
          borderTopWidth="1px"
          borderBottomWidth="1px"
          borderColor="border.default"
          bg="bg.muted"
        >
          <Box maxW="1120px" mx="auto">
            <Stack
              direction={{ base: 'column', lg: 'row' }}
              gap={{ base: '28px', lg: '56px' }}
              align="center"
              mb="36px"
            >
              <Box flex="1" minW={0} maxW={{ base: '100%', lg: '440px' }}>
                <SectionLabel index={5} label={t('landing_flows_eyebrow')} />
                <SectionHeading>{t('landing_flows_title')}</SectionHeading>
                <Text fontSize="md" color="fg.muted" lineHeight="1.7" mb="16px">
                  {t('landing_flows_body')}
                </Text>
                <Box as="ul" listStyleType="none" m={0} p={0}>
                  {[
                    t('landing_flows_point_1'),
                    t('landing_flows_point_2'),
                    t('landing_flows_point_3'),
                  ].map((point) => (
                    <Box
                      as="li"
                      key={point}
                      display="flex"
                      gap="10px"
                      mb="10px"
                      color="fg.muted"
                      fontSize="sm"
                      lineHeight="1.6"
                    >
                      <Box
                        as="span"
                        fontFamily="mono"
                        color="fg.subtle"
                        flexShrink={0}
                        aria-hidden
                      >
                        —
                      </Box>
                      {point}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box flex="1.15" minW={0} w="100%">
                <Shot src={shots.flows} alt={t('landing_flows_editor_alt')} />
              </Box>
            </Stack>

            <Motion
              src={shots.flowPlayer}
              poster={shots.flowPlayerPoster}
              alt={t('landing_flows_player_alt')}
            />
            <Text fontFamily="mono" fontSize="xs" color="fg.subtle" mt="12px">
              {t('landing_flows_player_caption')}
            </Text>
          </Box>
        </Box>

        {/* ── The contract, as the file it becomes ───────────────────────── */}
        <SpecSection
          index={6}
          eyebrow={t('landing_spec_eyebrow')}
          title={t('landing_spec_title')}
          body={t('landing_spec_body')}
          caption={t('landing_spec_caption')}
          code={OPENAPI_SAMPLE}
        />

        {/* ── AI development tools ───────────────────────────────────────── */}
        <Box as="section" px={{ base: '20px', md: '48px' }} py={{ base: '56px', md: '80px' }}>
          <Box maxW="1120px" mx="auto">
            <Stack
              direction={{ base: 'column', lg: 'row' }}
              gap={{ base: '28px', lg: '56px' }}
              align="center"
            >
              <Box flex="1" minW={0} maxW={{ base: '100%', lg: '440px' }}>
                <SectionLabel index={7} label={t('landing_ai_eyebrow')} />
                <SectionHeading>{t('landing_ai_title')}</SectionHeading>
                <Text fontSize="md" color="fg.muted" lineHeight="1.7" mb="16px">
                  {t('landing_ai_body')}
                </Text>
                <Box as="ul" listStyleType="none" m={0} p={0} mb="18px">
                  {[
                    t('landing_ai_point_1'),
                    t('landing_ai_point_2'),
                    t('landing_ai_point_3'),
                  ].map((point) => (
                    <Box
                      as="li"
                      key={point}
                      display="flex"
                      gap="10px"
                      mb="10px"
                      color="fg.muted"
                      fontSize="sm"
                      lineHeight="1.6"
                    >
                      <Box
                        as="span"
                        fontFamily="mono"
                        color="fg.subtle"
                        flexShrink={0}
                        aria-hidden
                      >
                        —
                      </Box>
                      {point}
                    </Box>
                  ))}
                </Box>
                <Link
                  asChild
                  color="brand.text"
                  fontWeight="600"
                  fontSize="sm"
                  display="inline-flex"
                  alignItems="center"
                  gap="6px"
                >
                  <RouterLink
                    to="/docs#mcp-cursor"
                    onClick={() => trackEvent('landing_docs', { placement: 'ai' })}
                  >
                    {t('landing_ai_docs_link')}
                    <ArrowRight size={15} aria-hidden />
                  </RouterLink>
                </Link>
              </Box>
              <Box flex="1.15" minW={0} w="100%">
                <Shot src={shots.changeSets} alt={t('landing_ai_shot_alt')} />
                <Box mt="18px">
                  <Heading
                    as="h3"
                    fontSize="lg"
                    fontWeight="700"
                    letterSpacing="-0.015em"
                    mb="8px"
                    color="fg.default"
                  >
                    {t('landing_ai_change_sets_title')}
                  </Heading>
                  <Text fontSize="sm" color="fg.muted" lineHeight="1.7">
                    {t('landing_ai_change_sets_body')}
                  </Text>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* ── The design the work is built against ───────────────────────── */}
        <DesignSection index={8} />

        {/* ── The built-in assistant ─────────────────────────────────────── */}
        <Box as="section" px={{ base: '20px', md: '48px' }} py={{ base: '48px', md: '72px' }}>
          <Stack
            direction={{ base: 'column', lg: 'row-reverse' }}
            gap={{ base: '28px', lg: '56px' }}
            align="center"
            maxW="1120px"
            mx="auto"
          >
            <Box flex="1" minW={0} maxW={{ base: '100%', lg: '440px' }}>
              <SectionLabel index={9} label={t('landing_assist_eyebrow')} />
              <SectionHeading>{t('landing_assist_title')}</SectionHeading>
              <Text fontSize="md" color="fg.muted" lineHeight="1.7" mb="16px">
                {t('landing_assist_body')}
              </Text>
              <Box as="ul" listStyleType="none" m={0} p={0} mb="18px">
                {[
                  t('landing_assist_point_1'),
                  t('landing_assist_point_2'),
                  t('landing_assist_point_3'),
                ].map((point) => (
                  <Box
                    as="li"
                    key={point}
                    display="flex"
                    gap="10px"
                    mb="10px"
                    color="fg.muted"
                    fontSize="sm"
                    lineHeight="1.6"
                  >
                    <Box as="span" fontFamily="mono" color="fg.subtle" flexShrink={0} aria-hidden>
                      —
                    </Box>
                    {point}
                  </Box>
                ))}
              </Box>
              <Text fontSize="sm" color="fg.subtle" lineHeight="1.6">
                {t('landing_assist_footnote')}
              </Text>
            </Box>

            {/*
              The artefact rather than a screenshot: this is what a review
              actually returns, set as text. Findings point at named elements —
              that is the whole claim, and a picture would only assert it.
            */}
            <Box flex="1.15" minW={0} w="100%">
              <Box
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="12px"
                bg="bg.canvas"
                p={{ base: '14px', md: '20px' }}
              >
                <Text fontFamily="mono" fontSize="xs" color="fg.subtle" mb="14px">
                  {t('landing_assist_sample_caption')}
                </Text>
                <Stack gap="12px">
                  {[
                    { severity: t('assist_severity_high'), palette: 'red', element: 'Order Service', message: t('landing_assist_sample_1') },
                    { severity: t('assist_severity_medium'), palette: 'orange', element: 'Notification Worker', message: t('landing_assist_sample_2') },
                    { severity: t('assist_severity_low'), palette: 'blue', element: 'Legacy Billing', message: t('landing_assist_sample_3') },
                  ].map((row) => (
                    <Box
                      key={row.element}
                      borderWidth="1px"
                      borderColor="border.default"
                      borderRadius="8px"
                      p="10px 12px"
                    >
                      <HStack gap="8px" mb="4px" flexWrap="wrap">
                        <Badge size="sm" colorPalette={row.palette} textTransform="uppercase" fontSize="10px">
                          {row.severity}
                        </Badge>
                        <Text fontSize="sm" fontWeight="600" color="fg.default">
                          {row.element}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="fg.muted" lineHeight="1.6">
                        {row.message}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* ── Where the data lives ───────────────────────────────────────── */}
        <Box
          as="section"
          px={{ base: '20px', md: '48px' }}
          py={{ base: '56px', md: '80px' }}
          borderTopWidth="1px"
          borderColor="border.default"
        >
          <Box maxW="1120px" mx="auto">
            <SectionLabel index={10} label={t('landing_trust_eyebrow')} />
            <SectionHeading>{t('landing_trust_title')}</SectionHeading>
            <Text fontSize="md" color="fg.muted" lineHeight="1.7" mb="28px" maxW="60ch">
              {t('landing_trust_body')}
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} gap={{ base: '20px', md: '32px' }}>
              {[
                { icon: ShieldCheck, title: t('landing_trust_1_title'), body: t('landing_trust_1_body') },
                { icon: Download, title: t('landing_trust_2_title'), body: t('landing_trust_2_body') },
                { icon: KeyRound, title: t('landing_trust_3_title'), body: t('landing_trust_3_body') },
              ].map(({ icon: Icon, title, body }) => (
                <Box key={title} flex="1" minW={0}>
                  <Box color="fg.brand.emphasis" mb="10px" aria-hidden>
                    <Icon size={18} />
                  </Box>
                  <Heading as="h3" fontSize="md" fontWeight="700" mb="6px" color="fg.default">
                    {title}
                  </Heading>
                  <Text fontSize="sm" color="fg.muted" lineHeight="1.7">
                    {body}
                  </Text>
                </Box>
              ))}
            </Stack>
            <Box mt="24px" display="flex" gap="18px" flexWrap="wrap" fontSize="sm">
              <Link asChild color="brand.text" fontWeight="600">
                <RouterLink to="/privacy">{t('landing_trust_privacy_link')}</RouterLink>
              </Link>
              {DEMO_SHARE_URL ? (
                /* A model a stranger can open, which beats any screenshot on
                   this page. Absent until someone puts a link in the file. */
                <Link
                  href={DEMO_SHARE_URL}
                  color="brand.text"
                  fontWeight="600"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('landing_demo_model')}
                >
                  {t('landing_demo_link')}
                </Link>
              ) : null}
            </Box>
          </Box>
        </Box>

        {/* ── Questions ──────────────────────────────────────────────────── */}
        <Box
          as="section"
          px={{ base: '20px', md: '48px' }}
          py={{ base: '56px', md: '80px' }}
          borderTopWidth="1px"
          borderColor="border.default"
          bg="bg.muted"
        >
          <Box maxW="1120px" mx="auto">
            <SectionLabel index={11} label={t('landing_faq_eyebrow')} />
            <SectionHeading>{t('landing_faq_title')}</SectionHeading>
            <Stack
              mt="28px"
              direction={{ base: 'column', lg: 'row' }}
              gap={{ base: '0', lg: '48px' }}
              align="start"
            >
              {[FAQ.slice(0, Math.ceil(FAQ.length / 2)), FAQ.slice(Math.ceil(FAQ.length / 2))].map(
                (column, i) => (
                  <Box key={i} flex="1" minW={0}>
                    {column.map((entry) => (
                      <Box key={entry.question} mb="24px">
                        <Heading
                          as="h3"
                          fontSize="md"
                          fontWeight="700"
                          mb="8px"
                          color="fg.default"
                        >
                          {entry.question}
                        </Heading>
                        <Text fontSize="sm" color="fg.muted" lineHeight="1.75">
                          {entry.answer}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )
              )}
            </Stack>
          </Box>
        </Box>

        {/* ── Closing CTA ────────────────────────────────────────────────── */}
        <Box
          as="section"
          px={{ base: '20px', md: '48px' }}
          py={{ base: '56px', md: '80px' }}
          borderTopWidth="1px"
          borderColor="border.default"
        >
          <Box maxW="1120px" mx="auto">
            <SectionLabel index={12} label={t('landing_cta_eyebrow')} />
            <SectionHeading>{t('landing_cta_title')}</SectionHeading>
            <Text fontSize="md" color="fg.muted" lineHeight="1.7" mb="28px" maxW="56ch">
              {t('landing_cta_body')}
            </Text>
            <HStack gap="12px" flexWrap="wrap">
              <Button
                asChild
                size="lg"
                h="48px"
                px="24px"
                fontWeight="700"
                fontSize="md"
                bg="bg.brand.emphasis"
                color="fg.on.brand"
                borderWidth="0"
                borderRadius="10px"
                _hover={{ bg: 'bg.brand.emphasis.hover' }}
                cursor="pointer"
              >
                <RouterLink
                  to="/editor"
                  onMouseEnter={prefetchWorkspace}
                  onFocus={prefetchWorkspace}
                  onClick={() => {
                    trackEvent('landing_try_local', { placement: 'footer' });
                    trackProductEvent('landing.try_local');
                  }}
                >
                  {t('landing_cta_local')}
                  <ArrowRight size={18} aria-hidden style={{ marginLeft: 8 }} />
                </RouterLink>
              </Button>
              <Button
                asChild
                size="lg"
                h="48px"
                px="24px"
                fontWeight="600"
                fontSize="md"
                variant="outline"
                borderColor="border.glass"
                color="fg.default"
                borderRadius="10px"
                _hover={{ bg: 'bg.muted' }}
                cursor="pointer"
              >
                <RouterLink
                  to={loginPagePath()}
                  state={FROM_LANDING}
                  onClick={() => {
                    trackEvent('landing_signin', { placement: 'footer' });
                    trackProductEvent('landing.signin');
                  }}
                >
                  {t('landing_cta_primary')}
                </RouterLink>
              </Button>
            </HStack>
          </Box>
        </Box>
      </Box>

      <AppFooter />
    </Box>
  );
}
