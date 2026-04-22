import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InitiatorPopup } from './InitiatorPopup';

describe('InitiatorPopup', () => {
  const onSelect = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    onSelect.mockClear();
    onCancel.mockClear();
  });

  it('selecting Team A calls onSelect("A")', async () => {
    render(
      <InitiatorPopup
        onSelect={onSelect}
        onCancel={onCancel}
        teamAName="Eagles"
        teamBName="Lions"
        refereeName="John"
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /Eagles/i }));
    expect(onSelect).toHaveBeenCalledWith('A');
  });

  it('selecting Referee calls onSelect("referee")', async () => {
    render(
      <InitiatorPopup
        onSelect={onSelect}
        onCancel={onCancel}
        teamAName="Eagles"
        teamBName="Lions"
        refereeName="John"
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /John.*Referee/i }));
    expect(onSelect).toHaveBeenCalledWith('referee');
  });

  it('cancel calls onCancel', async () => {
    render(
      <InitiatorPopup
        onSelect={onSelect}
        onCancel={onCancel}
        teamAName="Eagles"
        teamBName="Lions"
        refereeName="John"
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
