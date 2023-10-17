import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Heading,
  useTheme,
  VStack,
  Text,
  Toast,
  Pressable,
  Badge,
} from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { Store } from "../../../stores";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import { getTranslation } from "../../../utils/translation";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import FormSwitch from "../../../components/Switch/FormSwitch";
import { yearList, monthList, dateList } from "../../../constants/Time";
import { getAllDistricts } from "../../../constants/Districts";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import { isPositiveNumber } from "../../../utils/strings";
import { CreateEventRequest } from "../../../models/requests/Event";
import { useAuth } from "../../../hooks/UseAuth";
import RectangleImagePicker from "../../../components/ImagePicker/RectangleImagePicker";
import { EventType } from "../../../models/responses/Event";
import ArrayDateInput from "../../../components/ArrayDateInput";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import {
  createEvent,
  getEventPermissionById,
} from "../../../services/EventServices";
import ThreeColumnPickerModal from "../../../components/Modal/ThreeColumnPickerModal";
import { showApiToastError } from "../../../components/ApiToastError";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { createLeague, updateLeague } from "../../../services/LeagueServices";
import { CreateLeagueRequest } from "../../../models/requests/Leagues";
import ArrayDivisionsInput from "../AddLeague/ArrayDivisionsInput";

export type UpdateLeaguePropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "UpdateLeague"
>;

type UpdateLeaguePropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "UpdateLeague"
>;

export interface UpdateLeagueProps extends UpdateLeaguePropsBaseProps {
  store: Store;
  route: UpdateLeaguePropsBaseProps;
  navigation: UpdateLeaguePropsNavigationProp;
}

export interface FormValue extends CreateLeagueRequest {
  test: string;
}

const t = getTranslation([
  "constant.district",
  "constant.eventType",
  "screen.OrganizerScreens.League",
  "constant.profile",
  "component.ArrayDivisionsInput",
  "constant.button",
  "validation",
  "leagueTerms",
  "toastMessage",
]);

export default function UpdateLeague({ navigation, route }: UpdateLeagueProps) {
  const theme = useTheme();
  const today = new Date();
  const { user } = useAuth();
  const Districts = useMemo(() => {
    return getAllDistricts();
  }, []);
  const { league } = route.params;

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    resetField,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      name: league.name,
      season: league.season && league.season.toString(),
      divisions: league.divisions.map((d) => {
        return {
          ...d,
          tier: `${t(d.tier)}`,
        };
      }),
    },
  });

  const onSubmit = async (formValue: FormValue) => {
    try {
      const processedPayload = formValue;
      const tierMapping = {
        A: "A",
        B: "B",
        C: "C",
        D: "D",
        甲組: "A",
        乙組: "B",
        丙組: "C",
        丁組: "D",
      };
      processedPayload.divisions = processedPayload.divisions.map(
        (division) => {
          const tier = division.tier.split(" ")[0];
          return {
            ...division,
            tier: tierMapping[tier],
          };
        }
      );
      await updateLeague(league.id, processedPayload);
      Toast.show({
        id: "addSuccess",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={`${t("Update")}${t("Successful")}`}
            />
          );
        },
      });
      if (navigation.canGoBack()) navigation.goBack();
    } catch (error: any) {
      console.log(error.response.data);
      showApiToastError(error);
    }
  };

  const divisions = watch("divisions");
  const isDivisionReady = () => {
    return (
      divisions &&
      divisions.findIndex((division) => !division.name || !division.tier) === -1
    );
  };

  const footer = (onPress: () => void) => {
    return (
      <VStack space="2" mt="auto">
        <Pressable
          onPress={() => {
            onPress();
          }}
        >
          <Badge
            borderColor="rs.primary_purple"
            variant="outline"
            _text={{
              color: "rs.primary_purple",
              fontSize: 18,
              fontWeight: "bold",
            }}
            borderRadius="2xl"
            p="4"
          >
            {`${t("Add")}${t("Division")}`}
          </Badge>
        </Pressable>
        <Button
          isDisabled={!isValid || isSubmitting || !isDivisionReady()}
          style={{ marginTop: "auto" }}
          isLoading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          isLoadingText={t("Loading")}
        >
          {t("Save")}
        </Button>
      </VStack>
    );
  };

  return (
    <HeaderLayout
      containerProps={{ padding: theme.space.defaultLayoutSpacing }}
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: `${t("Update")}${t("League")}`,
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack space="4" flex="1">
        {/* Basic info components */}
        <Heading size="md">{t("Basic info")}</Heading>
        <FormInput
          label={t("League name")}
          controllerProps={{
            name: "name",
            control,
            rules: { required: t("is required") },
          }}
        />
        <FormInput
          label={t("Season")}
          controllerProps={{
            name: "season",
            control,
            rules: { required: t("is required") },
          }}
        />
        <ArrayDivisionsInput
          controllerProps={{
            name: "divisions",
            control,
          }}
          footer={footer}
        />
      </VStack>
    </HeaderLayout>
  );
}
