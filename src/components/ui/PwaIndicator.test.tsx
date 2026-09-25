// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { PwaIndicator } from "./PwaIndicator";

afterEach(() => {
  // Vitest runs without globals, so RTL's auto-cleanup never registers.
  cleanup();
  vi.unstubAllGlobals();
});

describe("PwaIndicator", () => {
  it("shows «آنلاین» once mounted (jsdom reports the page as online)", async () => {
    render(<PwaIndicator />);

    const pill = await screen.findByText("آنلاین");
    // Hidden below the sm breakpoint, pill from 640px up.
    expect(pill.className).toContain("hidden");
    expect(pill.className).toContain("sm:inline");
    expect(screen.queryByText("آفلاین")).toBeNull();
  });

  it("flips the pill to «آفلاین» on window offline and back on online", async () => {
    render(<PwaIndicator />);
    await screen.findByText("آنلاین");

    fireEvent(window, new Event("offline"));
    const offPill = await screen.findByText("آفلاین");
    expect(offPill.className).toContain("bg-saffron-100");
    expect(screen.queryByText("آنلاین")).toBeNull();

    fireEvent(window, new Event("online"));
    await screen.findByText("آنلاین");
    expect(screen.queryByText("آفلاین")).toBeNull();
  });

  it("offers the install button after beforeinstallprompt and hides it once accepted", async () => {
    // The component calls event.preventDefault() and event.prompt() directly
    // on the event object, so the fake needs those as own properties.
    const prompt = vi.fn().mockResolvedValue({ outcome: "accepted" });
    render(<PwaIndicator />);
    await screen.findByText("آنلاین");
    expect(screen.queryByRole("button")).toBeNull();

    const event = Object.assign(
      new Event("beforeinstallprompt", { cancelable: true }),
      {
        prompt,
        userChoice: Promise.resolve({ outcome: "accepted" }),
      },
    );
    fireEvent(window, event);

    const install = screen.getByRole("button", { name: "نصب سفره" });
    fireEvent.click(install);
    expect(prompt).toHaveBeenCalledTimes(1);

    // Resolving the prompt with "accepted" clears the button.
    await waitFor(() => expect(screen.queryByRole("button")).toBeNull());
  });

  it("keeps the pill mounted and removes listeners on unmount", async () => {
    const { unmount } = render(<PwaIndicator />);
    await screen.findByText("آنلاین");

    unmount();
    // After unmount, dispatching events must not throw (listeners removed).
    fireEvent(window, new Event("offline"));
    expect(screen.queryByText("آنلاین")).toBeNull();
  });
});
