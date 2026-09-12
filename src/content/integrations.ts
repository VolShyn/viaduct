/**
 * What Viaduct connects to, as one list.
 *
 * Two rules for this file.
 *
 * Every entry is something a reader can go and use today: a page of
 * integrations is a promise, and the fastest way to lose an evaluator is a
 * card that turns out to be an intention.
 *
 * And an integration is something the model travels to or from. Signing in
 * with Google, GitHub or GitLab is not one — that is how you get through the
 * door, not something Viaduct connects to, and listing it pads the page with
 * logos that answer a question nobody asked here.
 */
export type IntegrationCategory =
  | 'AI'
  | 'Developer'
  | 'Events'
  | 'Contracts'
  | 'Design'
  | 'Export'
  | 'Share';

export type Integration = {
  /** Stable, and used as the React key. */
  id: string;
  name: string;
  category: IntegrationCategory;
  /** One line. What it does for the reader, not what it is. */
  summary: string;
  /** Where to read more — a docs anchor, or the reference. */
  href: string;
  /** svgl brand mark, when the thing has one; otherwise a lucide icon name. */
  mark?: 'cursor' | 'claude' | 'anthropic' | 'vscode' | 'swagger' | 'json' | 'figma';
  icon?: 'plug' | 'code' | 'webhook' | 'file' | 'image' | 'share' | 'bot' | 'boxes';
};

/** The four that answer "can I get my architecture out of here". */
export const TOP_INTEGRATIONS: Integration[] = [
  {
    id: 'mcp',
    name: 'MCP server',
    category: 'AI',
    summary: 'Cursor, Claude Code and any MCP client read the model and write back to it.',
    href: '/docs#mcp-cursor',
    icon: 'bot',
  },
  {
    id: 'rest-api',
    name: 'API/SDK',
    category: 'Developer',
    summary: 'Everything the editor does, under /api/v1 — with an OpenAPI document to generate a client from.',
    href: '/docs#rest-api',
    icon: 'code',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    category: 'Events',
    summary: 'Signed events when elements, connections or a change set move.',
    href: '/docs#webhooks',
    icon: 'webhook',
  },
  {
    id: 'openapi',
    name: 'OpenAPI',
    category: 'Contracts',
    summary: 'Import a spec onto a container, or export its contracts back out.',
    href: '/docs#er-api',
    mark: 'swagger',
  },
];

export const ALL_INTEGRATIONS: Integration[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'AI',
    summary: 'Ask about the architecture, and let it write back.',
    href: '/docs#mcp-cursor',
    mark: 'cursor',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    category: 'AI',
    summary: 'The model in the terminal, change sets included.',
    href: '/docs#mcp-cursor',
    mark: 'claude',
  },
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    category: 'AI',
    summary: 'The same server, for questions rather than code.',
    href: '/docs#mcp-cursor',
    mark: 'anthropic',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'AI',
    summary: 'Any editor that speaks MCP. The config is three lines.',
    href: '/docs#mcp-cursor',
    mark: 'vscode',
  },
  {
    id: 'change-sets',
    name: 'Change sets',
    category: 'AI',
    summary: 'Work pinned to a version, with criteria the agent must prove.',
    href: '/docs#change-sets',
    icon: 'boxes',
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Design',
    summary: 'Components point at real frames; colours and spacing come in by name.',
    href: '/#figma',
    mark: 'figma',
  },
  {
    id: 'protobuf',
    name: 'Protobuf & gRPC',
    category: 'Contracts',
    summary: '.proto sources on the endpoints that speak them.',
    href: '/docs#er-api',
    icon: 'file',
  },
  {
    id: 'plantuml',
    name: 'PlantUML',
    category: 'Export',
    summary: 'Sequence diagrams are PlantUML source. Take it with you.',
    href: '/docs#sequences',
    icon: 'file',
  },
  {
    id: 'json',
    name: 'JSON',
    category: 'Export',
    summary: 'The whole model, in and out as one file.',
    href: '/docs#collaboration-export',
    mark: 'json',
  },
  {
    id: 'images',
    name: 'PNG & SVG',
    category: 'Export',
    summary: 'Render a diagram or a sequence for a slide or a README.',
    href: '/docs#collaboration-export',
    icon: 'image',
  },
  {
    id: 'share-links',
    name: 'Share links',
    category: 'Share',
    summary: 'Read or edit without an account, until you revoke it.',
    href: '/docs#collaboration-export',
    icon: 'share',
  },
];
