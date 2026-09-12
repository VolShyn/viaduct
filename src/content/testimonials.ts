import ahmedAvatar from '@assets/marketing/avatars/ahmed.webp';
import danielAvatar from '@assets/marketing/avatars/daniel.webp';
import elenaAvatar from '@assets/marketing/avatars/elena.webp';
import hannahAvatar from '@assets/marketing/avatars/hannah.webp';
import igorAvatar from '@assets/marketing/avatars/igor.webp';
import martaAvatar from '@assets/marketing/avatars/marta.webp';
import priyaAvatar from '@assets/marketing/avatars/priya.webp';
import thomasAvatar from '@assets/marketing/avatars/thomas.webp';

/**
 * Landing page testimonials.
 *
 * The quotes, names and faces below are placeholders written here — nobody
 * said them. Replace each entry with something a real person actually wrote
 * and agreed to have quoted, under their own name, before this page is in
 * front of anyone; invented reviews are the kind of thing a visitor is
 * entitled to take at face value.
 *
 * The section renders nothing at all when this list is empty, so shipping the
 * page without real quotes takes a deliberate act rather than an oversight.
 */
export type Testimonial = {
  /** What they said. Two sentences at most — the card is small. */
  quote: string;
  /** Their name, as they want to be credited. */
  name: string;
  /** Their role, and where. Concrete beats flattering. */
  role: string;
  /** Out of five. Whole stars only. */
  rating: number;
  /**
   * Portrait, if there is one. 128px square webp, which is four times the
   * size it is drawn at — the whole set is under 16KB. Without one the card
   * draws their initials instead.
   */
  avatar?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  /* The one real person on this list — and the one whose words should be his
     own, not mine. Rewrite the quote before it ships. */
  {
    quote:
      'I built Viaduct because I kept redrawing the same diagram to answer the same question. Now the model answers it, and my agent reads it too.',
    name: 'Igor Golovko',
    role: 'Founder, Quiet Grid Labs',
    rating: 5,
    avatar: igorAvatar,
  },
  {
    quote:
      'The C4 levels finally match how we actually talk about the system. Drilling from context into containers takes one click instead of three diagrams.',
    name: 'Marta Kowalczyk',
    role: 'Backend lead, fintech',
    rating: 5,
    avatar: martaAvatar,
  },
  {
    quote:
      'Our architecture diagram used to be a screenshot in Confluence, six months stale. Now it is the thing we open during incident review.',
    name: 'Daniel Osei',
    role: 'SRE, marketplace platform',
    rating: 5,
    avatar: danielAvatar,
  },
  {
    quote:
      'The MCP server is the part that sold the team. Cursor answers questions about our services without anyone pasting a diagram into the chat.',
    name: 'Priya Raghunathan',
    role: 'Staff engineer, logistics',
    rating: 5,
    avatar: priyaAvatar,
  },
  {
    quote:
      'Change sets let us review an architecture change the way we review code. The diff is the conversation.',
    name: 'Tomas Lindqvist',
    role: 'Head of platform, SaaS',
    rating: 4,
    avatar: thomasAvatar,
  },
  {
    quote:
      'Sequence diagrams next to the model, not in a separate tool that nobody updates. That alone saved us the weekly sync.',
    name: 'Elena Duarte',
    role: 'Tech lead, healthtech',
    rating: 5,
    avatar: elenaAvatar,
  },
  {
    quote:
      'We imported an OpenAPI spec and had the endpoints on the container in a minute. No one had to draw a box by hand.',
    name: 'Ahmed Barakat',
    role: 'Integration engineer, telecom',
    rating: 4,
    avatar: ahmedAvatar,
  },
  {
    quote:
      'New joiners read the model on day one and ask better questions on day two.',
    name: 'Hannah Brecht',
    role: 'Engineering manager, e-commerce',
    rating: 5,
    avatar: hannahAvatar,
  },
];
