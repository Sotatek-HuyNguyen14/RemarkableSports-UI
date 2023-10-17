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
} from "native-base";
import React, { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useFocusEffect } from "@react-navigation/native";

import { LayoutAnimation } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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
  isSinglePlayerApplicationEvent,
  kickOutParticipant,
  profilePictureForApplication,
} from "../../services/EventServices";
import LogoutIcon from "../../components/Icons/LogoutIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import RemoveIcon from "../../components/Icons/RemoveIcon";

export type ManageEventPlayerProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageEventPlayer"
>;

const t = getTranslation([
  "screen.ManageEventPlayer",
  "constant.button",
  "component.EventApplicantDetailsCard",
  "component.EventApplicantInfoCard",
]);

enum ActiveTab {
  Existing = "Existing",
  WaitingList = "WaitingList",
  Rejected = "Rejected",
}

export function ManageEventPlayer({
  navigation,
  route,
}: ManageEventPlayerProps) {
  const theme = useTheme();
  const { event: localEvent } = route.params;
  const [event, setEvent] = React.useState(localEvent);
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);

  const [selectedRemove, setSelectedRemove] = React.useState();
  const [isOpen, setIsOpen] = React.useState({
    isLoading: false,
    isError: false,
  });
  const [showKickoutModal, setShowKickoutModal] = useState(false);
  const [kickOutModalConfirmation, setKickoutModalConfirmation] =
    useState(false);
  const availableTabs = [
    t(ActiveTab.Existing),
    t(ActiveTab.WaitingList),
    t(ActiveTab.Rejected),
  ];
  const { control, watch, setValue } = useForm({ mode: "onChange" });

  const [kickOutApplicationId, setKickOutApplicationId] = useState<
    string | number
  >();

  const refresh = React.useCallback(() => {
    setIsOpen((prev) => ({ ...prev, isLoading: true }));
    getEventById(localEvent.id)
      .then((data) => {
        setIsOpen((prev) => ({ isLoading: false, isError: false }));
        if (JSON.stringify(event) !== JSON.stringify(data)) {
          setEvent(data);
        }
      })
      .catch((e) => {
        setIsOpen((prev) => ({ isLoading: false, isError: true }));
        console.log("e", e);
      });
  }, [event, localEvent.id]);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const kickOutApplication = async (applicationId: string | number) => {
    try {
      await kickOutParticipant({ applicationId });
      Toast.show({
        id: "actionSuccessKick",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={t("Kick out successfully")}
              body={t(
                "You have successfully kick participants out to this event"
              )}
            />
          );
        },
      });
      refresh();
    } catch (kickOutFailure) {
      showApiToastError(kickOutFailure);
    }
  };

  const renderExisting = () => {
    const memberData = event?.eventApplications.filter(
      (applicant) =>
        applicant.eventApplicationStatus === EventApplicationStatus.Approved
    );
    if (!memberData?.length) {
      return (
        <VStack p="4">
          <Button
            py="1.5"
            borderRadius="5"
            onPress={() => {
              if (event) {
                navigation.navigate("AddParticipant", { event });
              }
            }}
          >
            <HStack space={3}>
              <Text color="rs.white">+ {t("Add Player")}</Text>
            </HStack>
          </Button>
        </VStack>
      );
    }

    return (
      <VStack p="4">
        <Button
          py="1.5"
          borderRadius="5"
          onPress={() => {
            if (event) {
              navigation.navigate("AddParticipant", { event });
            }
          }}
        >
          <HStack space={3}>
            <Text color="rs.white">+ {t("Add Player")}</Text>
          </HStack>
        </Button>
        {memberData.map((applicant) => {
          // if Creator add Participants show logo
          const isCreatorAdd =
            event.creator.id === applicant.applicant.id &&
            applicant.eventParticipants?.length > 0;
          const profileImage = isCreatorAdd
            ? ImageDirectory.LOGO_SPLASH
            : profilePictureForApplication(applicant);
          const displayName = getDisplayNameForApplication(applicant);
          const shouldShowAvt = applicant.teamName === null;
          return (
            <HStack
              justifyContent="space-between"
              borderBottomColor="rs.lightGrey"
              borderBottomWidth={1}
              py="4"
            >
              <HStack space={2.5}>
                {shouldShowAvt && (
                  <Avatar
                    size="sm"
                    source={
                      profileImage === ImageDirectory.LOGO_SPLASH
                        ? ImageDirectory.LOGO_SPLASH
                        : {
                            uri: formatFileUrl(profileImage),
                          }
                    }
                  >
                    {applicant.applicant?.firstName}
                  </Avatar>
                )}
                <VStack space="1">
                  <Text
                    fontSize="md"
                    numberOfLines={2}
                    fontWeight={applicant.teamName ? "bold" : "normal"}
                  >{`${displayName.slice(
                    0,
                    displayName.length > 20
                      ? displayName.length / 2
                      : displayName.length
                  )}${displayName.length > 20 ? "..." : ""}`}</Text>
                  {/* Team info */}
                  {applicant.teamName &&
                    applicant.eventParticipants &&
                    applicant.eventParticipants.length > 0 &&
                    applicant.eventParticipants.map((participant) => {
                      return (
                        <Text fontSize="md" color="rs.GPP_grey">
                          {participant.participantName}
                        </Text>
                      );
                    })}
                  {/* Team show applicant info */}
                  {applicant.teamName &&
                    applicant.eventParticipants &&
                    applicant.eventParticipants.length > 0 &&
                    applicant.isOnline && (
                      <Pressable
                        _pressed={{ opacity: 0.5 }}
                        onPress={() => {
                          navigation.navigate("UserProfileViewer", {
                            user: {
                              ...applicant.applicant,
                            },
                          });
                        }}
                      >
                        <Text color="rs.primary_purple">
                          {t("Applicant details")}
                          {">"}
                        </Text>
                      </Pressable>
                    )}
                  {isSinglePlayerApplicationEvent(applicant) &&
                    applicant.isOnline && (
                      <Pressable
                        onPress={() => {
                          navigation.navigate("UserProfileViewer", {
                            user: {
                              ...applicant.applicant,
                              userType: applicant.applicant.userType,
                            },
                          });
                        }}
                      >
                        <Text color="rs.primary_purple">{`${t(
                          "Player details"
                        )} >`}</Text>
                      </Pressable>
                    )}
                </VStack>
              </HStack>
              <Button
                variant="outline"
                py="1.5"
                borderRadius="5"
                px="8"
                alignItems="center"
                _text={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "rs.primary_purple",
                }}
                _pressed={{
                  _icon: {
                    strokeColor: "#FFFFFF",
                  },
                }}
                h="10"
                onPress={() => {
                  setSelectedRemove(getDisplayNameForApplication(applicant));
                  setKickoutModalConfirmation(true);
                  setKickOutApplicationId(applicant.id);
                }}
                leftIcon={<RemoveIcon />}
              >
                {t("Remove")}
              </Button>
            </HStack>
          );
        })}
      </VStack>
    );
  };

  const renderWaitingList = () => {
    const memberData = event?.eventApplications.filter(
      (applicant) =>
        applicant.eventApplicationStatus === EventApplicationStatus.WaitingList
    );

    if (!memberData?.length) {
      return <NoDataComponent />;
    }

    return (
      <VStack p="4">
        {memberData.map((applicant) => {
          // if Creator add Participants show logo
          const isCreatorAdd =
            event.creator.id === applicant.applicant.id &&
            applicant.eventParticipants?.length > 0;
          const profileImage = isCreatorAdd
            ? ImageDirectory.LOGO_SPLASH
            : profilePictureForApplication(applicant);
          const displayName = getDisplayNameForApplication(applicant);
          const shouldShowAvt = applicant.teamName === null;
          return (
            <HStack
              justifyContent="space-between"
              borderBottomColor="rs.lightGrey"
              borderBottomWidth={1}
              py="4"
            >
              <HStack space={2.5}>
                {shouldShowAvt && (
                  <Avatar
                    size="sm"
                    source={
                      profileImage === ImageDirectory.LOGO_SPLASH
                        ? ImageDirectory.LOGO_SPLASH
                        : {
                            uri: formatFileUrl(profileImage),
                          }
                    }
                  >
                    {applicant.applicant?.firstName}
                  </Avatar>
                )}
                <VStack space="1">
                  <Text
                    fontSize="md"
                    numberOfLines={2}
                    fontWeight={applicant.teamName ? "bold" : "normal"}
                  >{`${displayName.slice(
                    0,
                    displayName.length > 20
                      ? displayName.length / 2
                      : displayName.length
                  )}${displayName.length > 20 ? "..." : ""}`}</Text>
                  {/* Team info */}
                  {applicant.teamName &&
                    applicant.eventParticipants &&
                    applicant.eventParticipants.length > 0 &&
                    applicant.eventParticipants.map((participant) => {
                      return (
                        <Text fontSize="md" color="rs.GPP_grey">
                          {participant.participantName}
                        </Text>
                      );
                    })}
                  {/* Team show applicant info */}
                  {applicant.teamName &&
                    applicant.eventParticipants &&
                    applicant.eventParticipants.length > 0 &&
                    applicant.isOnline && (
                      <Pressable
                        _pressed={{ opacity: 0.5 }}
                        onPress={() => {
                          navigation.navigate("UserProfileViewer", {
                            user: {
                              ...applicant.applicant,
                            },
                          });
                        }}
                      >
                        <Text color="rs.primary_purple">
                          {t("Applicant details")}
                          {">"}
                        </Text>
                      </Pressable>
                    )}
                  {isSinglePlayerApplicationEvent(applicant) &&
                    applicant.isOnline && (
                      <Pressable
                        onPress={() => {
                          navigation.navigate("UserProfileViewer", {
                            user: {
                              ...applicant.applicant,
                              userType: applicant.applicant.userType,
                            },
                          });
                        }}
                      >
                        <Text color="rs.primary_purple">{`${t(
                          "Player details"
                        )} >`}</Text>
                      </Pressable>
                    )}
                </VStack>
              </HStack>
              <Button
                variant="outline"
                py="1.5"
                borderRadius="5"
                px="8"
                alignItems="center"
                _text={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "rs.primary_purple",
                }}
                _pressed={{
                  _icon: {
                    strokeColor: "#FFFFFF",
                  },
                }}
                h="10"
                onPress={() => {
                  setSelectedRemove(getDisplayNameForApplication(applicant));
                  setKickoutModalConfirmation(true);
                  setKickOutApplicationId(applicant.id);
                }}
                leftIcon={<RemoveIcon />}
              >
                {t("Remove")}
              </Button>
            </HStack>
          );
        })}
      </VStack>
    );
  };

  const renderRejected = () => {
    const rejectedData = event?.eventApplications.filter(
      (applicant) =>
        applicant.eventApplicationStatus === EventApplicationStatus.Rejected
    );
    if (!rejectedData?.length) {
      return <NoDataComponent />;
    }

    return (
      <VStack space="3" p="defaultLayoutSpacing">
        {rejectedData.map((applicant) => {
          const isCreatorAdd =
            event.creator.id === applicant.applicant.id &&
            applicant.eventParticipants?.length > 0;
          const profileImage = isCreatorAdd
            ? ImageDirectory.LOGO_SPLASH
            : profilePictureForApplication(applicant);
          const displayName = getDisplayNameForApplication(applicant);
          const shouldShowAvt = applicant.teamName === null;
          return (
            <HStack
              justifyContent="space-between"
              borderBottomColor="rs.lightGrey"
              borderBottomWidth={1}
              py="4"
              alignItems="center"
            >
              <HStack space={2.5}>
                {shouldShowAvt && (
                  <Avatar
                    size="sm"
                    source={
                      profileImage === ImageDirectory.LOGO_SPLASH
                        ? ImageDirectory.LOGO_SPLASH
                        : {
                            uri: formatFileUrl(profileImage),
                          }
                    }
                  >
                    {applicant.applicant?.firstName}
                  </Avatar>
                )}
                <VStack space="1">
                  <Text
                    fontSize="md"
                    numberOfLines={2}
                    fontWeight={applicant.teamName ? "bold" : "normal"}
                  >{`${displayName.slice(
                    0,
                    displayName.length > 20
                      ? displayName.length / 2
                      : displayName.length
                  )}${displayName.length > 20 ? "..." : ""}`}</Text>
                  {/* Team info */}
                  {applicant.teamName &&
                    applicant.eventParticipants &&
                    applicant.eventParticipants.length > 0 &&
                    applicant.eventParticipants.map((participant) => {
                      return (
                        <Text fontSize="md" color="rs.GPP_grey">
                          {participant.participantName}
                        </Text>
                      );
                    })}
                </VStack>
              </HStack>
              <Text color="rs_secondary.error" fontWeight="bold">
                {t("Rejected")}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    );
  };

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
        {activeTabIndex === 1 && renderWaitingList()}
        {activeTabIndex === 2 && renderRejected()}
      </VStack>

      <SingleSelectModal
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
        shouldRenderIcon
        alertType="Fail"
        isOpen={kickOutModalConfirmation}
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
      />
    </HeaderLayout>
  );
}
