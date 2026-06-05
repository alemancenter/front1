'use client';

import dynamic from 'next/dynamic';

// Client-side dynamic import so the comments JS chunk is kept off the LCP
// critical path. `ssr: false` is only legal inside a client component, hence
// this thin wrapper around the real ArticleComments module.
const ArticleComments = dynamic(() => import('./ArticleComments'), {
  ssr: false,
  loading: () => null,
});

export default ArticleComments;
