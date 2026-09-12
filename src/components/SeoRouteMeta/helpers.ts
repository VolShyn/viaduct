import { FAQ } from '@/content/faq';
import { SITE_NAME, SITE_URL } from '@/seo';

/** `/docs/` and `/docs` are the same page — index them as one. */
export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.replace(/\/+$/, '');
  return pathname || '/';
}

/** Trail from the home page to here, so results can show a path. */
export function breadcrumbs(label: string, publicUrl: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: label, item: publicUrl },
    ],
  };
}

export function buildRouteJsonLd(pathname: string, title: string, description: string) {
  const publicUrl = `${SITE_URL}${pathname}`;

  const page =
    pathname === '/docs'
      ? {
          /* The documentation is a long-form technical article, not a
             landing page — say so, and Google can treat it as one. */
          '@type': 'TechArticle',
          headline: 'Architecture documentation that stays attached to the model',
          name: title,
          description,
          url: publicUrl,
          inLanguage: 'en',
          isPartOf: { '@id': `${SITE_URL}/#website` },
          about: [
            'C4 model',
            'software architecture documentation',
            'Model Context Protocol',
            'MCP server',
            'AI development tools',
            'AI coding agents',
          ],
          author: { '@id': `${SITE_URL}/#organization` },
          publisher: { '@id': `${SITE_URL}/#organization` },
          mainEntityOfPage: publicUrl,
        }
      : {
          '@type': 'WebPage',
          name: title,
          description,
          url: publicUrl,
          inLanguage: 'en',
          isPartOf: { '@id': `${SITE_URL}/#website` },
          ...(pathname === '/' ? { about: { '@id': `${SITE_URL}/#app` } } : {}),
        };

  /* The landing page answers six questions in prose; this is the same six,
     in the shape a search engine reads. One source (content/faq.ts), so
     the page and the markup cannot drift apart. */
  const faq =
    pathname === '/'
      ? [
          {
            '@type': 'FAQPage',
            mainEntity: FAQ.map((entry) => ({
              '@type': 'Question',
              name: entry.question,
              acceptedAnswer: { '@type': 'Answer', text: entry.answer },
            })),
          },
        ]
      : [];

  return {
    '@context': 'https://schema.org',
    '@graph':
      pathname === '/'
        ? [page, ...faq]
        : [page, breadcrumbs(title.split(' — ')[0], publicUrl)],
  };
}
