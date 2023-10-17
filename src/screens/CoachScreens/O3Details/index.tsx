import React, { useState } from "react";
import { Box, Button, useTheme, VStack } from "native-base";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import useSWR from "swr";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import {
  cancelMeetCoachO3Request,
  queryO3MeetupsById,
} from "../../../services/O3Services";
import PlayerShortProfile from "../../../components/PlayerShortProfile";
import O3DetailsComponent from "../../../components/O3Details";
import { useAuth } from "../../../hooks/UseAuth";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import {
  O3MeetupStatus,
  O3Response,
} from "../../../models/responses/O3Response";
import { formatMeetupApiUrl } from "../../../services/ServiceUtil";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { showApiToastError } from "../../../components/ApiToastError";

export type O3CoachRequestScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "CoachO3Details"
>;
export type O3CoachRequestScreenRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "CoachO3Details"
>;
interface O3CoachRequestScreenNavigationProps {
  navigation: O3CoachRequestScreenNavigationProp;
  route: O3CoachRequestScreenRouteProp;
}
const t = getTranslation(["screen.CoachScreens.O3Details", "constant.button"]);
export default function O3Details({
  navigation,
  route,
}: O3CoachRequestScreenNavigationProps) {
  const { space } = useTheme();
  const [isOpenCloseModal, setIsOpenCloseModal] = React.useState(false);
  const { o3, o3Id } = route.params;

  const {
    data: o3Data,
    error: fetchError,
    isValidating,
  } = useSWR<O3Response>(
    o3Id && !o3 ? formatMeetupApiUrl(`/1on1/${o3Id}`) : null,
    (p) => queryO3MeetupsById(o3Id)
  );

  const { user } = useAuth();
  const o3Result = o3 || o3Data;
  const fee =
    o3Result &&
    o3Result.appliedCoachs.find((ac) => ac.coachId === user?.sub)?.fee;
  const [error, setError] = useState<string | null>(null);

  let isOutTime = false;
  if (o3Result?.endTime) {
    isOutTime = o3Result?.endTime?.getTime() < new Date().getTime();
  }

  const cancelMeetup = async () => {
    if (o3Result) {
      try {
        await cancelMeetCoachO3Request({ id: o3Result.id });
        setIsOpenCloseModal(false);
        navigation.navigate("CoachRequestList");
      } catch (apiError) {
        setIsOpenCloseModal(false);
        showApiToastError(apiError);
      }
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
        <>
          <VStack space={3} flex={1}>
            <PlayerShortProfile
              player={o3Result.playerInfo}
              onPressViewProfile={() => {}}
            />
            <O3DetailsComponent
              fee={fee}
              fromTime={o3Result.fromTime}
              toTime={o3Result.endTime}
              venue={o3Result.venue}
            />

            {o3Result.status === O3MeetupStatus.Matched && !isOutTime && (
              <Box flexGrow={1}>
                <Button
                  onPress={() => {
                    setIsOpenCloseModal(true);
                  }}
                  marginTop="auto"
                >
                  {t("Cancel meetup")}
                </Button>
              </Box>
            )}
          </VStack>
          <ConfirmationModal
            isOpen={isOpenCloseModal}
            alertType="Fail"
            title={t("Are you sure to cancel the meetup")}
            confirmText={t("Yes")}
            cancelText={t("No")}
            onConfirm={cancelMeetup}
            onCancel={() => setIsOpenCloseModal(false)}
          />

          <ConfirmationModal
            isOpen={error !== null}
            alertType="Fail"
            title={t("Error")}
            confirmText={t("OK")}
            description={error}
            onConfirm={() => {
              setError(null);
            }}
          />
        </>
      )}
    </HeaderLayout>
  );
}
