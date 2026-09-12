import { SITE_DEFAULT_DESCRIPTION, SITE_NAME } from '@/seo';

export const ROUTE_META: Record<string, { title: string; description: string; robots?: string }> = {
  '/': {
    title: `${SITE_NAME} — C4 Modeling Tool with an MCP Server for AI Coding Agents`,
    description: SITE_DEFAULT_DESCRIPTION,
  },
  '/editor': {
    title: `${SITE_NAME} — C4 Model Editor`,
    description: SITE_DEFAULT_DESCRIPTION,
    robots: 'noindex, nofollow, noarchive',
  },
  '/docs': {
    title: `Documentation — ${SITE_NAME} | C4 Model & MCP for AI Tools`,
    description:
      'How to use Viaduct: C4 model levels, documentation and sequence diagrams on elements, ER schemas, Magic flows, the MCP server for Cursor and Claude Code, and change sets an AI coding agent implements against a pinned version.',
  },
  '/catalog': {
    title: `Service Catalog — ${SITE_NAME}`,
    description:
      'Browse every container in the C4 model by system and kind, inspect a service, then jump to it on the diagram.',
    robots: 'noindex, nofollow, noarchive',
  },
  '/flows': {
    title: `Magic Flows — ${SITE_NAME}`,
    description:
      'Design and browse Magic Flows as ordered steps between services, then play them back on the C4 diagram.',
    robots: 'noindex, nofollow, noarchive',
  },
  '/integrations': {
    title: `Integrations — ${SITE_NAME} | MCP, REST API, Webhooks`,
    description:
      'How Viaduct connects to the rest of your tooling: an MCP server for Cursor and Claude, a REST API with an OpenAPI document, signed webhooks, OpenAPI and Protobuf contracts, PlantUML sequences, and JSON, PNG and SVG export.',
  },
  '/terms': {
    title: `Terms of Service — ${SITE_NAME}`,
    description:
      'The terms covering use of Viaduct: accounts, your content, acceptable use, availability, and how the agreement ends.',
  },
  '/privacy': {
    title: `Privacy Policy — ${SITE_NAME}`,
    description:
      'What Viaduct collects and why: account data from your sign-in provider, the model you create, analytics including an anonymous browser id for signed-out product metrics, and the rights you can exercise over any of it.',
  },
  '/login': {
    title: `Sign in to ${SITE_NAME} — C4 Modeling Tool`,
    description:
      'Sign in to Viaduct with your GitLab organization account, or use the local editor without an account.',
  },
};
