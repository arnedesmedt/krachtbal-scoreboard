import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { PresentationWindowCountField } from './PresentationWindowCountField';
import { useGameStore } from '../../store/gameStore';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { numPresentationWindows: 1 } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PresentationWindowCountField', () => {
  beforeEach(() => {
    useGameStore.setState({ phase: 'SETUP' });
  });

  it('is enabled during SETUP', () => {
    render(
      <Wrapper>
        <PresentationWindowCountField />
      </Wrapper>
    );
    const input = screen.getByRole('spinbutton');
    expect(input).not.toBeDisabled();
  });

  it('is disabled when phase !== SETUP', () => {
    useGameStore.setState({ phase: 'FIRST_HALF' });
    render(
      <Wrapper>
        <PresentationWindowCountField />
      </Wrapper>
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toBeDisabled();
  });
});

