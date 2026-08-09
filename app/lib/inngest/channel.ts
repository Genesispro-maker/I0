import { channel, staticSchema } from "inngest/realtime";
import type { EventType } from "@/app/types/types";

export const generationchannel = channel({
  name: ({ projectId }: { projectId: string }) => `project:${projectId}`,
  topics: {
    progress: {
      schema: staticSchema<{ type: EventType; data: string }>(),
    },
  },
});