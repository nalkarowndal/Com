import { useState, useEffect, useCallback } from 'react';
import { defaultContent } from '../data/defaultContent';
import { fetchHomeContent } from '../services/api';

export function useHomeContent() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('initializing');
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const { data, source } = await fetchHomeContent();
        if (isMounted) {
          if (data) {
            setContent(data);
          }
          setDataSource(source);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[useHomeContent] Falling back to default baseline content:', err);
          setContent(defaultContent);
          setDataSource('fallback');
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateContentFromAdmin = useCallback((updates) => {
    setContent((prev) => {
      const next = {
        ...prev,
        hero: {
          ...prev.hero,
          title: updates.heroTitle !== undefined ? updates.heroTitle : prev.hero.title,
          badge: updates.heroBadge !== undefined ? updates.heroBadge : prev.hero.badge,
          author: updates.heroAuthor !== undefined ? updates.heroAuthor : prev.hero.author
        },
        cards: [
          {
            ...prev.cards[0],
            title: updates.card1Title !== undefined ? updates.card1Title : prev.cards[0].title,
            description: updates.card1Desc !== undefined ? updates.card1Desc : prev.cards[0].description
          },
          {
            ...prev.cards[1],
            title: updates.card2Title !== undefined ? updates.card2Title : prev.cards[1].title,
            description: updates.card2Desc !== undefined ? updates.card2Desc : prev.cards[1].description
          }
        ]
      };
      return next;
    });

    setAuditLogs((prev) => [
      {
        action: 'UPDATE_CONTENT',
        entity: 'HOME_PAGE',
        timestamp: new Date().toISOString(),
        details: updates
      },
      ...prev
    ]);
  }, []);

  return {
    content,
    loading,
    dataSource,
    auditLogs,
    updateContentFromAdmin
  };
}
