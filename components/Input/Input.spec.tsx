import { composeStories } from "@storybook/react";
import { userEvent } from "@storybook/testing-library";
import { screen, render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import styles from "./Input.module.scss";
import * as stories from "./Input.stories";

const story = composeStories(stories);

describe("<Input />", () => {
  const getRendered = () =>
    render(
      <story.Default />,
    ).container.firstChild as HTMLElement;

  it("描画可能", async () => {
    getRendered();
    const rootElement = (await screen.findByTestId("inputRoot")) as HTMLElement;
    expect(rootElement).toBeInTheDocument();
  });
  it("CSS-Module class を持つ", async () => {
    getRendered();
    const rootElement = (await screen.findByTestId("inputRoot")) as HTMLElement;
    expect(rootElement.classList.contains(styles.Input)).toBe(true);
  });

  it("外部で更新(setValue) された状態(value) が描画に反映される", async () => {
    render(<story.WithAppendButton />);
    const rawInputElement = (await screen.findByTestId("rawInput")) as HTMLInputElement;
    const appendButton = (await screen.findByTestId("appendButton")) as HTMLButtonElement;
    const beforeValue = rawInputElement.value;

    const user = userEvent.setup();
    await user.click(appendButton);

    const afterValue = rawInputElement.value;
    expect(beforeValue).not.toBe(afterValue);
  });
});
