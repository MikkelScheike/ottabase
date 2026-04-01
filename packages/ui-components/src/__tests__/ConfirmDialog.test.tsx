import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from '../index';

describe('ConfirmDialog', () => {
    it('renders dialog copy and uses destructive tone classes', () => {
        render(
            <ConfirmDialog
                open
                onOpenChange={vi.fn()}
                title="Delete post?"
                description="This action cannot be undone."
                tone="destructive"
                confirmLabel="Delete"
            />,
        );

        const confirmButton = screen.getByRole('button', { name: 'Delete' });
        expect(screen.getByText('Delete post?')).toBeTruthy();
        expect(screen.getByText('This action cannot be undone.')).toBeTruthy();
        expect(confirmButton.className).toContain('bg-destructive');
    });

    it('uses default tone classes and forwards basic button props', () => {
        const onConfirm = vi.fn();

        render(
            <ConfirmDialog
                open
                onOpenChange={vi.fn()}
                title="Publish changes?"
                confirmLabel="Publish"
                onConfirm={onConfirm}
                confirmProps={{ disabled: true, 'data-testid': 'confirm-action' }}
            />,
        );

        const confirmButton = screen.getByTestId('confirm-action');
        confirmButton.click();

        expect(confirmButton.className).toContain('bg-primary');
        expect(confirmButton).toBeDisabled();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('uses unsaved-changes defaults and renders the leave action first', () => {
        render(
            <ConfirmDialog
                open
                onOpenChange={vi.fn()}
                title="Unsaved changes"
                description="You have unsaved changes that will be lost if you leave this page."
                tone="unsaved-changes"
            />,
        );

        const buttons = screen.getAllByRole('button');

        expect(buttons[0].textContent).toBe('Leave without saving');
        expect(buttons[1].textContent).toBe('Stay and keep editing');
        expect(buttons[0].className).toContain('bg-destructive');
    });

    it('lets primary and secondary action text override the default labels', () => {
        render(
            <ConfirmDialog
                open
                onOpenChange={vi.fn()}
                title="Custom actions"
                primaryActionText="Proceed now"
                secondaryActionText="Not yet"
            />,
        );

        expect(screen.getByRole('button', { name: 'Proceed now' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Not yet' })).toBeTruthy();
    });
});
