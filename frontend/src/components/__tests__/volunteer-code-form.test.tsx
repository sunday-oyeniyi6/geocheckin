import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  mockFetchNetworkError,
  mockFetchResponse,
  push,
} from "@/test-utils";
import { VolunteerCodeForm } from "../volunteer-code-form";

function setup() {
  const user = userEvent.setup();
  render(<VolunteerCodeForm />);
  return {
    user,
    input: screen.getByLabelText("Code volontaire"),
    button: screen.getByRole("button", { name: "Continuer" }),
  };
}

describe("VolunteerCodeForm", () => {
  it("formats the code as it is typed and enables submit once complete", async () => {
    const { user, input, button } = setup();
    expect(button).toBeDisabled();

    await user.type(input, "0123460");
    expect(input).toHaveValue("012346-0");
    expect(button).toBeDisabled();

    await user.type(input, "0");
    expect(input).toHaveValue("012346-00");
    expect(button).toBeEnabled();
  });

  it("shows a format error after leaving an incomplete code", async () => {
    const { user, input } = setup();
    await user.type(input, "0123");
    await user.tab();
    expect(screen.getByText("Le code doit être au format 012346-00.")).toBeInTheDocument();
  });

  it("goes to /checkin when the account exists", async () => {
    const fetchMock = mockFetchResponse(200, {
      code: "012346-00",
      firstName: "Awa",
      lastName: "Fall",
    });
    const { user, input, button } = setup();

    await user.type(input, "01234600");
    await user.click(button);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/login$/),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(push).toHaveBeenCalledWith("/checkin");
  });

  it("suggests creating an account with the code pre-filled when not found", async () => {
    mockFetchResponse(404, { error: "VOLUNTEER_NOT_FOUND" });
    const { user, input, button } = setup();

    await user.type(input, "01234600");
    await user.click(button);

    expect(await screen.findByText(/Aucun compte pour le code/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Créer mon compte" })).toHaveAttribute(
      "href",
      "/inscription?code=012346-00",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it.each([
    ["rate limited", () => mockFetchResponse(429), /Trop de tentatives/],
    ["network error", mockFetchNetworkError, /Connexion impossible/],
  ])("shows a message when %s", async (_label, mock, message) => {
    mock();
    const { user, input, button } = setup();

    await user.type(input, "01234600");
    await user.click(button);

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
  });
});
