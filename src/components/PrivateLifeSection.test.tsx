import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrivateLifeSection } from "@/components/PrivateLifeSection";

describe("PrivateLifeSection", () => {
  it("renders Private Life cards with Under Construction placeholders for hobbies and photos", () => {
    render(<PrivateLifeSection />);

    expect(screen.getAllByText("Under Construction")).toHaveLength(2);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Hobbies Section Under Construction",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Photo Gallery Under Construction",
      }),
    ).toBeInTheDocument();
  });
});
