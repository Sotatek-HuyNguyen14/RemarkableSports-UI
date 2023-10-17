// eslint-disable-next-line import/no-extraneous-dependencies
import { by, device, expect, element } from "detox";
import { getElement } from "../helpers";

describe("[GPP-1354]: Usecase Club staff login", () => {
  beforeEach(async () => {
    await device.installApp();
    await device.launchApp();
  });

  afterEach(async () => {
    await device.uninstallApp();
  });

  it("[GPP-1353]: Club staff login successfully", async () => {
    // Preconditions
    // Email and passwords are VALID
    // Email and passwords for Club staff account
    const email = "pedro.ng+P1@nextgen-solns.com";
    const password = "Pass123$";

    // When
    await (await getElement(by.id("Email"))).replaceText(email);
    await (await getElement(by.id("Password"))).replaceText(password);
    await (await getElement(by.id("Login"))).tap();

    // Then
    await expect(element(by.text("GoPingPong"))).toBeVisible();
  });

  it("[GPP-1353]: Club staff login failed", async () => {
    // Preconditions
    // Email and passwords are INVALID
    const email = "michelle.ng+T1@nextgen-solns.com";
    const password = "Pass1234$";

    // When
    await (await getElement(by.id("Email"))).replaceText(email);
    await (await getElement(by.id("Password"))).replaceText(password);
    await (await getElement(by.id("Login"))).tap();

    // Then
    await expect(
      element(by.text("Invalid email and/or password"))
    ).toBeVisible();
  });
});
