import { GitHubDark, GitHubLight } from '@ridemountainpig/svgl-react';
import { useColorMode } from '@contexts/ColorModeContext';

/**
 * GitHub's Octocat, from svgl, picking its variant the way the technology
 * icons do: the suffix names the ground the mark is drawn for, so `Dark` is
 * the one with light ink. The button is an outline over the app's own
 * background, so it needs both.
 */
export default function GithubMark({ size = 18 }: { size?: number }) {
  const { mode } = useColorMode();
  const Mark = mode === 'dark' ? GitHubDark : GitHubLight;
  return <Mark width={size} height={size} aria-hidden focusable="false" />;
}
