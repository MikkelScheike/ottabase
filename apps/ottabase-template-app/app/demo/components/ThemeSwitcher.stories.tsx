import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { userEvent, within } from "storybook/test";
import { ThemeProvider } from "../lib/themeContext";
import { ThemeSwitcher } from "./ThemeSwitcher";

const meta: Meta<typeof ThemeSwitcher> = {
  title: "ThemeSwitcher",
  component: ThemeSwitcher,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ThemeSwitcher>;

export const Default: Story = {};

export const StripePreview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stripeOption = await canvas.findByLabelText("Mantine Stripe");
    await userEvent.click(stripeOption);
  },
};
