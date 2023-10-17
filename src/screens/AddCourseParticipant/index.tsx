import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { isFuture, isToday, parseISO } from "date-fns";
import useSWR from "swr";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";

import CheckIcon from "../../components/Icons/CheckIcon";
import { useAuth } from "../../hooks/UseAuth";
import { ClubStaff, User, UserType } from "../../models/User";
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
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import DateTimePicker from "../../components/v2/DateTimePicker";
import {
  addOfflineApplication,
  getCourseSessions,
} from "../../services/CourseServices";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { formatUtcToLocalDate } from "../../utils/date";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { ClubApplicationResponse } from "../../models/responses/Club";
import { getPlayerByClub } from "../../services/ClubServices";
import Loading from "../../components/Loading";
import { getUserName } from "../../utils/name";
import { validate } from "json-schema";

export type AddCoursePlayerPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "AddCoursePlayer"
>;

type AddCoursePlayerPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "AddCoursePlayer"
>;

export interface AddCoursePlayerProps extends AddCoursePlayerPropsBaseProps {
  route: AddCoursePlayerPropsBaseProps;
  navigation: AddCoursePlayerPropsNavigationProp;
}
const t = getTranslation([
  "screen.AddCoursePlayer",
  "constant.button",
  "validation",
  "formInput",
]);

export interface FormValue {
  playerId: string;
  sessionId: string;
  numberOfSessions: string;
  courseSessionText: string;
  playerName: string;
}

export default function AddCoursePlayer({
  navigation,
  route,
}: AddCoursePlayerProps) {
  const theme = useTheme();

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
    defaultValues: {},
  });
  const { courseId } = route.params;
  const {
    data: courseSessions,
    isValidating: isCourseSessionsFetching,
    error: courseSessionError,
    mutate: courseSessionsMutate,
  } = useSWR(
    formatCoreUrl(`/course/${courseId}/session`),
    () => getCourseSessions(courseId!),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );
  const { user } = useAuth();
  const staff = user as ClubStaff;
  const {
    data: playerExistingList,
    error: playerExistingError,
    isValidating: playerExistingValidating,
    mutate: playerExistingMutate,
  } = useSWR<ClubApplicationResponse[]>(
    formatCoreUrl(`/club/${staff.club?.id}/player?status=Approved`),
    () => getPlayerByClub(staff.club?.id)
  );

  const isLoading = playerExistingValidating || isCourseSessionsFetching;
  const playerOptions = playerExistingList
    ? playerExistingList.map((p) => {
        return {
          label: getUserName(p.candidateInfo as User)?.toString() || "",
          value: p.candidateInfo.id,
        };
      })
    : [];

  const sessionOptions = courseSessions
    ? courseSessions.map((session) => {
        return {
          label: formatUtcToLocalDate(session.courseSessionFrom),
          value: session.courseSessionId.toString(),
        };
      })
    : [];

  const selectedSessionId = watch("sessionId");
  const sessionIdIdx = selectedSessionId
    ? sessionOptions.map((option) => option.value).indexOf(selectedSessionId)
    : -1;
  const sessionNumOptions = selectedSessionId
    ? Array.from(Array(sessionOptions.length - sessionIdIdx).keys()).map(
        (naturalNum) => {
          return {
            label: (naturalNum + 1).toString(),
            value: (naturalNum + 1).toString(),
          };
        }
      )
    : [];

  const [playerOpen, setPlayerOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [sessionNumOpen, setsessionNumOpen] = useState(false);

  const onSubmit = async (value: FormValue) => {
    try {
      await addOfflineApplication({
        courseId,
        playerId: value.playerId,
        sessionId: value.sessionId,
        sessionCount: value.numberOfSessions,
      });
      showApiToastSuccess({});
      navigation.goBack();
    } catch (error) {
      showApiToastError(error);
    }
  };

  if (user?.userType === UserType.Coach) {
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
        <VStack flex="1" justifyContent="center" alignItems="center">
          <Text>{t("No Permissions")}</Text>
        </VStack>
      </HeaderLayout>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

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
      <VStack flex="1" space="4">
        <FormInput
          label={`${t("Player name")}`}
          controllerProps={{
            name: "playerName",
            control,
            rules: { required: true },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setPlayerOpen(true);
          }}
        />
        <FormInput
          label={t("Start Date")}
          controllerProps={{
            name: "courseSessionText",
            control,
            rules: {
              required: t("is required"),
            },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setDateOpen(true);
          }}
        />
        <FormInput
          label={`${t("Number of Sessions")}`}
          controllerProps={{
            name: "numberOfSessions",
            control,
            rules: { required: true },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setsessionNumOpen(true);
          }}
        />
      </VStack>
      <Button
        mt="4"
        mx="defaultLayoutSpacing"
        isLoading={isSubmitting}
        isLoadingText={t("Loading")}
        isDisabled={!isValid}
        onPress={handleSubmit(onSubmit)}
      >
        {t("Submit")}
      </Button>
      <SingleSelectModal
        title={t("Player name")}
        options={playerOptions}
        controllerProps={{
          name: "playerId",
          control,
          rules: {
            required: true,
          },
        }}
        isOpen={playerOpen}
        onCloseWithValue={(id) => {
          setValue(
            "playerName",
            playerOptions.filter((option) => option.value === id)[0]?.label
          );
          setPlayerOpen(false);
        }}
      />
      <SingleSelectModal
        title={t("Start Date")}
        options={sessionOptions}
        controllerProps={{
          name: "sessionId",
          control,
          rules: {
            required: true,
          },
        }}
        isOpen={dateOpen}
        onCloseWithValue={(id) => {
          setValue(
            "courseSessionText",
            sessionOptions.filter((option) => option.value === id)[0]?.label
          );
          setValue("numberOfSessions", "");
          trigger("courseSessionText");
          setDateOpen(false);
        }}
      />
      <SingleSelectModal
        title={t("Number of Sessions")}
        options={sessionNumOptions}
        controllerProps={{
          name: "numberOfSessions",
          control,
          rules: {
            required: true,
          },
        }}
        isOpen={sessionNumOpen}
        onCloseWithValue={(num) => {
          setValue(
            "numberOfSessions",
            sessionNumOptions.filter((option) => option.value === num)[0]?.label
          );
          setsessionNumOpen(false);
        }}
      />
    </HeaderLayout>
  );
}
