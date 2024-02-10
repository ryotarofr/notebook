import { rest } from "msw";

import { Button } from "@/components/ui/Button";
import { useApiMutation } from "@/fn/state/useApi";

import { SwrErrorBoundary } from "./SwrErrorBoundary";

import type { Meta, StoryObj } from "@storybook/react";

const Children = () => {
  const { trigger } = useApiMutation("/samples", "post");
  return (
    <Button
      onClick={() => trigger({ title: "Sample Title" })}
    >
      Trigger error fetch.
    </Button>
  );
};
const meta: Meta<typeof SwrErrorBoundary> = {
  component: SwrErrorBoundary,
  parameters: {
    msw: {
      handlers: {
        samples: [
          rest.post("/api/v1/samples", (_, res, ctx) => {
            return res(
              ctx.status(500),
              ctx.json({
                code: "E10001",
                timestamp: "2023-11-08 04:45:05.797",
                errorLogId: "036da285-3db2-4bc1-9f5d-5e14a81c7743",
              }),
            );
          }),
        ],
      },
    },
  },
  args: {
    children: <Children />,
  },
};

export default meta;
type Story = StoryObj<typeof SwrErrorBoundary>;

export const Default: Story = {
};
