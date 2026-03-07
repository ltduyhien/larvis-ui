import { render, screen, fireEvent } from '@testing-library/react'
import { ReportFormActions } from './ReportFormActions'

describe('ReportFormActions', () => {
  it('renders Reset, Schedule and Send buttons', () => {
    const onReset = jest.fn()
    render(<ReportFormActions onReset={onReset} />)

    expect(screen.getByRole('button', { name: /Reset All Fields/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Schedule Sending Report/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Send Report/i })).toBeTruthy()
  })

  it('calls onReset when Reset clicked', () => {
    const onReset = jest.fn()
    render(<ReportFormActions onReset={onReset} />)

    fireEvent.click(screen.getByRole('button', { name: /Reset All Fields/i }))

    expect(onReset).toHaveBeenCalled()
  })

  it('Send Report button submits form via form attribute', () => {
    const onReset = jest.fn()
    render(<ReportFormActions onReset={onReset} />)

    const sendBtn = screen.getByRole('button', { name: /Send Report/i })
    expect(sendBtn.getAttribute('form')).toBe('report-form')
  })
})
