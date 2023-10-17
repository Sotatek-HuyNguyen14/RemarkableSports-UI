/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
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
import useSWR from "swr";
import I18n from "i18n-js";
import { isAfter, isFuture, parseISO, isEqual } from "date-fns";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { Store } from "../../stores";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import FormInput from "../../components/FormInput/FormInput";
import { getTranslation } from "../../utils/translation";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../components/Modal/OneColumnPickerModal";
import ThreeColumnPickerModal from "../../components/Modal/ThreeColumnPickerModal";
import FormSwitch from "../../components/Switch/FormSwitch";
import {
  hourList,
  minuteList,
  getPeriod,
  yearList,
  monthList,
  dateList,
} from "../../constants/Time";
import {
  format12HTo24H,
  format24HTo12H,
  getDefaultEndTimeByStartTime,
  validateTimeRange,
} from "../../utils/date";
import { getAllDistricts } from "../../constants/Districts";
import { OnboardingStepId } from "../../models/responses/Onboarding";
import {
  formatCoreUrl,
  formatFileUrl,
  formatWorkflowUrl,
} from "../../services/ServiceUtil";
import { getWorkflowDefinition } from "../../services/WorkflowService";
import DaysOfWeekComponent from "../../components/DaysOfWeekComponent";
import {
  addCourseCreating,
  deleteCoursesById,
  updateCourse,
  updateCourseV2,
} from "../../services/CourseServices";
import { PlayerInfoForm } from "../SignUp/PlayerInfo";
import { DaysOfWeek } from "../../models/Response";
import { isPositiveNumber } from "../../utils/strings";
import { CreateCourseRequest } from "../../models/requests/Course";
import { getInputOptions } from "../../services/Workflow";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { ClubStaff, UserType } from "../../models/User";
import { useAuth } from "../../hooks/UseAuth";
import { getCoachByClub } from "../../services/ClubServices";
import { formatName, getUserName } from "../../utils/name";
import RectangleImagePicker from "../../components/ImagePicker/RectangleImagePicker";
import BinIcon from "../../components/Icons/BinIcon";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import Loading from "../../components/Loading";
import { showApiToastError } from "../../components/ApiToastError";
import DateTimePicker from "../../components/v2/DateTimePicker";
import TimePicker from "../../components/v2/TimePicker";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { CourseType } from "../../models/responses/Course";
import NoAccessRight from "../../components/NoAccessRight";

export type UpdateCoursePropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "UpdateCourse"
>;

type UpdateCoursePropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "UpdateCourse"
>;

export interface UpdateCourseProps extends UpdateCoursePropsBaseProps {
  store: Store;
  route: UpdateCoursePropsBaseProps;
  navigation: UpdateCoursePropsNavigationProp;
}

export interface FormValue extends CreateCourseRequest {
  districtText: string;
  isCourseRecurring?: boolean | null;
  isAssignCoach?: boolean | null;
  levelText: string;
  isNewImage?: boolean;
}

const t = getTranslation([
  "constant.district",
  "screen.ClubScreens.Course",
  "constant.profile",
  "constant.button",
  "validation",
  "formInput",
]);

const SAVED_SUCCESSFUL_TOAST = "savedSuccessful";

// 1: Cannot make changes to the price, course type
// 2: Quota cannot be lower than the existing no.of applied players
// 3:  Edit when no player has applied to the course
export default function UpdateCourse({ navigation, route }: UpdateCourseProps) {
  const theme = useTheme();
  const today = new Date();
  const { course, paymentMethodUpdated } = route.params;
  const { user } = useAuth();
  const staff = user as ClubStaff;
  const { data: def } = useSWR(
    formatWorkflowUrl("/onboarding/definition"),
    async () => getWorkflowDefinition("onboarding")
  );

  const [offlineFieldFocus, setOfflineFieldFocus] = useState(false);
  const [onlineFieldFocus, setOnlineFieldFocus] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteImagePressed, setDeleteImagePressed] = useState(false);
  const [defaultForm, setDefaultFrom] = useState(course.fromDate.toString());
  const [defaultTo, setDefaultTo] = useState(course.toDate.toString());

  const { data: coachList, isValidating } = useSWR(
    user?.userType === UserType.ClubStaff
      ? formatCoreUrl(`/club/${staff?.club?.id}/coach?status=Approved`)
      : null,
    async () => getCoachByClub(staff?.club?.id ?? "")
  );
  const Districts = useMemo(() => {
    return getAllDistricts();
  }, []);

  const period = useMemo(() => {
    return getPeriod();
  }, []);
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
      name: course.name,
      capacity: course.capacity.toString(),
      fee: course.fee.toString(),
      description: course.description,
      level: course?.level,
      minAge: course?.minAge?.toString(),
      maxAge: course?.maxAge?.toString(),
      district: course.district,
      address: course.address,
      enquiryPhoneNumber: course.enquiryPhoneNumber,
      minimumRequiredConsecutiveSession:
        course.minimumRequiredConsecutiveSession.toString(),
      courseImage: course.courseImage,
      courseType: course.courseType ? t(course?.courseType) : "",
    },
  });

  const levelOptions = getInputOptions<PlayerInfoForm>(
    def,
    "level",
    OnboardingStepId.PlayerInfo
  );
  const district = watch("district");

  const [isOpen, setIsOpen] = useState({
    district: false,
    name: false,
    courseFrom: false,
    courseTo: false,
    durationFrom: false,
    durationTo: false,
    level: false,
    coach: false,
  });
  const setDistrict = useCallback(
    (newDistrict: string) => {
      const newLabel = Districts.reduce<string | null>((ret, val) => {
        if (val.value === newDistrict) {
          return val.label;
        }
        return ret;
      }, null);
      setValue("districtText", newLabel!, {
        shouldDirty: !!newLabel,
      });
      setValue("district", newDistrict, {
        shouldDirty: !!newLabel,
      });
    },
    [Districts, setValue]
  );

  const level = watch("level");

  const setLevel = useCallback(
    (newLevel: string) => {
      setValue("levelText", t(newLevel));
    },
    [setValue]
  );

  useEffect(() => {
    if (district) {
      setDistrict(district);
    }
  }, [district, setDistrict]);

  useEffect(() => {
    if (level) {
      setLevel(level);
    } else {
      setValue("levelText", "");
    }
  }, [level, setLevel, setValue]);

  const deleteCourse = async () => {
    try {
      await deleteCoursesById(course.id);
      if (!Toast.isActive(SAVED_SUCCESSFUL_TOAST)) {
        Toast.show({
          id: SAVED_SUCCESSFUL_TOAST,
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Deleted")}
              />
            );
          },
        });
      }

      navigation.navigate(
        user?.userType === UserType.Coach ? "CoachNavigator" : "ClubNavigator"
      );
    } catch (error: any) {
      showApiToastError(error);
    }
  };

  async function processSubmit(formValue: FormValue) {
    try {
      // Image processing
      let isNewImage = false;
      const newFormValue = {
        ...course,
        ...formValue,
        courseType: course.courseType,
      };
      if (!newFormValue.courseImage) {
        delete newFormValue.courseImage;
        if (isDeleteImagePressed) {
          isNewImage = true;
        }
      } else {
        isNewImage = true;
      }
      // If payment method not updated then dont send to backend
      if (!paymentMethodUpdated) {
        delete newFormValue.paymentInfo;
      }
      await updateCourseV2({ ...newFormValue, isNewImage }, course.id);
      if (!Toast.isActive(SAVED_SUCCESSFUL_TOAST)) {
        Toast.show({
          id: SAVED_SUCCESSFUL_TOAST,
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Saved")}
                body={t(
                  "You have successfully edit the course details You can check it in the details page"
                )}
              />
            );
          },
        });
      }

      navigation.navigate(
        user?.userType === UserType.Coach ? "CoachNavigator" : "ClubNavigator"
      );
    } catch (error: any) {
      showApiToastError(error);
    }
  }

  const courseType = watch("courseType");

  const courseWatched = watch();

  // Only Course Creator (ClubStaff or Coach) able to update course
  const userHasRightToAccess =
    user?.userType === UserType.ClubStaff ||
    (user?.userType === UserType.Coach && course?.creatorId === user?.id);
  if (!userHasRightToAccess) {
    return (
      <HeaderLayout
        containerProps={{ padding: theme.space.defaultLayoutSpacing }}
        KeyboardAwareScrollViewProps={{
          bounces: false,
        }}
        headerProps={{
          title: t("Update Course"),
          containerStyle: {
            marginHorizontal: 0,
          },
        }}
        isSticky
      >
        <NoAccessRight />
      </HeaderLayout>
    );
  }
  return (
    <HeaderLayout
      containerProps={{ padding: theme.space.defaultLayoutSpacing }}
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Update Course"),
        containerStyle: {
          marginHorizontal: 0,
        },
        rightComponent: (
          <Pressable
            mr="2"
            onPress={() => {
              setDeleteModalOpen(true);
            }}
          >
            <BinIcon size="md" />
          </Pressable>
        ),
      }}
      isSticky
    >
      {isValidating ? (
        <Loading />
      ) : (
        <VStack space="4" flex="1">
          {/* Basic info components */}
          <HStack alignItems="center" justifyContent="space-between">
            <Heading size="md">{t("Basic info")}</Heading>
            {course.fee && (
              <Pressable
                onPress={() => {
                  navigation.navigate("AddCoursePaymentMethod", {
                    course: {
                      ...course,
                      ...courseWatched,
                      courseType: course.courseType,
                    },
                    isUpdating: true,
                  });
                }}
              >
                <Text color="#31095E">{t("Edit payment method")}</Text>
              </Pressable>
            )}
          </HStack>
          <FormInput
            isGreyedOut
            label={t("Course type")}
            inputProps={{
              editable: false,
            }}
            controllerProps={{
              name: "courseType",
              control,
              rules: { required: t("is required") },
            }}
          />
          <FormInput
            label={t("Course name")}
            controllerProps={{
              name: "name",
              control,
              rules: { required: t("is required") },
            }}
          />
          <FormInput
            isGreyedOut
            inputProps={{
              keyboardType: "numeric",
              editable: false,
            }}
            label={t("Course price (HKD)")}
            controllerProps={{
              name: "fee",
              control,
              rules: {
                required: t("is required"),
                validate: {
                  withInRange: (v) => {
                    if (v) {
                      return (
                        (isPositiveNumber(v) && parseInt(v, 10) > 0) ||
                        t("Course price must be greater than 0 and an integer")
                      );
                    }
                  },
                },
              },
            }}
          />
          <FormInput
            label={t("Description")}
            inputProps={{ multiline: true }}
            controllerProps={{
              name: "description",
              control,
              rules: {
                required: t("is required"),
              },
            }}
          />
          <FormInput
            label={t("Level required")}
            controllerProps={{
              name: "levelText",
              control,
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, level: true }));
            }}
          />
          <FormInput
            label={t("Course district")}
            controllerProps={{
              name: "districtText",
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
              setIsOpen((prev) => ({ ...prev, district: true }));
            }}
          />
          <FormInput
            label={t("Course address")}
            inputProps={{ multiline: true }}
            controllerProps={{
              name: "address",
              control,
              rules: {
                required: t("is required"),
              },
            }}
            onPress={() => {}}
          />
          <FormInput
            label={t("Enquiry phone no")}
            inputProps={{ keyboardType: "numeric" }}
            controllerProps={{
              name: "enquiryPhoneNumber",
              control,
              rules: {
                required: `${t("Mobile")} ${t("is required")}`,
                pattern: {
                  value: /^\d{8}$/,
                  message: t("Phone Number be 8-digit number"),
                },
              },
            }}
          />
          {courseType === t(CourseType.Public) && (
            <>
              <Heading size="md">{t("Course capacity")}</Heading>
              <FormInput
                label={t("Course capacity")}
                inputProps={{ keyboardType: "numeric" }}
                controllerProps={{
                  name: "capacity",
                  control,
                  rules: {
                    required: courseType === CourseType.Public,
                    validate: {
                      withInRange: (v) => {
                        if (v) {
                          return (
                            (isPositiveNumber(v) && parseInt(v, 10) > 0) ||
                            t(
                              "Course capacity must be greater than 0 and an integer"
                            )
                          );
                        }
                      },
                    },
                  },
                }}
              />
            </>
          )}

          <Heading>{t("Course photo")}</Heading>
          <Text fontSize="sm" color="rs_secondary.grey">
            {t("Files smaller than 5mb")}
          </Text>
          <RectangleImagePicker
            onPressDelete={() => {
              setDeleteImagePressed(true);
            }}
            defaultImageUrl={
              course.imageUrl ? formatFileUrl(course.imageUrl) : undefined
            }
            placeholderText={t("Course photo")}
            controllerProps={{
              name: "courseImage",
              control,
            }}
          />
          {courseType === t(CourseType.Public) && (
            <>
              <Heading size="md">{t("Minimum session to apply")}</Heading>
              <FormInput
                label={t("Minimum session to apply")}
                inputProps={{ keyboardType: "numeric" }}
                controllerProps={{
                  name: "minimumRequiredConsecutiveSession",
                  control,
                  rules: {
                    required: courseType === CourseType.Public,
                    validate: {
                      withInRange: (v) => {
                        if (v) {
                          return (
                            (isPositiveNumber(v) && parseInt(v, 10) > 0) ||
                            t(
                              "Minimum session to apply must be greater than 0 and an integer"
                            )
                          );
                        }
                      },
                    },
                  },
                }}
              />
            </>
          )}
          <Button
            style={{ marginTop: "auto" }}
            isDisabled={!isDirty || !isValid}
            isLoading={isSubmitting}
            isLoadingText={t("Loading")}
            onPress={handleSubmit(processSubmit)}
          >
            {t("Save")}
          </Button>
        </VStack>
      )}

      <SingleSelectModal
        isOpen={isOpen.district}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, district: false }));
        }}
        title={`${t("Select")}${t("District")}`}
        buttonLabel={t("Confirm")}
        options={Districts}
        controllerProps={{
          name: "district",
          control,
          rules: { required: t("is required") },
        }}
        confirmButtonText={t("Save")}
      />

      <SingleSelectModal
        confirmButtonText={t("Save")}
        isOpen={isOpen.level}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, level: false }));
        }}
        title={t("Select Level")}
        options={levelOptions}
        controllerProps={{
          name: "level",
          control,
        }}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        alertType="Fail"
        title={t("Are you sure to delete this course you created?")}
        description={t(
          "Once the course delete, participants are not longer to reach this course"
        )}
        confirmText={t("Yes, delete")}
        cancelText={t("Cancel")}
        onConfirm={deleteCourse}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </HeaderLayout>
  );
}
