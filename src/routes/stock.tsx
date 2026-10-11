import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/stock")({
  component: () => <Navigate to="/admin" search={{ tab: "stock" }} />,
});
