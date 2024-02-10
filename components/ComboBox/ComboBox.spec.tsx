import { composeStories } from "@storybook/react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import styles from "./ComboBox.module.scss";
import * as stories from "./ComboBox.stories";

const story = composeStories(stories);

describe("<ComboBox />", () => {
  const getRendered
    = () =>
      render(
        <story.Default>
          <p id="test-child">childText</p>
        </story.Default>,
      ).container.firstChild as HTMLElement;

  it("描画可能", async () => {
    const rendered = getRendered();
    expect(rendered).toBeInTheDocument();
  });
  it("CSS-Module class を持つ", async () => {
    const rendered = getRendered();
    expect(rendered.querySelector("input")?.classList.contains(styles.ComboBox)).toBe(true);
  });
  it("子要素が描画されている", async () => {
    const rendered = getRendered();
    expect(rendered.firstChild).not.toBeUndefined();
    expect(rendered.querySelector("p#test-child")).toBeInTheDocument();
  });
});
