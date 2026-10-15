import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DiodeComparison } from './comparison';

afterEach(cleanup);
describe('diode comparison', () => {
  it('overlays all four curves and toggles each independently', () => {
    render(<DiodeComparison />);
    for (const k of ['rectifier', 'schottky', 'led', 'zener']) expect(screen.getByTestId(`curve-${k}`)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Rectifier diode' }));
    expect(screen.queryByTestId('curve-rectifier')).toBeNull();
    expect(screen.getByTestId('curve-zener')).toBeTruthy();
  });
  it('updates the probe, LED curve and reverse range', () => {
    render(<DiodeComparison />);
    const original = screen.getByTestId('curve-led').getAttribute('d');
    fireEvent.change(screen.getByLabelText('Comparison LED color'), { target: { value: 'blue' } });
    expect(screen.getByTestId('curve-led').getAttribute('d')).not.toBe(original);
    fireEvent.change(screen.getByRole('slider', { name: /^Diode voltage/ }), { target: { value: '-6' } });
    expect(screen.getByText('-36.00')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reverse' }));
    expect(screen.getByRole('slider', { name: /^Diode voltage/ }).getAttribute('max')).toBe('0');
  });
});