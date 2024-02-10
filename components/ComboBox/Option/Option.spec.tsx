import { composeStories } from "@storybook/react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import styles from "./Option.module.scss";
import * as stories from "./Option.stories";

const story = composeStories(stories);

describe("<Option />", () => {
  const getRendered = () => render(
    <story.Default />,
  )
    .container
    .querySelector(`.${styles.Option }`)!;

  it("描画可能", async () => {
    const rendered = getRendered();
    expect(rendered).toBeInTheDocument();
  });
  it("CSS-Module class を持つ", async () => {
    const rendered = getRendered();
    expect(rendered.classList.contains(styles.Option)).toBe(true);
  });
  it("子要素が描画されている", async () => {
    const rendered = getRendered();
    expect(rendered.firstChild).not.toBeUndefined();
    expect(rendered.querySelector("*[data-testid=child]")).toBeInTheDocument();
  });
});
