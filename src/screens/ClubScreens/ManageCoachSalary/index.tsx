/* eslint-disable no-unsafe-optional-chaining */
import React, { useCallback, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Avatar,
  Box,
  Button,
  HStack,
  Pressable,
  Text,
  Toast,
  useTheme,
  View,
  VStack,
} from "native-base";
import { Alert, LayoutAnimation } from "react-native";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { ClubStaff, UserType } from "../../../models/User";
import { formatCoreUrl, formatFileUrl } from "../../../services/ServiceUtil";
import {
  ApplicationType,
  ClubApplicationResponse,
  ClubRelationship,
} from "../../../models/responses/Club";
import {
  approvalJoinClub,
  getCoachAppliedClubs,
  getCoachByClub,
  getPlayerAppliedClubs,
  getPlayerByClub,
  getStaffAppliedClubs,
  getStaffByClub,
  rejectJoinClub,
  removeClubUser,
  updateCoachPrice,
} from "../../../services/ClubServices";
import GhostTabbar from "../../../components/GhostTabBar";
import { formatName, getUserName } from "../../../utils/name";
import { showApiToastError } from "../../../components/ApiToastError";
import { ClubStatusType } from "../../../models/requests/Club";
import { getUserById } from "../../../services/AuthServices";
import { useAuth } from "../../../hooks/UseAuth";
import FormInput from "../../../components/FormInput/FormInput";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import { isBlank } from "../../../utils/strings";

export type CourseListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageCoachSalary"
>;
const t = getTranslation([
  "screen.ClubScreens.ManageCoachSalary",
  "constant.button",
  "constant.profile",
  "toastMessage",
  "component.Player.PlayerProfile",
]);

interface FormValue {
  private: string;
  headCoach: string;
  assistantCoach: string;
}

const MIN_COACH_PRICE = 0;
const MAX_COACH_PRICE = 2000;

export default function ManageCoachSalary({
  navigation,
  route,
}: CourseListProps) {
  const { coachApplication } = route.params;
  const {
    control,
    watch,
    formState: { isDirty },
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      private: coachApplication.privatePrice
        ? coachApplication.privatePrice.toString()
        : "0",
      headCoach: coachApplication.headPrice
        ? coachApplication.headPrice.toString()
        : "0",
      assistantCoach: coachApplication.assistantPrice
        ? coachApplication.assistantPrice.toString()
        : "0",
    },
  });

  const [edit, setEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const privatePrice = watch("private");
  const headPrice = watch("headCoach");
  const assistPrice = watch("assistantCoach");

  const showView = () => {
    return (
      <VStack flex="1" space="4">
        <Text color="#31095E" fontWeight="bold" fontSize="md">
          {t("Private ($/hr)")}
        </Text>
        <HStack
          borderRadius="2xl"
          px="4"
          py="5"
          alignItems="center"
          bg="#EDEFF0"
        >
          <Text color="rs.black">{privatePrice || 0}</Text>
        </HStack>

        <Text color="#31095E" fontWeight="bold" fontSize="md">
          {t("Head Coach ($/hr)")}
        </Text>
        <HStack
          borderRadius="2xl"
          px="4"
          py="5"
          alignItems="center"
          bg="#EDEFF0"
        >
          <Text color="rs.black">{headPrice || 0}</Text>
        </HStack>

        <Text color="#31095E" fontWeight="bold" fontSize="md">
          {t("Assistant Coach ($/hr)")}
        </Text>
        <HStack
          borderRadius="2xl"
          px="4"
          py="5"
          alignItems="center"
          bg="#EDEFF0"
        >
          <Text color="rs.black">{assistPrice || 0}</Text>
        </HStack>

        <Button
          onPress={() => {
            setEdit(true);
          }}
          mt="auto"
        >
          {t("Edit")}
        </Button>
      </VStack>
    );
  };

  const isPriceValid = (price: string) => {
    return (
      parseInt(price, 10) > MIN_COACH_PRICE &&
      parseInt(price, 10) < MAX_COACH_PRICE
    );
  };
  const isValid = () => {
    return (
      isPriceValid(privatePrice) &&
      isPriceValid(headPrice) &&
      isPriceValid(assistPrice)
    );
  };
  const editView = () => {
    return (
      <VStack flex="1" space="4">
        <Text color="#31095E" fontWeight="bold" fontSize="md">
          {t("Private ($/hr)")}
        </Text>
        <FormInput
          label={t("Private ($/hr)")}
          controllerProps={{
            name: "private",
            control,
            rules: {
              validate: {
                withInRange: (v) => {
                  if (v) {
                    return (
                      (parseInt(v, 10) > MIN_COACH_PRICE &&
                        parseInt(v, 10) < MAX_COACH_PRICE) ||
                      t("Price should between $%{min} - $%{max}", {
                        min: MIN_COACH_PRICE,
                        max: MAX_COACH_PRICE,
                      })
                    );
                  }
                },
              },
            },
          }}
          inputProps={{
            keyboardType: "number-pad",
          }}
        />

        <Text color="#31095E" fontWeight="bold" fontSize="md">
          {t("Head Coach ($/hr)")}
        </Text>
        <FormInput
          label={t("Head Coach ($/hr)")}
          controllerProps={{
            name: "headCoach",
            control,
            rules: {
              validate: {
                withInRange: (v) => {
                  if (v) {
                    return (
                      (parseInt(v, 10) > MIN_COACH_PRICE &&
                        parseInt(v, 10) < MAX_COACH_PRICE) ||
                      t("Price should between $%{min} - $%{max}", {
                        min: MIN_COACH_PRICE,
                        max: MAX_COACH_PRICE,
                      })
                    );
                  }
                },
              },
            },
          }}
          inputProps={{
            keyboardType: "number-pad",
          }}
        />

        <Text color="#31095E" fontWeight="bold" fontSize="md">
          {t("Assistant Coach ($/hr)")}
        </Text>
        <FormInput
          label={t("Assistant Coach ($/hr)")}
          controllerProps={{
            name: "assistantCoach",
            control,
            rules: {
              validate: {
                withInRange: (v) => {
                  if (v) {
                    return (
                      (parseInt(v, 10) > MIN_COACH_PRICE &&
                        parseInt(v, 10) < MAX_COACH_PRICE) ||
                      t("Price should between $%{min} - $%{max}", {
                        min: MIN_COACH_PRICE,
                        max: MAX_COACH_PRICE,
                      })
                    );
                  }
                },
              },
            },
          }}
          inputProps={{
            keyboardType: "number-pad",
          }}
        />
      </VStack>
    );
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Coach Salary"),
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      <VStack mx="defaultLayoutSpacing" flex="1">
        {edit ? editView() : showView()}
      </VStack>
      {edit && (
        <VStack space="2" mx="defaultLayoutSpacing">
          <Button
            isDisabled={!isValid()}
            onPress={() => {
              setShowModal(true);
            }}
          >
            {t("Save")}
          </Button>
          <Button
            onPress={() => {
              setEdit(false);
            }}
            variant="outline"
          >
            {t("Cancel")}
          </Button>
        </VStack>
      )}
      <ConfirmationModal
        isOpen={showModal}
        alertType="Success"
        title={t("Confirm to save changes")}
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        onConfirm={async () => {
          try {
            await updateCoachPrice({
              clubId: coachApplication.clubId,
              applicationId: coachApplication.applicationId,
              privatePrice:
                privatePrice && !isBlank(privatePrice)
                  ? privatePrice
                  : undefined,
              headPrice:
                headPrice && !isBlank(headPrice) ? headPrice : undefined,
              assistantPrice:
                assistPrice && !isBlank(assistPrice) ? assistPrice : undefined,
            });
            setShowModal(false);
            setEdit(false);
            showApiToastSuccess({});
          } catch (error) {
            showApiToastError(error);
          }
        }}
        onCancel={() => {
          setShowModal(false);
        }}
      />
    </HeaderLayout>
  );
}
