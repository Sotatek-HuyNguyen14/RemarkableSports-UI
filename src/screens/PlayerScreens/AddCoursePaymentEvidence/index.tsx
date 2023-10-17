import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Box,
  Button,
  Heading,
  Text,
  Toast,
  useTheme,
  VStack,
} from "native-base";
import React from "react";
import { uniqueId } from "lodash";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { showApiToastError } from "../../../components/ApiToastError";
import RectangleImagePicker from "../../../components/ImagePicker/RectangleImagePicker";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { useAuth } from "../../../hooks/UseAuth";
import {
  EventApplicationStatus,
  PaymentStatus,
} from "../../../models/responses/Event";
import { UserType } from "../../../models/User";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { paymentevidence } from "../../../services/JoinEventServices";
import { getTranslation } from "../../../utils/translation";
import {
  addCoursePaymentEvidence,
  getCourseApplicationEnrollment,
} from "../../../services/CourseServices";
import { formatCoreUrl } from "../../../services/ServiceUtil";

export type AddCoursePaymentEvidenceProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "AddCoursePaymentEvidence"
>;

const t = getTranslation([
  "screen.PlayerScreens.PaymentEvidence",
  "validation",
  "constant.button",
]);

export interface fieldValues {
  paymentEvidence: {
    fileName: string;
    fileContent: string;
  };
}

export default function AddCoursePaymentEvidence({
  navigation,
  route,
}: AddCoursePaymentEvidenceProps) {
  const { course } = route.params;
  const { space } = useTheme();
  const { user } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    trigger,
  } = useForm<fieldValues>({
    mode: "onChange",
    defaultValues: {},
  });

  const { data: applicationEnrollments } = useSWR(
    formatCoreUrl(`/course/${course.id}/application/${user?.id}/enrollment`),
    () => getCourseApplicationEnrollment(course.id, user?.id)
  );

  const upnextSessions = applicationEnrollments
    ? applicationEnrollments
        .filter(
          (session) =>
            session.courseSessionFrom.getTime() > new Date().getTime() &&
            session.courseId === course.id
        )
        .map((value, index) => {
          return {
            ...value,
            personalIndex: index + 1,
          };
        })
    : [];

  const onSubmit = async (payload: fieldValues) => {
    const findResult = course.playerApplicationId;
    if (findResult) {
      try {
        await addCoursePaymentEvidence(findResult, payload.paymentEvidence);
        navigation.goBack();
        Toast.show({
          id: "submitSuccessfully",
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Submit successfully")}
                body={t("You have successfully paid this the course")}
              />
            );
          },
        });
      } catch (error) {
        showApiToastError(error);
      }
    }
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Payment evidence"),
        hasBackButton: true,
        headerLabelStyle: { fontSize: 16 },
        containerStyle: {
          alignItems: "center",
          marginLeft: 0,
          marginRight: space.defaultLayoutSpacing,
        },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
      isSticky
    >
      <VStack space={2} flex={1}>
        <Heading mt="5" lineHeight={28}>
          {t("Total")}
        </Heading>
        <Box
          shadow="9"
          borderColor="rs.white"
          borderRadius="2xl"
          borderWidth="1"
          bgColor="rs.white"
          px="4"
          pt="5"
          pb="4"
          mb="2"
          style={{
            shadowOffset: {
              width: 5,
              height: 5,
            },
            shadowOpacity: 0.1,
          }}
        >
          <Text fontSize="20" fontWeight={700} lineHeight={28}>
            {`$${
              (upnextSessions && upnextSessions.length > 0
                ? upnextSessions.length
                : parseInt(
                    course.minimumRequiredConsecutiveSession || "1",
                    10
                  )) * course.fee
            }`}
          </Text>
        </Box>
        {course.paymentInfo?.map((val, index) => (
          <VStack key={uniqueId()} space={2} mt={4} ml={1}>
            <Text fontWeight={700} color="rs.primary_purple">
              {t("Payment method")} {index + 1}
            </Text>
            <VStack mb="2">
              <Text fontWeight={700} color="rs.black">
                {val.paymentType}
              </Text>
              {val.paymentType === "Bank" && (
                <VStack>
                  <Text>{val.bankName}</Text>
                  <Text>
                    {val.bankAccount} ({val.accountName})
                  </Text>
                </VStack>
              )}
              {val.paymentType === "Others" && (
                <VStack>
                  <Text>{val.otherPaymentInfo}</Text>
                </VStack>
              )}
              {val.paymentType !== "Bank" && val.paymentType !== "Others" && (
                <Text>
                  {val.phoneNumber} ({val.accountName})
                </Text>
              )}
              {val.identifier && (
                <Text>
                  {t("Fast payment identification code")} {val.identifier}
                </Text>
              )}
            </VStack>
          </VStack>
        ))}
        <Text fontSize="sm" color="rs_secondary.grey">
          {t("Files smaller than 5mb")}
        </Text>
        <RectangleImagePicker
          placeholderText={t("Add payment evidence")}
          manipulateSaveOptions={{ base64: false }}
          controllerProps={{
            name: "paymentEvidence",
            control,
            rules: { required: t("is required") },
          }}
          imageProps={{
            width: "100%",
            height: 223,
          }}
        />
      </VStack>
      <Button
        isDisabled={!isValid}
        mt="10"
        isLoading={isSubmitting}
        isLoadingText={t("Loading")}
        onPress={handleSubmit(onSubmit)}
      >
        {t("Submit")}
      </Button>
    </HeaderLayout>
  );
}
