import React, { useEffect } from 'react';

/**
 * SocialBarAd: Permanently disabled per user request ("Uporer shudu Ad Ti Akbare off kore deo").
 * Actively cleans up any residual scripts, iframes, or floating badges injected by third-party ad networks.
 */
export const SocialBarAd: React.FC = () => {
  useEffect(() => {
    // 1. Remove script tag
    const scriptId = 'adsterra-socialbar-real-script';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    // 2. Remove any injected scripts or iframes from bicea.org or social bar
    const scripts = document.querySelectorAll('script[src*="bicea.org"], script[src*="socialbar"]');
    scripts.forEach((s) => s.remove());

    const iframes = document.querySelectorAll('iframe[src*="bicea.org"]');
    iframes.forEach((f) => f.remove());

    // 3. Remove any floating ad containers attached to the body
    const lingeringContainers = document.querySelectorAll(
      'div[id*="bicea"], div[class*="bicea"], div[id*="socialbar"], div[class*="socialbar"]'
    );
    lingeringContainers.forEach((c) => c.remove());
  }, []);

  return null;
};
