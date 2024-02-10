import type { Meta, StoryObj } from "@storybook/react";

import { Option } from ".";

const meta: Meta<typeof Option> = {
  component: Option,
  args: {
    dataKey: "key",
    value: "value",
    focused: false,
    selected: false,
    setCurrentKey: () => {},
    setFocusedOption: () => {},
    setFocusFn: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof Option>;

export const Default: Story = {
};

export const Focused: Story = {
  args: {
    focused: true,
  },
};

export const Selectd: Story = {
  args: {
    selected: true,
  },
};
