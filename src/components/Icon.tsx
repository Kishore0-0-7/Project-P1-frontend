import type { ReactElement, SVGProps } from 'react';

export type IconName =
  | 'activity' | 'alert' | 'archive' | 'arrow-up-right' | 'asset' | 'bell' | 'bolt'
  | 'book' | 'box' | 'briefcase' | 'calendar' | 'check' | 'chevron-down' | 'chevron-right'
  | 'clock' | 'close' | 'command' | 'copy' | 'download' | 'filter' | 'grid' | 'help'
  | 'inbox' | 'layers' | 'link' | 'lock' | 'log-out' | 'more' | 'pause' | 'play' | 'plus' | 'refresh'
  | 'report' | 'search' | 'settings' | 'shield' | 'sliders' | 'sparkle' | 'target' | 'terminal'
  | 'trend-down' | 'trend-up' | 'upload' | 'user' | 'users' | 'workflow' | 'zap';

interface IconProps extends SVGProps<SVGSVGElement> { name: IconName; size?: number }

const paths: Record<IconName, ReactElement> = {
  activity: <><path d="M3 12h3l3-8 4 16 3-8h4" /></>,
  alert: <><path d="M10.3 3.5 2.7 17a2 2 0 0 0 1.75 3h15.1A2 2 0 0 0 21.3 17L13.7 3.5a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></>,
  archive: <><path d="M4 5h16v15H4z" /><path d="M3 5V2h18v3M9 10h6" /></>,
  'arrow-up-right': <><path d="M7 17 17 7M8 7h9v9" /></>,
  asset: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z" />,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" /></>,
  box: <><path d="m21 8-9 5-9-5 9-5 9 5Z" /><path d="M3 8v9l9 5 9-5V8M12 13v9" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  check: <path d="m5 12 4.2 4.2L19 6.5" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  command: <><path d="M9 9H7a4 4 0 1 1 4-4v2m4 2h2a4 4 0 1 0-4-4v2m2 8h2a4 4 0 1 1-4 4v-2m-4-2H7a4 4 0 1 0 4 4v-2" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" /></>,
  filter: <path d="M4 5h16M7 12h10m-7 7h4" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4.8 1c-.7 1.4-2.3 1.7-2.3 3.5M12 17h.01" /></>,
  inbox: <><path d="M4 4h16v13H4z" /><path d="M4 14h4l2 3h4l2-3h4" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  'log-out': <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
  play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" />,
  plus: <path d="M12 5v14M5 12h14" />,
  refresh: <><path d="M20 11a8.1 8.1 0 0 0-14.9-3L3 10" /><path d="M3 5v5h5M4 13a8.1 8.1 0 0 0 14.9 3l2.1-2" /><path d="M21 19v-5h-5" /></>,
  report: <><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v5h5M8 13h8M8 17h5" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.2 2.2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.2v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.2-2.2.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-3.2h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.2-2.2.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3.2v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.2 2.2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
  shield: <><path d="M12 3 20 6v5c0 5-3.4 8.1-8 10-4.6-1.9-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  sliders: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="var(--panel)" /><circle cx="15" cy="17" r="2" fill="var(--panel)" /></>,
  sparkle: <><path d="m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2" /></>,
  terminal: <><path d="m5 7 4 4-4 4M12 17h7" /></>,
  'trend-down': <><path d="m4 7 5 5 4-4 7 7" /><path d="M20 10v5h-5" /></>,
  'trend-up': <><path d="m4 17 5-5 4 4 7-7" /><path d="M15 9h5v5" /></>,
  upload: <><path d="M12 16V3m0 0L7 8m5-5 5 5M4 16v4h16v-4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.8M17 14a6 6 0 0 1 4 6" /></>,
  workflow: <><rect x="3" y="4" width="6" height="5" rx="1" /><rect x="15" y="15" width="6" height="5" rx="1" /><path d="M9 6.5h3a4 4 0 0 1 4 4V15M3 17h6m-3-8v8" /></>,
  zap: <path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z" />,
};

export function Icon({ name, size = 18, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
