import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { useChangePassword } from '@/features/settings/hooks/useChangePassword'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const HUMOR_STORAGE_KEY = 'larvis-humor-setting'

function loadHumorSetting(): number {
  try {
    const raw = localStorage.getItem(HUMOR_STORAGE_KEY)
    if (raw !== null) {
      const n = parseInt(raw, 10)
      if (!Number.isNaN(n) && n >= 0 && n <= 100) return n
    }
  } catch {
    // ignore
  }
  return 0
}

function saveHumorSetting(value: number) {
  try {
    localStorage.setItem(HUMOR_STORAGE_KEY, String(value))
  } catch {
    // ignore
  }
}

export function SettingsPage() {
  const [humor, setHumor] = useState(loadHumorSetting)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [reNewPassword, setReNewPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const { changePassword, isLoading } = useChangePassword()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(false)
    setPasswordError(null)

    if (newPassword !== reNewPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    const result = await changePassword({ oldPassword, newPassword })

    if (result.success) {
      setPasswordSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setReNewPassword('')
    } else {
      setPasswordError(result.error ?? 'Failed to change password.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.round(Number(e.target.value))
    setHumor(value)
    saveHumorSetting(value)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 pt-4">
      <PageHeader title="Settings" subtitle="Station configuration" />

      <section className="flex max-w-md flex-col gap-4 rounded-lg border border-input bg-muted/30 p-6">
        <h2 className="text-base font-semibold">Larvis Humor Setting</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={humor}
              onChange={handleChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-mars-500"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={humor}
              aria-valuetext={`${humor}%`}
              aria-label="Humor level"
            />
            <span className="w-12 shrink-0 text-right text-sm font-medium tabular-nums">
              {humor}%
            </span>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Knock knock!</p>
            <p>
              <span className="font-medium text-foreground">0%:</span> &quot;Who&apos;s there?&quot;
            </p>
            <p>
              <span className="font-medium text-foreground">100%:</span> &quot;Knocked a hole on
              the left side of the fuel compartment.&quot;
            </p>
          </div>
        </div>
      </section>

      <section className="flex max-w-md flex-col gap-4 rounded-lg border border-input bg-muted/30 p-6">
        <h2 className="mb-4 text-base font-semibold">Change Password</h2>
        {passwordSuccess && (
          <Alert variant="success" className="flex items-start justify-between gap-2 pr-10">
            <div>
              <AlertTitle>Password changed</AlertTitle>
              <AlertDescription>Your password has been updated successfully.</AlertDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="absolute right-2 top-1/2 shrink-0 -translate-y-1/2"
              aria-label="Dismiss"
              onClick={() => setPasswordSuccess(false)}
            >
              <XIcon className="size-4" />
            </Button>
          </Alert>
        )}
        {passwordError && (
          <Alert variant="destructive" className="flex items-start justify-between gap-2 pr-10">
            <div>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{passwordError}</AlertDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="absolute right-2 top-1/2 shrink-0 -translate-y-1/2"
              aria-label="Dismiss"
              onClick={() => setPasswordError(null)}
            >
              <XIcon className="size-4" />
            </Button>
          </Alert>
        )}
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="old-password">Old password</Label>
            <Input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter old password"
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="renew-password">Password confirmation</Label>
            <Input
              id="renew-password"
              type="password"
              value={reNewPassword}
              onChange={(e) => setReNewPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="mt-4">
            {isLoading ? 'Changing…' : 'Change Password'}
          </Button>
        </form>
      </section>
    </div>
  )
}
