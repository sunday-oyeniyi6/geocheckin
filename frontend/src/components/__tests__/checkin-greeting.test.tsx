import { render, screen } from "@testing-library/react";
import { mockFetchResponse, replace } from "@/test-utils";
import { CheckinGreeting } from "../checkin-greeting";

const me = { code: "012346-00", firstName: "Awa", lastName: "Fall" };

describe("CheckinGreeting", () => {
  it("greets the volunteer", async () => {
    mockFetchResponse(200, { ...me, checkedInToday: false });
    render(<CheckinGreeting />);
    expect(await screen.findByRole("heading", { name: "Bonjour Awa" })).toBeInTheDocument();
  });

  it("tells the volunteer they already checked in today", async () => {
    mockFetchResponse(200, { ...me, checkedInToday: true });
    render(<CheckinGreeting />);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Vous avez déjà émargé aujourd'hui.",
    );
  });

  it("redirects to / without a session", async () => {
    mockFetchResponse(401);
    render(<CheckinGreeting />);
    await screen.findByText("Chargement…");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(replace).toHaveBeenCalledWith("/");
  });
});
