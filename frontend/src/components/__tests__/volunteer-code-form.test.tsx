import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VolunteerCodeForm } from "../volunteer-code-form";

describe("VolunteerCodeForm", () => {
  it("disables submit until a code is typed", async () => {
    const user = userEvent.setup();
    render(<VolunteerCodeForm />);

    const button = screen.getByRole("button", { name: "Continuer" });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText("Code volontaire"), "  ");
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText("Code volontaire"), "jmb-1");
    expect(button).toBeEnabled();
  });

  it("uppercases the volunteer code", async () => {
    const user = userEvent.setup();
    render(<VolunteerCodeForm />);

    const input = screen.getByLabelText("Code volontaire");
    await user.type(input, "jmb-42");

    expect(input).toHaveValue("JMB-42");
  });
});
