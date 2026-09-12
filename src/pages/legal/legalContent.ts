/**
 * Terms of Service and Privacy Policy — a template, not legal advice.
 *
 * Everything factual here was written from the code: which providers sign
 * people in, what the server stores, what the browser keeps, what leaves the
 * machine. That part is worth keeping accurate as the product changes. The
 * legal frame around it — the warranty and liability sections in particular —
 * is boilerplate that a lawyer in your jurisdiction should review before
 * anyone relies on it.
 *
 * The company details, retention periods, hosting and payment routes below
 * were given by the operator on 2 September 2026 and match what the deployment
 * actually does. When any of them changes — a new host, a new mail route, a
 * paid plan — this file changes with it, and so does the date.
 */

export const COMPANY_NAME = 'Quiet Grid Labs';
export const COMPANY_LEGAL_NAME = 'Quiet Grid Labs co.';
export const COMPANY_ADDRESS = 'Žemaitės gatvė 5c, Vilnius, Lithuania';
export const GOVERNING_LAW = 'the Republic of Lithuania';
export const CONTACT_EMAIL = 'support@quietgridlabs.com';

/** Bump when the text changes; the page shows it and people rely on it. */
export const LEGAL_UPDATED = '2 September 2026';

export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

const p = (text: string): LegalBlock => ({ kind: 'p', text });
const ul = (items: string[]): LegalBlock => ({ kind: 'ul', items });

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    heading: '1. The agreement',
    blocks: [
      p(
        `These terms are between you and ${COMPANY_LEGAL_NAME} ("${COMPANY_NAME}", "we", "us"), registered at ${COMPANY_ADDRESS}, and they cover your use of Viaduct — the web application at c4.quietgridlabs.com, the hosted MCP server at mcp.quietgridlabs.com, and everything we publish alongside them.`
      ),
      p(
        'By creating an account, signing in, or using the local editor you accept these terms. If you are accepting them for a company, you confirm you may bind that company.'
      ),
    ],
  },
  {
    id: 'service',
    heading: '2. What the service does',
    blocks: [
      p(
        'Viaduct is a modelling tool for software architecture: C4 diagrams, documentation and sequence diagrams attached to elements, API contracts, and an MCP server that lets AI development tools read and write that model on your behalf.'
      ),
      p(
        'You can also use the editor without an account. In that mode the model stays in your browser and is never sent to our servers; clearing your browser data deletes it, and we cannot recover it.'
      ),
    ],
  },
  {
    id: 'accounts',
    heading: '3. Accounts',
    blocks: [
      p(
        'An account is created through Google, GitHub, or the GitLab we run at git.quietgridlabs.com. Each of those is a separate account here even when the email address on them is the same — signing in with a different provider puts you in a different workspace, not the same one, and there is no way to merge them.'
      ),
      p(
        'You are responsible for what happens under your account and for any personal access token you issue for the MCP server. Tell us at once if you believe a token or an account has been compromised; you can revoke tokens yourself at any time.'
      ),
      p('You must be old enough to enter into a contract where you live.'),
    ],
  },
  {
    id: 'your-content',
    heading: '4. Your content',
    blocks: [
      p(
        'Your models, documentation, diagrams and files remain yours. We claim no ownership of them.'
      ),
      p(
        'You grant us the limited licence needed to run the service: to store your content, to display it back to you and to the people you share it with, to back it up, and to process it when an AI tool you have connected asks for it through the MCP server.'
      ),
      p(
        'You are responsible for having the right to upload what you upload, and for anything you choose to share by link. A share link works until you revoke it, so treat it as you would the content behind it.'
      ),
    ],
  },
  {
    id: 'acceptable-use',
    heading: '5. Acceptable use',
    blocks: [
      p('Do not use Viaduct to:'),
      ul([
        'break the law, or infringe anyone’s rights;',
        'store or distribute malware, or content you have no right to;',
        'attack, probe or overload the service, or work around its limits and access controls;',
        'resell or rebrand the hosted service as your own;',
        'automate use in a way that degrades the service for other people.',
      ]),
      p(
        'We may suspend an account that does any of these, and will say why where we lawfully can.'
      ),
    ],
  },
  {
    id: 'availability',
    heading: '6. Availability and changes',
    blocks: [
      p(
        'We work to keep the service up but do not promise uninterrupted availability, and there is no service level agreement unless we have signed one with you separately. Maintenance, incidents and third-party outages happen.'
      ),
      p(
        'We may add, change or withdraw features. If we withdraw something you depend on we will give reasonable notice and, where we can, a way to take your work with you — the model exports as JSON and the contracts as OpenAPI at any time.'
      ),
    ],
  },
  {
    id: 'fees',
    heading: '7. Fees',
    blocks: [
      p(
        'Viaduct is free to use. There is no paid plan, no trial that ends, and no feature held back behind one.'
      ),
      p(
        'You may donate if you want the work to continue — through Stripe from the EU or the US, or through CloudTips from Russia. Both are external services: you leave this site to pay, and we never see your card. A donation buys nothing — no support commitment, no feature, no priority — and it is not refundable through us.'
      ),
      p(
        'If that ever changes and part of the service becomes paid, we will say so in the application before it applies, and nothing you already have will be locked behind the change without notice.'
      ),
    ],
  },
  {
    id: 'termination',
    heading: '8. Ending the agreement',
    blocks: [
      p(
        `You may stop using Viaduct at any time, and ask us to delete your account by writing to ${CONTACT_EMAIL}.`
      ),
      p(
        'We may terminate or suspend an account for a material breach of these terms, or if we stop offering the service. On termination we delete your content according to the retention periods in the Privacy Policy — export anything you want to keep first.'
      ),
    ],
  },
  {
    id: 'warranties',
    heading: '9. Warranties',
    blocks: [
      p(
        'The service is provided "as is" and "as available". To the extent the law allows, we disclaim implied warranties of merchantability, fitness for a particular purpose and non-infringement.'
      ),
      p(
        'Where you deal with us as a consumer, nothing in this section affects your statutory rights.'
      ),
    ],
  },
  {
    id: 'liability',
    heading: '10. Liability',
    blocks: [
      p(
        'To the extent the law allows, we are not liable for indirect or consequential loss, loss of profit, or loss of data beyond our obligation to keep the backups described in the Privacy Policy.'
      ),
      p(
        'Where we are liable, our total liability for all claims arising in any twelve-month period is capped at €100. The service is free, so there is no fee to measure it against; the cap is a fixed sum instead.'
      ),
      p(
        'Nothing here limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.'
      ),
    ],
  },
  {
    id: 'changes',
    heading: '11. Changes to these terms',
    blocks: [
      p(
        'We may update these terms; the date at the top of this page always says when. If a change materially reduces your rights we will give notice in the application or by email before it takes effect, and using the service after that date means you accept the new terms.'
      ),
    ],
  },
  {
    id: 'law',
    heading: '12. Governing law',
    blocks: [
      p(
        `These terms are governed by the law of ${GOVERNING_LAW}, and the courts of Vilnius have exclusive jurisdiction — without affecting any mandatory protection you have as a consumer where you live.`
      ),
    ],
  },
  {
    id: 'contact-terms',
    heading: '13. Contact',
    blocks: [
      p(
        `Questions about these terms: ${CONTACT_EMAIL}, or by post to ${COMPANY_LEGAL_NAME}, ${COMPANY_ADDRESS}.`
      ),
    ],
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'controller',
    heading: '1. Who is responsible',
    blocks: [
      p(
        `${COMPANY_LEGAL_NAME} ("${COMPANY_NAME}"), ${COMPANY_ADDRESS}, is the controller of the personal data described here. Write to ${CONTACT_EMAIL} about anything on this page.`
      ),
      p(
        'We are established in Lithuania, so this policy is written to the GDPR. We are not required to appoint a data protection officer and have not appointed one — write to the address above and it reaches the person responsible.'
      ),
    ],
  },
  {
    id: 'what-we-collect',
    heading: '2. What we collect',
    blocks: [
      p('Account data, from whichever provider you sign in with:'),
      ul([
        'the provider’s own account identifier, which is the only thing we use to recognise you — never your email address;',
        'your username or handle, display name, email address and avatar URL, as that provider reports them;',
        'for GitLab sign-in, an access token, so the application can read the groups that decide what you may open. That GitLab is our own instance at git.quietgridlabs.com, not a third party’s.',
      ]),
      p(
        'Content you create: models, elements, connections, documentation, sequence diagrams, contracts, comments, project and version names, and the files you attach.'
      ),
      p(
        'Technical data: a session cookie, the time of your last sign-in, ordinary server logs — IP address, user agent, request path and time — kept for security and debugging, and, when you are not signed in, a random anonymous browser identifier used only for product metrics as described below.'
      ),
      p(
        'Messages you send: what you write in the support and access-request forms, and the address we reply to.'
      ),
      p(
        'Nothing is collected from the local editor. If you use Viaduct without an account, the model lives in your browser’s storage and never reaches us.'
      ),
    ],
  },
  {
    id: 'why',
    heading: '3. Why we use it, and on what basis',
    blocks: [
      ul([
        'To run the service and keep your work where you left it — performance of our contract with you.',
        'To keep accounts secure, prevent abuse and diagnose faults — our legitimate interest in a service that works.',
        'To answer support and access requests — performance of a contract, or legitimate interest.',
        'To understand which features are used, in aggregate — legitimate interest, through the privacy-preserving analytics described below.',
        'To send service messages about outages, security or material changes — legitimate interest. Marketing email, if we ever send any, will be on consent you can withdraw.',
      ]),
      p('We do not sell personal data, and we do not profile anyone for advertising.'),
    ],
  },
  {
    id: 'ai',
    heading: '4. AI tools and the MCP server',
    blocks: [
      p(
        'The MCP server exists so that an AI development tool you have connected — Cursor, Claude Code, or another client — can read and write your model. That happens only when you issue a personal access token and configure the client with it, and only for the projects that token can reach.'
      ),
      p(
        'What the client then does with the data is governed by that tool’s own terms, not ours. Revoking the token in your account settings ends the access immediately.'
      ),
      p('We do not use your models to train machine learning models.'),
    ],
  },
  {
    id: 'analytics',
    heading: '5. Cookies and analytics',
    blocks: [
      p(
        'One essential cookie holds your signed-in session. Without it you cannot stay signed in, so it is set when you sign in and cleared when you sign out.'
      ),
      p(
        'Your browser also keeps preferences locally — colour theme, the provider you signed in with last, and the local model if you work without an account. These never leave your device, and they are not cookies.'
      ),
      p(
        'Usage is measured with Umami Cloud, a cookieless analytics service that records page views and feature events without cross-site identifiers or fingerprinting, and with our own product metrics at metrics.quietgridlabs.com, which record which action happened — never the contents of your model.'
      ),
      p(
        'When you are signed in, product metrics are tied to your account. When you are not — for example visiting the site or starting in the browser without an account — your browser keeps a random anonymous identifier in local storage so we can tell one visitor from another. It is not your name, email or account, it is not used for advertising, and a signed-in session always replaces it for those events. Clearing site data for this origin removes it.'
      ),
    ],
  },
  {
    id: 'sharing',
    heading: '6. Who else sees it',
    blocks: [
      p(
        'People you share with: anyone you invite to a project, and anyone holding a share link you have created, sees the content of that project.'
      ),
      p(
        'Share links: a link you create gives whoever holds it access to that project until you revoke it. Revoking is immediate and is done from the project’s share panel.'
      ),
      p('Service providers who process data on our instructions:'),
      ul([
        'Timeweb (Netherlands, EU) — the servers this application runs on, its database and its backups;',
        'Timeweb (Netherlands, EU) — outgoing mail, meaning support replies and access-request notifications;',
        'Umami Software, Inc. (United States) — the Umami Cloud analytics described above.',
      ]),
      p(
        'There is no CDN or proxy in front of the application, and the product metrics run on our own servers.'
      ),
      p(
        'Two things you initiate leave for someone else, and neither is us passing your data on. Signing in sends you to Google, GitHub or our GitLab and brings back the account details named above; Google and GitHub decide for themselves what they do with that visit, under their own policies. Donating sends you to Stripe or CloudTips, who take the payment on their own account — we never receive your card details, only the fact that a donation arrived.'
      ),
      p(
        'One of those is contacted by your browser directly rather than through us, and so sees the IP address any request carries: the Umami script. Everything else — the typefaces, the images, every other script — is served from this origin, so nothing further about your visit reaches anyone.'
      ),
      p(
        'Our hosting and mail sit in the Netherlands, inside the EU, so your account and your model never leave the EEA. The analytics is the exception: Umami Cloud is operated from the United States, so the page views and events it receives are processed outside the EEA under that provider’s data processing terms. It is the only part of this that crosses the border, and it carries no account of yours and nothing from your model.'
      ),
      p(
        'We disclose data to authorities only where the law requires it, and will tell you unless we are forbidden from doing so.'
      ),
    ],
  },
  {
    id: 'retention',
    heading: '7. How long we keep it',
    blocks: [
      ul([
        'Account and content: for as long as your account exists, and removed from the live database within 30 days of your asking us to delete it.',
        'Backups: taken daily and kept for six months, so a deleted account survives in backups for up to six months before the last copy rolls off. Backups are only ever used to restore the service after a failure.',
        'Server logs: one month.',
        'Support correspondence: kept indefinitely, so that a conversation years apart still has its history. Ask us and we will delete your side of it.',
      ]),
      p(
        'Deleting an account is done by writing to us rather than by a button in the application — there is no self-service delete yet. We do it by hand, and confirm when it is done.'
      ),
    ],
  },
  {
    id: 'security',
    heading: '8. Security',
    blocks: [
      p(
        'Traffic runs over TLS. Session cookies are signed, HTTP-only and same-site. Personal access tokens are stored as hashes, so a copy of the database does not yield a working token. Access to production is limited to the people who need it.'
      ),
      p(
        'No service is immune. If a breach affects your data we will notify you and the relevant authority within the time the law allows.'
      ),
    ],
  },
  {
    id: 'rights',
    heading: '9. Your rights',
    blocks: [
      p(
        'Depending on where you live, you may ask us for a copy of your data, to correct it, to delete it, to restrict or object to how we use it, or to send it to another provider. You may also complain to your local data protection authority.'
      ),
      p(
        `Write to ${CONTACT_EMAIL} and we will answer within one month. Your model can be exported as JSON from the editor at any time without asking us.`
      ),
    ],
  },
  {
    id: 'children',
    heading: '10. Children',
    blocks: [
      p(
        'Viaduct is a tool for software teams and is not directed at children. We do not knowingly collect data from anyone under 16; write to us if you believe we have, and we will delete it.'
      ),
    ],
  },
  {
    id: 'changes-privacy',
    heading: '11. Changes to this policy',
    blocks: [
      p(
        'We update this page when what we do changes, and the date at the top says when. Material changes are announced in the application before they take effect.'
      ),
    ],
  },
];
