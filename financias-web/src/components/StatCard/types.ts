import type { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  icon: LucideIcon
  label: string
  valor: string
  destaque?: string
  cor?: string
}
