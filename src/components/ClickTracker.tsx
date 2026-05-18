'use client';

import { useEffect } from 'react';
import { publicEnv } from '@/lib/env';

export function ClickTracker() {
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        if (!target) return;

        // 1. Get click position
        const x = event.clientX;
        const y = event.clientY;

        // 2. Resolve element identity info
        const tagName = target.tagName;
        const elementId = target.id || null;
        const elementClass = target.className && typeof target.className === 'string' 
          ? target.className 
          : null;

        // Truncate innerText to avoid storing huge blocks of raw HTML text
        let text = target.innerText || target.textContent || '';
        text = text.trim().substring(0, 100);

        // 3. Resolve CSS-like path of elements up to 5 levels
        const getDomPath = (el: HTMLElement | null): string => {
          const path: string[] = [];
          let current: HTMLElement | null = el;
          let depth = 0;
          while (current && depth < 5) {
            let name = current.tagName.toLowerCase();
            if (current.id) {
              name += `#${current.id}`;
              path.unshift(name);
              break; // Unique enough
            } else if (current.className && typeof current.className === 'string') {
              const classes = current.className.split(/\s+/).filter(Boolean).slice(0, 3).join('.');
              if (classes) {
                name += `.${classes}`;
              }
            }
            path.unshift(name);
            current = current.parentElement;
            depth++;
          }
          return path.join(' > ');
        };

        const path = getDomPath(target);
        const url = window.location.href;

        // 4. Resolve authenticated user information from localStorage
        const userStr = localStorage.getItem('retailos_customer_user');
        let userId = null;
        let userEmail = null;
        let userName = null;
        let userRole = 'guest';

        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userId = user.id || user._id || null;
            userEmail = user.email || null;
            userName = user.fullName || user.name || null;
            userRole = user.role || 'customer';
          } catch (err) {
            // Ignore JSON parse errors
          }
        }

        // Create click payload
        const payload = {
          elementId,
          elementClass,
          tagName,
          text,
          path,
          url,
          x,
          y,
          userId,
          userEmail,
          userName,
          userRole
        };

        // 5. Send payload to public analytics click endpoint (background non-blocking)
        const endpoint = `${publicEnv.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/analytics/click`;
        
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          keepalive: true, // Keep connection alive in case of fast page unloads/navigations
        }).catch((err) => {
          // Silent catch to prevent console cluttering in case API is temporarily unavailable
        });

      } catch (err) {
        // Complete safety catch to ensure analytics tracking NEVER interrupts user behavior
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  return null; // This component doesn't render any UI elements
}
