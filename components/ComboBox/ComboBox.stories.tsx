import { userEvent, within } from "@storybook/testing-library";
import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ComboBox } from ".";

const meta: Meta<typeof ComboBox> = {
  component: ComboBox,
  decorators: [
    (Story, { args }) => {
      const [value, setValue] = useState<string | undefined>(args.value);
      return (
        <>
          <Story
            args={{
              ...args,
              value: value,
              setValue: setValue,
            }}
          />
          <p><span>Input</span>: {value}</p>
        </>
      );
    },
  ],
  args: {
    label: "コンボボックス",
    suggestions: {
      foo: "Foo",
      bar: "Bar",
      bazz: "Bazz",
      foobar: "Foobar",
      foobazz: "Foobazz",
      barfoo: "Barfoo",
      barbazz: "Barbazz",
      bazzfoo: "Bazzfoo",
      bazzbar: "Bazzbar",
    },
    value: "Foobar",
    required: true,
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await userEvent.pointer(
      {
        keys: "[MouseLeft]",
        target: screen.getByRole("combobox"),
      },
      { delay: 1000 },
    );
    await userEvent.keyboard(
      "Foobar",
      { delay: 200 },
    );
    await userEvent.keyboard(
      "{backspace}",
      { delay: 200 },
    );
    await userEvent.keyboard(
      "{backspace}",
      { delay: 200 },
    );
    await userEvent.keyboard(
      "{backspace}",
      { delay: 200 },
    );
  },
};

export default meta;
type Story = StoryObj<typeof ComboBox>;

export const Default: Story = {
};

export const FreeInput: Story = {
  args: {
    filterable: true,
    freeInput: true,
    required: true,
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await userEvent.pointer(
      {
        keys: "[MouseLeft]",
        target: screen.getByTestId("combobox"),
      },
      { delay: 1000 },
    );
    await userEvent.keyboard(
      "Foobar",
      { delay: 200 },
    );
    await userEvent.keyboard(
      "{backspace}",
      { delay: 200 },
    );
    await userEvent.pointer(
      {
        keys: "[MouseLeft]",
        target: screen.getByText("Input"),
      },
    );
  },
};

export const ReadOnly = {
  args: {
    readOnly: true,
  },
};
