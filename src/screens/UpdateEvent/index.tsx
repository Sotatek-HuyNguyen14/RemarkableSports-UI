import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Heading,
  useTheme,
  VStack,
  Text,
  HStack,
  Toast,
  Pressable,
} from "native-base";
import { useForm } from "react-hook-form";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { Store } from "../../stores";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import FormInput from "../../components/FormInput/FormInput";
import { getTranslation } from "../../utils/translation";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../components/Modal/OneColumnPickerModal";
import FormSwitch from "../../components/Switch/FormSwitch";
import { format24HTo12H, formatUtcToLocalDate } from "../../utils/date";
import { getAllDistricts } from "../../constants/Districts";
import { formatFileUrl } from "../../services/ServiceUtil";
import { isPositiveNumber } from "../../utils/strings";
import {
  CreateEventRequest,
  UpdateEventRequest,
} from "../../models/requests/Event";
import RectangleImagePicker from "../../components/ImagePicker/RectangleImagePicker";
import { EventType } from "../../models/responses/Event";
import ArrayDateInput from "../../components/ArrayDateInput";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { deleteEventById, updateEvent } from "../../services/EventServices";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import BinIcon from "../../components/Icons/BinIcon";
import { showApiToastError } from "../../components/ApiToastError";
import DateTimePicker from "../../components/v2/DateTimePicker";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";

export type UpdateEventPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "UpdateEvent"
>;

type UpdateEventPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "UpdateEvent"
>;

export interface UpdateEventProps extends UpdateEventPropsBaseProps {
  store: Store;
  route: UpdateEventPropsBaseProps;
  navigation: UpdateEventPropsNavigationProp;
}

export interface FormValue extends CreateEventRequest {
  districtText: string;
  typeText: string;
  fromDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  latestCancellationText?: string;
  applicationDeadlineText?: string;
  competitionTypeText?: string;
}

const t = getTranslation([
  "constant.district",
  "constant.eventType",
  "constant.profile",
  "screen.Event",
  "constant.button",
  "validation",
  "formInput",
]);

export default function UpdateEvent({ navigation, route }: UpdateEventProps) {
  const theme = useTheme();

  const Districts = useMemo(() => {
    return getAllDistricts();
  }, []);

  const { event, paymentMethodUpdated } = route.params;
  const [isDeleteImagePressed, setDeleteImagePressed] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
    watch,
    setValue,
    resetField,
    trigger,
    register,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      type: event.type,
      name: event.name,
      competitionType: event.competitionType,
      capacity: event.capacity.toString(),
      fee: event.fee,
      address: event.address,
      description: event.description,
      district: event.district,
      isApproval: event.isApproval,
      latestCancellation: event.latestCancellation,
      latestCancelationText: event.latestCancellation
        ? `${event.latestCancellation} ${t("hrs")}`
        : undefined,
      image: event.image,
      applicationDeadline:
        (event.applicationDeadline &&
          formatUtcToLocalDate(new Date(event.applicationDeadline))) ||
        undefined,
      eventSessions: event.eventSessions.map((session) => {
        return {
          ...session,
          fromTime: session.fromTime.includes("000")
            ? format24HTo12H(session.fromTime)
            : session.fromTime,
          toTime: session.toTime.includes("000")
            ? format24HTo12H(session.toTime)
            : session.toTime,
        };
      }),
    },
  });
  const eventWatched = watch();

  const district = watch("district");
  const type = watch("type");
  const latestCancellation = watch("latestCancellation");
  const applicationDeadline = watch("applicationDeadline");

  const [isOpen, setIsOpen] = useState({
    district: false,
    type: false,
    lastCancellation: false,
    durationFrom: false,
    isEventFree: false,
    competitionType: false,
    applicationDeadline: false,
  });
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState(
    (event.applicationDeadline &&
      formatUtcToLocalDate(new Date(event.applicationDeadline))) ||
      undefined
  );
  const typeOptions = [
    EventType.Competition,
    EventType.GroupBallGame,
    EventType.OpenDay,
    EventType.Others,
  ].map((option) => {
    return {
      label: t(option),
      value: option,
    };
  });

  const latestCancellationOptions = [24, 48].map((hOption) => {
    return {
      label: `${hOption} ${t("hrs")}`,
      value: hOption.toString(),
    };
  });

  const setType = useCallback(
    (newLevel: string) => {
      setValue("typeText", t(newLevel));
    },
    [setValue]
  );

  const setCancellation = useCallback(
    (newLevel: string) => {
      if (newLevel === " ") {
        resetField("latestCancellationText");
        setValue("latestCancellation", undefined);
      } else {
        setValue("latestCancellationText", newLevel);
      }
    },
    [setValue, resetField]
  );

  const setApplicationDeadline = useCallback(
    (newLevel: string) => {
      if (newLevel === "") {
        resetField("applicationDeadlineText");
      } else {
        setValue("applicationDeadlineText", newLevel);
      }
    },
    [setValue, resetField]
  );

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
  const competitionType = watch("competitionType");
  const setCompetitionType = useCallback(
    (newLevel: string) => {
      setValue("competitionTypeText", t(newLevel));
    },
    [setValue]
  );

  useEffect(() => {
    if (district) setDistrict(district);
  }, [district, setDistrict]);

  useEffect(() => {
    if (type) setType(type);
  }, [setType, type]);

  useEffect(() => {
    if (applicationDeadline || applicationDeadline === "") {
      setApplicationDeadline(applicationDeadline);
    }
  }, [setApplicationDeadline, setType, type, applicationDeadline]);

  useEffect(() => {
    if (competitionType) {
      setCompetitionType(competitionType);
    }
  }, [competitionType, setCompetitionType]);

  useEffect(() => {
    setCancellation(latestCancellation ? latestCancellation.toString() : "");
  }, [setCancellation, latestCancellation]);

  const eventDateList = () => {
    return (
      <ArrayDateInput
        label={t("Date")}
        controllerProps={{
          name: "eventSessions",
          control,
        }}
      />
    );
  };

  const eventTypeSelection = () => {
    return (
      <VStack space="4">
        <FormInput
          isGreyedOut
          label={t("Competition type")}
          controllerProps={{
            name: "competitionTypeText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
            backgroundColor: "red.100",
          }}
        />
      </VStack>
    );
  };

  const deleteEvent = async () => {
    try {
      await deleteEventById(event.id);
      Toast.show({
        id: "deleteDone",
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
      navigation.navigate("EventList");
    } catch (error: any) {
      console.log("error:", error);
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
        hasBackButton: true,
        title: t("UpdateEvent"),
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
      <VStack space="4" flex="1">
        {/* Basic info components */}
        <HStack justifyContent="space-between">
          <Heading size="md">{t("Basic Info")}</Heading>
          {event.fee ? (
            <Pressable
              onPress={() => {
                navigation.navigate("AddPaymentMethod", {
                  event: event.fee ? { ...event, ...eventWatched } : event,
                  isUpdating: true,
                });
              }}
            >
              <Text color="rs.primary_purple">{t("Edit payment method")}</Text>
            </Pressable>
          ) : null}
        </HStack>
        <FormInput
          label={t("Name")}
          controllerProps={{
            name: "name",
            control,
            rules: { required: t("is required") },
          }}
        />
        <FormInput
          label={t("Type")}
          controllerProps={{
            name: "typeText",
            control,
            rules: { required: t("is required") },
          }}
          isGreyedOut
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
        />
        {type === EventType.Competition && eventTypeSelection()}
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
          label={t("District")}
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
          label={t("Address")}
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
          label={t("Latest cancellation period (Optional)")}
          controllerProps={{
            name: "latestCancellationText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, lastCancellation: true }));
          }}
        />
        <FormInput
          label={t("Deadline for application (Optional)")}
          controllerProps={{
            name: "applicationDeadlineText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, applicationDeadline: true }));
          }}
        />

        {/* Day time settings */}
        {eventDateList()}

        {/* Capacity */}
        <Heading size="md">{t("Capacity")}</Heading>
        <FormInput
          isGreyedOut
          label={t("Capacity")}
          inputProps={{ keyboardType: "numeric", editable: false }}
          controllerProps={{
            name: "capacity",
            control,
            rules: {
              required: t("is required"),
              validate: {
                withInRange: (v) => {
                  if (v) {
                    return (
                      isPositiveNumber(v) ||
                      parseInt(v, 10) > 0 ||
                      t("Event capacity must be greater than 0 and an integer")
                    );
                  }
                },
              },
            },
          }}
        />

        <Heading>{t("Photo")}</Heading>
        <Text fontSize="sm" color="rs_secondary.grey">
          {t("Files smaller than 5mb")}
        </Text>
        <RectangleImagePicker
          onPressDelete={() => {
            setDeleteImagePressed(true);
          }}
          defaultImageUrl={
            event.imageUrl ? formatFileUrl(event.imageUrl) : undefined
          }
          placeholderText={t("Photo")}
          controllerProps={{
            name: "image",
            control,
          }}
        />

        {/* Approval */}
        <FormSwitch
          isDisabledSwitch
          title={t("Does it require approval")}
          onText={t("Yes")}
          offText={t("No")}
          controllerProps={{
            name: "isApproval",
            control,
          }}
        />
        <Button
          isLoadingText={t("Loading")}
          style={{ marginTop: "auto" }}
          isLoading={isSubmitting}
          onPress={handleSubmit(async (val) => {
            /* Update */
            try {
              const payload: UpdateEventRequest = {
                ...event,
                ...val,
                fee: event.fee,
              };

              // If payment method not updated then dont send to backend
              if (!paymentMethodUpdated) {
                delete payload.paymentInfo;
              }
              // If event sessions not updated then dont send to backend
              const mapped = event.eventSessions.map((session) => {
                return {
                  ...session,
                  fromTime: session.fromTime.includes("000")
                    ? format24HTo12H(session.fromTime)
                    : session.fromTime,
                  toTime: session.toTime.includes("000")
                    ? format24HTo12H(session.toTime)
                    : session.toTime,
                };
              });
              let isEventSessionUpdated = false;
              if (mapped.length !== val.eventSessions.length) {
                isEventSessionUpdated = true;
              } else {
                mapped.forEach((session, index) => {
                  const compared = val.eventSessions[index];
                  if (
                    session.address !== compared.address ||
                    session.date !== compared.date ||
                    session.fromTime !== compared.fromTime ||
                    session.toTime !== compared.toTime
                  ) {
                    isEventSessionUpdated = true;
                  }
                });
              }
              if (!isEventSessionUpdated) {
                delete payload.eventSessions;
              }

              // Image processing
              let isNewImage = false;
              if (!payload.image) {
                delete payload.image;
                if (isDeleteImagePressed) {
                  isNewImage = true;
                }
              } else {
                isNewImage = true;
              }
              if (!payload.latestCancellation) {
                delete payload.latestCancellation;
              }

              if (
                !payload.applicationDeadline ||
                payload.applicationDeadline === ""
              ) {
                delete payload.applicationDeadline;
              }

              const res = await updateEvent(
                { ...payload, id: event.id, isNewImage },
                event.id
              );

              setIsOpen((prev) => ({ ...prev, isEventFree: false }));
              Toast.show({
                id: "updateSuccess",
                duration: 2000,
                placement: "top",
                render: () => {
                  return (
                    <MessageToast
                      type={MesssageToastType.Success}
                      title={t("Updated")}
                      body={t("Updated successfully")}
                    />
                  );
                },
              });
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("AddEventSuccessful", {
                  eventId: res.data,
                });
              }
            } catch (error: any) {
              showApiToastError(error);
              setIsOpen((prev) => ({ ...prev, isEventFree: false }));
            }
          })}
        >
          {t("Continue")}
        </Button>
      </VStack>
      <SingleSelectModal
        title={`${t("Select")}${t("District")}`}
        options={Districts}
        controllerProps={{
          name: "district",
          control,
          rules: { required: t("is required") },
        }}
        isOpen={isOpen.district}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, district: false }));
        }}
        confirmButtonText={t("Confirm")}
      />

      <SingleSelectModal
        title={`${t("Select")}${t("Type")}`}
        options={typeOptions}
        controllerProps={{
          name: "type",
          control,
          rules: { required: t("is required") },
        }}
        isOpen={isOpen.type}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, type: false }));
        }}
        confirmButtonText={t("Confirm")}
      />
      {/* <OneColumnPickerModal
        allowEmptyOnChange
        isOpen={isOpen.lastCancellation}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, lastCancellation: false }));
        }}
        headerLabel={`${t("Select")}${t("Latest cancellation period (Optional)")}`}
        options={latestCancellationOptions}
        controllerProps={{
          name: "latestCancellation",
          control,
        }}
      /> */}
      <SingleSelectModal
        title={`${t("Select")}${t("Latest cancellation period (Optional)")}`}
        options={latestCancellationOptions}
        controllerProps={{
          name: "latestCancellation",
          control,
        }}
        isOpen={isOpen.lastCancellation}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, lastCancellation: false }));
        }}
        confirmButtonText={t("Confirm")}
      />
      {/* <OneColumnPickerModal
        isOpen={isOpen.competitionType}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, competitionType: false }));
        }}
        headerLabel={t("Competition type")}
        options={["Single", "Double", "Team"].map((cCompetitionType) => {
          return { label: t(cCompetitionType), value: cCompetitionType };
        })}
        controllerProps={{
          name: "competitionType",
          control,
          rules: {
            required: type === EventType.Competition,
          },
        }}
      /> */}

      <SingleSelectModal
        isOpen={isOpen.competitionType}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, competitionType: false }));
        }}
        title={t("Competition type")}
        options={["Single", "Double", "Team"].map((cCompetitionType) => {
          return { label: t(cCompetitionType), value: cCompetitionType };
        })}
        controllerProps={{
          name: "competitionType",
          control,
          rules: {
            required: type === EventType.Competition,
          },
        }}
        confirmButtonText={t("Confirm")}
      />
      <OneColumnPickerModal
        isOpen={isOpen.competitionType}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, competitionType: false }));
        }}
        headerLabel={t("Competition type")}
        options={["Single", "Double", "Team"].map((cCompetitionType) => {
          return { label: cCompetitionType, value: cCompetitionType };
        })}
        controllerProps={{
          name: "competitionType",
          control,
        }}
      />
      <ConfirmationModal
        verticalButtons
        alertType="Fail"
        shouldRenderIcon={false}
        confirmText={t("Yes, add payment method")}
        cancelText={t("No, it is free")}
        isOpen={isOpen.isEventFree}
        onCancel={() => {}}
        description={t(
          "Once the event delete participants are not longer to reach this event"
        )}
        title={t("Is there a fee for the event")}
        onConfirm={handleSubmit((val) => {
          setIsOpen((prev) => ({ ...prev, isEventFree: false }));
          navigation.navigate("AddPaymentMethod", {
            event: { ...event, ...val },
            isUpdating: true,
          });
        })}
      />
      {/* <ThreeColumnPickerModal
        defaultSelectValues={[
          `${today.getFullYear()}`,
          `${today.getMonth() + 1}`.padStart(2, "0"),
          `${today.getDate() + 1}`.padStart(2, "0"),
        ]}
        isOpen={isOpen.applicationDeadline}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, applicationDeadline: false }));
        }}
        headerLabel={`${t("Select")}${t("Date")}`}
        buttonLabel={t("Confirm")}
        concatenator={["-", "-"]}
        options={[yearList, monthList, dateList]}
        controllerProps={{
          name: "applicationDeadline",
          control,
        }}
      /> */}
      <DateTimePicker
        title={`${t("Select")}${t("Date")}`}
        isShow={isOpen.applicationDeadline}
        mode="date"
        onDefaultDate={(value) => {
          setDefaultDate(value);
        }}
        defaultDate={defaultDate}
        controllerProps={{
          name: "applicationDeadline",
          control,
        }}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, applicationDeadline: false }));
        }}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        alertType="Fail"
        title={t("Are you sure to delete this event you created")}
        description={t(
          "Once the event delete participants are not longer to reach this event"
        )}
        confirmText={t("Yes, delete")}
        cancelText={t("Cancel")}
        onConfirm={deleteEvent}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </HeaderLayout>
  );
}
