import { useState } from "react";

import { Button } from "@/components/ui/Button";

import type { Meta, StoryObj } from "@storybook/react";

import { Input } from ".";

const meta: Meta<typeof Input> = {
  component: Input,
  decorators: [
    (Story, { args }) => {
      const [value, setValue] = useState<string | undefined>(`${args.value}`);
      return (
        <Story
          args={{
            ...args,
            value: value,
            setValue: setValue,
            children: <p><span>Input</span>: {value}</p>,
          }}
        >
          <p><span>Input</span>: {value}</p>
        </Story>
      );
    },
  ],
  args: {
    label: "Label",
    value: "value",
    setValue: () => {},
    required: true,
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
};

export const NotRequired: Story = {
  args: {
    required: false,
  },
};

export const NoneLabelAndRequired: Story = {
  args: {
    label: undefined,
    required: true,
  },
};

export const Simplified: Story = {
  args: {
    required: true,
    simplified: true,
  },
};

export const WithAppendButton: Story = {
  decorators: [
    (Story, { args }) => {
      const [value, setValue] = useState<string | undefined>(`${args.value}`);
      const appendStr = "hoge";

      return (
        <div>
          <Story
            args={{
              ...args,
              value,
              setValue,
            }}
          />
          <Button
            data-testid="appendButton"
            onClick={() => setValue((prev) => prev + appendStr)}
            style={{ pointerEvents: "auto" }}
          >
            append {`"${appendStr}"`}
          </Button>
        </div>
      );
    },
  ],
};
