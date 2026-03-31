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
  const width = widthClassName ?? 'w-full sm:w-[760px]';
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={width}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="px-4 pb-6 overflow-y-auto overflow-x-hidden">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

