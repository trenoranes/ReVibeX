import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { CategoryScroller, type CategoryValue } from "./CategoryScroller";

function Harness({ initial = "All" as CategoryValue }) {
  const [v, setV] = useState<CategoryValue>(initial);
  return (
    <>
      <div data-testid="current">{v}</div>
      <CategoryScroller value={v} onChange={setV} />
    </>
  );
}

describe("CategoryScroller (native select)", () => {
  it("shows the current category in the trigger", () => {
    render(<Harness initial="Tops" />);
    const trigger = screen.getByRole("combobox", { name: /choose category/i });
    expect(trigger).toHaveTextContent("Tops");
  });

  it("selects a category", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.selectOptions(screen.getByRole("combobox", { name: /choose category/i }), "Shoes");
    expect(screen.getByTestId("current")).toHaveTextContent("Shoes");
  });

  it("renders all groups", () => {
    const { container } = render(<Harness />);
    const groups = Array.from(container.querySelectorAll("optgroup")).map((group) => group.label);
    expect(groups).toEqual(expect.arrayContaining(["Fashion", "Home & decor", "Books, music & games", "Electronics & tech"]));
  });
});
