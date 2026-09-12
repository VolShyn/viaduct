/**
 * The questions people ask before signing up, answered on the page rather than
 * by email.
 *
 * Also published as FAQPage structured data (see SeoRouteMeta), which is why
 * this is plain data and not JSX: the same words go to the reader and to the
 * search engine, and cannot drift apart.
 *
 * Every answer here must stay true of the deployment. If the price changes, if
 * hosting moves, if the local editor starts talking to a server, this file
 * changes first.
 */
export type FaqEntry = { question: string; answer: string };

export const FAQ: FaqEntry[] = [
  {
    question: 'What does it cost?',
    answer:
      'Nothing. Viaduct is free — every level, the MCP server, collaboration and change sets included. There is no trial that ends and no feature held back behind a plan. If you want the work to continue you can donate, and that buys nothing but the work continuing.',
  },
  {
    question: 'What is the AI assistant, and what does it cost me?',
    answer:
      'It writes the parts of a model people leave blank: descriptions for elements that have none, names for unnamed flow steps, and a review of the whole model that points at real elements rather than giving generic advice. It runs on our provider, so there is no key to obtain and nothing to configure, and every account gets a monthly allowance of it. Nothing it suggests is applied on its own — you see the text and press a button, or you do not.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'Not to draw. The editor opens with a sample model and works entirely in your browser, where the model stays on your machine and never reaches our servers. An account is for the things a browser cannot do alone: keeping a project across devices, sharing it with your team, and serving it over MCP.',
  },
  {
    question: 'Where does my architecture live?',
    answer:
      'On servers inside the EU, along with the backups. Without an account it lives in your browser and nowhere else. Either way you can export the whole model as JSON, and any container’s contracts as an OpenAPI document, whenever you like.',
  },
  {
    question: 'What can an AI agent do with it?',
    answer:
      'Read the model and write to it: Cursor, Claude Code, Claude Desktop or any other MCP client can ask what talks to what and over which contract, and can add services, endpoints, connections and documentation back. Access needs a personal token you issue yourself, scoped to your projects, and revoking it ends the access immediately.',
  },
  {
    question: 'How is this different from a diagramming tool?',
    answer:
      'A diagram is a picture; this is a model. An element exists once and appears on every level it belongs to, so a rename or a new dependency shows up everywhere at once. The endpoints on a container are a real OpenAPI document, not labels on a box — which is what makes the whole thing readable by something other than a person.',
  },
  {
    question: 'Can I bring what I already have?',
    answer:
      'Import an OpenAPI specification and the endpoints land on the container with their parameters, request bodies and responses. Models export and import as JSON, so moving a workspace — or keeping a copy outside this service — is a file.',
  },
];
