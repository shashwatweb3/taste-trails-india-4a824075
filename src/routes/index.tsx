import { createFileRoute } from "@tanstack/react-router";

const TITLE = "PLATEMAP — India, ranked by people who actually eat there";
const DESC =
  "Discover, visit, rate and rank India's food. First city live: Lucknow. First category live: Biryani.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/app.html"
      title="PLATEMAP — India food discovery and community ranking"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        background: "#0b0c12",
      }}
    />
  );
}
