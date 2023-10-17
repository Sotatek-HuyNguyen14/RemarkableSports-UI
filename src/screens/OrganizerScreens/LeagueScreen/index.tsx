import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import {
  Text,
  Pressable,
  Box,
  Button,
  HStack,
  IconButton,
  VStack,
  Heading,
  Badge,
  Modal,
  Toast,
} from "native-base";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { uniqueId } from "lodash";
import { useFocusEffect } from "@react-navigation/native";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import { getAllClubs } from "../../../services/ClubServices";
import { ClubResponse } from "../../../models/responses/Club";
import ClubDetails from "../../../components/Club/ClubDetails";
import { ClubStatusType } from "../../../models/requests/Club";
import BellIcon from "../../../components/Icons/BellIcon";
import BannerButton from "../../../components/BannerButton";
import CoffeeIcon from "../../../components/Icons/CoffeeIcon";
import {
  DivisionModel,
  LeagueResponse,
  Tier,
} from "../../../models/responses/League";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import Card from "../../../components/Card/Card";
import FormInput from "../../../components/FormInput/FormInput";
import {
  addDivisionForLeague,
  getLeagues,
} from "../../../services/LeagueServices";
import { showApiToastError } from "../../../components/ApiToastError";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import Loading from "../../../components/Loading";
import LogoutIcon from "../../../components/Icons/LogoutIcon";
import useNotification from "../../../hooks/UseNotification";
import { useAuth } from "../../../hooks/UseAuth";
import NotificationBellIcon from "../../../components/Icons/NotificationBellIcon";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import LeaderboardCard from "../../../components/Card/LeaderboardCard";

const t = getTranslation([
  "constant.district",
  "screen.OrganizerScreens.LeagueHome",
  "component.ArrayDivisionsInput",
  "constant.button",
  "formInput",
  "leagueTerms",
  "toastMessage",
]);

interface FormValue {
  selectedLeague?: LeagueResponse;
  name: string;
  tier: string;
}

let IS_NOTI_SET_UP = false;

export default function LeagueHome({
  navigation,
}: NativeStackScreenProps<MainStackNavigatorParamList, "OrganizerNavigator">) {
  const {
    data: leagues,
    isValidating: leagueListIsValidating,
    error: leagueListError,
    mutate: leagueListMutate,
  } = useSWR(formatCoreUrl("/league"), () => getLeagues());
  const leagueOptions =
    leagues && leagues.map((l) => ({ label: l.name, value: l }));
  const [showLeagueSelection, setShowLeagueSelection] = useState(false);
  const [addDivisionModal, setAddDivisionModal] = useState(false);
  const [tierModal, setTierModal] = useState(false);

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
      selectedLeague: leagues && leagues[0] ? leagues[0] : undefined,
    },
  });

  const { updateNotification, cleanUpNotifications } = useNotification();

  const setUpNotificationPostLogin = async () => {
    try {
      await updateNotification();
    } catch (error) {
      console.log("Ignored", error);
    }
  };

  if (!IS_NOTI_SET_UP) {
    IS_NOTI_SET_UP = true;
    setUpNotificationPostLogin();
  }

  const { logout } = useAuth();

  const mutateAll = useCallback(() => {
    leagueListMutate();
  }, [leagueListMutate]);

  useFocusEffect(
    React.useCallback(() => {
      mutateAll();
    }, [mutateAll])
  );

  const noLeagueComponent = () => {
    return (
      <HStack
        space={2}
        alignItems="center"
        bg="orange.100"
        p="4"
        borderRadius="8"
      >
        <Box
          w="8"
          h="8"
          alignItems="center"
          pl="1.5"
          pt="1"
          justifyContent="center"
          borderRadius="full"
          bgColor="rgba(232, 106, 16, 0.15)"
        >
          <CoffeeIcon />
        </Box>
        <Heading fontSize="md">{t("No league now")}</Heading>
      </HStack>
    );
  };

  const selectedLeague = watch("selectedLeague");
  const league =
    leagues && leagues.filter((l) => l.id === selectedLeague?.id)[0];

  const tierOptions = [
    Tier.DivisionA,
    Tier.DivisionB,
    Tier.DivisionC,
    Tier.DivisionD,
  ].map((tier) => ({
    value: `${t(tier)}`,
    label: `${t(tier)}`,
  }));

  const addDivisionModalComponent = () => {
    const name = watch("name");
    const tier = watch("tier");
    return (
      <Modal
        size="full"
        isOpen={addDivisionModal}
        onClose={() => {
          setAddDivisionModal(false);
        }}
      >
        <Modal.Content>
          <Modal.Header>{`${t("Add")}${t("Division")}`}</Modal.Header>
          <Modal.CloseButton />
          <Modal.Body>
            <VStack space="4" alignItems="center">
              <FormInput
                label={`${t("Name")} *`}
                controllerProps={{
                  name: "name",
                  control,
                }}
              />
              <FormInput
                label={`${t("Tier")} *`}
                inputProps={{
                  editable: false,
                  InputRightElement: <DownArrowIcon mr="4" />,
                }}
                onPress={() => {
                  setTierModal(true);
                }}
                controllerProps={{
                  name: "tier",
                  control,
                }}
              />
              <Button
                p="4"
                w="100%"
                isDisabled={!name || !tier}
                isLoadingText={t("Loading")}
                onPress={async () => {
                  setAddDivisionModal(false);
                  try {
                    if (selectedLeague?.id) {
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
                      console.log({
                        leagueId: selectedLeague?.id,
                        name,
                        tier: tierMapping[tier.split(" ")[0]],
                      });
                      await addDivisionForLeague({
                        leagueId: selectedLeague?.id,
                        name,
                        tier: tierMapping[tier.split(" ")[0]],
                      });
                      Toast.show({
                        id: "addDivisionSuccess",
                        duration: 2000,
                        placement: "top",
                        render: () => {
                          return (
                            <MessageToast
                              type={MesssageToastType.Success}
                              title={`${t("Add")}${t("Division")} ${t(
                                "Successful"
                              )}`}
                            />
                          );
                        },
                      });

                      resetField("name");
                      resetField("tier");
                      mutateAll();
                    }
                  } catch (error) {
                    showApiToastError(error);
                  }
                }}
              >
                {`${t("Add")}${t("Division")}`}
              </Button>
              <SingleSelectModal
                onChangeValue={(value) => {}}
                confirmButtonText={t("Confirm")}
                isOpen={tierModal}
                onClose={() => {
                  setTierModal(false);
                }}
                title={`${t("Select")}${t("Tier")}`}
                options={tierOptions}
                controllerProps={{
                  name: "tier",
                  control,
                }}
              />
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  const divisionCell = (
    leaugueResponse: LeagueResponse,
    division: DivisionModel
  ) => {
    return (
      <Pressable
        key={`division_${division.id}_${league?.id}`}
        onPress={() => {
          navigation.navigate("ManageDivision", {
            league: leaugueResponse,
            division,
          });
        }}
      >
        <Card
          onPress={() => {
            navigation.navigate("ManageDivision", {
              league: leaugueResponse,
              division,
            });
          }}
          key={`division_${division.id}_${league?.id}_card`}
          containerProps={{ style: { borderRadius: 14 } }}
          body={
            <HStack alignItems="center" space="2">
              <Badge w="24" bg="rs.primary_purple">
                <Text color="rs.white">{`${t(division.tier)}`}</Text>
              </Badge>
              <Heading fontSize="md">{division.name}</Heading>
            </HStack>
          }
        />
      </Pressable>
    );
  };

  const leagueScreen = () => {
    return (
      <VStack space="4">
        {/* Dropdown selection */}
        <Pressable
          onPress={() => {
            setShowLeagueSelection(true);
          }}
        >
          <HStack
            justifyContent="space-between"
            bg="gray.200"
            p="4"
            borderRadius="2xl"
          >
            {league ? (
              <VStack space="1">
                <Text color="gray.700">{league.name}</Text>
                <Text color="gray.700">{league.season}</Text>
              </VStack>
            ) : (
              <Text color="gray.700">{t("Please select a league")}</Text>
            )}
            <DownArrowIcon size="sm" />
          </HStack>
        </Pressable>

        {/* League list */}
        {league?.divisions.map((division) => {
          return (
            <VStack
              key={`division_cell_${division.name}_${division.tier}_${division.id}_${league.id}`}
            >
              {divisionCell(league, division)}
            </VStack>
          );
        })}

        {/* Add button */}
        <Pressable
          onPress={() => {
            setAddDivisionModal(true);
          }}
        >
          <Badge
            borderColor="rs_secondary.green"
            variant="outline"
            bg="rs_secondary.green"
            _text={{ color: "rs.white", fontSize: 14 }}
            mr={3}
            w="40"
            p="2"
            borderRadius="full"
          >
            {`+ ${t("Add")}${t("Division")}`}
          </Badge>
        </Pressable>
      </VStack>
    );
  };

  if (leagueListIsValidating) {
    <Loading />;
  }
  return (
    <HeaderLayout
      headerProps={{
        hasBackButton: false,
        title: t("League"),
        rightComponent: (
          <HStack justifyContent="center" alignItems="center" space="2">
            <IconButton
              onPress={() => {
                navigation.navigate("NotificationCentre");
              }}
              icon={<NotificationBellIcon />}
            />
            <Pressable
              onPress={async () => {
                try {
                  await cleanUpNotifications();
                } catch (cleanError: any) {
                  console.log(cleanError);
                }
                await logout();
                navigation.reset({ index: 0, routes: [{ name: "LogIn" }] });
              }}
            >
              <LogoutIcon />
            </Pressable>
          </HStack>
        ),
      }}
      isSticky
      supportPullToRefresh
      onRefresh={() => {
        mutateAll();
      }}
    >
      <VStack mt="4" mb="4">
        <BannerButton
          headerLabel={t("CreateLeague")}
          description={t(
            "Tap here to create a new league and division for player to join teams"
          )}
          onPress={() => {
            navigation.navigate("AddLeague");
          }}
        />
      </VStack>
      <VStack mx="defaultLayoutSpacing">
        <LeaderboardCard
          title={t("Statistic")}
          onPress={() => {
            if (selectedLeague) {
              navigation.navigate("DivisionLeaderboard", {
                league: selectedLeague,
              });
            } else {
              Toast.show({
                id: uniqueId(),
                duration: 2000,
                placement: "top",
                render: () => {
                  return (
                    <MessageToast
                      type={MesssageToastType.Error}
                      title={t("Please select a league")}
                    />
                  );
                },
              });
            }
          }}
        />
        <HStack justifyContent="space-between" alignItems="center" my="2">
          <Text fontSize="md" fontWeight="bold" color="gray.600">
            {t("Created league")}
          </Text>
          <Pressable
            _pressed={{ opacity: 0.5 }}
            onPress={() => {
              if (league) {
                navigation.navigate("UpdateLeague", { league });
              }
            }}
          >
            <Text fontWeight="bold" color="rs.primary_purple" fontSize={16}>
              {t("Edit")}
            </Text>
          </Pressable>
        </HStack>
        {leagues && leagues.length > 0 ? leagueScreen() : noLeagueComponent()}
      </VStack>
      {leagues && (
        <SingleSelectModal
          confirmButtonText={t("Confirm")}
          isOpen={showLeagueSelection}
          onClose={() => setShowLeagueSelection(false)}
          title={`${t("Select")}${t("League")}`}
          options={leagueOptions}
          controllerProps={{
            name: "selectedLeague",
            control,
            rules: {
              required: true,
            },
          }}
        />
      )}
      {addDivisionModalComponent()}
    </HeaderLayout>
  );
}
