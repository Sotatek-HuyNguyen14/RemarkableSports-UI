import { VenueBooking } from "../models/Booking";
import { CourseBookingResponse } from "../models/Response";
import {
  AppliedCoach,
  ContactResponse,
  O3Response,
} from "../models/responses/O3Response";
import {
  ClubApplicationResponse,
  ClubPaymentMethodResponse,
  ClubResponse,
} from "../models/responses/Club";
import { ClubStaff, Coach, Player } from "../models/User";
import { CreateVenueRequest, Venue } from "../models/requests/Venue";
import { CourseFilteringFormValues } from "../screens/PlayerScreens/CourseFiltering";
import { VenueFilteringForm } from "../screens/VenueFiltering";
import {
  CourseApplicationResponse,
  CourseResponse,
  CourseSessionsResponse,
} from "../models/responses/Course";
import { OnboardingResponse } from "../models/responses/Onboarding";
import { ContentResponse } from "../models/responses/Content";
import { CreateEventRequest } from "../models/requests/Event";
import { EventApplication, EventResponse } from "../models/responses/Event";
import { EventFilteringForm } from "../screens/EventFiltering";
import {
  Fixture,
  LeagueResponse,
  DivisionModel,
  TeamModel,
  FixtureResponse,
  GroupedFixtureBySessionAndRound,
  DivisionMatchResultResponse,
  LeaderboardIndividualResponse,
} from "../models/responses/League";
import { FilterResult } from "../screens/FilterFixtureResult";
import { ChatGPTTopic } from "../models/responses/ChatGPT";
import { AddCourseSessionModel } from "../screens/AddCourse/AddSessionComponent";
import { CreateCourseRequest } from "../models/requests/Course";
import { LeagueFlow } from "../screens/LeagueV2/LeagueScreenV2";
import { BookingModel } from "../screens/BookVenue";
import { VenueBookingGroup } from "../screens/BookingAdditionalInformation";

export type MainStackNavigatorParamList = {
  // === common screens
  Splash: undefined;
  LogIn: undefined;
  SettingsScreen: undefined;
  ChangePassword: undefined;
  ChangeEmail: undefined;
  JoinClubScreen: undefined;
  ProfileScreen: undefined;
  SettingAccount: undefined;
  CoachContanctsDetails: { contanct: ContactResponse };
  AddCourse: {
    isReset?: boolean;
  };
  AddCourseSession: { course: CreateCourseRequest };
  EditCourseSession: {
    application: CourseApplicationResponse;
  };
  ChangeCourseSession: {
    session: CourseSessionsResponse;
    playerId: string | number;
    isMoveSessionFlow?: boolean;
    isEditSessionFlow?: boolean;
    playerName?: string;
    makeupSessionId?: string | number;
    flow: "default" | "manage" | "move";
  };
  PreviewCourseSessions: {
    sessions: AddCourseSessionModel[];
    course: CreateCourseRequest;
  };
  AllCourses:
    | {
        filterValue: CourseFilteringFormValues | null;
        filterText?: string;
      }
    | undefined;
  AddCourseSuccessful: {
    courseId: string | number;
  };
  LeagueScreen: undefined;
  DivisionLeaderboard: {
    league: LeagueResponse;
  };
  TeamStatistic: {
    divisionId: number | string;
    teamId: number | string;
  };
  ChatGPT: undefined;
  ChatGPTWithSelectedTopic: {
    topic: ChatGPTTopic;
  };
  ManageVenue: {
    venue: Venue;
  };
  SubmitMatchResult: {
    matchResult?: DivisionMatchResultResponse;
    fixture?: FixtureResponse;
  };
  IndividualStatistic: {
    divisionId: number | string;
    teamId: number | string;
    team: TeamModel;
    displayName: string;
    playerId: string;
  };
  DivisionScreen: {
    division?: DivisionModel;
    divisionId?: number;
    defaultTabIndex?: number;
    startTime?: Date;
  };
  PendingApproval: {
    teamId: number | string;
    divisionId: number | string;
    myTeam?: TeamModel;
  };
  ManageTeam: {
    team?: TeamModel;
    teamId?: number;
  };
  AddEventSuccessful: {
    eventId: string | number;
    isUpdating?: boolean;
  };
  AddEvent: undefined;
  UpdateEvent: {
    event: EventResponse;
    paymentMethodUpdated?: boolean;
  };
  AddPaymentMethod: {
    event: CreateEventRequest;
    isUpdating?: boolean;
    ableToAddContent?: boolean;
  };
  AddCoursePaymentMethod: {
    course: CourseResponse;
    isUpdating?: boolean;
  };
  ManageCourse: {
    course?: CourseResponse;
    courseId?: number;
  };
  AddParticipant: {
    event: EventResponse;
  };
  ManageEvent: {
    event?: EventResponse;
    eventId?: number | string;
  };
  ManageEventPlayer: {
    event: EventResponse;
  };
  ManageCoursePlayer: {
    course: CourseResponse;
  };
  BookingRecords: undefined;
  ManageBookings: {
    venue: Venue;
  };
  BookingSchedules: {
    venue: Venue;
  };
  BookVenue: {
    venue: Venue;
  };
  BookingAdditionalInformation: {
    bookingModel: BookingModel;
    venue: Venue;
  };
  ConfirmVenueBooking: {
    remarks?: string;
    group?: VenueBookingGroup;
    bookingModel: BookingModel;
    venue: Venue;
  };
  BookVenueSuccess: {
    venueId: string | number;
  };
  ManageCourseSessionPlayer: {
    session: CourseSessionsResponse;
    sessionList: CourseSessionsResponse[];
    cachedList: AddCourseSessionModel[];
    course: CourseResponse;
    removedSessionIds: number[];
  };
  AddCoursePlayer: {
    courseId: string | number;
  };
  PaymentStatus: {
    eventId: number | string;
    event?: EventResponse;
  };
  PaymentEvidence: {
    application: EventApplication;
  };
  PlayerBreakdown: undefined;
  CoachBreakdown: undefined;
  AddCoursePaymentEvidence: {
    course: CourseResponse;
  };
  ManageCoachSalary: {
    coachApplication: ClubApplicationResponse;
  };
  AskForLeave: {
    courseId: string | number;
  };
  ContentScreen: undefined;
  AddContent:
    | {
        eventId?: number;
      }
    | undefined;
  UpdateContent: {
    content: ContentResponse;
  };
  ContentList: {
    contents: ContentResponse[];
  };
  EventList: undefined;

  ContentDetails: {
    content?: ContentResponse;
    contentId?: number;
    isExpired?: boolean;
  };
  // sign up screens
  CreateAccount: undefined;
  ForgotPassword: undefined;
  EmailVerification: {
    email: string;
    password: string;
  };
  NotificationCentre: undefined;

  // onboarding screens
  OnboardingBasicInfo: undefined;
  OnboardingUserType: undefined;
  OnboardingPlayerInfo: undefined;
  OnboardingCoachInfo: undefined;
  OnboardingClubStaffInfo: undefined;
  SignUpSuccess: undefined;
  UserProfileViewer: {
    user: Player | Coach | ClubStaff;
    isFavouriteCoach?: boolean;
    shouldShowEditButtonForStaff?: boolean;
  };

  // === player screens
  PlayerNavigator: {
    screen: keyof PlayerBottomTabNavigatorParamList;
    params: any;
  };
  // 1-on-1 Coach
  PlayerO3SubmitRequest: {
    selectedCoachId: string | null;
    isSubmitO3RequestWithSelectedCoach: boolean | null;
  };
  PlayerO3AppliedCoachDetails: {
    o3?: O3Response;
    appliedCoach?: AppliedCoach;
    o3CoachId?: number;
    isCoachApproveRejectFlow?: boolean;
    isForceBackToPlayerMeetupList?: boolean;
  };
  PlayerPendingRequests: undefined;
  VenueFiltering: {
    filterValue: VenueFilteringForm | null;
  };
  EventFiltering: {
    filterValue: EventFilteringForm | null;
  };
  LeagueFiltering: {
    filterValue?: FilterResult | null | undefined;
    league: LeagueResponse;
  };
  VenueDetail: {
    venue: Venue;
  };
  VenueFilteringPage: undefined;
  FilteredVenues: { venues: Venue[] };
  VenueBookingDetail: {
    venueBooking?: VenueBooking;
    venueBookingId?: number;
  };
  VenueApplySuccess: {
    venue: Venue;
    appliedFromTime: string;
    appliedToTime: string;
  };
  // Course
  PlayerCourseFiltering: {
    filterValue: CourseFilteringFormValues | null;
  };
  PlayerCourseDetails: {
    course?: CourseResponse;
    courseId?: number;
  };
  ClubCourseDetails: {
    course?: CourseResponse;
    courseId?: number;
  };
  PlayerCourseApplySuccess: {
    destination: keyof MainStackNavigatorParamList;
    nestedDestination?: keyof PlayerBottomTabNavigatorParamList;
    course: CourseResponse;
    numberOfSessions: number;
    upnextSession: string;
  };
  PlayerCourseRejectSuccess: {
    destination: keyof MainStackNavigatorParamList;
    nestedDestination?: keyof PlayerBottomTabNavigatorParamList;
    course: CourseResponse;
  };
  PlayerUpdateProfile: {
    player: Player;
  };
  PlayerMeetupRecords: undefined;

  PlayerEventDetails: {
    event?: EventResponse;
    eventId?: number;
  };
  ClubEventDetails: {
    event?: EventResponse;
    eventId?: number;
  };
  PlayerJoinEventSuccess: {
    destination: keyof MainStackNavigatorParamList;
    nestedDestination?: keyof PlayerBottomTabNavigatorParamList;
    eventId: string | number;
  };
  PlayerPaymentEvidence: {
    event: EventResponse;
  };
  PlayerSearchCourse: undefined;
  // === coach screens
  CoachNavigator: undefined;
  CoachRequestList: undefined;
  CoachUpdateProfile: {
    coach: Coach;
  };

  // 1-on-1 Coach
  CoachO3ApplyRequest: {
    o3?: O3Response;
    o3Id?: string | number;
    isAIRecommended?: boolean;
  };

  CoachO3Details: {
    o3?: O3Response;
    o3Id?: string | number;
  };

  // === admin screens
  AdminNavigator: {
    initialRouteName: AdminBottomTabNavigatorParamList;
  };
  ReviewCoachOnboardingInfo: {
    onboardResponse: OnboardingResponse;
    isAdminView: boolean;
  };
  AdminClubApproval: {
    clubResponse: ClubResponse;
  };
  AdminApproveSuccess: {
    destination: keyof MainStackNavigatorParamList;
    nestedDestination?: keyof PlayerBottomTabNavigatorParamList;
  };
  AdminRejectSuccess: {
    destination: keyof MainStackNavigatorParamList;
    nestedDestination?: keyof PlayerBottomTabNavigatorParamList;
  };

  // === organizer screens
  OrganizerNavigator: {
    initialRouteName: OrganizerBottomTabNavigatorParamList;
  };
  AddLeague: undefined;
  ManageDivision: {
    league: LeagueResponse;
    division: DivisionModel;
  };
  TeamRequest: {
    teamParam?: TeamModel;
    teamId?: number;
  };
  EditFixture: {
    groupedFixture: GroupedFixtureBySessionAndRound;
    divisionId: string | number;
  };
  UpdateLeague: {
    league: LeagueResponse;
  };
  MatchResult: {
    matchResult?: DivisionMatchResultResponse;
    isShowApproval?: boolean;
    matchResultId: string | number;
    fromTeam?: "home" | "away";
    flow?: LeagueFlow;
  };
  LeaderBoard: {
    league: LeagueResponse;
  };
  TeamViewResult: undefined;
  UpdateMatchResult: {
    matchResult: DivisionMatchResultResponse;
  };
  ResultApproval: {
    divisionId: string | number;
  };

  // === club staff screens
  ClubNavigator: undefined;
  CourseList: undefined;
  UpdateCourse: {
    course: CourseResponse;
    paymentMethodUpdated?: boolean;
  };
  ClubVenueBookingDetails: {
    venueBooking?: VenueBooking;
    venueBookingId?: string;
    flow?: "ReopenAndRefund" | "default";
  };
  ClubApprovedVenueBooking: { venueBooking: VenueBooking };
  ClubRejectedVenueBooking: undefined;
  ClubAddClub: undefined;
  ClubUpdateClub: {
    club: ClubResponse;
  };
  ClubCourseBookingDetails: {
    course?: CourseBookingResponse;
    courseId?: number;
  };
  ClubApprovedCourseBooking: {
    course: CourseBookingResponse;
  };
  ClubRejectedCourseBooking: undefined;
  ClubRejectedVenueRequest: { msg: string };
  ClubAddVenue: undefined;
  ClubAddVenueOpeningHours: { venue: CreateVenueRequest };
  ClubAddVenueSuccess: {
    venueId: number;
    venueSubmittedDetails: CreateVenueRequest;
  };
  ClubUpdateVenue: {
    venue: Venue;
  };
  ClubUpdateProfile: {
    clubStaff: ClubStaff;
  };
  ClubUpdateVenueSuccess: undefined;
  ClubVenueDetails: {
    venue: Venue;
  };
  ClubProcess: {
    club: ClubResponse;
  };
  ClubAddPaymentMethod: {
    clubId: string | number;
    editPayMethod?: ClubPaymentMethodResponse;
  };
  ClubMonthlySummary: undefined;
  ClubCoursePerformance: undefined;
  AllEvent:
    | {
        filterValue: EventFilteringForm | null;
        filterText?: string;
      }
    | undefined;
  FilterFixtureResult: {
    filterValue?: FilterResult | null | undefined;
    league: LeagueResponse;
  };
  ManageSessions: {
    course: CourseResponse;
  };
  EditSessions: {
    course: CourseResponse;
    cachedList: AddCourseSessionModel[];
    sessionList: CourseSessionsResponse[];
    isSessionListDidUpdate?: boolean;
    removedSessionIds: number[];
  };
  ReviewCoursePaymentEvidence: {
    application: CourseApplicationResponse;
  };
  ReviewEventPaymentEvidence: {
    application: EventApplication;
  };
  CourseRefund: {
    application: CourseApplicationResponse;
  };
  ApplySessions: {
    course: CourseResponse;
    sessionList: CourseSessionsResponse[];
  };
  LeagueScreenV2: undefined;
  LeagueViewV2: {
    flow: LeagueFlow;
  };
  LeagueAudienceDivision: {
    league: LeagueResponse;
    selectedDivisionId?: string | number;
  };
  AudiencePlayerStatistic: {
    division: DivisionModel;
    flow: LeagueFlow;
  };
  AudienceTeamStatistic: {
    division: DivisionModel;
    flow: LeagueFlow;
  };
  LeaguePlayerDivision: {
    division: DivisionModel;
    league: LeagueResponse;
  };
  LeaguePlayerSubmitJoinTeamRequest: {
    division: DivisionModel;
  };
  LeagueTeamManagement: {
    teamId: string | number;
    divisionId: string | number;
  };
  LeagueTeamStatisticDetail: {
    divisionId: number | string;
    teamId: number | string;
    flow: LeagueFlow;
  };
  LeagueFilteringV2: {
    flow: LeagueFlow;
    league: LeagueResponse;
    selectedDivisionId?: string | number;
    roundsData: {
      divisionId: string | number;
      round: string | number;
    }[];
  };
  LeagueFilterFixtureResultV2: {
    flow: LeagueFlow;
    results: {
      fixture: FixtureResponse;
      matchResult?: DivisionMatchResultResponse;
    }[];
  };
  LeaguePlayerIndividualStatistic: {
    divisionId: number | string;
    teamId: number | string;
    team: TeamModel;
    displayName: string;
    playerId: string;
    ranking: string | number;
    flow: LeagueFlow;
  };
  LeagueViewSubmitResults: {
    teamId: number | string;
    divisionId: number | string;
    currentUserTeam?: TeamModel;
  };
  LeagueReviewMatchResult: {
    teamId: number | string;
    divisionId: number | string;
    currentUserTeam?: TeamModel;
  };
  SubmitUpdateMatchResult: {
    matchResult: DivisionMatchResultResponse;
    fixture: FixtureResponse;
  };
  LeagueViewAllFixtureV2: {
    flow: LeagueFlow;
    divisionId: string | number;
    league: LeagueResponse;
  };
  CourseApplicationSummary: undefined;
  CourseApplicationDetails: {
    application: CourseApplicationResponse;
  };
  CourseLeaveApplicationsSummary: undefined;
  CoursePaymentEvidenceSummary: undefined;
  EventApplicationSummary: undefined;
  EventPaymentEvidenceSummary: undefined;
};

export type PlayerBottomTabNavigatorParamList = {
  // Common
  PlayerHome: undefined;
  PlayerHistory: undefined;
  PlayerMeetUp: undefined;
  PlayerCalendar: {
    defaultDateParam?: Date;
  };
  PlayerProfile: undefined;
  PlayerContent: undefined;
  MeetupRecords: undefined;
  VenueList:
    | {
        filterValue: VenueFilteringForm | null;
      }
    | undefined;
  GameList: undefined;
  EventList: undefined;
  PlayerLeague: undefined;
  LeagueScreenV2: undefined;
  // 1-on-1 coach
  PlayerO3AppliedCoach: undefined;

  // Course
  PlayerCourseList:
    | {
        filterValue: CourseFilteringFormValues | null;
      }
    | undefined;
};

export type CoachBottomTabNavigatorParamList = {
  CoachHome: undefined;
  CoachHistory: undefined;
  CoachMeetUp: undefined;
  CoachCalendar: undefined;
  CoachProfile: undefined;
  CoachRequestList: undefined;
  CoachCourseList: undefined;
  SettingsScreen: undefined;
  MeetupRecords: undefined;
  CoachContent: undefined;
  CoachLeague: undefined;
  VenueList:
    | {
        filterValue: VenueFilteringForm | null;
      }
    | undefined;
  GameList: undefined;
  EventList: undefined;
};

export type ClubBottomTabNavigatorParamList = {
  ClubHome: undefined;
  ClubManage: undefined;
  ClubCalendar: undefined;
  ClubProfile: undefined;
  ClubContent: undefined;
  StaffMeetUp: undefined;
  EventList: undefined;
  ClubCalendarScreen: undefined;
  ClubLeague: undefined;
  ClubCourseList: undefined;
  ClubVenueList: undefined;
  ClubReportScreen: undefined;
};
export type AdminBottomTabNavigatorParamList = {
  AdminUser: undefined;
  AdminClub: undefined;
  AdminContent: undefined;
  AdminPermission: undefined;
};

export type OrganizerBottomTabNavigatorParamList = {
  LeagueHome: undefined;
  OrganizerProfile: undefined;
};
