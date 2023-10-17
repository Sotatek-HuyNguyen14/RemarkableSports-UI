import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  Heading,
  useTheme,
  VStack,
  Text,
  HStack,
  Pressable,
  Center,
  Box,
} from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../routers/Types";

import HeaderLayout from "../../components/Layout/HeaderLayout";
import FormInput from "../../components/FormInput/FormInput";
import { getTranslation } from "../../utils/translation";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";

import { getAllDistricts } from "../../constants/Districts";
import { OnboardingStepId } from "../../models/responses/Onboarding";
import { formatCoreUrl, formatWorkflowUrl } from "../../services/ServiceUtil";
import { getWorkflowDefinition } from "../../services/WorkflowService";

import { PlayerInfoForm } from "../SignUp/PlayerInfo";
import { isBlank, isPositiveNumber } from "../../utils/strings";
import { CreateCourseRequest } from "../../models/requests/Course";
import { getInputOptions } from "../../services/Workflow";
import { useAuth } from "../../hooks/UseAuth";
import { ClubStaff, UserType } from "../../models/User";
import { getPlayerByClub } from "../../services/ClubServices";
import { getUserName } from "../../utils/name";
import RectangleImagePicker from "../../components/ImagePicker/RectangleImagePicker";

import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { CourseType } from "../../models/responses/Course";
import Loading from "../../components/Loading";
import { getClubVenues } from "../../services/VenueServices";
import FormSwitch from "../../components/Switch/FormSwitch";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import LocationIcon from "../../components/Icons/LocationIcon";

export type AddCoursePropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "AddCourse"
>;
type AddCoursePropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "AddCourse"
>;
export interface AddCourseProps extends AddCoursePropsBaseProps {
  route: AddCoursePropsBaseProps;
  navigation: AddCoursePropsNavigationProp;
}
export interface FormValue extends CreateCourseRequest {
  districtText: string;
  isAssignCoach?: boolean | null;
  typeText: string;
  editedPlayerText: string;
  levelText: string;
  isSyncClubVenue?: boolean;
  clubVenue?: string;
}
const t = getTranslation([
  "constant.district",
  "screen.ClubScreens.Course",
  "constant.profile",
  "constant.button",
  "validation",
  "formInput",
  "screen.AddParticipant",
]);
export default function AddCourse({ navigation, route }: AddCourseProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const staff = user as ClubStaff;
  const { data: def, isValidating: defValidating } = useSWR(
    formatWorkflowUrl("/onboarding/definition"),
    async () => getWorkflowDefinition("onboarding")
  );

  const { data: clubVenueList, isValidating: clubVenuesValidating } = useSWR(
    user?.userType === UserType.ClubStaff && user.club
      ? formatCoreUrl(`/venue/club/${user.club.id}`)
      : undefined,
    () => getClubVenues(user.club.id)
  );

  const [assignedPlayers, setAssignedPlayers] = useState<
    { label: string; value: string }[]
  >([]);

  const Districts = useMemo(() => {
    return getAllDistricts();
  }, []);
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      courseType:
        user?.userType === UserType.Coach ? CourseType.Public : undefined,
    },
  });

  const { data: playerList, isValidating: playerListValidating } = useSWR(
    user?.userType === UserType.ClubStaff
      ? formatCoreUrl(`/club/${staff?.club?.id}/player?status=Approved`)
      : null,
    async () => getPlayerByClub(staff?.club?.id ?? "")
  );
  const levelOptions = getInputOptions<PlayerInfoForm>(
    def,
    "level",
    OnboardingStepId.PlayerInfo
  );
  const courseTypeOptions = [CourseType.Public, CourseType.Private].map((v) => {
    return { label: t(v), value: v };
  });
  const playerOptions = playerList
    ? playerList.map((player) => {
        return {
          label: getUserName(player.candidateInfo),
          value: player.candidateInfo.id,
        };
      })
    : [];
  const shouldRenderCourseType = user?.userType === UserType.ClubStaff;
  const district = watch("district");
  const level = watch("level");
  const capacity = watch("capacity");
  const courseType = watch("courseType");
  const isSyncClubVenue = watch("isSyncClubVenue");
  const clubVenue = watch("clubVenue");
  const [isOpen, setIsOpen] = useState({
    district: false,
    name: false,
    level: false,
    type: false,
    editPlayer: false,
    clubVenue: false,
    noVenue: false,
  });
  const setLevel = useCallback(
    (newLevel: string) => {
      setValue("levelText", t(newLevel));
    },
    [setValue]
  );
  const setDistrict = useCallback(
    (newDistrict: string) => {
      setValue("districtText", t(newDistrict));
      setValue("district", newDistrict);
    },
    [setValue]
  );
  const setType = useCallback(
    (newType: string) => {
      setValue("typeText", t(newType));
    },
    [setValue]
  );

  const setSyncNoVenue = useCallback(() => {
    setValue("isSyncClubVenue", false);
    setIsOpen((prev) => ({ ...prev, noVenue: true }));
  }, [setValue]);

  const setCleanDistrict = useCallback(() => {
    setValue("districtText", "");
    setValue("district", "");
    setValue("address", "");
    setValue("clubVenue", "");
  }, [setValue]);

  const setAddressValue = useCallback(
    (newAddress: string) => {
      setValue("address", newAddress);
    },
    [setValue]
  );

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
    if (courseType) {
      setType(courseType);
    } else {
      setValue("typeText", "");
    }
  }, [courseType, setType, setValue]);

  useEffect(() => {
    if (district) {
      setDistrict(district);
    } else {
      setValue("districtText", "");
    }
  }, [setValue, district, setDistrict]);

  useEffect(() => {
    if (level) {
      setLevel(level);
    } else {
      setValue("levelText", "");
    }
  }, [setValue, level, setLevel]);

  useEffect(() => {
    if (route?.params?.isReset) {
      setValue("levelText", "");
      setValue("districtText", "");
      reset();
    }
  }, [route, setValue, reset]);

  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(-1);

  const assignedPlayersView = () => {
    const shouldShowAddButtonOnly =
      shouldRenderCourseType && assignedPlayers.length < 2;

    const playerItem = (
      player: { label: string; value: string },
      index: number
    ) => {
      return (
        <Pressable
          key={`${player}`}
          onPress={() => {
            setSelectedPlayerIndex(index);
            setIsOpen((prev) => ({ ...prev, editPlayer: true }));
          }}
        >
          <HStack
            key={`${player}`}
            bgColor="rs.white"
            shadow="9"
            borderRadius="2xl"
            style={{
              shadowOffset: {
                width: 5,
                height: 5,
              },
              shadowOpacity: 0.1,
            }}
            px="3"
            alignItems="center"
            justifyContent="space-between"
            py="3"
            borderColor="rs.black"
            borderWidth="0.5"
          >
            <VStack space="1">
              <Text color="#B3B6B8" fontSize="xs">
                {t("Player %{number} name", { number: index + 1 })}
              </Text>
              <Text fontSize="md">{player.label}</Text>
            </VStack>
            <DownArrowIcon mr="2" />
          </HStack>
        </Pressable>
      );
    };

    return (
      <VStack space="3">
        <Heading>{t("Assigned Player(s)")}</Heading>
        {assignedPlayers.map((player, index) => {
          return playerItem(player, index);
        })}
        {/* Add & Remove players */}
        {shouldShowAddButtonOnly ? (
          <Button
            onPress={() => {
              setSelectedPlayerIndex(-1);
              setIsOpen((prev) => ({ ...prev, editPlayer: true }));
            }}
            variant="outline"
            fontWeight="bold"
            p="2"
            borderRadius="2xl"
            _text={{ fontSize: "md", color: "rs.primary_purple" }}
          >
            {t("Add")}
          </Button>
        ) : (
          <HStack space="3">
            <Button
              onPress={() => {
                setSelectedPlayerIndex(-1);
                setIsOpen((prev) => ({ ...prev, editPlayer: true }));
              }}
              flex="1"
              padding="2"
              borderRadius="2xl"
            >
              <Text fontWeight="bold" fontSize="md" color="rs.white">
                {t("Add")}
              </Text>
            </Button>
            <Button
              onPress={() => {
                const newData = assignedPlayers.slice(0, -1);
                setAssignedPlayers(newData);
              }}
              variant="outline"
              flex="1"
              padding="2"
              borderRadius="2xl"
            >
              <Text fontWeight="bold" fontSize="md" color="#31095E">
                {t("Remove")}
              </Text>
            </Button>
          </HStack>
        )}
        <SingleSelectModal
          isOpen={isOpen.editPlayer}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, editPlayer: false }));
          }}
          title={`${t("Select")}${t("Player")}`}
          options={playerOptions.filter((p) => {
            return !assignedPlayers.map((v) => v.value).includes(p.value);
          })}
          controllerProps={{
            name: "editedPlayerText",
            control,
          }}
          confirmButtonText={t("Save")}
          onCloseWithValue={(value) => {
            if (!isBlank(value)) {
              if (selectedPlayerIndex !== -1) {
                // Edit an exsiting player
                const p = playerOptions.filter(
                  (playerr) => playerr.value === value
                )[0];
                const newAssignedPlayers = assignedPlayers.map(
                  (player, index) => {
                    if (index === selectedPlayerIndex) {
                      return p;
                    }
                    return player;
                  }
                );

                setAssignedPlayers(newAssignedPlayers);
              } else {
                // Add new player
                const p = playerOptions.filter(
                  (playerr) => playerr.value === value
                )[0];
                setAssignedPlayers([...assignedPlayers, p]);
                setIsOpen((prev) => ({ ...prev, editPlayer: false }));
              }
            } else if (selectedPlayerIndex !== -1) {
              // Edit an exsiting player
              const newAssignedPlayers = assignedPlayers.map(
                (player, index) => {
                  if (index === selectedPlayerIndex) {
                    return { label: "", value: "" };
                  }
                  return player;
                }
              );

              setAssignedPlayers(newAssignedPlayers);
            }
            setIsOpen((prev) => ({ ...prev, editPlayer: false }));
          }}
        />
      </VStack>
    );
  };

  const isLoading = defValidating || playerListValidating;
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
        title: t("Course creating"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack space="4" flex="1">
        {/* Basic info components */}
        <Heading size="md">{t("Basic info")}</Heading>
        {shouldRenderCourseType && (
          <FormInput
            label={t("Course type")}
            controllerProps={{
              name: "typeText",
              control,
              rules: {
                required: shouldRenderCourseType,
              },
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, type: true }));
            }}
          />
        )}
        <FormInput
          label={t("Course name")}
          controllerProps={{
            name: "name",
            control,
            rules: { required: t("is required") },
          }}
        />
        <FormInput
          inputProps={{ keyboardType: "numeric" }}
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
            />
          </VStack>
        )}
        {courseType === CourseType.Private &&
          shouldRenderCourseType &&
          assignedPlayersView()}
        {courseType === CourseType.Public && (
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
          placeholderText={t("Course photo")}
          controllerProps={{
            name: "courseImage",
            control,
          }}
        />
        {courseType === CourseType.Public && (
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
          isDisabled={
            !isValid ||
            (courseType === CourseType.Private && shouldRenderCourseType
              ? assignedPlayers.length === 0 ||
                (assignedPlayers.length && !assignedPlayers[0].label)
              : false)
          }
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit((value: CreateCourseRequest) => {
            // eslint-disable-next-line no-param-reassign
            value.listAssignedPlayerId = assignedPlayers.map((v) => {
              return v.value;
            });
            if (user?.userType === UserType.Coach) {
              // eslint-disable-next-line no-param-reassign
              value.courseType = CourseType.Public;
            }
            navigation.navigate("AddCourseSession", { course: value });
          })}
        >
          {t("Next")}
        </Button>
      </VStack>
      {isOpen.district && (
        <SingleSelectModal
          isOpen={isOpen.district}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, district: false }));
          }}
          title={`${t("Select")}${t("District")}`}
          options={Districts}
          controllerProps={{
            name: "district",
            control,
          }}
          confirmButtonText={t("Save")}
        />
      )}
      {isOpen.level && (
        <SingleSelectModal
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
          confirmButtonText={t("Save")}
        />
      )}
      {isOpen.type && (
        <SingleSelectModal
          isOpen={isOpen.type}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, type: false }));
          }}
          title={`${t("Select")}${t("Type")}`}
          options={courseTypeOptions}
          controllerProps={{
            name: "courseType",
            control,
          }}
          confirmButtonText={t("Save")}
        />
      )}

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
      {/* // No Venue Created */}
      {user?.userType === UserType.ClubStaff && (
        <ConfirmationModal
          alertType="customize"
          confirmText={t("OK")}
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
          isOpen={isOpen.noVenue}
          onConfirm={() => setIsOpen((prev) => ({ ...prev, noVenue: false }))}
          title={t("No Venue Created")}
          description={t(
            "There is no venue created under your club Go to venue tab and add a venue"
          )}
        />
      )}
    </HeaderLayout>
  );
}
