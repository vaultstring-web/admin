'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

type DetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  widthClassName?: string;
};

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  widthClassName,
}: DetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={widthClassName ?? 'sm:max-w-xl'}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="px-4 pb-6 overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

