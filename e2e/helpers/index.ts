// Test constants
export const APP_SCROLL_VIEW_TEST_ID = "APP_SCROLL_VIEW_TEST_ID";
export const FORM_INPUT_TEST_ID = "FORM_INPUT_TEST_ID";
export const SINGLE_SELECT_MODAL_CONFIRM_BUTTON_TEST_ID =
  "SINGLE_SELECT_MODAL_CONFIRM_BUTTON_TEST_ID";
export const MEET_BUTTON_TEST_ID = "MEET_BUTTON_TEST_ID";

// Test Helpers:

export function getFormInputTestId(name: string) {
  return `${FORM_INPUT_TEST_ID}_${name}`;
}

export function getSingleSectionModalConfirmButtonTestId(name: string) {
  return `${SINGLE_SELECT_MODAL_CONFIRM_BUTTON_TEST_ID}_${name}`;
}

// Will scroll until element visible if needed
export async function getElement(matcher: Detox.NativeMatcher) {
  await waitFor(element(matcher))
    .toBeVisible()
    .whileElement(by.id(APP_SCROLL_VIEW_TEST_ID))
    .scroll(150, "down");
  const foundedElement = await element(matcher);
  return foundedElement;
}

// Perform login with specific account
export async function performLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  await (await getElement(by.id("Email"))).replaceText(email);
  await (await getElement(by.id("Password"))).replaceText(password);
  await (await getElement(by.id("Login"))).tap();
}

// Tap Meet button
export async function tapMeetButton() {
  await (await getElement(by.id(MEET_BUTTON_TEST_ID))).tap();
}

// Go to Route
export const EVENT_ROUTE_TEST_ID = "EVENT_ROUTE_TEST_ID";
export const COURSE_ROUTE_TEST_ID = "COURSE_ROUTE_TEST_ID";
export const O3_ROUTE_TEST_ID = "O3_ROUTE_TEST_ID";
export const VENUE_ROUTE_TEST_ID = "VENUE_ROUTE_TEST_ID";
export const LEAGUE_ROUTE_TEST_ID = "LEAGUE_ROUTE_TEST_ID";
export const REPORT_ROUTE_TEST_ID = "REPORT_ROUTE_TEST_ID";

export async function goToRoute(routeId: string) {
  await tapMeetButton();
  await (await getElement(by.id(routeId))).tap();
}

// Go to Tabs
export const HOME_TAB_TEST_ID = "HOME_TAB_TEST_ID";
export const CONTENT_TAB_TEST_ID = "CONTENT_TAB_TEST_ID";
export const CALENDAR_TAB_TEST_ID = "CALENDAR_TAB_TEST_ID";
export const PROFILE_TAB_TEST_ID = "PROFILE_TAB_TEST_ID";

export async function goToTab(tabId: string) {
  await (await getElement(by.id(tabId))).tap();
}

// Get form input by name
// <FormInput
// controllerProps={{
//   control,
//   name: "email", -> Use this name
//   rules: { required: t("is required") },
// }}
// />
export async function getFormInput(name: string) {
  const formInput = await getElement(by.id(getFormInputTestId(name)));
  return formInput;
}

// Perform open a dropdown selection and select a value
// <FormInput
// controllerProps={{
//   control,
//   name: "email", -> formName
//   rules: { required: t("is required") },
// }}
// />
// <SingleSelectModal
// controllerProps={{
//   name: "competitionType", -> modalName
//   control,
//   rules: {
//     required: type === EventType.Competition,
//   },
// }}
// confirmButtonText={t("Confirm")}
// />
export async function openSelectionThenSelect(
  formName: string,
  selectValue: string,
  modalName: string
) {
  await (await getFormInput(formName)).tap();
  await (await getElement(by.text(selectValue))).tap();
  await element(
    by.id(getSingleSectionModalConfirmButtonTestId(modalName))
  ).tap();
}
