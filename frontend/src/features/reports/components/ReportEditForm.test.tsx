import { render, screen, fireEvent } from '@testing-library/react'
import { ReportEditForm } from './ReportEditForm'

const defaultProps = {
  monthLabel: 'January 2026',
  acquisitions: [{ timestamp: 1000, ore_sites: 5 }],
  selected: { year: 2026, month: 0 },
  isLoading: false,
  customReport: '',
  onCustomReportChange: jest.fn(),
  files: [] as File[],
  rejectReason: null as string | null,
  inputRef: { current: null } as React.RefObject<HTMLInputElement | null>,
  onFileChange: jest.fn(),
  onDrop: jest.fn(),
  onDragOver: jest.fn(),
  onRemoveFile: jest.fn(),
  onSubmit: jest.fn(),
}

describe('ReportEditForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form with notes textarea and attachments area', () => {
    render(<ReportEditForm {...defaultProps} />)

    expect(screen.getByLabelText(/Notes and observations/i)).toBeTruthy()
    expect(screen.getByText(/Drop files here or click to browse/i)).toBeTruthy()
  })

  it('shows rejectReason when provided', () => {
    render(<ReportEditForm {...defaultProps} rejectReason="Rejected: bad.pdf" />)

    expect(screen.getByRole('alert').textContent).toContain('Rejected: bad.pdf')
  })

  it('shows file count when files selected', () => {
    render(
      <ReportEditForm
        {...defaultProps}
        files={[new File([], 'a.jpg'), new File([], 'b.pdf')]}
      />
    )

    expect(screen.getByText(/2 files selected/)).toBeTruthy()
  })

  it('shows singular file when one file', () => {
    render(<ReportEditForm {...defaultProps} files={[new File([], 'a.jpg')]} />)

    expect(screen.getByText(/1 file selected/)).toBeTruthy()
  })

  it('calls onCustomReportChange when typing in textarea', () => {
    const onCustomReportChange = jest.fn()
    render(
      <ReportEditForm
        {...defaultProps}
        onCustomReportChange={onCustomReportChange}
      />
    )

    fireEvent.change(screen.getByLabelText(/Notes and observations/i), {
      target: { value: 'test notes' },
    })

    expect(onCustomReportChange).toHaveBeenCalledWith('test notes')
  })

  it('calls onRemoveFile when remove button clicked', () => {
    const onRemoveFile = jest.fn()
    render(
      <ReportEditForm
        {...defaultProps}
        files={[new File([], 'doc.pdf')]}
        onRemoveFile={onRemoveFile}
      />
    )

    fireEvent.click(screen.getByLabelText(/Remove doc.pdf/i))

    expect(onRemoveFile).toHaveBeenCalledWith(0)
  })

  it('submits form and calls onSubmit', () => {
    const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault())
    render(<ReportEditForm {...defaultProps} onSubmit={onSubmit} />)

    const form = document.getElementById('report-form')
    expect(form).toBeTruthy()
    fireEvent.submit(form!)

    expect(onSubmit).toHaveBeenCalled()
  })
})
