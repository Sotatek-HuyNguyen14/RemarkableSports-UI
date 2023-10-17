import React, { useState } from "react";
import useSWR from "swr";
import {
  Box,
  Button,
  Pressable,
  Toast,
  useTheme,
  VStack,
  Text,
  Heading,
} from "native-base";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useForm } from "react-hook-form";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import MeetupDetails from "../../../components/MeetupDetails";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import {
  provideFeedback,
  pickCoach,
  queryO3MeetupsById,
  cancelMeetCoachO3Request,
  isDirectMeetup,
} from "../../../services/O3Services";
import CoachShortProfile from "../../../components/CoachShortProfile";
import { formatMeetupApiUrl } from "../../../services/ServiceUtil";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import TextInputModal from "../../../components/Modal/TextInputModal";
import FormSwitch from "../../../components/Switch/FormSwitch";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { O3MeetupStatus } from "../../../models/responses/O3Response";
import { UserType } from "../../../models/User";
import PlayerShortProfile from "../../../components/PlayerShortProfile";
import { useAuth } from "../../../hooks/UseAuth";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { showApiToastError } from "../../../components/ApiToastError";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";

type PlayerO3AppliedCoachDetailsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<
    MainStackNavigatorParamList,
    "PlayerO3AppliedCoachDetails"
  >,
  BottomTabScreenProps<PlayerBottomTabNavigatorParamList>
>;

interface FormValue {
  isInterested: boolean;
}

const t = getTranslation([
  "screen.PlayerScreens.O3AppliedCoachDetails",
  "constant.button",
]);

export default function PlayerO3AppliedCoachDetails({
  navigation,
  route,
}: PlayerO3AppliedCoachDetailsScreenProps) {
  const { space } = useTheme();
  const {
    o3,
    appliedCoach,
    o3CoachId,
    appliedCoachId,
    isForceBackToPlayerMeetupList,
  } = route.params;
  const { data, isValidating, error, mutate } = useSWR(
    o3CoachId ? formatMeetupApiUrl("/1on1/{id}") : null,
    () => queryO3MeetupsById(o3CoachId!),
    {
      errorRetryCount: 0,
    }
  );

  const [isLoading, setIsLoading] = useState(false);
  const o3Result = o3 || data;

  const dataAppliedCoach =
    appliedCoachId &&
    o3Result?.appliedCoachs.filter(
      (applied) => applied.coachInfo.id === appliedCoachId
    )[0];
  const appliedCoachWithPickedCoachId =
    o3Result &&
    o3Result.pickedCoachId &&
    o3Result.appliedCoachs &&
    o3Result.appliedCoachs.filter(
      (applied) => applied.coachInfo.id === o3Result.pickedCoachId
    )[0];

  const appliedCoachResult =
    appliedCoachWithPickedCoachId ||
    appliedCoach ||
    dataAppliedCoach ||
    data?.appliedCoachs[0];

  const [isCoachCancelModalOpen, setCoachCancelModalOpen] = useState(false);

  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const {
    control,
    formState: { isValid, isSubmitting },
    watch,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      isInterested: true,
    },
  });

  const isInterested = watch("isInterested");
  const isComplete = o3Result && o3Result.status === O3MeetupStatus.Completed;

  const { user } = useAuth();
  const shouldShowLeaveFeedbackForPlayer =
    user?.userType &&
    user?.userType === UserType.Player &&
    o3Result?.playerComments === null;
  const shouldShowLeaveFeedbackForCoach =
    user?.userType &&
    user?.userType === UserType.Coach &&
    o3Result?.coachComments === null;
  const shouldShowLeaveFeedback =
    user?.userType === UserType.Player
      ? shouldShowLeaveFeedbackForPlayer
      : shouldShowLeaveFeedbackForCoach;

  const shouldShowConfirmButton =
    o3Result?.status === O3MeetupStatus.Pending &&
    user?.userType === UserType.Player &&
    !isDirectMeetup(o3Result);

  const [isCanceling, setIsCanceling] = useState(false);

  const shouldShowCancelForPlayer =
    (o3Result && o3Result.status === O3MeetupStatus.Matched) ||
    (o3Result && isDirectMeetup(o3Result));

  const isApproveRejectFlow =
    route.params.isCoachApproveRejectFlow &&
    route.params.isCoachApproveRejectFlow === true;

  const isMeetUpNotEnded =
    o3Result && o3Result.endTime.getTime() > new Date().getTime();

  const shouldShowCoachCancelInApproveRejectFlow =
    isMeetUpNotEnded &&
    (o3Result.status === O3MeetupStatus.Pending ||
      o3Result.status === O3MeetupStatus.Matched);

  const shouldShowCancelForCoach = isApproveRejectFlow
    ? shouldShowCoachCancelInApproveRejectFlow
    : isMeetUpNotEnded && o3Result.status === O3MeetupStatus.Matched;

  const shouldShowCancel =
    user?.userType === UserType.Player
      ? shouldShowCancelForPlayer
      : shouldShowCancelForCoach;

  const navigateBackToMeetupListForPlayer = () => {
    navigation.navigate("PlayerO3AppliedCoach");
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Meet up details"),
        onBack: () => {
          if (isForceBackToPlayerMeetupList) {
            navigateBackToMeetupListForPlayer();
          } else {
            navigation.goBack();
          }
        },
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{
        marginHorizontal: space.defaultLayoutSpacing,
      }}
    >
      {isValidating && <Loading />}
      {!isValidating && o3Result && appliedCoachResult && (
        <VStack space={7} flex={1}>
          {user?.userType === UserType.Player ? (
            <CoachShortProfile coach={appliedCoachResult.coachInfo} />
          ) : (
            <PlayerShortProfile player={o3Result.playerInfo} />
          )}
          <MeetupDetails meetup={o3Result} appliedCoach={appliedCoachResult} />
          {isComplete && shouldShowLeaveFeedback && (
            <Pressable
              onPress={() => {
                setFeedbackModalOpen(true);
              }}
            >
              <Text
                fontSize="md"
                textDecorationLine="underline"
                color="rs.primary_purple"
                textDecorationColor="rs.primary_purple"
              >
                {t("Leave your feedback")}
              </Text>
            </Pressable>
          )}
          {o3Result.playerComments && (
            <VStack space="4">
              <Heading>{t("Feedback from player")}</Heading>
              <Text>{o3Result.playerComments}</Text>
            </VStack>
          )}
          {o3Result.coachComments && (
            <VStack space="4">
              <Heading>{t("Feedback from coach")}</Heading>
              <Text>{o3Result.coachComments}</Text>
            </VStack>
          )}
          {shouldShowConfirmButton && (
            <VStack space="4" position="absolute" bottom={0} w="100%">
              <Button
                isDisabled={isLoading}
                isLoading={isLoading}
                onPress={async () => {
                  setIsLoading(false);
                  try {
                    await pickCoach(o3Result.id, appliedCoachResult.coachId);
                    navigation.goBack();
                    showApiToastSuccess({
                      title: t("Confirm"),
                      body: t("Your meetup is ready"),
                    });
                  } catch (apiError) {
                    showApiToastError(apiError);
                  }
                }}
              >
                {t("Confirm")}
              </Button>
            </VStack>
          )}
          {shouldShowCancel && (
            <Button
              isDisabled={isCanceling}
              mt="auto"
              onPress={() => {
                setCoachCancelModalOpen(true);
              }}
            >
              {t("Cancel")}
            </Button>
          )}
          <TextInputModal
            heading={t("Feedback")}
            description={t("Please leave your feed back here")}
            isOpen={isFeedbackModalOpen}
            onClose={() => {
              setFeedbackModalOpen(false);
            }}
            footer={
              <FormSwitch
                title={t("Show ?")}
                onText={t("Yes")}
                offText={t("No")}
                controllerProps={{
                  name: "isInterested",
                  control,
                }}
              />
            }
            onPressSubmit={async (msg: string) => {
              try {
                await provideFeedback(o3Result.id, msg, !isInterested);
                Toast.show({
                  id: "playerFeedbackSuccess",
                  duration: 2000,
                  placement: "top",
                  render: () => {
                    return (
                      <MessageToast
                        type={MesssageToastType.Success}
                        title={t("Provide feedback successfully")}
                      />
                    );
                  },
                });
                mutate();
                setFeedbackModalOpen(false);
              } catch (feedbackError) {
                console.log(feedbackError);
                setFeedbackModalOpen(false);
                showApiToastError(feedbackError);
              }
            }}
          />
          <ConfirmationModal
            isOpen={isCoachCancelModalOpen}
            alertType="Fail"
            title={t("Are you sure to cancel the meetup")}
            confirmText={t("Yes")}
            cancelText={t("No")}
            isLoading={isCanceling}
            onConfirm={async () => {
              try {
                setIsCanceling(true);
                await cancelMeetCoachO3Request({ id: o3Result.id });
                setIsCanceling(false);
                setCoachCancelModalOpen(false);
                Toast.show({
                  id: "playerDeleteCoachSuccess",
                  duration: 2000,
                  placement: "top",
                  render: () => {
                    return (
                      <MessageToast
                        type={MesssageToastType.Success}
                        title={t("Delete success")}
                      />
                    );
                  },
                });
                navigation.goBack();
              } catch (e) {
                setIsCanceling(false);
                setCoachCancelModalOpen(false);
                console.log(e);
                showApiToastError(e);
              }
            }}
            onCancel={() => setCoachCancelModalOpen(false)}
          />
        </VStack>
      )}
    </HeaderLayout>
  );
}
