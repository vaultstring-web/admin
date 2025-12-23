// app/settings/page.tsx
'use client';

import { SettingsPanel } from '@/components/settings/SettingsPanel';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <SettingsPanel />
    </div>
  );
}