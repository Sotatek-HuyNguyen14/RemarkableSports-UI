import React, { useState } from "react";
import {
  Badge,
  Box,
  Heading,
  HStack,
  useTheme,
  Text,
  VStack,
  Pressable,
  Button,
  Toast,
  Image,
} from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import ClockIcon from "../../../components/Icons/ClockIcon";
import LocationIcon from "../../../components/Icons/LocationIcon";
import {
  CompetitionType,
  EventApplicationStatus,
  EventType,
  PaymentStatus,
} from "../../../models/responses/Event";
import MoneyIcon from "../../../components/Icons/MoneyIcon";
import ParticipantListModal from "../../../components/Modal/ParticipantListModal";
import FormInput from "../../../components/FormInput/FormInput";
import AddIcon from "../../../components/Icons/AddIcon";
import { format24HTo12H } from "../../../utils/date";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { cancelEvent, JoinEvent } from "../../../services/JoinEventServices";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import TipsComponent from "../../../components/TipsComponent";
import TipDialogIcon from "../../../components/Icons/TipDialogIcon";
import { useAuth } from "../../../hooks/UseAuth";
import {
  getEventById,
  getPaymentEvidenceForApplication,
  isCanApply,
  isCanCancel,
  isEventFinished,
} from "../../../services/EventServices";
import { UserType } from "../../../models/User";
import { formatName, getUserName } from "../../../utils/name";
import { showApiToastError } from "../../../components/ApiToastError";
import { formatCoreUrl, formatFileUrl } from "../../../services/ServiceUtil";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import ImageDirectory from "../../../assets";
import RemoveIcon from "../../../components/Icons/RemoveIcon";

export type EventDetailsProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "PlayerEventDetails"
>;

const t = getTranslation([
  "screen.PlayerScreens.EventDetails",
  "constant.eventType",
  "constant.button",
  "validation",
  "formInput",
]);

export default function EventDetails({ navigation, route }: EventDetailsProps) {
  const { space, colors } = useTheme();
  const { user } = useAuth();
  const { event, eventId } = route.params;
  const [isOpen, setIsOpen] = useState(false);
  const [teamList, setTeamList] = useState([
    { playerName: "playerName4", index: 4 },
    { playerName: "playerName5", index: 5 },
    { playerName: "playerName6", index: 6 },
    { playerName: "playerName7", index: 7 },
  ]);
  const [cancelConfirmationModal, setCancelConfirmationModal] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
  } = useForm({
    mode: "onChange",
  });
  const {
    data: eventData,
    isValidating,
    error: eventError,
  } = useSWR(
    eventId && !event ? formatCoreUrl(`/event/${eventId}`) : null,
    () => getEventById(eventId),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  const selectedApplication = event?.eventApplications.filter((application) => {
    return application.applicant.id === user?.id;
  })[0];

  const {
    data: paymentEvidence,
    isValidating: paymentEvidenceValidating,
    error: paymentEvidenceError,
  } = useSWR(
    selectedApplication
      ? formatCoreUrl(`/paymentevidence/${selectedApplication.id}`)
      : null,
    () => {
      if (selectedApplication?.id) {
        return getPaymentEvidenceForApplication(selectedApplication.id);
      }
      return null;
    },
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  const didSubmitPaymentEvidence =
    paymentEvidence !== null &&
    paymentEvidence !== undefined &&
    !paymentEvidenceError &&
    !paymentEvidenceValidating;

  const localEvent = event || eventData;
  const playerName = watch("playerName");
  const playerName2 = watch("playerName2");
  const playerName3 = watch("playerName3");
  const teamName = watch("teamName");
  const members = localEvent?.eventApplications?.filter(
    (val) => val.eventApplicationStatus === EventApplicationStatus.Approved
  );

  const isShowPay = !!(
    localEvent?.fee &&
    localEvent.eventApplications.find(
      (item) =>
        item.applicant.id === user?.sub &&
        ((item.paymentStatus === PaymentStatus.Unpaid &&
          !didSubmitPaymentEvidence) ||
          item.paymentStatus === PaymentStatus.Rejected) &&
        item.eventApplicationStatus === EventApplicationStatus.Approved
    )
  );

  const isShowCancel = !!localEvent?.eventApplications.find(
    (item) =>
      item.applicant.id === user?.sub &&
      (item.eventApplicationStatus === EventApplicationStatus.Approved ||
        item.eventApplicationStatus === EventApplicationStatus.Pending ||
        item.eventApplicationStatus === EventApplicationStatus.WaitingList)
  );

  const isApplied = !!localEvent?.eventApplications.find(
    (item) =>
      item.applicant.id === user?.sub &&
      item.eventApplicationStatus !== EventApplicationStatus.Rejected
  );
  const isFinished = localEvent ? isEventFinished(localEvent) : true;

  // From the same club‘s staff have had  Creator‘s same permissions
  const isCreator =
    localEvent?.creator.id === user?.sub ||
    (user?.userType === UserType.ClubStaff &&
      user?.club?.id === event?.club?.id);

  const canApply = localEvent ? isCanApply(localEvent) : true;
  const canCancel = localEvent ? isCanCancel(localEvent) : true;

  const onApply = async () => {
    if (!localEvent) return;
    try {
      if (localEvent?.type !== EventType.Competition) {
        const name = getUserName(user);
        if (name)
          await JoinEvent({
            eventId: localEvent.id,
            memberList: [name],
          });
      } else {
        if (localEvent?.competitionType === CompetitionType.Single)
          await JoinEvent({ eventId: localEvent.id, memberList: [playerName] });
        if (localEvent?.competitionType === CompetitionType.Double) {
          await JoinEvent({
            eventId: localEvent.id,
            memberList: [playerName2, playerName3],
          });
        }
        if (localEvent?.competitionType === CompetitionType.Team) {
          const keys = teamList.map((val) => val.playerName);
          const locals = keys.map((val) => watch(val));
          await JoinEvent({
            eventId: localEvent.id,
            teamName,
            memberList: locals,
          });
        }
      }
      let destination = "";
      switch (user?.userType) {
        case UserType.ClubStaff:
          destination = "ClubNavigator";
          break;
        case UserType.Coach:
          destination = "CoachNavigator";
          break;
        case UserType.Player:
          destination = "PlayerNavigator";
          break;
        default:
          destination = "PlayerNavigator";
          break;
      }
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "PlayerJoinEventSuccess",
            params: {
              destination,
              nestedDestination: "EventList",
              eventId: event?.id,
            },
          },
        ],
      });
    } catch (error) {
      console.error("onApplyError:", error);
      showApiToastError(error);
    }
  };

  const footer = () => {
    if (localEvent?.type !== EventType.Competition) {
      return (
        <VStack p="4" mt="6" borderRadius="2xl" space={4}>
          <Button
            mt="6"
            isDisabled={!isValid}
            isLoading={isSubmitting}
            isLoadingText={t("Loading")}
            onPress={handleSubmit(onApply)}
          >
            {t("Apply")}
          </Button>
        </VStack>
      );
    }

    return (
      <VStack
        p="4"
        mt="6"
        bg="rgba(102,206,225,0.1)"
        borderRadius="2xl"
        space={4}
      >
        <Heading>
          {t("Easy apply %{type} competition NOW!", {
            type: t(localEvent?.competitionType),
          })}
        </Heading>
        <Text>
          {t(
            "After quick apply organiser will approve your application shortly Then you have to submit payment after Final confirmation will be done after organiser approve your payment evidence"
          )}
        </Text>
        {localEvent?.competitionType === CompetitionType.Team && (
          <Text>*{t("You can add up to 10 members")}</Text>
        )}
        {localEvent?.competitionType === CompetitionType.Single && (
          <FormInput
            label={t("Player name")}
            inputProps={{
              multiline: true,
              maxLength: 50,
            }}
            controllerProps={{
              name: "playerName",
              control,
              rules: { required: `${t("name")} ${t("is required")}` },
            }}
          />
        )}
        {localEvent?.competitionType === CompetitionType.Double && (
          <>
            <FormInput
              label={t("Player name")}
              inputProps={{
                multiline: true,
                maxLength: 50,
              }}
              controllerProps={{
                name: "playerName2",
                control,
                rules: { required: `${t("name")} ${t("is required")}` },
              }}
            />
            <FormInput
              label={t("Player name")}
              inputProps={{
                multiline: true,
                maxLength: 50,
              }}
              controllerProps={{
                name: "playerName3",
                control,
                rules: { required: `${t("name")} ${t("is required")}` },
              }}
            />
          </>
        )}
        {localEvent?.competitionType === CompetitionType.Team && (
          <>
            <FormInput
              label={t("Team name")}
              inputProps={{
                multiline: true,
                maxLength: 50,
              }}
              controllerProps={{
                name: "teamName",
                control,
                rules: { required: `${t("name")} ${t("is required")}` },
              }}
            />
            {teamList.map((val) => {
              return (
                <FormInput
                  key={val.index}
                  label={t("Player name")}
                  inputProps={{
                    multiline: true,
                    maxLength: 50,
                  }}
                  controllerProps={{
                    name: val.playerName,
                    control,
                    rules: { required: `${t("name")} ${t("is required")}` },
                  }}
                />
              );
            })}
            <HStack justifyContent="space-between" space={4}>
              <Button
                variant="solid"
                py="1"
                flex={1}
                borderRadius="8"
                _text={{ fontSize: 14, fontWeight: 500 }}
                _pressed={{}}
                onPress={() => {
                  if (teamList.length < 10) {
                    setTeamList((old) => {
                      const newPlayer = {
                        playerName: `playerName${
                          old[old.length - 1].index + 1
                        }`,
                        index: old[old.length - 1].index + 1,
                      };
                      old.push(newPlayer);
                      return [...old];
                    });
                  }
                }}
                leftIcon={
                  <AddIcon
                    haveRect={false}
                    pathColor="white"
                    props={{ size: 8, ml: -2 }}
                  />
                }
              >
                {t("Add Player")}
              </Button>
              <Button
                variant="outline"
                py="1"
                borderRadius="8"
                alignItems="center"
                _text={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rs.primary_purple",
                }}
                _pressed={{
                  _icon: {
                    strokeColor: "#FFFFFF",
                  },
                }}
                onPress={() => {
                  if (teamList.length > 3) {
                    setTeamList((old) => {
                      old.splice(old.length - 1, 1);
                      return [...old];
                    });
                  }
                }}
                flex={1}
                leftIcon={<RemoveIcon />}
              >
                {t("Remove Player")}
              </Button>
            </HStack>
          </>
        )}
        <Button
          mt="6"
          isDisabled={!isValid}
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit(onApply)}
        >
          {t("Apply")}
        </Button>
      </VStack>
    );
  };

  const textColor =
    localEvent?.type === EventType.Competition ? "rs.black" : "rs.white";
  const bg =
    localEvent?.type === EventType.Competition
      ? "#66CEE1"
      : localEvent?.type === EventType.OpenDay
      ? "rs.primary_purple"
      : "#E08700";
  const typeText =
    localEvent?.type === EventType.Competition
      ? `${t(localEvent?.competitionType)} ${t(localEvent?.type)}`
      : `${t(localEvent?.type)}`;
  const bgMap = ImageDirectory.VENUE;

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Event details"),
        hasBackButton: true,
        headerLabelStyle: { fontSize: 16 },
        containerStyle: {
          alignItems: "center",
          marginLeft: 0,
          marginRight: space.defaultLayoutSpacing,
        },
        // onBack: () => {
        //   let destination = "";
        //   switch (user?.userType) {
        //     case UserType.ClubStaff:
        //       destination = "ClubNavigator";
        //       break;
        //     case UserType.Coach:
        //       destination = "CoachNavigator";
        //       break;
        //     case UserType.Player:
        //       destination = "PlayerNavigator";
        //       break;
        //     default:
        //       destination = "PlayerNavigator";
        //       break;
        //   }
        //   navigation.reset({
        //     index: 0,
        //     routes: [
        //       {
        //         name: destination,
        //         params: { screen: "EventList" },
        //       },
        //     ],
        //   });
        // },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
      isSticky
    >
      {!localEvent && isValidating && <Loading />}
      {!localEvent && !isValidating && eventError && <ErrorMessage />}
      {localEvent && (
        <>
          {localEvent &&
            members?.length === localEvent?.capacity &&
            !isShowPay && (
              <TipsComponent
                icon={<TipDialogIcon size="sm" />}
                title={t("Event is full")}
                body={t("You can still apply to be waiting list")}
                bg="rgba(232, 16, 16, 0.1)"
                iconProps={{ bg: "rgba(232, 16, 16, 0.15)" }}
              />
            )}
          {localEvent && !isFinished && isShowPay && !isCreator && (
            <TipsComponent
              icon={<LocationIcon color="#F16514" />}
              title={t("Payment evidence")}
              body={t("Please submit the payment evidence")}
              submitText={t("Submit now")}
              bg="rgba(232, 106, 16, 0.1)"
              iconProps={{ bg: "rgba(232, 106, 16, 0.15)" }}
              onPress={() => {
                if (localEvent.paymentInfo?.length)
                  navigation.navigate("PlayerPaymentEvidence", {
                    event: localEvent,
                  });
              }}
            />
          )}
          {localEvent && (
            <HStack space={2} mt="6" mb="4">
              <Badge
                borderColor={bg}
                bg={bg}
                _text={{
                  color: textColor,
                  fontWeight: "bold",
                  fontSize: "sm",
                  borderRadius: "full",
                }}
              >
                {typeText}
              </Badge>
              <Badge bgColor="rs.white" borderColor={bg}>
                <Text color={bg} fontWeight={600}>{`${
                  localEvent?.eventSessions?.length
                } ${
                  localEvent?.eventSessions?.length > 1 ? t("days") : t("Day")
                }`}</Text>
              </Badge>
            </HStack>
          )}
          <HStack space="3" alignItems="center">
            <Image
              source={
                localEvent?.imageUrl
                  ? {
                      uri: formatFileUrl(localEvent?.imageUrl),
                    }
                  : bgMap
              }
              w="65"
              h="65"
            />
            <Heading>{localEvent?.name}</Heading>
          </HStack>
          {localEvent?.eventSessions &&
            localEvent?.eventSessions?.map((val, index) => (
              <VStack space={2} key={`${val.date} ${val.fromTime}`}>
                <Text
                  mt={2}
                  fontSize={16}
                  color="rs.primary_purple"
                  fontWeight={700}
                >
                  {t("Day %{number}", { number: index + 1 })}
                </Text>
                <HStack space="3" alignItems="center">
                  <CalendarIcon />
                  <Text flex={1}>{val?.date}</Text>
                  <ClockIcon />
                  <Text flex={1}>
                    {`${format24HTo12H(val?.fromTime)} - ${format24HTo12H(
                      val?.toTime
                    )}`}
                  </Text>
                </HStack>
                <HStack space="3" flexWrap="wrap">
                  <LocationIcon />
                  <Text flex={1}>{val?.address}</Text>
                </HStack>
              </VStack>
            ))}
          {localEvent && localEvent.capacity && (
            <VStack space={2} flex={1}>
              <Heading mt="4" fontSize={16} color="rs.primary_purple">
                {t("Description")}
              </Heading>

              <Text>{localEvent?.description}</Text>
              {localEvent && (
                <VStack>
                  <Heading my="2" fontSize={16} color="rs.primary_purple">
                    {t("Price")}
                  </Heading>
                  <HStack space="3">
                    <MoneyIcon />
                    {localEvent?.fee ? (
                      <Text>
                        {localEvent?.fee} {t("hkd/person")}
                      </Text>
                    ) : (
                      <Text>{t("free")}</Text>
                    )}
                  </HStack>
                </VStack>
              )}
              <HStack justifyContent="space-between" mt="2">
                <Heading fontSize={16}>{t("Opening remain")}</Heading>
                <HStack space={1} alignItems="center">
                  <Text>
                    {members?.length ?? 0}/{localEvent?.capacity}
                  </Text>
                  <Box w={6} h={6} />
                </HStack>
              </HStack>
              <Pressable
                onPress={() => {
                  setIsOpen(true);
                }}
              >
                <Text color="rs.primary_purple" fontSize={16}>
                  {t("See participant list")}
                </Text>
              </Pressable>
            </VStack>
          )}
          {localEvent &&
            !isFinished &&
            !isApplied &&
            !isCreator &&
            canApply &&
            footer()}
          {localEvent &&
            !isFinished &&
            isShowCancel &&
            !isCreator &&
            canCancel && (
              <Button
                mb={Platform.OS === "ios" ? 0 : 2}
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                onPress={() => {
                  setCancelConfirmationModal(true);
                }}
              >
                {t("Cancel")}
              </Button>
            )}
        </>
      )}
      <ParticipantListModal
        modalType={localEvent?.competitionType}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        options={localEvent?.eventApplications}
      />
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={cancelConfirmationModal}
        onCancel={() => {
          setCancelConfirmationModal(false);
        }}
        title={t("Are you sure to cancel joining this event?")}
        onConfirm={async () => {
          const findResult = localEvent?.eventApplications.find(
            (val) =>
              val.applicant.id === user?.sub &&
              (val.eventApplicationStatus === EventApplicationStatus.Pending ||
                val.eventApplicationStatus ===
                  EventApplicationStatus.Approved ||
                val.eventApplicationStatus ===
                  EventApplicationStatus.WaitingList)
          );
          if (findResult) {
            try {
              await cancelEvent(findResult.id);
              setCancelConfirmationModal(false);
              if (navigation.canGoBack()) navigation.goBack();
              Toast.show({
                id: "cancelSuccess",
                duration: 2000,
                placement: "top",
                render: () => {
                  return (
                    <MessageToast
                      type={MesssageToastType.Success}
                      title={t("Cancel successfully")}
                      body={t(
                        "You have successfully cancel joining this event"
                      )}
                    />
                  );
                },
              });
            } catch (error) {
              setCancelConfirmationModal(false);
              showApiToastError(error);
            }
          }
        }}
      />
    </HeaderLayout>
  );
}
