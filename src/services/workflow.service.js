import { ExecutionsClient } from "@google-cloud/workflows";

const client = new ExecutionsClient();

const PROJECT_ID = "project-f58923fc-74bb-4a51-9f9";
const LOCATION = "asia-south2";
const WORKFLOW_NAME = "booking-saga";

export async function triggerWorkflow(bookingId) {
  const parent = client.workflowPath(
    PROJECT_ID,
    LOCATION,
    WORKFLOW_NAME
  );

  await client.createExecution({
    parent,
    execution: {
      argument: JSON.stringify({ bookingId })
    }
  });

  console.log("Workflow started for booking:", bookingId);
}
