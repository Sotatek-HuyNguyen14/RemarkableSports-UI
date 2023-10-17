import * as React from "react";
import { StatusBar, useColorModeValue, useTheme } from "native-base";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MainStackNavigatorParamList } from "./Types";

import SplashScreen from "../screens/Splash";
import LogInScreen from "../screens/LogIn";
import CreateAccountScreen from "../screens/SignUp/CreateAccount";
import EmailVerificationScreen from "../screens/SignUp/EmailVerification";
import OnboardingBasicInfoScreen from "../screens/SignUp/BasicInfo";
import OnboardingUserTypeScreen from "../screens/SignUp/UserType";
import OnboardingPlayerInfoScreen from "../screens/SignUp/PlayerInfo";
import OnboardingCoachInfoScreen from "../screens/SignUp/CoachInfo";
import OnboardingClubStaffInfoScreen from "../screens/SignUp/ClubStaffInfo";
import SignUpSuccessScreen from "../screens/SignUp/SignUpSuccess";

import PlayerBottomTabNavigator from "./PlayerBottomTabNavigator";
import VenueFiltering from "../screens/VenueFiltering";
import PlayerO3SubmitRequestScreen from "../screens/PlayerScreens/O3SubmitRequest";
import PlayerO3AppliedCoachDetails from "../screens/PlayerScreens/O3AppliedCoachDetails";
import PlayerCourseFilteringScreen from "../screens/PlayerScreens/CourseFiltering";
import PlayerCourseDetailsScreen from "../screens/PlayerScreens/CourseDetails";
import PlayerCourseApplySuccess from "../screens/PlayerScreens/CourseApplySuccess";

import CoachBottomTabNavigator from "./CoachBottomTabNavigator";
import CoachO3ApplyRequestScreen from "../screens/CoachScreens/O3ApplyRequest";

import ClubBottomTabNavigator from "./ClubBottomTabNavigator";
import ClubVenueBookingDetails from "../screens/ClubScreens/VenueBookingDetails";
import ClubApprovedVenueBooking from "../screens/ClubScreens/ApprovedVenueBooking";
import ClubRejectedVenueBooking from "../screens/ClubScreens/RejectedVenueBooking";

import ReviewCoachOnboardingInfoScreen from "../screens/AdminScreens/CoachApproval";
import VenueDetails from "../screens/VenueDetails";
import VenueBookingDetail from "../screens/VenueBookingDetails";
import VenueApplySuccess from "../screens/VenueApplySuccess";
import AdminApproveSuccessScreen from "../screens/AdminScreens/ApproveSuccess";
import AdminRejectSuccessScreen from "../screens/AdminScreens/RejectSuccess";
import ClubCourseBookingDetails from "../screens/ClubScreens/ClubCourseBookingDetails";
import ClubApprovedCourseBooking from "../screens/ClubScreens/ClubApprovedCourseBooking";
import ClubRejectedCourseBooking from "../screens/ClubScreens/ClubRejectedCourseBooking";
import SettingsScreen from "../screens/SettingsScreen";
import { useAuth } from "../hooks/UseAuth";
import useNotification from "../hooks/UseNotification";
import { createNotificationDevice } from "../services/notificationServices";
import ForgotPassword from "../screens/ForgotPassword/ForgotPassword";
import CoachO3Details from "../screens/CoachScreens/O3Details";
import UserProfileViewer from "../screens/UserProfileViewer";
import ClubAddVenue from "../screens/ClubScreens/AddVenue";
import ClubAddVenueOpeningHours from "../screens/ClubScreens/AddVenueOpeningHours";
import ClubAddVenueSuccess from "../screens/ClubScreens/AddVenueSuccess";
import PlayerCourseRejectSuccess from "../screens/PlayerScreens/CourseRejectSuccess";
import AddCourse from "../screens/AddCourse";
import AddCourseSuccessful from "../screens/AddCourse/AddCourseSuccessful";
import ClubUpdateProfile from "../screens/ClubScreens/UpdateProfile";
import CoachUpdateProfile from "../screens/CoachScreens/UpdateProfile";
import PlayerUpdateProfile from "../screens/PlayerScreens/UpdateProfile";
import CourseList from "../screens/CourseList";
import UpdateCourse from "../screens/UpdateCourse";
import ClubUpdateVenue from "../screens/ClubScreens/UpdateVenue";
import ClubVenueList from "../screens/ClubScreens/VenueList";
import ClubUpdateVenueSuccess from "../screens/ClubScreens/UpdateVenueSuccess";
import ClubVenueDetails from "../screens/ClubScreens/VenueDetails";
import ChangePassword from "../screens/ChangePassword";
import NotificationCentre from "../screens/NotificationCentre";
import ClubAddClub from "../screens/ClubScreens/AddClub";
import AdminBottomTabNavigator from "./AdminBottomTabNavigator";
import AdminClubApproval from "../screens/AdminScreens/ClubApproval";
import ClubUpdateClub from "../screens/ClubScreens/UpdateClub";
import JoinClubScreen from "../screens/JoinClubScreen";
import ClubProcess from "../screens/ClubScreens/ClubProcess";
import ManageCourse from "../screens/ManageCourse";
import AskForLeave from "../screens/PlayerScreens/AskForLeave";
import AddContent from "../screens/AddContent";
import ContentList from "../screens/ContentList";
import ContentDetails from "../screens/ContentDetails";
import UpdateContent from "../screens/UpdateContent";
import ManageEvent from "../screens/ManageEvent";
import PaymentEvidence from "../screens/PaymentEvidence";
import PaymentStatus from "../screens/PaymentStatus";
import AddEvent from "../screens/AddEvent";
import AddPaymentMethod from "../screens/AddPaymentMethod";
import AddEventSuccessful from "../screens/AddEvent/AddEventSuccessful";
import EventDetails from "../screens/PlayerScreens/EventDetails";
import ProvidePaymentEvidence from "../screens/PlayerScreens/PaymentEvidence";
import EventFiltering from "../screens/EventFiltering";
import JoinEventSuccess from "../screens/PlayerScreens/JoinEventSuccess";
import AddParticipant from "../screens/AddParticipant";
import UpdateEvent from "../screens/UpdateEvent";
import AllEvent from "../screens/AllEvent";
import OrganizerBottomTabNavigator from "./OrganizerBottomTabNavigator";
import LeagueHome from "../screens/OrganizerScreens/LeagueScreen";
import AddLeague from "../screens/OrganizerScreens/AddLeague";
import ManageDivision from "../screens/OrganizerScreens/ManageDivision";
import TeamRequest from "../screens/OrganizerScreens/TeamRequest";
import EditFixture from "../screens/OrganizerScreens/EditFixture";
import { DivisionScreen } from "../screens/DivisionScreen";
import UpdateLeague from "../screens/OrganizerScreens/UpdateLeague";
import { ManageTeam } from "../screens/ManageTeam";
import MatchResult from "../screens/OrganizerScreens/MatchResult";
import LeaderBoardScreen from "../screens/LeaderBoard";
import TeamViewResultScreen from "../screens/TeamViewResult";
import UpdateMatchResult from "../screens/OrganizerScreens/UpdateMatchResult";
import ResultApproval from "../screens/OrganizerScreens/ResultApproval";
import DivisionLeaderboard from "../screens/DivisionLeaderboard";
import IndividualStatistic from "../screens/IndividualStatistic";
import TeamStatistic from "../screens/TeamStatistic";
import SubmitMatchResult from "../screens/SubmitMatchResult";
import FilterFixtureResult from "../screens/FilterFixtureResult";
import LeagueFiltering from "../screens/LeagueFiltering";
import PendingApproval from "../screens/PendingApproval";
import SettingAccount from "../screens/SettingAccount";
import EventList from "../screens/EventList";
import { ManageEventPlayer } from "../screens/ManageEventPlayer";
import PlayerMeetupRecords from "../screens/PlayerScreens/PlayerMeetupRecords";
import ContanctsDetails from "../screens/CoachScreens/ContanctsDetails/intex";
import PlayerPendingRequests from "../screens/PlayerScreens/PlayerPendingRequests";
import ChatGPT from "../screens/ChatGPT";
import ChatGPTWithSelectedTopic from "../screens/ChatGPTOption";
import AllCourses from "../screens/AllCourses";
import ManageVenue from "../screens/ClubScreens/ManageVenue";
import SearchCourse from "../screens/PlayerScreens/SearchCourse";
import AddCourseSession from "../screens/AddCourseSession";
import PreviewCourseSessions from "../screens/PreviewCourseSessions";
import AddCoursePaymentMethod from "../screens/AddCoursePaymentMethod";
import { ManageCoursePlayer } from "../screens/ManageCoursePlayer";
import AddCoursePlayer from "../screens/AddCourseParticipant";
import AddCoursePaymentEvidence from "../screens/PlayerScreens/AddCoursePaymentEvidence";
import ManageSessions from "../screens/ManageSessions";
import EditSessions from "../screens/EditSessions";
import CourseRefund from "../screens/CourseRefund";
import EditCourseSession from "../screens/EditCourseSession";
import ChangeCourseSession from "../screens/ChangeCourseSession";
import ManageCoachSalary from "../screens/ClubScreens/ManageCoachSalary";
import PlayerBreakdown from "../screens/PlayerBreakdown";
import CoachBreakdown from "../screens/CoachBreakdown";
import { ClubMonthlySummary } from "../screens/ClubScreens/ClubMonthlySummary";
import { ClubCoursePerformance } from "../screens/ClubScreens/ClubCoursePerformance";
import { ManageCourseSessionPlayer } from "../screens/ManageCourseSessionPlayer";
import ApplySessions from "../screens/ApplySessions";
import ChangeEmail from "../screens/ChangeEmail";
import ReviewCoursePaymentEvidence from "../screens/ReviewCoursePaymentEvidence";
import ClubAddPaymentMethod from "../screens/ClubScreens/ClubAddPaymentMethod";
import LeagueScreenV2 from "../screens/LeagueV2/LeagueScreenV2";
import LeagueViewV2 from "../screens/LeagueV2/LeagueViewV2";
import LeagueAudienceDivision from "../screens/LeagueV2/LeagueAudienceDivision";
import AudiencePlayerStatistic from "../screens/LeagueV2/AudiencePlayerStatistic";
import AudienceTeamStatistic from "../screens/LeagueV2/AudienceTeamStatistic";
import LeaguePlayerDivision from "../screens/LeagueV2/LeaguePlayerDivision";
import LeaguePlayerSubmitJoinTeamRequest from "../screens/LeagueV2/LeaguePlayerSubmitJoinTeamRequest";
import LeagueTeamManagement from "../screens/LeagueV2/LeagueTeamManagement";
import LeagueTeamStatisticDetail from "../screens/LeagueV2/LeagueTeamStatisticDetail";
import LeaguePlayerIndividualStatistic from "../screens/LeagueV2/LeaguePlayerIndividualStatistic";
import LeagueViewSubmitResults from "../screens/LeagueV2/LeagueViewSubmitResults";
import LeagueReviewMatchResult from "../screens/LeagueV2/LeagueReviewMatchResult";
import SubmitUpdateMatchResult from "../screens/LeagueV2/SubmitUpdateMatchResult";
import LeagueViewAllFixtureV2 from "../screens/LeagueV2/LeagueViewAllFixtureV2";
import LeagueFilteringV2 from "../screens/LeagueV2/LeagueFilteringV2";
import LeagueFilterFixtureResultV2 from "../screens/LeagueV2/LeagueFilterFixtureResultV2";
import CourseApplicationSummary from "../screens/ClubScreens/CourseApplicationSummary";
import CourseApplicationDetails from "../screens/ClubScreens/CourseApplicationDetails";
import CourseLeaveApplicationsSummary from "../screens/ClubScreens/CourseLeaveApplicationsSummary";
import CoursePaymentEvidenceSummary from "../screens/ClubScreens/CoursePaymentEvidenceSummary";
import EventApplicationSummary from "../screens/ClubScreens/EventApplicationSummary";
import EventPaymentEvidenceSummary from "../screens/ClubScreens/EventPaymentEvidenceSummary";
import ReviewEventPaymentEvidence from "../screens/ReviewEventPaymentEvidence";
import ClubEventDetails from "../screens/ClubScreens/EventDetails";
import ClubCourseDetails from "../screens/ClubScreens/CourseDetails";
import VenueFilteringPage from "../screens/ClubScreens/FilterVenue/VenueFilteringPage";
import FilteredVenues from "../screens/ClubScreens/FilterVenue/FilteredVenues";
import { BookingRecords } from "../screens/BookingRecords";
import { BookVenue } from "../screens/BookVenue";
import BookingAdditionalInformation from "../screens/BookingAdditionalInformation";
import ConfirmVenueBooking from "../screens/ConfirmVenueBooking";
import BookVenueSuccess from "../screens/BookVenueSuccess";
import { BookingSchedules } from "../screens/BookingSchedules";
import ManageBookings from "../screens/ManageBookings";

const MainStack = createNativeStackNavigator<MainStackNavigatorParamList>();

function MainStackNavigator() {
  const { colors } = useTheme();
  const colorMode = useColorModeValue("Light", "Dark");
  const { loggedIn } = useAuth();
  const { notification, notificationToken } = useNotification();

  React.useEffect(() => {
    if (loggedIn && !!notificationToken && notificationToken.token.length > 0) {
      const post = async () => {
        try {
          await createNotificationDevice(notificationToken);
        } catch (e) {
          alert(e);
        }
      };
      post();
    }
  }, [loggedIn, notificationToken]);

  return (
    <>
      {/* For persisting status bar color in iOS and in Android */}
      <StatusBar
        barStyle={colorMode === "Light" ? "dark-content" : "light-content"}
        backgroundColor={colors.rs.white}
      />
      <MainStack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* === common screens */}
        <MainStack.Group>
          <MainStack.Screen
            name="BookingSchedules"
            component={BookingSchedules}
          />
          <MainStack.Screen name="ManageBookings" component={ManageBookings} />
          <MainStack.Screen name="Splash" component={SplashScreen} />
          <MainStack.Screen name="LogIn" component={LogInScreen} />
          <MainStack.Screen name="ForgotPassword" component={ForgotPassword} />
          <MainStack.Screen name="ChangePassword" component={ChangePassword} />
          <MainStack.Screen name="ChangeEmail" component={ChangeEmail} />
          <MainStack.Screen name="JoinClubScreen" component={JoinClubScreen} />
          <MainStack.Screen name="CourseList" component={CourseList} />
          <MainStack.Screen name="AllCourses" component={AllCourses} />
          <MainStack.Screen
            name="PreviewCourseSessions"
            component={PreviewCourseSessions}
          />
          <MainStack.Screen
            name="EditCourseSession"
            component={EditCourseSession}
          />
          <MainStack.Screen
            name="ChangeCourseSession"
            component={ChangeCourseSession}
          />
          <MainStack.Screen
            name="ManageCoachSalary"
            component={ManageCoachSalary}
          />
          <MainStack.Screen
            name="PlayerBreakdown"
            component={PlayerBreakdown}
          />
          <MainStack.Screen
            name="ReviewCoursePaymentEvidence"
            component={ReviewCoursePaymentEvidence}
          />
          <MainStack.Screen name="CoachBreakdown" component={CoachBreakdown} />
          <MainStack.Screen name="AddEvent" component={AddEvent} />
          <MainStack.Screen name="UpdateEvent" component={UpdateEvent} />
          <MainStack.Screen name="AddParticipant" component={AddParticipant} />
          <MainStack.Screen
            name="AddEventSuccessful"
            component={AddEventSuccessful}
          />
          <MainStack.Screen name="ChatGPT" component={ChatGPT} />
          <MainStack.Screen
            name="ChatGPTWithSelectedTopic"
            component={ChatGPTWithSelectedTopic}
          />
          <MainStack.Screen
            name="AddPaymentMethod"
            component={AddPaymentMethod}
          />
          <MainStack.Screen
            name="AddCoursePaymentEvidence"
            component={AddCoursePaymentEvidence}
          />
          <MainStack.Screen
            name="AddCoursePaymentMethod"
            component={AddCoursePaymentMethod}
          />
          <MainStack.Screen name="BookingRecords" component={BookingRecords} />
          <MainStack.Screen
            name="BookingAdditionalInformation"
            component={BookingAdditionalInformation}
          />
          <MainStack.Screen
            name="ConfirmVenueBooking"
            component={ConfirmVenueBooking}
          />
          <MainStack.Screen
            name="BookVenueSuccess"
            component={BookVenueSuccess}
          />

          <MainStack.Screen name="BookVenue" component={BookVenue} />
          <MainStack.Screen name="UpdateCourse" component={UpdateCourse} />
          <MainStack.Screen name="ManageEvent" component={ManageEvent} />
          <MainStack.Screen
            name="ManageCoursePlayer"
            component={ManageCoursePlayer}
          />
          <MainStack.Screen
            name="AddCoursePlayer"
            component={AddCoursePlayer}
          />
          <MainStack.Screen
            name="PaymentEvidence"
            component={PaymentEvidence}
          />
          <MainStack.Screen name="PaymentStatus" component={PaymentStatus} />
          <MainStack.Screen
            name="CreateAccount"
            component={CreateAccountScreen}
          />
          <MainStack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
          />
          <MainStack.Screen
            name="OnboardingBasicInfo"
            component={OnboardingBasicInfoScreen}
          />
          <MainStack.Screen
            name="OnboardingUserType"
            component={OnboardingUserTypeScreen}
          />
          <MainStack.Screen
            name="OnboardingPlayerInfo"
            component={OnboardingPlayerInfoScreen}
          />
          <MainStack.Screen
            name="OnboardingCoachInfo"
            component={OnboardingCoachInfoScreen}
          />
          <MainStack.Screen
            name="OnboardingClubStaffInfo"
            component={OnboardingClubStaffInfoScreen}
          />
          <MainStack.Screen
            name="SignUpSuccess"
            component={SignUpSuccessScreen}
          />
          <MainStack.Screen
            name="UserProfileViewer"
            component={UserProfileViewer}
          />
          <MainStack.Screen name="AddCourse" component={AddCourse} />
          <MainStack.Screen
            name="AddCourseSession"
            component={AddCourseSession}
          />
          <MainStack.Screen name="ManageCourse" component={ManageCourse} />
          <MainStack.Screen
            name="AddCourseSuccessful"
            component={AddCourseSuccessful}
          />
          <MainStack.Screen name="AddContent" component={AddContent} />
          <MainStack.Screen name="ContentList" component={ContentList} />
          <MainStack.Screen name="ContentDetails" component={ContentDetails} />
          <MainStack.Screen name="UpdateContent" component={UpdateContent} />
          <MainStack.Screen name="EventFiltering" component={EventFiltering} />
          <MainStack.Screen name="AllEvent" component={AllEvent} />
          {/* setting */}
          <MainStack.Screen name="SettingsScreen" component={SettingsScreen} />
          <MainStack.Screen name="SettingAccount" component={SettingAccount} />
          <MainStack.Screen name="DivisionScreen" component={DivisionScreen} />
          <MainStack.Screen name="ManageTeam" component={ManageTeam} />
          <MainStack.Screen
            name="ManageEventPlayer"
            component={ManageEventPlayer}
          />
          <MainStack.Screen
            name="ManageCourseSessionPlayer"
            component={ManageCourseSessionPlayer}
          />

          <MainStack.Screen
            name="DivisionLeaderboard"
            component={DivisionLeaderboard}
          />
          <MainStack.Screen
            name="IndividualStatistic"
            component={IndividualStatistic}
          />
          <MainStack.Screen name="TeamStatistic" component={TeamStatistic} />
          <MainStack.Screen
            name="SubmitMatchResult"
            component={SubmitMatchResult}
          />
        </MainStack.Group>
        <MainStack.Screen
          name="NotificationCentre"
          component={NotificationCentre}
        />
        <MainStack.Screen
          name="FilterFixtureResult"
          component={FilterFixtureResult}
        />
        <MainStack.Screen name="LeagueFiltering" component={LeagueFiltering} />
        <MainStack.Screen name="PendingApproval" component={PendingApproval} />
        {/* === player screens */}
        <MainStack.Group>
          <MainStack.Screen
            name="PlayerNavigator"
            component={PlayerBottomTabNavigator}
          />
          {/* 1-on-1 coach */}
          <MainStack.Screen
            name="PlayerO3SubmitRequest"
            component={PlayerO3SubmitRequestScreen}
          />
          <MainStack.Screen
            name="PlayerO3AppliedCoachDetails"
            component={PlayerO3AppliedCoachDetails}
          />

          <MainStack.Screen
            name="PlayerEventDetails"
            component={EventDetails}
          />

          <MainStack.Screen
            name="PlayerJoinEventSuccess"
            component={JoinEventSuccess}
          />
          <MainStack.Screen
            name="PlayerPaymentEvidence"
            component={ProvidePaymentEvidence}
          />
          {/* Venue */}
          <MainStack.Screen name="VenueFiltering" component={VenueFiltering} />
          <MainStack.Screen name="FilteredVenues" component={FilteredVenues} />
          <MainStack.Screen
            name="VenueFilteringPage"
            component={VenueFilteringPage}
          />
          <MainStack.Screen name="VenueDetail" component={VenueDetails} />
          <MainStack.Screen
            name="VenueBookingDetail"
            component={VenueBookingDetail}
          />
          <MainStack.Screen
            name="VenueApplySuccess"
            component={VenueApplySuccess}
          />

          {/* Course */}
          <MainStack.Screen
            name="PlayerCourseFiltering"
            component={PlayerCourseFilteringScreen}
          />
          <MainStack.Screen
            name="PlayerCourseDetails"
            component={PlayerCourseDetailsScreen}
          />
          <MainStack.Screen
            name="PlayerCourseApplySuccess"
            component={PlayerCourseApplySuccess}
          />
          <MainStack.Screen
            name="PlayerPendingRequests"
            component={PlayerPendingRequests}
          />
          <MainStack.Screen
            name="PlayerCourseRejectSuccess"
            component={PlayerCourseRejectSuccess}
          />
          <MainStack.Screen
            name="PlayerUpdateProfile"
            component={PlayerUpdateProfile}
          />
          <MainStack.Screen name="AskForLeave" component={AskForLeave} />
          <MainStack.Screen
            name="PlayerMeetupRecords"
            component={PlayerMeetupRecords}
          />
          <MainStack.Screen
            name="PlayerSearchCourse"
            component={SearchCourse}
          />
          <MainStack.Screen name="ManageSessions" component={ManageSessions} />
          <MainStack.Screen name="EditSessions" component={EditSessions} />
          <MainStack.Screen name="CourseRefund" component={CourseRefund} />
          <MainStack.Screen name="ApplySessions" component={ApplySessions} />
        </MainStack.Group>
        {/* === coach screens */}
        <MainStack.Group>
          <MainStack.Screen
            name="CoachNavigator"
            component={CoachBottomTabNavigator}
          />
          <MainStack.Screen
            name="CoachO3ApplyRequest"
            component={CoachO3ApplyRequestScreen}
          />
          <MainStack.Screen name="CoachO3Details" component={CoachO3Details} />
          <MainStack.Screen
            name="CoachContanctsDetails"
            component={ContanctsDetails}
          />
          <MainStack.Screen
            name="CoachUpdateProfile"
            component={CoachUpdateProfile}
          />
        </MainStack.Group>
        {/* === club screens */}
        <MainStack.Group>
          <MainStack.Screen
            name="ClubNavigator"
            component={ClubBottomTabNavigator}
          />
          <MainStack.Screen
            name="ClubVenueBookingDetails"
            component={ClubVenueBookingDetails}
          />
          <MainStack.Screen name="ManageVenue" component={ManageVenue} />
          <MainStack.Screen
            name="ClubApprovedVenueBooking"
            component={ClubApprovedVenueBooking}
          />
          <MainStack.Screen
            name="ClubRejectedVenueBooking"
            component={ClubRejectedVenueBooking}
          />

          <MainStack.Screen
            name="ClubCourseBookingDetails"
            component={ClubCourseBookingDetails}
          />
          <MainStack.Screen
            name="ClubApprovedCourseBooking"
            component={ClubApprovedCourseBooking}
          />
          <MainStack.Screen
            name="ClubRejectedCourseBooking"
            component={ClubRejectedCourseBooking}
          />
          <MainStack.Screen name="ClubAddVenue" component={ClubAddVenue} />
          <MainStack.Screen
            name="ClubAddVenueOpeningHours"
            component={ClubAddVenueOpeningHours}
          />
          <MainStack.Screen
            name="ClubAddVenueSuccess"
            component={ClubAddVenueSuccess}
          />
          <MainStack.Screen
            name="ClubUpdateProfile"
            component={ClubUpdateProfile}
          />
          <MainStack.Screen
            name="ClubMonthlySummary"
            component={ClubMonthlySummary}
          />

          <MainStack.Screen
            name="ClubCoursePerformance"
            component={ClubCoursePerformance}
          />
          {/* <MainStack.Screen name="ClubVenueList" component={ClubVenueList} /> */}
          <MainStack.Screen
            name="ClubUpdateVenue"
            component={ClubUpdateVenue}
          />
          <MainStack.Screen
            name="ClubUpdateVenueSuccess"
            component={ClubUpdateVenueSuccess}
          />
          <MainStack.Screen
            name="ClubVenueDetails"
            component={ClubVenueDetails}
          />
          <MainStack.Screen name="ClubAddClub" component={ClubAddClub} />
          <MainStack.Screen name="ClubUpdateClub" component={ClubUpdateClub} />
          <MainStack.Screen name="ClubProcess" component={ClubProcess} />
          <MainStack.Screen
            name="ClubAddPaymentMethod"
            component={ClubAddPaymentMethod}
          />
        </MainStack.Group>
        {/* === admin screens */}
        <MainStack.Group>
          <MainStack.Screen
            name="AdminNavigator"
            component={AdminBottomTabNavigator}
          />
          <MainStack.Screen
            name="ReviewCoachOnboardingInfo"
            component={ReviewCoachOnboardingInfoScreen}
          />
          <MainStack.Screen
            name="AdminApproveSuccess"
            component={AdminApproveSuccessScreen}
          />
          <MainStack.Screen
            name="AdminRejectSuccess"
            component={AdminRejectSuccessScreen}
          />
          <MainStack.Screen
            name="AdminClubApproval"
            component={AdminClubApproval}
          />
        </MainStack.Group>
        {/* === Organizer screens */}
        <MainStack.Group>
          <MainStack.Screen
            name="OrganizerNavigator"
            component={OrganizerBottomTabNavigator}
          />
          <MainStack.Screen name="AddLeague" component={AddLeague} />
          <MainStack.Screen name="ManageDivision" component={ManageDivision} />
          <MainStack.Screen name="TeamRequest" component={TeamRequest} />
          <MainStack.Screen name="EditFixture" component={EditFixture} />
          <MainStack.Screen name="UpdateLeague" component={UpdateLeague} />
          <MainStack.Screen name="MatchResult" component={MatchResult} />
          <MainStack.Screen name="LeaderBoard" component={LeaderBoardScreen} />
          <MainStack.Screen
            name="TeamViewResult"
            component={TeamViewResultScreen}
          />
          <MainStack.Screen
            name="UpdateMatchResult"
            component={UpdateMatchResult}
          />
          <MainStack.Screen name="ResultApproval" component={ResultApproval} />
        </MainStack.Group>
        <MainStack.Screen name="LeagueScreenV2" component={LeagueScreenV2} />
        <MainStack.Screen name="LeagueViewV2" component={LeagueViewV2} />
        <MainStack.Screen
          name="LeagueAudienceDivision"
          component={LeagueAudienceDivision}
        />
        <MainStack.Screen
          name="AudiencePlayerStatistic"
          component={AudiencePlayerStatistic}
        />
        <MainStack.Screen
          name="AudienceTeamStatistic"
          component={AudienceTeamStatistic}
        />
        <MainStack.Screen
          name="LeaguePlayerDivision"
          component={LeaguePlayerDivision}
        />
        <MainStack.Screen
          name="LeaguePlayerSubmitJoinTeamRequest"
          component={LeaguePlayerSubmitJoinTeamRequest}
        />
        <MainStack.Screen
          name="LeagueTeamManagement"
          component={LeagueTeamManagement}
        />
        <MainStack.Screen
          name="LeagueTeamStatisticDetail"
          component={LeagueTeamStatisticDetail}
        />
        <MainStack.Screen
          name="LeaguePlayerIndividualStatistic"
          component={LeaguePlayerIndividualStatistic}
        />
        <MainStack.Screen
          name="LeagueViewSubmitResults"
          component={LeagueViewSubmitResults}
        />
        <MainStack.Screen
          name="LeagueReviewMatchResult"
          component={LeagueReviewMatchResult}
        />
        <MainStack.Screen
          name="SubmitUpdateMatchResult"
          component={SubmitUpdateMatchResult}
        />
        <MainStack.Screen
          name="LeagueViewAllFixtureV2"
          component={LeagueViewAllFixtureV2}
        />
        <MainStack.Screen
          name="LeagueFilteringV2"
          component={LeagueFilteringV2}
        />
        <MainStack.Screen
          name="LeagueFilterFixtureResultV2"
          component={LeagueFilterFixtureResultV2}
        />
        <MainStack.Screen
          name="CourseApplicationSummary"
          component={CourseApplicationSummary}
        />
        <MainStack.Screen
          name="CourseApplicationDetails"
          component={CourseApplicationDetails}
        />
        <MainStack.Screen
          name="CourseLeaveApplicationsSummary"
          component={CourseLeaveApplicationsSummary}
        />
        <MainStack.Screen
          name="CoursePaymentEvidenceSummary"
          component={CoursePaymentEvidenceSummary}
        />
        <MainStack.Screen
          name="EventApplicationSummary"
          component={EventApplicationSummary}
        />
        <MainStack.Screen
          name="EventPaymentEvidenceSummary"
          component={EventPaymentEvidenceSummary}
        />
        <MainStack.Screen
          name="ReviewEventPaymentEvidence"
          component={ReviewEventPaymentEvidence}
        />
        <MainStack.Screen
          name="ClubCourseDetails"
          component={ClubCourseDetails}
        />
        <MainStack.Screen
          name="ClubEventDetails"
          component={ClubEventDetails}
        />
      </MainStack.Navigator>
    </>
  );
}

export default MainStackNavigator;
