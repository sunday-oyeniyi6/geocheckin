import {
  VOLUNTEER_CODE_REGEX,
  formatVolunteerCodeInput,
  isValidPersonName,
  isValidSenegalPhone,
  normalizeSenegalPhone,
} from "../formats";

describe("formatVolunteerCodeInput", () => {
  it.each([
    ["01234600", "012346-00"],
    ["012346", "012346"],
    ["0123460", "012346-0"],
    ["012346-00", "012346-00"],
    ["01 2346 00 99", "012346-00"],
    ["abc", ""],
  ])("formats %p as %p", (raw, expected) => {
    expect(formatVolunteerCodeInput(raw)).toBe(expected);
  });

  it("always produces a valid code from 8 digits", () => {
    expect(VOLUNTEER_CODE_REGEX.test(formatVolunteerCodeInput("99999999"))).toBe(true);
  });
});

describe("phone", () => {
  it.each(["771234567", "77 123 45 67", "+221771234567", "00221 70.123.45.67"])(
    "accepts %p",
    (input) => {
      expect(isValidSenegalPhone(input)).toBe(true);
    },
  );

  it.each(["721234567", "77123456", "+33612345678"])("rejects %p", (input) => {
    expect(isValidSenegalPhone(input)).toBe(false);
  });

  it("normalizes to E.164", () => {
    expect(normalizeSenegalPhone("77 123 45 67")).toBe("+221771234567");
  });
});

describe("isValidPersonName", () => {
  it.each(["Aïssatou", "N'Diaye", "N’Diaye", "  Mame   Diarra "])("accepts %p", (name) => {
    expect(isValidPersonName(name)).toBe(true);
  });

  it.each(["A", "Jean3", "'Fall", "x".repeat(51)])("rejects %p", (name) => {
    expect(isValidPersonName(name)).toBe(false);
  });
});
