'use client';

import { useEffect, useState } from 'react';
import ChatbotWidget from './ChatbotWidget';

export default function ClientOnlyChatbotWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ChatbotWidget />;
}
