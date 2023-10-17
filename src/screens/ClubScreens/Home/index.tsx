import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CompositeNavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import useSWR from "swr";
import axios from "axios";
import {
  Heading,
  HStack,
  IconButton,
  Text,
  VStack,
  Pressable,
  Spinner,
  useTheme,
  Avatar,
  Box,
  Divider,
} from "native-base";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { LayoutAnimation } from "react-native";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import {
  ClubBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
} from "../../../routers/Types";
import { VenueBooking, VenueBookingStatus } from "../../../models/Booking";
import { getTranslation } from "../../../utils/translation";
import {
  formatCoreUrl,
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../../services/ServiceUtil";
import { MEET_UP_COURSE } from "../../../services/CourseBookingServices";
import {
  CourseBookingResponse,
  CourseBookingStatus,
} from "../../../models/Response";
import BannerButton from "../../../components/BannerButton";
import GhostTabbar from "../../../components/GhostTabBar";
import { useAuth } from "../../../hooks/UseAuth";
import {
  ClubApplicationResponse,
  ClubRelationship,
} from "../../../models/responses/Club";
import ClubShortProfile from "../../../components/ClubShortProfile";
import { ClubStatusType } from "../../../models/requests/Club";
import { ClubStaff } from "../../../models/User";
import CreateJoinClub from "./CreateJoinClub";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import NotificationBellIcon from "../../../components/Icons/NotificationBellIcon";
import useNotification from "../../../hooks/UseNotification";
import { showApiToastError } from "../../../components/ApiToastError";
import { getUserName, truncate } from "../../../utils/name";
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import Loading from "../../../components/Loading";
import ChatBotIcon from "../../../components/Icons/ChatBotIcon";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import {
  cancelClubRequest,
  deleteClub,
  getClubApplication,
} from "../../../services/ClubServices";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import RightArrowIcon from "../../../components/Icons/RightArrowIcon";
import { getClubCourseSummary } from "../../../services/CourseServices";
import { getClubEventSummary } from "../../../services/EventServices";

const t = getTranslation([
  "screen.ClubScreens.Home",
  "screen.ClubHomeV2",
  "constant.button",
  "constant.dummyUser",
]);

export type ClubHomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ClubBottomTabNavigatorParamList, "ClubHome">,
  NativeStackNavigationProp<MainStackNavigatorParamList>
>;

interface ClubHomeScreenNavigationProps {
  navigation: ClubHomeNavigationProp;
}

let IS_NOTI_SET_UP = false;

export default function Home({ navigation }: ClubHomeScreenNavigationProps) {
  const CREATE_BUTTON_LIST = [
    { label: t("Course"), value: "Course", id: 0 },
    { label: t("Event"), value: "Event", id: 1 },
    { label: t("Venue"), value: "Venue", id: 3 },
  ];
  const [selectedTab, setSelectedTab] = useState<string>(t("Course"));
  const { user, updateUserInfo } = useAuth();

  const staff = user as ClubStaff;
  const {
    data: clubApplication,
    isValidating: clubApplicationValidating,
    mutate: clubApplicationMutate,
    error,
  } = useSWR<ClubApplicationResponse>(
    staff ? formatCoreUrl(`/club/${staff.club?.id}/application`) : null,
    () => getClubApplication(staff.club.id),
    {
      onErrorRetry: () => {},
      shouldRetryOnError: false,
    }
  );

  const {
    data: clubCourseSummary,
    isValidating: clubCourseSummaryValidating,
    mutate: courseSummaryMutate,
  } = useSWR(formatCoreUrl("/course/summary"), () => getClubCourseSummary());

  const totalCourseApplications = useMemo(() => {
    if (!clubCourseSummary) {
      return 0;
    }
    let result = 0;
    clubCourseSummary.courseApplicationSummaries.forEach((summary) => {
      result += summary.courseApplications.length;
    });
    return result;
  }, [clubCourseSummary]);

  const totalCourseLeaveRequests = useMemo(() => {
    if (!clubCourseSummary) {
      return 0;
    }
    let result = 0;
    clubCourseSummary.courseLeaveApplicationSummaries.forEach((summary) => {
      result += summary.leaveRequests.length;
    });
    return result;
  }, [clubCourseSummary]);

  const totalCoursePaymentEvidences = useMemo(() => {
    if (!clubCourseSummary) {
      return 0;
    }
    let result = 0;
    clubCourseSummary.coursePaymentEvidenceSummaries.forEach((summary) => {
      result += summary.paymentEvidences.length;
    });
    return result;
  }, [clubCourseSummary]);

  const {
    data: clubEventSummary,
    isValidating: clubEventSummaryValidating,
    mutate: eventSummaryMutate,
  } = useSWR(formatCoreUrl("/event/summary"), () => getClubEventSummary());

  useFocusEffect(
    React.useCallback(() => {
      courseSummaryMutate();
      eventSummaryMutate();
    }, [courseSummaryMutate, eventSummaryMutate])
  );

  const totalEventAplications = useMemo(() => {
    if (!clubEventSummary) {
      return 0;
    }
    let result = 0;
    clubEventSummary.eventApplicationSummary.forEach((summary) => {
      result += summary.eventApplications.length;
    });
    return result;
  }, [clubEventSummary]);

  const totalEventPaymentEvidences = useMemo(() => {
    if (!clubEventSummary) {
      return 0;
    }
    let result = 0;
    clubEventSummary.eventPaymentEvidenceSummary.forEach((summary) => {
      result += summary.paymentEvidences.length;
    });
    return result;
  }, [clubEventSummary]);

  const isLoading =
    clubCourseSummaryValidating ||
    clubApplicationValidating ||
    clubEventSummaryValidating;

  const chatBotSection = () => {
    return (
      <Pressable
        onPress={() => {
          navigation.navigate("ChatGPT");
        }}
      >
        <HStack
          bg="#66CEE180"
          space="2"
          p="4"
          justifyContent="center"
          alignItems="center"
          borderRadius="xl"
        >
          <ChatBotIcon />
          <Text fontSize="md" fontWeight="bold">
            {t("Talk with \nChatPingPong")}
          </Text>
        </HStack>
      </Pressable>
    );
  };

  const isTrial = user?.is_trial;
  const appliedStatus = staff?.applyClubStatus || staff?.club?.approvalStatus;
  const shouldDisplayAlternativeScreen =
    appliedStatus !== ClubStatusType.Approved;
  const { colors } = useTheme();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [cancelModalOpen, setCancelModal] = useState(false);
  const [deleteModalOpen, setDeleteModal] = useState(false);
  const [verifyModalOpen, setVerifyModalOpenl] = useState(isTrial);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { updateNotification } = useNotification();

  const setUpNotificationPostLogin = async () => {
    try {
      await updateNotification();
    } catch (e) {
      console.log("Ignored", e);
    }
  };

  if (!IS_NOTI_SET_UP) {
    IS_NOTI_SET_UP = true;
    setUpNotificationPostLogin();
  }

  const boxSection = (
    title: string,
    notifications: number,
    onPress: () => void
  ) => {
    return (
      <Pressable
        key={`${title}_${notifications}`}
        onPress={() => {
          onPress();
        }}
      >
        <HStack
          borderRadius="lg"
          borderWidth="1"
          borderColor="rs.black"
          alignItems="center"
          px="5"
          py="4"
          justifyContent="space-between"
        >
          <Text fontSize="md" fontWeight="bold">
            {title}
          </Text>
          <HStack alignItems="center" space="2">
            <HStack
              bg="#81CCDE"
              borderRadius="full"
              w="6"
              h="6"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontWeight="bold" color="rs.white">
                {notifications}
              </Text>
            </HStack>

            <RightArrowIcon />
          </HStack>
        </HStack>
      </Pressable>
    );
  };

  const courseInformationSection = () => {
    return (
      <VStack space="2" mt="3">
        <Pressable
          onPress={() => {
            navigation.navigate("ClubCourseList");
          }}
        >
          <HStack alignItems="center" justifyContent="space-between">
            <Heading fontSize="lg" color="rs.primary_purple">
              {t("Course")}
            </Heading>
            <RightArrowIcon />
          </HStack>
        </Pressable>
        <Divider />
        <VStack space="2">
          {[
            {
              title: t("Applications"),
              number: totalCourseApplications,
              onPress: () => {
                navigation.navigate("CourseApplicationSummary");
              },
            },
            {
              title: t("Leave Applications"),
              number: totalCourseLeaveRequests,
              onPress: () => {
                navigation.navigate("CourseLeaveApplicationsSummary");
              },
            },
            {
              title: t("Payment Evidences"),
              number: totalCoursePaymentEvidences,
              onPress: () => {
                navigation.navigate("CoursePaymentEvidenceSummary");
              },
            },
          ].map((section) => {
            return boxSection(section.title, section.number, section.onPress);
          })}
        </VStack>
      </VStack>
    );
  };

  const eventInformationSection = () => {
    return (
      <VStack space="2" mt="3">
        <Pressable
          onPress={() => {
            navigation.navigate("EventList");
          }}
        >
          <HStack alignItems="center" justifyContent="space-between">
            <Heading fontSize="lg" color="rs.primary_purple">
              {t("Event")}
            </Heading>
            <RightArrowIcon />
          </HStack>
        </Pressable>
        <Divider />
        <VStack space="2">
          {[
            {
              title: t("Applications"),
              number: totalEventAplications,
              onPress: () => {
                navigation.navigate("EventApplicationSummary");
              },
            },
            {
              title: t("Payment Evidences"),
              number: totalEventPaymentEvidences,
              onPress: () => {
                navigation.navigate("EventPaymentEvidenceSummary");
              },
            },
          ].map((section) => {
            return boxSection(section.title, section.number, section.onPress);
          })}
        </VStack>
      </VStack>
    );
  };

  const clubHomeV2 = () => {
    return (
      <VStack space="3" mx="defaultLayoutSpacing">
        <Box>{chatBotSection()}</Box>
        {/* Course section */}
        {courseInformationSection()}
        {/* Event section */}
        {eventInformationSection()}
      </VStack>
    );
  };

  if (isLoading) {
    return <Loading />;
  }
  return (
    <HeaderLayout
      headerProps={{
        title: t("Remarkable Sports"),
        rightComponent: (
          <IconButton
            onPress={() => {
              navigation.navigate("NotificationCentre");
            }}
            icon={<NotificationBellIcon />}
          />
        ),
        headerLabelStyle: { fontSize: 24 },
        headerLabelContainerStyle: { alignItems: "flex-start" },
      }}
    >
      {shouldDisplayAlternativeScreen && staff ? (
        <CreateJoinClub
          navigation={navigation}
          staff={staff}
          onCancel={() => {
            setCancelModal(true);
          }}
          onDelete={() => {
            setDeleteModal(true);
          }}
          onEdit={() => {
            if (staff.club)
              navigation.navigate("ClubUpdateClub", {
                club: staff.club,
              });
          }}
        />
      ) : (
        clubHomeV2()
      )}
      {clubApplication && (
        <ConfirmationModal
          alertType="Fail"
          confirmText={t("Confirm")}
          cancelText={t("Cancel")}
          isOpen={cancelModalOpen}
          onCancel={() => {
            setCancelModal(false);
          }}
          title={t("Confirm to cancel join request?")}
          onConfirm={async () => {
            setCancelModal(false);
            try {
              await cancelClubRequest({
                clubId: clubApplication.clubId,
                applicationId: clubApplication.applicationId,
              });
              showApiToastSuccess({
                title: t("Cancel successfuly"),
                body: "",
              });
              clubApplicationMutate();
              updateUserInfo();
            } catch (ee) {
              showApiToastError(ee);
            }
          }}
        />
      )}
      {staff?.clubRelationship === ClubRelationship.Admin &&
        (staff.applyClubStatus === ClubStatusType.Pending ||
          staff.club?.approvalStatus === ClubStatusType.Pending) && (
          <ConfirmationModal
            alertType="Fail"
            confirmText={t("Confirm")}
            cancelText={t("Cancel")}
            isOpen={deleteModalOpen}
            onCancel={() => {
              setDeleteModal(false);
            }}
            title={t("Confirm to delete club?")}
            onConfirm={async () => {
              setDeleteModal(false);
              try {
                if (staff.club?.id) await deleteClub(staff.club.id);
                showApiToastSuccess({
                  title: t("Delete successfuly"),
                  body: "",
                });
                clubApplicationMutate();
                updateUserInfo();
              } catch (err) {
                console.log("error:", err);
                showApiToastError(err);
              }
            }}
          />
        )}

      {isTrial && (
        <ConfirmationModal
          alertType="Alert"
          confirmText={t("Verify")}
          cancelText={t("Skip")}
          isOpen={verifyModalOpen}
          onCancel={() => {
            setVerifyModalOpenl(false);
          }}
          title={t("Trial Account")}
          description={t(
            "Click Verify to convert your trial account to a verified account"
          )}
          onConfirm={() => {
            setVerifyModalOpenl(false);
            navigation.navigate("ChangeEmail");
          }}
        />
      )}
      {isTrial && (
        <ConfirmationModal
          alertType="Alert"
          confirmText={t("Update")}
          cancelText={t("Skip")}
          isOpen={profileModalOpen}
          onCancel={() => {
            setProfileModalOpen(false);
          }}
          title={t("Getting Started")}
          description={t(
            "Update your profile to connect with other players, coaches and clubs"
          )}
          onConfirm={() => {
            // to do
          }}
        />
      )}
    </HeaderLayout>
  );
}
