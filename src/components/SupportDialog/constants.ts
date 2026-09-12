import type { SupportTopic } from '@shared/api';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const TOPICS: { value: SupportTopic; labelKey: string }[] = [
  { value: 'question', labelKey: 'support_topic_question' },
  { value: 'bug', labelKey: 'support_topic_bug' },
  { value: 'idea', labelKey: 'support_topic_idea' },
  { value: 'other', labelKey: 'support_topic_other' },
];

export const EMPTY_SUPPORT_FORM = {
  name: '',
  email: '',
  topic: 'question' as SupportTopic,
  message: '',
};
