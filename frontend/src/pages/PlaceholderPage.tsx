import { PageHeader } from '@/shared/ui/page-header'

interface PlaceholderPageProps {
  title: string
  subtitle: string
}

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 pt-4">
      <PageHeader title={title} subtitle={subtitle} />
    </div>
  )
}
