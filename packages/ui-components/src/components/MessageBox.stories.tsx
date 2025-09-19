import type { Meta, StoryObj } from '@storybook/react-webpack5';
import MessageBox from './MessageBox';

const meta: Meta<typeof MessageBox> = {
  title: 'MessageBox',
  component: MessageBox,
  args: {
    message: "Here's something you should know.",
    messageType: 'info',
  },
  argTypes: {
    messageType: {
      options: ['info', 'error', 'warning', 'success', 'help', 'loginRequired', 'disconnected', 'loading'],
      control: { type: 'select' },
    },
    loadingType: {
      options: ['spinner', 'skeleton'],
      control: { type: 'inline-radio' },
    },
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MessageBox>;

export const Info: Story = {};

export const Success: Story = {
  args: {
    message: 'All operations completed successfully.',
    messageType: 'success',
  },
};

export const Warning: Story = {
  args: {
    message: 'Heads up! Some configuration might need attention.',
    messageType: 'warning',
  },
};

export const ErrorState: Story = {
  render: (args) => (
    <MessageBox
      {...args}
      message={new Error("We couldn't fetch the latest dashboard metrics.")}
      messageType="error"
    />
  ),
};

export const Help: Story = {
  args: {
    messageType: 'help',
    message: {
      title: 'Need a hand?',
      body: 'Reach out to support@ottabase.dev or check the documentation.',
    },
  },
};

export const LoadingSpinner: Story = {
  args: {
    isLoading: true,
    loadingType: 'spinner',
  },
};

export const LoadingSkeleton: Story = {
  args: {
    isLoading: true,
    loadingType: 'skeleton',
  },
};

export const LoginRequired: Story = {
  args: {
    messageType: 'loginRequired',
    message: 'Please sign in to continue.',
  },
};
