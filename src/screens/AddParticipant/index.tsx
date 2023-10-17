import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Badge,
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Text,
  Toast,
  useTheme,
  VStack,
} from "native-base";
import { RouteProp } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";

import CheckIcon from "../../components/Icons/CheckIcon";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { CompetitionType, EventType } from "../../models/responses/Event";
import FormInput from "../../components/FormInput/FormInput";
import ArrayFormInput from "../../components/ArrayFormInput";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { addParticipant } from "../../services/EventServices";
import { showApiToastError } from "../../components/ApiToastError";
import { isBlank } from "../../utils/strings";
import ArrayAddParticipantInput from "./ArrayAddParticipantInput";

export type AddParticipantPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "AddParticipant"
>;

type AddParticipantPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "AddParticipant"
>;

export interface AddParticipantProps extends AddParticipantPropsBaseProps {
  route: AddParticipantPropsBaseProps;
  navigation: AddParticipantPropsNavigationProp;
}
const t = getTranslation(["screen.AddParticipant", "constant.button"]);

export interface FormValue {
  player: string;
  players: string[];
  teamName: string;
  player1: string;
  player2: string;
}

export default function AddParticipant({
  navigation,
  route,
}: AddParticipantProps) {
  const theme = useTheme();
  const { event } = route.params;

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
    watch,
    setValue,
    resetField,
    trigger,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      players: [],
    },
  });

  const isEnableSubmit = () => {
    if (event.competitionType === CompetitionType.Double) {
      const player1 = watch("player1");
      const player2 = watch("player2");
      return player1 && player2 && !isBlank(player1) && !isBlank(player2);
    }

    if (event.competitionType === CompetitionType.Team) {
      const players = watch("players");
      const index = players.findIndex((p) => isBlank(p));
      return index === -1 && players.length >= 3;
    }

    const player = watch("player");
    return !isBlank(player);
  };

  const singleType = () => {
    return (
      <FormInput
        label={`${t("Player name")} *`}
        controllerProps={{
          name: "player",
          control,
        }}
      />
    );
  };

  const doubleType = () => {
    return (
      <VStack space="4">
        <FormInput
          label={`${t("Player %{number} name", { number: 1 })} *`}
          controllerProps={{
            name: "player1",
            control,
          }}
        />
        <FormInput
          label={`${t("Player %{number} name", { number: 2 })} *`}
          controllerProps={{
            name: "player2",
            control,
          }}
        />
      </VStack>
    );
  };

  const teamType = () => {
    return (
      <VStack space="4">
        <FormInput
          label={t("Team name")}
          controllerProps={{
            name: "teamName",
            control,
            rules: {
              required: event.competitionType === CompetitionType.Team,
            },
          }}
        />
        <ArrayAddParticipantInput
          label={t("Player name")}
          controllerProps={{
            name: "players",
            control,
            rules: {
              required: event.competitionType === CompetitionType.Team,
            },
          }}
          customAddButton={
            <HStack
              w="100%"
              justifyContent="center"
              alignItems="center"
              bg="rs.white"
              borderWidth="1"
              borderRadius="2xl"
              borderColor="rs.primary_purple"
              p="4"
            >
              <Text color="rs.primary_purple" fontSize="md" fontWeight="bold">
                {t("Add player")}
              </Text>
            </HStack>
          }
        />
      </VStack>
    );
  };

  const onSubmit = async (val: FormValue) => {
    try {
      const memberList: string[] =
        event.type === EventType.Competition
          ? event.competitionType === CompetitionType.Double
            ? [val.player1, val.player2]
            : event.competitionType === CompetitionType.Team
            ? val.players
            : [val.player]
          : [val.player];
      await addParticipant({
        teamName: val.teamName,
        eventId: event.id,
        memberList,
      });
      Toast.show({
        id: "addSuccess",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={t("Add successfully")}
              body={t("You have successfully add participants to the event")}
            />
          );
        },
      });
      navigation.goBack();
    } catch (error) {
      showApiToastError(error);
    }
  };

  return (
    <HeaderLayout
      containerProps={{ padding: theme.space.defaultLayoutSpacing }}
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Add Participant"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack flex="1" mx="defaultLayoutSpacing" space="4">
        {!event.competitionType && singleType()}
        {event.competitionType === CompetitionType.Single && singleType()}
        {event.competitionType === CompetitionType.Double && doubleType()}
        {event.competitionType === CompetitionType.Team && teamType()}
      </VStack>
      <Button
        mt="4"
        mx="defaultLayoutSpacing"
        variant={!isValid || !isEnableSubmit() ? "outline" : "solid"}
        isDisabled={!isValid || !isEnableSubmit()}
        isLoading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        isLoadingText={t("Loading")}
      >
        {t("Submit")}
      </Button>
    </HeaderLayout>
  );
}
