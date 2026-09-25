'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Maps the current pathname to a clear, user-friendly route label.
 * Format: "The Professor | <Route>"
 */
export function getRouteTitle(pathname: string | null): string {
  if (!pathname || pathname === '/' || pathname === '') {
    return 'Home';
  }

  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const segments = clean.split('/');

  if (segments[0] === 'documents') {
    if (segments.length === 1) return 'Documents';
    if (segments.length === 2) return 'Overview';
    const subRoute = segments[2]?.toLowerCase();
    switch (subRoute) {
      case 'chat':
        return 'Chat';
      case 'quiz':
        return 'Quiz';
      case 'flashcards':
        return 'Flashcards';
      case 'visualize':
        return 'Visualize';
      default:
        return subRoute
          ? subRoute.charAt(0).toUpperCase() + subRoute.slice(1)
          : 'Overview';
    }
  }

  if (segments[0] === 'upload') return 'Upload';
  if (segments[0] === 'sign-in') return 'Sign In';

  const last = segments[segments.length - 1];
  return last
    ? last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
    : 'Home';
}

export function RouteTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const routeTitle = getRouteTitle(pathname);
    document.title = `The Professor | ${routeTitle}`;
  }, [pathname]);

  return null;
}

export default RouteTitleSync;
