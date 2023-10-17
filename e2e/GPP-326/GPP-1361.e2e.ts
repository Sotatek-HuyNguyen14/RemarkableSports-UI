// eslint-disable-next-line import/no-extraneous-dependencies
import { by, device, expect, element } from "detox";
import { PROFILE_EDIT_BUTTON_TEST_ID } from "../../src/screens/ProfileScreen/constants";
import {
  getElement,
  getFormInput,
  openSelectionThenSelect,
  performLogin,
} from "../helpers";

describe("[GPP-1361]: Usecase Coach update profile", () => {
  beforeEach(async () => {
    await device.installApp();
    await device.launchApp();
  });

  afterEach(async () => {
    await device.uninstallApp();
  });

  it("[GPP-1348]: Coach update profile successfully", async () => {
    // Preconditions
    // Email and passwords for Coach account
    const email = "pedro.ng+C1@nextgen-solns.com";
    const password = "Pass123$";

    // When
    // 1: Login as coach
    await performLogin({ email, password });

    // 2: Tap on Profile
    await (await getElement(by.text("Profile"))).tap();

    // 3: Tap on Edit
    await (await getElement(by.id(PROFILE_EDIT_BUTTON_TEST_ID))).tap();

    // 4: Start updating profile
    await (await getElement(by.text("Female"))).tap();

    await (await getFormInput("firstName")).replaceText("New coach name");

    await openSelectionThenSelect(
      "coachLevelText",
      "Intermediate",
      "coachLevel"
    );

    await openSelectionThenSelect(
      "startYearAsCoach",
      "2018",
      "startYearAsCoach"
    );

    await (await getElement(by.text("Right Hand"))).tap();

    await (await getElement(by.text("Penhold"))).tap();

    await openSelectionThenSelect("rubberText", "Short Pips", "rubber");

    // 5: Tap on save button
    await (await getElement(by.text("Save"))).tap();

    // Then
    await expect(element(by.text("Wait for approval"))).toBeVisible();
  });
});
