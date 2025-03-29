import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const StatementMappings = [
  {
    value: 'applecard',
    label: 'Apple Card'
  },
  {
    value: 'chase',
    label: 'Chase Bank'
  },
  {
    value: 'mastercard',
    label: 'Mastercard'
  }
]