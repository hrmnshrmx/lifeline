// useOnThisDay.js
// Fetches REAL, sourced historical events for a given month/day from the free
// Wikipedia "On this day" REST API (no key, CORS-enabled). Only the calendar
// month + day are ever sent — never the birth year, and never anything that
// identifies the person. Falls back to the bundled local dataset when offline
// or if the request fails, so the section always shows something real.

import { useEffect, useRef, useState } from 'react';
import { getOnThisDay } from '../data/onThisDay.js';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n) {
  return String(n).padStart(2, '0');
}

// Simple in-memory cache so revisiting the same day doesn't refetch.
const cache = new Map();

function normalize(items, limit) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((it) => it && it.text && typeof it.year === 'number')
    .sort((a, b) => b.year - a.year)
    .slice(0, limit)
    .map((it) => {
      const page = it.pages && it.pages[0];
      const url =
        page && page.content_urls && page.content_urls.desktop
          ? page.content_urls.desktop.page
          : null;
      // Strip Wikipedia's tracking params off thumbnail URLs.
      let thumb = null;
      if (page && page.thumbnail && page.thumbnail.source) {
        thumb = page.thumbnail.source.split('?')[0];
      }
      return {
        year: it.year,
        text: it.text,
        url,
        thumb,
        title: page ? page.normalizedtitle || (page.titles && page.titles.normalized) : null,
        desc: page ? page.description : null,
      };
    });
}

function fromLocal(month, day) {
  const local = getOnThisDay(`${pad(month + 1)}-${pad(day)}`);
  if (!local) return { events: [], births: [], deaths: [], source: 'local', empty: true };
  return {
    events: local.events || [],
    births: local.births || [],
    deaths: local.deaths || [],
    source: 'local',
    empty:
      !(local.events && local.events.length) &&
      !(local.births && local.births.length) &&
      !(local.deaths && local.deaths.length),
  };
}

export function useOnThisDay(birthDate) {
  const month = birthDate.getMonth();
  const day = birthDate.getDate();
  const key = `${pad(month + 1)}-${pad(day)}`;

  const [state, setState] = useState({ status: 'loading', data: null });
  const activeKey = useRef(key);

  useEffect(() => {
    activeKey.current = key;

    if (cache.has(key)) {
      setState({ status: 'ready', data: cache.get(key) });
      return undefined;
    }

    setState({ status: 'loading', data: null });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${pad(
      month + 1,
    )}/${pad(day)}`;

    fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const events = normalize(
          (json.selected && json.selected.length ? json.selected : json.events),
          6,
        );
        const births = normalize(json.births, 5);
        const deaths = normalize(json.deaths, 5);
        const data = {
          events,
          births,
          deaths,
          source: 'wikipedia',
          sourceUrl: `https://en.wikipedia.org/wiki/${MONTHS[month]}_${day}`,
          empty: !events.length && !births.length && !deaths.length,
        };
        cache.set(key, data);
        if (activeKey.current === key) setState({ status: 'ready', data });
      })
      .catch(() => {
        // Network/offline/failed → bundled local data.
        const data = fromLocal(month, day);
        if (activeKey.current === key) setState({ status: 'ready', data });
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [key, month, day]);

  return state;
}
