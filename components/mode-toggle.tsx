"use client"

import { Moon, SunMedium } from "lucide-react"

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function ToggleThemeButton() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      className="grid size-8 place-content-center rounded-md border text-muted-foreground"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <SunMedium className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}