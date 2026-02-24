import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeDate(input: string | number | Date | null | undefined): string {
  if (input === null || input === undefined || input === '') {
    return ''
  }

  try {
    const date = input instanceof Date ? input : new Date(input)
    if (Number.isNaN(date.getTime())) {
      return ''
    }
    return date.toISOString()
  } catch {
    return ''
  }
}
