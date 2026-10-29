import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockFetchResponse, push, setSearchParams } from "@/test-utils";
import { SignUpForm } from "../sign-up-form";

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Prénom"), "Aïssatou");
  await user.type(screen.getByLabelText("Nom"), "N'Diaye");
  await user.type(screen.getByLabelText("Code volontaire"), "01234600");
  await user.type(screen.getByLabelText("Téléphone"), "77 123 45 67");
}

describe("SignUpForm", () => {
  beforeEach(() => setSearchParams(""));

  it("pre-fills the code from the URL", () => {
    setSearchParams("code=012346-00");
    render(<SignUpForm />);
    expect(screen.getByLabelText("Code volontaire")).toHaveValue("012346-00");
  });

  it("shows field errors and does not call the API when the form is invalid", async () => {
    const fetchMock = mockFetchResponse(201);
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText("Prénom"), "A");
    await user.type(screen.getByLabelText("Téléphone"), "721234567");
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(screen.getByText("Prénom invalide (2 à 50 lettres).")).toBeInTheDocument();
    expect(screen.getByText("Nom invalide (2 à 50 lettres).")).toBeInTheDocument();
    expect(screen.getByText("Le code doit être au format 012346-00.")).toBeInTheDocument();
    expect(
      screen.getByText("Numéro mobile sénégalais attendu (70, 75, 76, 77 ou 78)."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends normalized data and goes to /checkin on success", async () => {
    const fetchMock = mockFetchResponse(201, {
      code: "012346-00",
      firstName: "Aïssatou",
      lastName: "N'Diaye",
    });
    const user = userEvent.setup();
    render(<SignUpForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      firstName: "Aïssatou",
      lastName: "N'Diaye",
      code: "012346-00",
      phone: "+221771234567",
    });
    expect(push).toHaveBeenCalledWith("/checkin");
  });

  it("shows which field is already used on 409", async () => {
    mockFetchResponse(409, { error: "VOLUNTEER_ALREADY_EXISTS", fields: ["code", "phone"] });
    const user = userEvent.setup();
    render(<SignUpForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(await screen.findByText("Ce code est déjà utilisé.")).toBeInTheDocument();
    expect(screen.getByText("Ce numéro est déjà utilisé.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
