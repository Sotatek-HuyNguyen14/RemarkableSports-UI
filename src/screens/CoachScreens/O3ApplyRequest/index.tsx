import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Pressable,
  Text,
  Toast,
  useTheme,
  VStack,
} from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { action } from "mobx";
import useSWR from "swr";
import FormInput from "../../../components/FormInput/FormInput";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import {
  applyRequest,
  O3CoachingAction,
  o3HideMeetup,
  o3CoachAcceptRejectMeetup,
  queryO3MeetupsById,
} from "../../../services/O3Services";
import FormSwitch from "../../../components/Switch/FormSwitch";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import PlayerShortProfile from "../../../components/PlayerShortProfile";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { useAuth } from "../../../hooks/UseAuth";
import {
  O3MeetupStatus,
  O3Response,
} from "../../../models/responses/O3Response";
import {
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../../services/ServiceUtil";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { showApiToastError } from "../../../components/ApiToastError";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import LocationIcon from "../../../components/Icons/LocationIcon";
import ClockIcon from "../../../components/Icons/ClockIcon";
import MoneyIcon from "../../../components/Icons/MoneyIcon";
import { formatName, getUserName } from "../../../utils/name";
import { UserType } from "../../../models/User";
import TipIcon from "../../../components/Icons/TipIcon";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import { getUserInfo } from "../../../services/AuthServices";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../../constants/constants";

export type O3CoachRequestScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "CoachO3ApplyRequest"
>;
export type O3CoachRequestScreenRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "CoachO3ApplyRequest"
>;
interface O3CoachRequestScreenNavigationProps {
  navigation: O3CoachRequestScreenNavigationProp;
  route: O3CoachRequestScreenRouteProp;
}
const t = getTranslation([
  "screen.CoachScreens.O3ApplyRequest",
  "constant.button",
  "constant.district",
  "validation",
  "constant.profile",
]);
export default function O3ApplyRequest({
  navigation,
  route,
}: O3CoachRequestScreenNavigationProps) {
  const { space } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const { o3, o3Id } = route.params;
  const [acceptRequestOpen, setAcceptRequestOpen] = useState(false);
  const [rejectRequestOpen, setRejectRequestOpen] = useState(false);

  const {
    data: o3Data,
    error: fetchError,
    isValidating,
    mutate,
  } = useSWR<O3Response>(
    !o3 && o3Id ? formatMeetupApiUrl(`/1on1/${o3Id}`) : null,
    () => queryO3MeetupsById(o3Id)
  );

  const o3Result = o3 || o3Data;

  const {
    control,
    handleSubmit,
    watch,
    unregister,
    formState: { isValid, isSubmitting },
  } = useForm({ mode: "onChange" });
  const isProvideVenue = watch("isProvideVenue");

  let isInvalid = false;

  if (o3Result?.status !== O3MeetupStatus.Pending) {
    isInvalid = true;
  } else if (o3Result?.endTime) {
    isInvalid = o3Result?.endTime?.getTime() < new Date().getTime();
  }

  const onSubmit = async (formValue: any) => {
    if (o3Result) {
      try {
        await applyRequest(o3Result.id, formValue.fee, formValue.venue);
        // onAlert();
        showApiToastSuccess({
          title: t("Applied request"),
          body: t("You have successfully applied the request"),
        });
        navigation.reset({
          index: 1,
          routes: [
            {
              name: "CoachNavigator",
            },
            {
              name: "PlayerO3AppliedCoachDetails",
              params: {
                o3CoachId: o3?.id,
                isForceBackToPlayerMeetupList: false,
              },
            },
          ],
        });
      } catch (error) {
        showApiToastError(error);
      }
    }
  };

  const { user } = useAuth();
  const [isHidePlayerRequesting, setHidePlayerRequesting] = useState(false);

  const onHidePlayer = async () => {
    if (user?.id && o3Result) {
      try {
        setHidePlayerRequesting(true);
        await o3HideMeetup(o3Result.id, user?.id, O3CoachingAction.HideMeeting);
        setHidePlayerRequesting(false);
        Toast.show({
          id: "hideCoachSuccess",
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Successfully hide player")}
              />
            );
          },
        });
        navigation.goBack();
      } catch (hidePlayerError) {
        setHidePlayerRequesting(false);
        showApiToastError(hidePlayerError);
      }
    }
  };
  useEffect(() => {
    if (!isProvideVenue) {
      unregister("venue");
    }
  }, [isProvideVenue, unregister]);
  const onAlert = () => {
    setIsOpen((pre) => !pre);
  };

  const handUsed = o3Result?.playerInfo.handUsed;

  const level = o3Result?.playerInfo.playerLevel
    ? t(o3Result?.playerInfo.playerLevel)
    : "-";
  const hand = t(`${handUsed} Hand`);
  const rank = o3Result?.playerInfo.ranking || t("No Rank");
  const levelRanking =
    `${level} (${rank})` === "- (-)" ? "-" : `${level} (${rank})`;

  const aiPrice = o3Result?.proposedFee;
  // const isAIMeetup = isAIRecommended || false;

  const price =
    o3Result?.isByAI && o3Result?.minTuitionFee
      ? `${o3Result?.minTuitionFee} - ${o3Result?.maxTuitionFee} ${t("HK$")}`
      : `${t("HK$")} ${aiPrice}`;

  const isOther = o3Result?.isOthers || false;
  const isByAI = o3Result?.isByAI || false;

  const shouldShowApply = (!isOther && isByAI) || isOther;
  const shouldShowApproveReject = !isOther && !isByAI;

  const acceptRequest = async (formValue: any) => {
    setAcceptRequestOpen(false);
    if (o3Result && user) {
      try {
        await o3CoachAcceptRejectMeetup({
          action: O3CoachingAction.CoachAcceptRequest,
          parameters: {
            coachId: user?.id,
            venue: formValue.venue,
          },
          meetupId: o3Result?.id,
        });
        if (o3Result) {
          navigation.reset({
            index: 1,
            routes: [
              {
                name: "CoachNavigator",
              },
              {
                name: "PlayerO3AppliedCoachDetails",
                params: {
                  o3CoachId: o3?.id,
                  isCoachApproveRejectFlow: true,
                  isForceBackToPlayerMeetupList: false,
                },
              },
            ],
          });
        }
        showApiToastSuccess({
          title: t("Request accepted"),
          body: t("You have successfully accept the request"),
        });
      } catch (error) {
        showApiToastError(error);
      }
    }
  };

  const rejectRequest = async (formValue: any) => {
    setRejectRequestOpen(false);
    if (o3Result && user) {
      try {
        await o3CoachAcceptRejectMeetup({
          action: O3CoachingAction.CoachRejectRequest,
          parameters: {
            coachId: user?.id,
            venue: formValue.venue,
          },
          meetupId: o3Result?.id,
        });
        if (o3Result) {
          navigation.reset({
            index: 1,
            routes: [
              {
                name: "CoachNavigator",
              },
              {
                name: "PlayerO3AppliedCoachDetails",
                params: {
                  o3CoachId: o3?.id,
                  isForceBackToPlayerMeetupList: false,
                },
              },
            ],
          });
        }
        showApiToastSuccess({
          title: t("Request rejected"),
          body: t("You have rejected the request"),
          type: MesssageToastType.Reject,
        });
      } catch (error) {
        showApiToastError(error);
      }
    }
  };

  const footer = () => {
    if (shouldShowApproveReject) {
      return (
        <VStack space="4" w="100%" mt="auto">
          <Button
            isDisabled={!isValid || isHidePlayerRequesting}
            isLoading={isSubmitting}
            isLoadingText={t("Loading")}
            onPress={() => {
              setAcceptRequestOpen(true);
            }}
            bg={APPROVE_BUTTON_COLOR}
          >
            {t("Accept")}
          </Button>
          <Button
            isDisabled={isHidePlayerRequesting || isSubmitting}
            isLoading={isHidePlayerRequesting}
            isLoadingText={t("Loading")}
            variant="outline"
            onPress={() => {
              setRejectRequestOpen(true);
            }}
            _text={{ color: REJECT_BUTTON_COLOR }}
            borderColor={REJECT_BUTTON_COLOR}
          >
            {t("Reject")}
          </Button>
        </VStack>
      );
    }

    if (shouldShowApply) {
      return (
        <VStack space="4" mt="auto" w="100%">
          <Button
            isDisabled={!isValid || isHidePlayerRequesting}
            isLoading={isSubmitting}
            isLoadingText={t("Loading")}
            onPress={handleSubmit(onSubmit)}
          >
            {t("Apply")}
          </Button>
          {/* <Button
          isDisabled={isHidePlayerRequesting || isSubmitting}
          isLoadingText={t("Loading")}
          variant="outline"
          onPress={onHidePlayer}
        >
          {t("Hide")}
        </Button> */}
        </VStack>
      );
    }
  };

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Request details"),
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{
        marginHorizontal: space.defaultLayoutSpacing,
      }}
    >
      {isValidating && <Loading />}
      {!isValidating && (fetchError || !o3Result) && <ErrorMessage />}
      {o3Result && (
        <VStack space={3} flex={1} py="defaultLayoutSpacing">
          <Heading>{t("Information")}</Heading>
          <HStack space="2" alignItems="center">
            <CalendarIcon />
            <Text fontSize="xs" fontWeight="normal">
              {`${formatUtcToLocalDate(o3Result.fromTime)}`}
            </Text>
          </HStack>
          <HStack space="2" alignItems="center">
            <ClockIcon />
            <Text fontSize="xs" fontWeight="normal">
              {formatUtcToLocalTime(o3Result.fromTime)}
              {" - "}
              {formatUtcToLocalTime(o3Result.endTime)}
            </Text>
          </HStack>
          <HStack space="2" alignItems="center">
            <LocationIcon />
            <Text fontSize="xs" fontWeight="normal">
              {t(o3Result.district)}
            </Text>
          </HStack>

          <HStack space="2" alignItems="center">
            <MoneyIcon />
            <Text fontSize="xs" fontWeight="normal">
              {price}
            </Text>
          </HStack>

          <Heading>{t("Applicant")}</Heading>

          {o3Result.playerInfo && (
            <HStack space="3" alignItems="flex-start" flexWrap="wrap">
              <Avatar
                size="sm"
                source={
                  o3Result?.playerInfo.profilePicture
                    ? {
                        uri: formatFileUrl(o3Result?.playerInfo.profilePicture),
                      }
                    : undefined
                }
              >
                {o3Result?.playerInfo.firstName}
              </Avatar>
              <VStack space="2" flex="1">
                <HStack space="2" alignItems="center" flexWrap="wrap">
                  {o3Result?.playerInfo.firstName &&
                    o3Result?.playerInfo.lastName && (
                      <Heading>{getUserName(o3Result?.playerInfo)}</Heading>
                    )}
                  <Badge
                    px="2"
                    py="2"
                    borderRadius="full"
                    bg="#66CEE133"
                    alignSelf="flex-start"
                  >
                    <Text>{`${hand} (${t(o3Result.playerInfo.blade)})`}</Text>
                  </Badge>
                </HStack>
                <Text>{levelRanking}</Text>

                <Pressable
                  onPress={() =>
                    navigation.navigate("UserProfileViewer", {
                      user: {
                        ...o3Result.playerInfo,
                        userType: UserType.Player,
                      },
                    })
                  }
                >
                  <Text
                    fontWeight="bold"
                    fontSize="md"
                    color="rs.primary_purple"
                  >
                    {t("View profile")}
                  </Text>
                </Pressable>
              </VStack>
            </HStack>
          )}

          <VStack space={4} mt={4}>
            {o3Result.venue && (
              <Box>
                <Text fontSize="md" fontWeight="bold">
                  {t("Address")}
                </Text>
                <Text>{`${o3Result.venue}`}</Text>
              </Box>
            )}

            {!o3Result.venue && !isInvalid && (
              <Box>
                <FormSwitch
                  title={t("Do you have a venue?")}
                  onText={t("Yes")}
                  offText={t("No")}
                  controllerProps={{
                    name: "isProvideVenue",
                    control,
                  }}
                />
                {!isProvideVenue && !isInvalid && (
                  <HStack
                    bg="#66CEE126"
                    p="4"
                    space="3"
                    justifyContent="center"
                    borderRadius="lg"
                  >
                    <TipIcon props={{ size: "2xl" }} color="#66CEE1" />
                    <VStack flex="1">
                      <Text fontSize="md" fontWeight="bold">
                        {t("Looking for a venue")}
                      </Text>
                      <Text fontSize="md">
                        {t("Explore and check availability of venue now")}
                      </Text>
                    </VStack>
                  </HStack>
                )}
              </Box>
            )}

            {isProvideVenue && (
              <FormInput
                label={t("Address")}
                controllerProps={{
                  name: "venue",
                  control,
                  rules: { required: t("is required") },
                }}
                inputProps={{
                  editable: true,
                  multiline: true,
                }}
              />
            )}

            {!isInvalid && shouldShowApply && (
              <Box>
                <Text fontSize="md" fontWeight="bold" pb={1}>
                  {t("Rate")}
                </Text>

                <FormInput
                  label={t("Rate")}
                  inputProps={{
                    keyboardType: "numeric",
                  }}
                  controllerProps={{
                    name: "fee",
                    control,
                    rules: {
                      required: t("is required"),
                      pattern: {
                        value: /^\d{1,8}$/,
                        message: t("Rate must be positive number"),
                      },
                      validate: {
                        withInRange: (v) => {
                          if (o3Result.isOthers) {
                            return true;
                          }
                          const n = parseInt(v, 10);
                          return (
                            (o3Result.minTuitionFee <= n &&
                              n <= o3Result.maxTuitionFee) ||
                            t(
                              "Rate must with in user's request $%{min} to $%{max}",
                              {
                                min: o3Result.minTuitionFee,
                                max: o3Result.maxTuitionFee,
                              }
                            )
                          );
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </VStack>
          {o3Result.status === O3MeetupStatus.Pending && !isInvalid && footer()}
        </VStack>
      )}

      {/* <ConfirmationModal
        isOpen={isOpen}
        alertType="Success"
        title={t("Successful")}
        description={t("the meet up details already sent to your applicant")}
        confirmText={t("OK")}
        onConfirm={async () => {
          onAlert();
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "CoachNavigator",
                params: {
                  screen: "CoachHome",
                },
              },
            ],
          });
        }}
        onCancel={onAlert}
      /> */}

      <ConfirmationModal
        alertType="Fail"
        shouldRenderIcon={false}
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={rejectRequestOpen}
        onCancel={() => {
          setRejectRequestOpen(false);
        }}
        title={t("Confirm to reject request")}
        onConfirm={handleSubmit(rejectRequest)}
      />
      <ConfirmationModal
        alertType="Success"
        shouldRenderIcon={false}
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={acceptRequestOpen}
        onCancel={() => {
          setAcceptRequestOpen(false);
        }}
        title={t("Confirm to accept request")}
        onConfirm={handleSubmit(acceptRequest)}
      />
    </HeaderLayout>
  );
}
