// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoneyTip } from "./MoneyTip";
import { formatCompactToman, formatToman } from "@/lib/format";

// MoneyTip is exercised in touch mode: (pointer: coarse) → true,
// (prefers-reduced-motion: reduce) → false (spring animation runs,
// which is why the tests below use async queries for both show and hide).
function mockMatchMedia() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query === "(pointer: coarse)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

// `window.navigator` is a non-configurable accessor in jsdom, so
// vi.stubGlobal("navigator", …) silently no-ops. Define `clipboard`
// directly on the navigator instance instead.
//
// Call this AFTER `userEvent.setup()`: setup installs its own clipboard
// stub as a getter on `navigator`, which would shadow a mock defined
// earlier. Redefining the configurable property with a data descriptor
// replaces that getter, so the component resolves the mock.
function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(window.navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

afterEach(() => {
  // Vitest runs without globals, so RTL's auto-cleanup never registers.
  cleanup();
  vi.unstubAllGlobals();
  // jsdom has no navigator.clipboard by default; drop the mock we added.
  delete (window.navigator as unknown as { clipboard?: unknown }).clipboard;
});

const value = 2_500_000;
const compact = formatCompactToman(value);
const full = formatToman(value);

describe("MoneyTip (touch)", () => {
  it("reveals the exact amount on tap, then dismisses on tap outside", async () => {
    mockMatchMedia();
    const user = userEvent.setup();
    render(<MoneyTip value={value} display={compact} />);

    const trigger = screen.getByRole("button", { name: compact });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await user.click(trigger);
    const tip = await screen.findByRole("tooltip");
    expect(tip.textContent).toBe(full);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    // The component listens for capture pointerdown — userEvent's click does
    // not synthesize pointerdown, so fire it explicitly.
    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("dismisses the open tip on Escape", async () => {
    mockMatchMedia();
    const user = userEvent.setup();
    render(<MoneyTip value={value} display={compact} />);

    await user.click(screen.getByRole("button", { name: compact }));
    await screen.findByRole("tooltip");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("inside a link: first tap only reveals the tip, second tap navigates", async () => {
    mockMatchMedia();
    const user = userEvent.setup();
    const navigate = vi.fn((e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault());

    render(
      <a href="/x" onClick={navigate}>
        <MoneyTip value={value} display={compact} />
      </a>,
    );

    const trigger = screen.getByRole("button", { name: compact });

    await user.click(trigger);
    await screen.findByRole("tooltip");
    expect(navigate).not.toHaveBeenCalled();

    // userEvent resolves the click target by hit-testing rects; in jsdom
    // every rect is zero-size, so the click would land on the overlapping
    // tooltip span instead of the trigger. Dispatch directly on it.
    fireEvent.click(trigger);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("a second tap closes the tip again", async () => {
    mockMatchMedia();
    const user = userEvent.setup();
    render(<MoneyTip value={value} display={compact} />);

    const trigger = screen.getByRole("button", { name: compact });
    await user.click(trigger);
    await screen.findByRole("tooltip");

    // Same jsdom zero-rect caveat as above — dispatch directly.
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("tapping the revealed amount copies it, flashes «کپی شد», and keeps the tip open", async () => {
    mockMatchMedia();
    const user = userEvent.setup();
    const writeText = mockClipboard();
    render(<MoneyTip value={value} display={compact} />);

    await user.click(screen.getByRole("button", { name: compact }));
    const tip = await screen.findByRole("tooltip");
    expect(tip.textContent).toBe(full);

    // jsdom zero-rect caveat — dispatch the click directly on the tip.
    fireEvent.click(tip);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(full);
    expect(tip.textContent).toBe("کپی شد");

    // The tip is an "inside" ref, so even a capture pointerdown on it must
    // not trigger the outside-tap dismiss.
    fireEvent.pointerDown(tip);
    expect(screen.queryByRole("tooltip")).not.toBeNull();

    // The «کپی شد» flash reverts to the full amount after a moment.
    await waitFor(() => expect(tip.textContent).toBe(full), { timeout: 3000 });
  });

  it("copying, then dismissing, resets the «کپی شد» flash", async () => {
    mockMatchMedia();
    const user = userEvent.setup();
    mockClipboard();
    render(<MoneyTip value={value} display={compact} />);

    const trigger = screen.getByRole("button", { name: compact });
    await user.click(trigger);
    const tip = await screen.findByRole("tooltip");

    fireEvent.click(tip);
    expect(tip.textContent).toBe("کپی شد");

    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());

    // Reopening must show the exact amount, not a stale «کپی شد».
    fireEvent.click(trigger);
    const tipAgain = await screen.findByRole("tooltip");
    expect(tipAgain.textContent).toBe(full);
  });

  it("renders a plain span when the display already is the exact amount", async () => {
    mockMatchMedia();
    const user = userEvent.setup();
    const tiny = 950;
    render(<MoneyTip value={tiny} display={formatToman(tiny)} />);

    const el = screen.getByText(formatToman(tiny));
    expect(el.getAttribute("dir")).toBe("rtl");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("tooltip")).toBeNull();

    await user.click(el);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
