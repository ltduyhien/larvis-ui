import { UtcTime } from './utc-time'

interface PageHeaderProps {
  title: string
  subtitle: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between pb-6">
      <h1 className="text-2xl">
        <span className="font-bold">{title}</span>
        <span className="font-normal text-lg"> | {subtitle}</span>
      </h1>
      <UtcTime />
    </div>
  )
}
