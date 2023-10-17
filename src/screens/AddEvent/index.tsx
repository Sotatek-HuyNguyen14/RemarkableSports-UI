import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading, useTheme, VStack, Text, Box } from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
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
import { yearList, monthList, dateList } from "../../constants/Time";
import { getAllDistricts } from "../../constants/Districts";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { isPositiveNumber } from "../../utils/strings";
import { CreateEventRequest } from "../../models/requests/Event";
import { useAuth } from "../../hooks/UseAuth";
import RectangleImagePicker from "../../components/ImagePicker/RectangleImagePicker";
import { EventType } from "../../models/responses/Event";
import ArrayDateInput from "../../components/ArrayDateInput";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import {
  createEvent,
  getAddEventPermissions,
  getEventPermissionById,
} from "../../services/EventServices";
import ThreeColumnPickerModal from "../../components/Modal/ThreeColumnPickerModal";
import {
  showApiToastError,
  showApiToastErrorWithMessage,
} from "../../components/ApiToastError";
import DateTimePicker from "../../components/v2/DateTimePicker";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import Loading from "../../components/Loading";
import { getPostPermissionById } from "../../services/ContentServices";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { UserType } from "../../models/User";
import { getClubVenues } from "../../services/VenueServices";
import LocationIcon from "../../components/Icons/LocationIcon";

export type AddEventPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "AddEvent"
>;

type AddEventPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "AddEvent"
>;

export interface AddEventProps extends AddEventPropsBaseProps {
  store: Store;
  route: AddEventPropsBaseProps;
  navigation: AddEventPropsNavigationProp;
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
  isSyncClubVenue?: boolean;
  clubVenue?: string;
}

const t = getTranslation([
  "constant.district",
  "constant.eventType",
  "screen.Event",
  "constant.profile",
  "constant.eventType",
  "constant.button",
  "validation",
  "formInput",
]);

export default function AddEvent({ navigation }: AddEventProps) {
  const theme = useTheme();
  const today = new Date();
  const { user } = useAuth();
  const Districts = useMemo(() => {
    return getAllDistricts();
  }, []);

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
      isApproval: true,
    },
  });

  const { data: clubVenueList, isValidating: clubVenuesValidating } = useSWR(
    user?.userType === UserType.ClubStaff && user.club
      ? formatCoreUrl(`/venue/club/${user.club.id}`)
      : undefined,
    () => getClubVenues(user.club.id)
  );

  const district = watch("district");
  const type = watch("type");
  const latestCancellation = watch("latestCancellation");
  const applicationDeadline = watch("applicationDeadline");
  const isSyncClubVenue = watch("isSyncClubVenue");
  const clubVenue = watch("clubVenue");
  const [defaultDate, setDefaultDate] = useState("");
  const [selectedPayload, setSelectedPayload] = useState<FormValue>();

  const [isOpen, setIsOpen] = useState({
    district: false,
    type: false,
    lastCancellation: false,
    durationFrom: false,
    isEventFree: false,
    competitionType: false,
    applicationDeadline: false,
    addContent: false,
    clubVenue: false,
    noVenue: false,
  });

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
      label: `${hOption} ${t("hours")}`,
      value: hOption.toString(),
    };
  });

  const setType = useCallback(
    (newLevel: string) => {
      setValue("typeText", t(newLevel));
    },
    [setValue]
  );

  const setCompetitionType = useCallback(
    (newLevel: string) => {
      console.log(t(newLevel));
      setValue("competitionTypeText", t(newLevel));
    },
    [setValue]
  );

  const setCancellation = useCallback(
    (newLevel: string) => {
      if (newLevel === "") {
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
        console.log("Reset");
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
  const setSyncNoVenue = useCallback(() => {
    setValue("isSyncClubVenue", false);
    setIsOpen((prev) => ({ ...prev, noVenue: true }));
  }, [setValue]);

  const setCleanDistrict = useCallback(() => {
    resetField("districtText");
    resetField("district");
    resetField("address");
    resetField("clubVenue");
  }, [resetField]);

  const setAddressValue = useCallback(
    (newAddress: string) => {
      setValue("address", newAddress);
    },
    [setValue]
  );

  const competitionType = watch("competitionType");

  useEffect(() => {
    if (isSyncClubVenue && (!clubVenueList || !clubVenueList.length)) {
      setSyncNoVenue();
    }
  }, [clubVenueList, isSyncClubVenue, setSyncNoVenue]);

  useEffect(() => {
    if (clubVenueList && clubVenueList.length) {
      setCleanDistrict();
    }
  }, [clubVenueList, isSyncClubVenue, setCleanDistrict]);

  useEffect(() => {
    if (isSyncClubVenue && clubVenue && clubVenueList && clubVenueList.length) {
      const venue = clubVenueList?.find((val) => val.name);
      if (venue) {
        setDistrict(venue.district);
        setAddressValue(venue.address);
      }
    }
  }, [clubVenue, clubVenueList, isSyncClubVenue, setAddressValue, setDistrict]);

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
  }, [setApplicationDeadline, applicationDeadline]);

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

  const isSessionValid = () => {
    if (latestCancellation) {
      const sessions = watch("eventSessions");
      const firstDay = sessions[0];
      let selectedDate = firstDay.date;
      sessions.forEach((session) => {
        if (
          new Date(session.date).getTime() < new Date(firstDay.date).getTime()
        ) {
          selectedDate = session.date;
        }
      });
      const comparedValue = latestCancellation.toString() === "24" ? 1 : 2;
      const dateOffset = 24 * 60 * 60 * 1000 * comparedValue;
      const comparedDate = new Date(selectedDate);
      comparedDate.setTime(comparedDate.getTime() - dateOffset);
      return comparedDate.getTime() > new Date().getTime();
    }
    return true;
  };

  const eventTypeSelection = () => {
    return (
      <VStack space="4">
        <FormInput
          label={t("Competition type")}
          controllerProps={{
            name: "competitionTypeText",
            control,
            rules: { required: type === EventType.Competition },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, competitionType: true }));
          }}
        />
      </VStack>
    );
  };

  const { data: permission, isValidating: isPermissionValidating } = useSWR(
    formatCoreUrl(`/event-permission/${user?.sub}`),
    () => getAddEventPermissions(user?.id)
  );

  if (isPermissionValidating) {
    return (
      <VStack flex="1">
        <Loading />
      </VStack>
    );
  }

  if (!permission || !permission?.canCreate) {
    return (
      <HeaderLayout
        containerProps={{ padding: theme.space.defaultLayoutSpacing }}
        KeyboardAwareScrollViewProps={{
          bounces: false,
        }}
        headerProps={{
          title: t("Event creating"),
          containerStyle: {
            marginHorizontal: 0,
          },
        }}
        isSticky
      >
        <VStack justifyContent="center" alignItems="center" space="4" flex="1">
          <Text>{t("No permission")}</Text>
        </VStack>
      </HeaderLayout>
    );
  }

  const onCreate = async (val: FormValue, isAddContent?: boolean) => {
    // Validate time
    const isSessionGood = isSessionValid();
    if (!isSessionGood) {
      showApiToastErrorWithMessage(
        t("The event date must be greater than now at least %{number} hour", {
          number: latestCancellation,
        })
      );
      return;
    }

    const payload = val;
    if (!val.latestCancellation) {
      delete payload.latestCancellation;
      delete payload.latestCancellationText;
    }

    if (!payload.applicationDeadline || payload.applicationDeadline === "") {
      delete payload.applicationDeadline;
      delete payload.applicationDeadlineText;
    }
    // Create
    try {
      const res = await createEvent(payload);
      setIsOpen((prev) => ({ ...prev, isEventFree: false, addContent: false }));
      if (isAddContent) {
        navigation.navigate("AddContent", { eventId: res.data });
      } else {
        navigation.navigate("AddEventSuccessful", { eventId: res.data });
      }
    } catch (error: any) {
      console.log("error:>>", error);
      showApiToastError(error);
      setIsOpen((prev) => ({ ...prev, isEventFree: false, addContent: false }));
    }
  };

  return (
    <HeaderLayout
      containerProps={{ padding: theme.space.defaultLayoutSpacing }}
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Event creating"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack space="4" flex="1">
        {/* Basic info components */}
        <Heading size="md">{t("Basic Info")}</Heading>
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
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, type: true }));
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
        {/* Address components */}
        <Heading size="md">{t("Address")}</Heading>

        {user?.userType === UserType.ClubStaff && (
          <FormSwitch
            styleForm="style2"
            title={t("Sync with club venue")}
            controllerProps={{
              name: "isSyncClubVenue",
              control,
            }}
          />
        )}
        {isSyncClubVenue && (
          <FormInput
            label={t("Club Venue")}
            controllerProps={{
              name: "clubVenue",
              control,
              rules: {
                required: isSyncClubVenue ? t("is required") : false,
              },
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, clubVenue: true }));
            }}
          />
        )}
        {!isSyncClubVenue && (
          <VStack space="4">
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
          </VStack>
        )}

        {/* Day time settings */}
        {eventDateList()}

        {/* Capacity */}
        <Heading size="md">{t("Capacity")}</Heading>
        <FormInput
          label={t("Capacity")}
          inputProps={{ keyboardType: "numeric" }}
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
          placeholderText={t("Photo")}
          controllerProps={{
            name: "image",
            control,
          }}
        />

        {/* Approval */}
        <FormSwitch
          title={t("Does it require approval")}
          onText={t("Yes")}
          offText={t("No")}
          controllerProps={{
            name: "isApproval",
            control,
          }}
        />
        <Button
          isDisabled={!isValid || isSubmitting}
          style={{ marginTop: "auto" }}
          isLoading={isSubmitting || isOpen.isEventFree || isOpen.addContent}
          onPress={handleSubmit((val) => {
            // Validate time
            const isSessionGood = isSessionValid();
            if (!isSessionGood) {
              showApiToastErrorWithMessage(
                t(
                  "The event date must be greater than now at least %{number} hour",
                  { number: latestCancellation }
                )
              );
            } else {
              navigation.navigate("AddPaymentMethod", {
                event: val,
              });
            }
          })}
          isLoadingText={t("Loading")}
        >
          {t("Continue")}
        </Button>
      </VStack>
      {/* <OneColumnPickerModal
        isOpen={isOpen.district}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, district: false }));
        }}
        headerLabel={`${t("Select")} ${t("District")}`}
        buttonLabel={t("Confirm")}
        options={Districts}
        controllerProps={{
          name: "district",
          control,
          rules: { required: t("is required") },
        }}
      /> */}
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

      {isSyncClubVenue && (
        <SingleSelectModal
          isOpen={isOpen.clubVenue}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, clubVenue: false }));
          }}
          title={`${t("Select")}${t("Club Venue")}`}
          options={clubVenueList?.map((venue) => {
            return { label: venue.name, value: venue.name };
          })}
          controllerProps={{
            name: "clubVenue",
            control,
            rules: {
              required: true,
            },
          }}
          confirmButtonText={t("Confirm")}
        />
      )}

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
      {/* // payment method */}
      {/* <ConfirmationModal
        verticalButtons
        alertType="Fail"
        shouldRenderIcon={false}
        confirmText={t("Yes, add payment method")}
        cancelText={t("Skip")}
        isOpen={isOpen.isEventFree}
        onCancel={handleSubmit((val) => {
          if (permission?.canPost) {
            setIsOpen((prev) => ({
              ...prev,
              isEventFree: false,
              addContent: true,
            }));
          } else {
            onCreate(val);
          }
        })}
        title={t("Is there a fee for the event")}
        onConfirm={handleSubmit((val) => {
          setIsOpen((prev) => ({ ...prev, isEventFree: false }));
          // Validate time
          const isSessionGood = isSessionValid();
          if (!isSessionGood) {
            showApiToastErrorWithMessage(
              t(
                "The event date must be greater than now at least %{number} hour",
                { number: latestCancellation }
              )
            );
          } else {
            navigation.navigate("AddPaymentMethod", { event: val });
          }
        })}
      /> */}
      {/* // Add Linkage */}
      {permission?.canPost && (
        <ConfirmationModal
          verticalButtons
          alertType="Fail"
          shouldRenderIcon={false}
          confirmText={t("Add Linkage")}
          cancelText={t("Skip")}
          isOpen={isOpen.addContent}
          onCancel={handleSubmit((val) => {
            onCreate(val);
            setIsOpen((prev) => ({ ...prev, addContent: false }));
          })}
          title={t("Create content for this event?")}
          onConfirm={handleSubmit((val) => {
            onCreate(val, true);
          })}
        />
      )}

      {/* // No Venue Created */}
      {user?.userType === UserType.ClubStaff && (
        <ConfirmationModal
          alertType="customize"
          // shouldRenderIcon={false}
          confirmText={t("OK")}
          isOpen={isOpen.noVenue}
          customizeIcon={
            <Box
              w="12"
              h="12"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="#66CEE133"
            >
              <LocationIcon size="lg" color="#66CEE1" />
            </Box>
          }
          onConfirm={() => setIsOpen((prev) => ({ ...prev, noVenue: false }))}
          title={t("No Venue Created")}
          description={t(
            "There is no venue created under your club Go to venue tab and add a venue"
          )}
        />
      )}
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
        headerLabel={`${t("Select")} ${t("Date")}`}
        buttonLabel={t("Confirm")}
        concatenator={["-", "-"]}
        options={[yearList, monthList, dateList]}
        controllerProps={{
          name: "applicationDeadline",
          control,
        }}
      /> */}
      <DateTimePicker
        description={t("Latest cancellation period (Optional)")}
        title={`${t("Select")}${t("Date")}`}
        isShow={isOpen.applicationDeadline}
        mode="date"
        controllerProps={{
          name: "applicationDeadline",
          control,
        }}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, applicationDeadline: false }));
        }}
        onDefaultDate={(value) => {
          setDefaultDate(value);
        }}
        defaultDate={defaultDate}
      />
    </HeaderLayout>
  );
}
