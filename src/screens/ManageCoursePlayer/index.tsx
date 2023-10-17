import {
  VStack,
  useTheme,
  Text,
  Box,
  Toast,
  HStack,
  Avatar,
  Button,
  Badge,
  Pressable,
  Divider,
} from "native-base";
import React, { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useFocusEffect } from "@react-navigation/native";

import { LayoutAnimation } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import GhostTabbar from "../../components/GhostTabBar";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";

import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";

import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { showApiToastError } from "../../components/ApiToastError";
import NoDataComponent from "../../components/NoDataComponent";
import { EventApplicationStatus } from "../../models/responses/Event";
import ImageDirectory from "../../assets";
import {
  getDisplayNameForApplication,
  getEventById,
  kickOutParticipant,
  profilePictureForApplication,
} from "../../services/EventServices";
import LogoutIcon from "../../components/Icons/LogoutIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import RemoveIcon from "../../components/Icons/RemoveIcon";
import {
  getCourseApplication,
  removeCourseApplication,
} from "../../services/CourseServices";
import { CourseApplicationStatus } from "../../models/responses/CourseApplication";
import { CourseApplicationResponse } from "../../models/responses/Course";
import { getUserName } from "../../utils/name";
import CourseApplicantDetailsCard from "../../components/CourseApplicantDetailsCard";
import { UserType } from "../../models/User";
import PencilIcon from "../../components/Icons/PencilIcon";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { useAuth } from "../../hooks/UseAuth";
import NoAccessRight from "../../components/NoAccessRight";
import EyesIcon from "../../components/Icons/EyesIcon";

export type ManageCoursePlayerProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageCoursePlayer"
>;

const t = getTranslation(["screen.ManageCoursePlayer", "constant.button"]);

enum ActiveTab {
  Existing = "Existing",
  Rejected = "Rejected",
}

export function ManageCoursePlayer({
  navigation,
  route,
}: ManageCoursePlayerProps) {
  const theme = useTheme();
  const { course } = route.params;
  // const [event, setEvent] = React.useState(course);
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);

  const [selectedRemove, setSelectedRemove] = React.useState();
  const [isOpen, setIsOpen] = React.useState({
    isLoading: false,
    isError: false,
  });
  const [showKickoutModal, setShowKickoutModal] = useState(false);
  const [kickOutModalConfirmation, setKickoutModalConfirmation] =
    useState(false);
  const availableTabs = [t(ActiveTab.Existing), t(ActiveTab.Rejected)];
  const { control, watch, setValue } = useForm({ mode: "onChange" });

  const [kickOutApplicationId, setKickOutApplicationId] = useState<
    string | number
  >();

  const {
    data: allApplications,
    isValidating: isApplicationFetching,
    error: fetchApplicationError,
    mutate: applicationsMutate,
  } = useSWR(
    formatCoreUrl(`/course/${course.id}/application`),
    () => getCourseApplication(course.id),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );
  const approvedApplications = allApplications
    ? allApplications.filter(
        (application) => application.status === CourseApplicationStatus.Approve
      )
    : [];

  const rejectedApplications = allApplications
    ? allApplications.filter(
        (application) => application.status === CourseApplicationStatus.Reject
      )
    : [];

  useFocusEffect(
    React.useCallback(() => {
      applicationsMutate();
    }, [applicationsMutate])
  );

  // const kickOutApplication = async (applicationId: string | number) => {
  //   try {
  //     await kickOutParticipant({ applicationId });
  //     Toast.show({
  //       id: "actionSuccessKick",
  //       duration: 2000,
  //       placement: "top",
  //       render: () => {
  //         return (
  //           <MessageToast
  //             type={MesssageToastType.Success}
  //             title={t("Kick out successfully")}
  //             body={t(
  //               "You have successfully kick participants out to this event"
  //             )}
  //           />
  //         );
  //       },
  //     });
  //     refresh();
  //   } catch (kickOutFailure) {
  //     showApiToastError(kickOutFailure);
  //   }
  // };

  const applicationList = (data: CourseApplicationResponse[]) => {
    const editRemoveFooter = (application: CourseApplicationResponse) => {
      return (
        <HStack space="3" mt="2">
          <Pressable
            flex="1"
            borderRadius="md"
            borderWidth="1"
            borderColor="rs.primary_purple"
            p="2"
            py="1.5"
            justifyContent="center"
            alignItems="center"
            onPress={() => {
              navigation.navigate("EditCourseSession", {
                application,
              });
            }}
          >
            <HStack space="1">
              <EyesIcon />
              <Text fontWeight="bold" color="rs.primary_purple">
                {t("Edit Sessions")}
              </Text>
            </HStack>
          </Pressable>
          <Pressable
            flex="1"
            borderRadius="md"
            borderWidth="1"
            borderColor="rs.primary_purple"
            p="2"
            py="1.5"
            justifyContent="center"
            alignItems="center"
            onPress={async () => {
              try {
                await removeCourseApplication(application.id);
                showApiToastSuccess({});
                applicationsMutate();
              } catch (error) {
                showApiToastError(error);
              }
            }}
          >
            <HStack space="2">
              <RemoveIcon />
              <Text fontWeight="bold" color="rs.primary_purple">
                {t("Remove")}
              </Text>
            </HStack>
          </Pressable>
        </HStack>
      );
    };

    return (
      <VStack mt="10" space="3">
        {data?.map((application) => {
          return (
            <VStack space="3" key={`${application.id}${application.createdAt}`}>
              <CourseApplicantDetailsCard
                shouldShowUpcommingSession
                shouldRenderStatus={activeTabIndex === 1}
                key={application.id}
                applicant={application.playerInfo}
                application={application}
                onPressApprove={async () => {}}
                onPressReject={async () => {}}
                onPressPlayerDetails={() => {
                  if (application.playerInfo)
                    navigation.navigate("UserProfileViewer", {
                      user: {
                        ...application.playerInfo,
                        userType: UserType.Player,
                      },
                    });
                }}
                footer={
                  activeTabIndex === 0
                    ? editRemoveFooter(application)
                    : undefined
                }
              />
              <Divider />
            </VStack>
          );
        })}
      </VStack>
    );
  };

  const renderExisting = () => {
    return (
      <VStack p="4">
        <Pressable
          borderRadius="5"
          onPress={() => {
            navigation.navigate("AddCoursePlayer", { courseId: course.id });
          }}
          bg="#31095E"
          justifyContent="center"
          alignItems="center"
        >
          <HStack space="3" justifyContent="center" alignItems="center">
            <Text fontSize="3xl" color="rs.white">
              +
            </Text>
            <Text
              mt="1"
              fontWeight="bold"
              color="rs.white"
              fontSize="sm"
              justifyContent="center"
              alignItems="center"
            >
              {t("Add Player")}
            </Text>
          </HStack>
        </Pressable>

        {/* Cards */}
        {applicationList(approvedApplications)}
      </VStack>
    );
  };

  const renderRejected = () => {
    if (!rejectedApplications || rejectedApplications.length === 0) {
      return <NoDataComponent />;
    }

    return (
      <VStack p="4">
        {/* Cards */}
        {applicationList(rejectedApplications)}
      </VStack>
    );
  };
  // Only Course Creator (ClubStaff or Coach that creates the course) able to manage player
  const { user } = useAuth();
  const userHasRightToAccess =
    user?.userType === UserType.ClubStaff ||
    (user?.userType === UserType.Coach && user?.id === course?.creatorId);
  if (!userHasRightToAccess) {
    return (
      <HeaderLayout
        KeyboardAwareScrollViewProps={{
          bounces: false,
        }}
        headerProps={{
          title: t("Manage Player"),
          containerStyle: { marginHorizontal: 0 },
          hasBackButton: true,
        }}
        isSticky
      >
        <NoAccessRight />
      </HeaderLayout>
    );
  }

  if (isApplicationFetching) {
    return <Loading />;
  }
  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Manage Player"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack py="defaultLayoutSpacing">
        <GhostTabbar
          isShowBottomLine
          isFlex
          defaultIndex={activeTabIndex}
          items={availableTabs}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setActiveTabIndex(index);
          }}
          activateColor={theme.colors.rs.primary_purple}
          unActivateColor={theme.colors.rs.inputLabel_grey}
          tabProps={{
            fontSize: 16,
            textAlign: "center",
            flex: 1,
          }}
        />

        {activeTabIndex === 0 && renderExisting()}
        {activeTabIndex === 1 && renderRejected()}
      </VStack>

      {/* <SingleSelectModal
        showSelectedIcon={false}
        shouldCloseAfterSelect
        title={t("Select one player to kick out")}
        options={
          event?.eventApplications
            ? event?.eventApplications
                .filter(
                  (application) =>
                    application.eventApplicationStatus ===
                    EventApplicationStatus.Approved
                )
                .map((application) => {
                  return {
                    label: getDisplayNameForApplication(application),
                    value: application.id,
                  };
                })
            : []
        }
        controllerProps={{
          name: "kickOutId",
          control,
        }}
        isOpen={showKickoutModal}
        onClose={() => {
          setShowKickoutModal(false);
        }}
        onPressItem={(item) => {
          setSelectedRemove(item.label);
          setKickoutModalConfirmation(true);
          setKickOutApplicationId(item.value);
        }}
      />
      <ConfirmationModal
        isOpen={kickOutModalConfirmation}
        alertType="Alert"
        title={t("Confirm to remove “%{name}”?", {
          name: selectedRemove || "",
        })}
        cancelText={t("Cancel")}
        confirmText={t("Confirm")}
        onConfirm={async () => {
          if (kickOutApplicationId) {
            await kickOutApplication(kickOutApplicationId);
          }
          setKickoutModalConfirmation(false);
          setShowKickoutModal(false);
        }}
        onCancel={() => {
          setKickoutModalConfirmation(false);
        }}
      /> */}
    </HeaderLayout>
  );
}
