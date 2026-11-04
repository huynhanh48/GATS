import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteRobots handles dynamic page title and robots meta directives per route.
 */
export default function RouteRobots() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Disallow indexing on sensitive/admin paths
    let robotsMeta = document.querySelector("meta[name='robots']");
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }

    if (path.startsWith('/admin') || path.startsWith('/account') || path.includes('checkout')) {
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else {
      robotsMeta.setAttribute('content', 'index, follow');
    }

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}
