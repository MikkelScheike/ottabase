import React from 'react';
import type { Preview } from '@storybook/react-webpack5';
import '@ottabase/ui-tailwind/styles/tailwind.base.css';
import '../app/globals.css';

import { ProviderUI } from '@ottabase/ui-core';
import { ProviderState } from '@ottabase/state';
import { ProviderCodeHighlight } from '@ottabase/ui-code-highlight';
import { appConfig, THEME_COLORS } from '../ottabase/config/app.config';

const preview: Preview = {
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'light',
            values: [
                { name: 'light', value: '#ffffff' },
                { name: 'dark', value: '#111827' },
            ],
        },
    },
    decorators: [
        (Story: any) => (
            <ProviderState>
                <ProviderUI
                    storagePrefix={appConfig.storage.prefix}
                    themeColors={THEME_COLORS}
                    primaryColor={appConfig.theme.colorDefault}
                    enforceGoogleFonts={appConfig.ui.enforceGoogleFonts}
                >
                    <ProviderCodeHighlight>
                        <Story />
                    </ProviderCodeHighlight>
                </ProviderUI>
            </ProviderState>
        ),
    ],
};

export default preview;
