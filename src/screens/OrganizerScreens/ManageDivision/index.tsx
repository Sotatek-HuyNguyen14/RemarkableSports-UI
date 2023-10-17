/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Heading,
  useTheme,
  VStack,
  Text,
  Toast,
  HStack,
  Pressable,
  Badge,
  Box,
} from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "react-native-document-picker";
import * as FileSystem from "expo-file-system";
import { groupBy } from "lodash";
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
import ArrayAddTeamInput from "./ArrayAddTeamInput";
import CustomFormInput from "../../../components/CustomFormInput/CustomFormInput";
import CustomInput from "../../../components/FormInput/CustomInput";
import PencilIcon from "../../../components/Icons/PencilIcon";
import BinIcon from "../../../components/Icons/BinIcon";
import CheckIcon from "../../../components/Icons/CheckIcon";
import ChooseIcon from "../../../components/Icons/ChooseIcon";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { showApiToastError } from "../../../components/ApiToastError";
import TipIcon from "../../../components/Icons/TipIcon";
import GreenTipIcon from "../../../components/Icons/GreenTipIcon";
import CoffeeIcon from "../../../components/Icons/CoffeeIcon";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import FixtureItem from "./FixtureItem";
import {
  addTeamToDivision,
  deleteTeamFromDivision,
  exportFixture,
  filterFixtureBySeasonAndRound,
  getAllDivisionMatchResults,
  getFixture,
  getMaxNumberOfRound,
  getMaxNumberOfSeason,
  getTeamsInDivision,
  groupFixtures,
  groupMatchResultsByFixtureSessionAndRound,
  importFixture,
  updateTeamToDivision,
} from "../../../services/LeagueServices";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import {
  DivisionMatchResultResponse,
  DivisionMatchResultStatus,
  GroupedMatchResultsByFixtureSessionAndRound,
  TeamApplicationStatus,
} from "../../../models/responses/League";
import Loading from "../../../components/Loading";
import ImportIcon from "../../../components/Icons/ImportIcon";
import ExportIcon from "../../../components/Icons/ExportIcon";
import ResultItem from "./ResultItem";
import DivisionMatchResultItem from "./DivisionResultItem";

export type ManageDivisionPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ManageDivision"
>;

type ManageDivisionPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "ManageDivision"
>;

export interface ManageDivisionProps extends ManageDivisionPropsBaseProps {
  store: Store;
  route: ManageDivisionPropsBaseProps;
  navigation: ManageDivisionPropsNavigationProp;
}

export interface FormValue {
  name: string;
  season: string;
  divisions: [];
  newTeam: { team: string }[];
  newEditedName: string;
  bottomNavigationRoute: string;
}

const t = getTranslation([
  "constant.district",
  "constant.eventType",
  "screen.OrganizerScreens.ManageDivision",
  "constant.profile",
  "component.FixtureItem",
  "constant.button",
  "formInput",
  "leagueTerms",
  "toastMessage",
]);

export default function ManageDivision({
  navigation,
  route,
}: ManageDivisionProps) {
  const theme = useTheme();

  const { league, division } = route.params;

  const [activePage, setActivePage] = useState(0);
  const [teamAdding, setTeamAdding] = useState(false);
  const [teamEditing, setTeamEditing] = useState(false);
  const [fixtureOpen, setImportFixtureOpen] = useState(false);
  const [selectedEditTeamId, setSelectedEditTeamId] = useState<Number | null>(
    null
  );
  const [selectedDeleteTeamId, setSelectedDeleteTeamId] =
    useState<Number | null>(null);
  const [isDeleteTeamOpen, setDeleteTeamOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    resetField,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {},
  });

  const {
    data: divisionTeams,
    isValidating: divisionTeamValidating,
    error: divisionTeamsError,
    mutate: divisionTeamsMutate,
  } = useSWR(formatCoreUrl(`/division/${division.id}/teams`), () =>
    getTeamsInDivision(division.id)
  );

  const {
    data: fixtures,
    isValidating: fixtureValidating,
    error: fixtureError,
    mutate: fixtureMutate,
  } = useSWR(formatCoreUrl(`/fixture`), () =>
    getFixture({ divisionId: division.id })
  );

  const {
    data: matchResultsData,
    isValidating: matchResultValidating,
    error: matchError,
    mutate: matchResultMutate,
  } = useSWR(
    division.id ? formatCoreUrl(`/division/${division.id}`) : undefined,
    () => {
      if (division.id) {
        return getAllDivisionMatchResults({ divisionId: division.id });
      }
    }
  );

  const mutateAll = useCallback(() => {
    divisionTeamsMutate();
    fixtureMutate();
    matchResultMutate();
  }, [divisionTeamsMutate, fixtureMutate, matchResultMutate]);

  useFocusEffect(
    React.useCallback(() => {
      mutateAll();
    }, [mutateAll])
  );

  const tabSelectors = () => {
    return (
      <HStack>
        <Pressable
          onPress={() => {
            setActivePage(0);
          }}
          flex="1"
          borderBottomWidth="2"
          borderBottomColor={
            activePage === 0 ? "rs.primary_purple" : "rs.button_grey"
          }
          p="4"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            fontWeight="bold"
            fontSize="md"
            color={activePage === 0 ? "rs.primary_purple" : "rs.button_grey"}
          >
            {t("Table")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setActivePage(1);
          }}
          flex="1"
          borderBottomWidth="2"
          borderBottomColor={
            activePage === 1 ? "rs.primary_purple" : "rs.button_grey"
          }
          p="4"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            fontWeight="bold"
            fontSize="md"
            color={activePage === 1 ? "rs.primary_purple" : "rs.button_grey"}
          >
            {t("Fixture")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setActivePage(2);
          }}
          flex="1"
          borderBottomWidth="2"
          borderBottomColor={
            activePage === 2 ? "rs.primary_purple" : "rs.button_grey"
          }
          p="4"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            fontWeight="bold"
            fontSize="md"
            color={activePage === 2 ? "rs.primary_purple" : "rs.button_grey"}
          >
            {t("Result")}
          </Text>
        </Pressable>
      </HStack>
    );
  };

  const newTeam = watch("newTeam");
  const editedTeams = divisionTeams || [];
  const newEditedName = watch("newEditedName");

  const tableView = () => {
    let shouldShowApproveTeamRequest = false;
    division.teams.forEach((team) => {
      team.members.forEach((member) => {
        if (member.status === TeamApplicationStatus.Pending) {
          shouldShowApproveTeamRequest = true;
        }
      });
    });
    return (
      <>
        <VStack space="4" mx="defaultLayoutSpacing">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            {league.name}
          </Text>

          {shouldShowApproveTeamRequest && (
            <HStack space="2" p="4" bg="rs.lightGrey" borderRadius="md">
              <GreenTipIcon />
              <VStack>
                <Heading fontSize="md">{t("Approve Request")}</Heading>
                <Text fontSize="md" flexWrap="wrap">
                  {t("You may click to the team and check all application")}
                </Text>
              </VStack>
            </HStack>
          )}

          {/* Team info */}
          <HStack justifyContent="space-between">
            <HStack>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                #
              </Text>
              <Text ml="2" fontSize="sm" fontWeight="semibold" color="gray.700">
                {t("Team")}
              </Text>
            </HStack>
            {!teamEditing && (
              <Pressable
                _pressed={{ opacity: 0.5 }}
                onPress={() => {
                  setTeamEditing(true);
                }}
              >
                <Text color="rs.primary_purple" fontWeight="bold" fontSize="sm">
                  {t("Edit")}
                </Text>
              </Pressable>
            )}
          </HStack>
        </VStack>

        {/* Add team - Save team adding button */}
        {!teamEditing && (
          <>
            <VStack space="0" mt="2">
              {divisionTeams &&
                divisionTeams.length > 0 &&
                divisionTeams.map((team, index) => {
                  return (
                    <Pressable
                      onPress={() => {
                        navigation.navigate("TeamRequest", { teamId: team.id });
                      }}
                    >
                      <HStack
                        key={`${division.name}_${team.id}`}
                        alignItems="center"
                        bg={index % 2 === 0 ? "gray.300" : "gray.200"}
                        p="4"
                        justifyContent="space-between"
                      >
                        <HStack space="4">
                          <Text fontWeight="bold">{index + 1}</Text>
                          <Text fontWeight="bold">{team.name}</Text>
                        </HStack>
                        {!teamAdding &&
                          team.members &&
                          team.members.filter(
                            (member) =>
                              member.status === TeamApplicationStatus.Pending
                          ).length > 0 && (
                            <HStack
                              space="1"
                              justifyContent="center"
                              alignItems="center"
                            >
                              <HStack
                                w="6"
                                h="6"
                                borderRadius="full"
                                bg="rs.green"
                                justifyContent="center"
                                alignItems="center"
                              >
                                <Text
                                  fontWeight="bold"
                                  fontSize="md"
                                  color="white"
                                >
                                  {
                                    team.members.filter(
                                      (member) =>
                                        member.status ===
                                        TeamApplicationStatus.Pending
                                    ).length
                                  }
                                </Text>
                              </HStack>
                              <Heading fontSize="md">{`>`}</Heading>
                            </HStack>
                          )}
                      </HStack>
                    </Pressable>
                  );
                })}

              <ArrayAddTeamInput
                shouldShowArrayInput={teamAdding}
                startIndex={(divisionTeams && divisionTeams.length) || 0}
                onPressAddTeam={() => {
                  setTeamAdding(true);
                }}
                label={t("Team name")}
                controllerProps={{ control, name: "newTeam" }}
              />
            </VStack>
            {teamAdding && (
              <Button
                my="4"
                mx="4"
                onPress={async () => {
                  setTeamAdding(false);
                  try {
                    for (const team of newTeam) {
                      await addTeamToDivision({
                        teamName: team.team,
                        divisionId: division.id,
                      });
                    }
                    Toast.show({
                      id: "addTeamSuccess",
                      duration: 2000,
                      placement: "top",
                      render: () => {
                        return (
                          <MessageToast
                            type={MesssageToastType.Success}
                            title={`${t("Add")}${t("Team")}${t(
                              "Successfully"
                            )}`}
                            body={t(
                              "You have successfully add teams to the division"
                            )}
                          />
                        );
                      },
                    });
                    resetField("newTeam");
                    mutateAll();
                  } catch (error) {
                    showApiToastError(error);
                  }
                }}
              >
                {t("Save")}
              </Button>
            )}
          </>
        )}

        {teamEditing && (
          <VStack space="0" mt="2">
            {editedTeams &&
              editedTeams.length > 0 &&
              editedTeams.map((team, index) => {
                if (team.id === selectedEditTeamId) {
                  return (
                    <HStack
                      key={`${division.name}_${team}`}
                      w="100%"
                      alignItems="center"
                      bg={index % 2 === 0 ? "gray.300" : "gray.200"}
                      p="4"
                    >
                      <CustomInput
                        label={t("Team name")}
                        containerProps={{
                          style: {
                            backgroundColor:
                              index % 2 === 0 ? "gray.300" : "gray.200",
                            flex: 1,
                          },
                        }}
                        customPlaceHolder={false}
                        controllerProps={{
                          name: "newEditedName",
                          control,
                        }}
                        inputProps={{
                          bgColor: index % 2 === 0 ? "gray.300" : "gray.200",
                          borderColor:
                            index % 2 === 0 ? "gray.300" : "gray.200",
                        }}
                      />
                      <Button
                        size="sm"
                        variant="link"
                        onPress={() => {
                          editedTeams.map((edit) => {
                            if (edit.id === selectedEditTeamId) {
                              edit.name = newEditedName;
                            }
                            return edit;
                          });
                          setSelectedEditTeamId(null);
                          setValue("newEditedName", "");
                        }}
                      >
                        {t("Done")}
                      </Button>
                    </HStack>
                  );
                }
                return (
                  <HStack
                    key={`${division.name}_${team}`}
                    alignItems="center"
                    bg={index % 2 === 0 ? "gray.300" : "gray.200"}
                    p="4"
                    justifyContent="space-between"
                  >
                    <HStack space="4">
                      <Text fontWeight="bold">{index + 1}</Text>
                      <Text fontWeight="bold">{team.name}</Text>
                    </HStack>

                    {teamEditing && (
                      <HStack space="3">
                        <Pressable
                          onPress={() => {
                            setSelectedEditTeamId(team.id);
                            setValue("newEditedName", team.name);
                          }}
                        >
                          <PencilIcon size="sm" />
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            setSelectedDeleteTeamId(team.id);
                            setDeleteTeamOpen(true);
                          }}
                        >
                          <BinIcon size="sm" />
                        </Pressable>
                      </HStack>
                    )}
                  </HStack>
                );
              })}
          </VStack>
        )}
        {teamEditing && (
          <Button
            my="4"
            mx="4"
            onPress={async () => {
              setTeamEditing(false);
              try {
                for (const team of editedTeams) {
                  const oldDataTeam = divisionTeams?.filter(
                    (old) => old.id === team.id
                  )[0];
                  if (oldDataTeam) {
                    await updateTeamToDivision({
                      newName: team.name,
                      teamId: team.id,
                    });
                  }
                }
                Toast.show({
                  id: "editTeam",
                  duration: 2000,
                  placement: "top",
                  render: () => {
                    return (
                      <MessageToast
                        type={MesssageToastType.Success}
                        title={`${t("EditTeam")}${t("Successfully")}`}
                        body={t(
                          "You have successfully edit teams to the division"
                        )}
                      />
                    );
                  },
                });
                mutateAll();
              } catch (error) {
                showApiToastError(error);
              }
            }}
          >
            {t("Finish editing")}
          </Button>
        )}
        <ConfirmationModal
          alertType="Fail"
          confirmText={t("Confirm")}
          cancelText={t("Cancel")}
          isOpen={isDeleteTeamOpen}
          onCancel={() => {
            setDeleteTeamOpen(false);
          }}
          title={t("Are you sure to delete this team")}
          description={t(
            "Warning Deleting the team may result in loss of results"
          )}
          onConfirm={async () => {
            setDeleteTeamOpen(false);
            try {
              if (selectedDeleteTeamId) {
                await deleteTeamFromDivision({ teamId: selectedDeleteTeamId });
              }
              mutateAll();
            } catch (error) {
              showApiToastError(error);
            }
          }}
        />
      </>
    );
  };

  const fixtureActions = [
    { label: t("Browse file"), value: "Browse file", id: 0 },
  ];
  const fixtureView = () => {
    const isNoFixture = fixtures && fixtures.length === 0;
    const groupedFixtureBySessionAndRound = fixtures
      ? groupFixtures(fixtures)
      : [];
    if (fixtureValidating) {
      return <Loading />;
    }
    return (
      <VStack space="4" mx="defaultLayoutSpacing" mt="4">
        {isNoFixture ? (
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
            <VStack>
              <Heading fontSize="md">{t("No fixture now")}</Heading>
              <Text>{t("Please upload the fixtures through a csv file")}</Text>
            </VStack>
          </HStack>
        ) : (
          <VStack space="4">
            {!isNoFixture && (
              <HStack space={3} bg="orange.100" p="4" borderRadius="8">
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
                <VStack space="2" flex="1">
                  <Heading fontSize="md">{`${t("Update")} ${t(
                    "Fixture"
                  )} `}</Heading>
                  <Text flexWrap="wrap">
                    {t(
                      "Upload fixtures from time-to-time to keep the fixtures up-to-date or you can simply click Edit below"
                    )}
                  </Text>
                  <HStack space="2">
                    <Button
                      flex="1"
                      size="sm"
                      isLoading={importLoading}
                      onPress={() => {
                        try {
                          setImportFixtureOpen(true);
                        } catch (error) {
                          showApiToastError(error);
                        }
                      }}
                    >
                      <HStack space="2">
                        <ImportIcon />
                        <Text color="rs.white" fontWeight="bold" fontSize={16}>
                          {t("Import")}
                        </Text>
                      </HStack>
                    </Button>
                    <Button
                      flex="1"
                      size="sm"
                      isLoading={exportLoading}
                      onPress={async () => {
                        setExportLoading(true);
                        try {
                          const groupedBySeasonsIds = fixtures
                            ? Object.keys(
                                groupBy(fixtures, (fixture) => fixture.season)
                              )
                            : [];
                          for (const seasonId of groupedBySeasonsIds) {
                            await exportFixture(division.id, seasonId);
                          }
                          Toast.show({
                            id: "exportDone",
                            duration: 2000,
                            placement: "top",
                            render: () => {
                              return (
                                <MessageToast
                                  type={MesssageToastType.Success}
                                  title={`${t("Export")} ${t("Fixture")} ${t(
                                    "Successful"
                                  )}`}
                                />
                              );
                            },
                          });
                          setExportLoading(false);
                        } catch (error) {
                          setExportLoading(false);
                          showApiToastError(error);
                        }
                      }}
                    >
                      <HStack space="2">
                        <ExportIcon />
                        <Text color="rs.white" fontWeight="bold" fontSize={16}>
                          {t("Export")}
                        </Text>
                      </HStack>
                    </Button>
                  </HStack>
                </VStack>
              </HStack>
            )}
            {groupedFixtureBySessionAndRound.map((group) => {
              return (
                <VStack space="2">
                  <HStack width="100%" alignItems="center" my="2">
                    <Text
                      flex="1"
                      textAlign="center"
                      fontWeight="bold"
                      color="rs_secondary.orange"
                      fontSize="md"
                      ml="8"
                    >
                      {`${t("Season")} ${group.season} - ${t("Round")} ${
                        group.round
                      }`}
                    </Text>
                    <Pressable
                      alignSelf="flex-end"
                      onPress={() => {
                        navigation.navigate("EditFixture", {
                          groupedFixture: group,
                          divisionId: division.id,
                        });
                      }}
                    >
                      <Text fontWeight="bold" color="rs.primary_purple" mr="1">
                        {t("Edit")}
                      </Text>
                    </Pressable>
                  </HStack>
                  {group.fixtures &&
                    group.fixtures.length > 0 &&
                    group.fixtures.map((f) => {
                      return <FixtureItem fixture={f} />;
                    })}
                </VStack>
              );
            })}
          </VStack>
        )}
        {isNoFixture && (
          <Button
            isLoading={importLoading}
            variant={isNoFixture ? "solid" : "outline"}
            onPress={() => {
              setImportFixtureOpen(true);
            }}
          >
            {`${t("Import")} ${t("Fixture")}`}
          </Button>
        )}

        <SingleSelectModal
          title={`${t("Import")} ${t("Fixture")}`}
          showSelectedIcon={false}
          options={fixtureActions}
          defaultIndex={0}
          controllerProps={{
            name: "bottomNavigationRoute",
            control,
            rules: {
              required: true,
            },
          }}
          isOpen={fixtureOpen}
          onClose={() => {
            setImportFixtureOpen(false);
          }}
          onPressItem={async (item) => {
            switch (item.value) {
              case "Browse file":
                /*
                  Object {
    "fileCopyUri": "file:///Users/henry/Library/Developer/CoreSimulator/Devices/path/application-9b9c3df6-2f00-4d2b-8daf-fb056a1d56b4.ipa",
    "name": "application-9b9c3df6-2f00-4d2b-8daf-fb056a1d56b4.ipa",
    "size": 8312051,
    "uri": "file:///Users/henry/Library/Developer/CoreSimulator/Devices/path/application-9b9c3df6-2f00-4d2b-8daf-fb056a1d56b4.ipa",
  },
                 */
                setImportFixtureOpen(false);
                setImportLoading(true);
                try {
                  const result = await DocumentPicker.pick({
                    copyTo: "cachesDirectory",
                  });
                  await importFixture({
                    file: result[0].fileCopyUri || result[0].uri,
                    leagueId: league.id,
                  });
                  Toast.show({
                    id: "importFixtureDone",
                    duration: 2000,
                    placement: "top",
                    render: () => {
                      return (
                        <MessageToast
                          type={MesssageToastType.Success}
                          title={`${t("Import")} ${t("Fixture")}${t(
                            "Successful"
                          )}`}
                        />
                      );
                    },
                  });
                  setImportLoading(false);
                  mutateAll();
                } catch (error) {
                  console.log("erro:", error);
                  setImportLoading(false);
                  showApiToastError(error);
                }
                break;
              default:
                break;
            }
          }}
        />
      </VStack>
    );
  };

  const resultView = () => {
    if (matchResultValidating) {
      return <Loading />;
    }
    if (
      !matchResultsData ||
      (matchResultsData && matchResultsData.length === 0)
    ) {
      return (
        <VStack flex="1">
          <Text>{t("No match result found for this division")}</Text>
        </VStack>
      );
    }

    const localResultsData = matchResultsData;
    // .filter((val) => val.submitted);
    const results: GroupedMatchResultsByFixtureSessionAndRound[] =
      groupMatchResultsByFixtureSessionAndRound(localResultsData);

    return (
      <VStack mx="defaultLayoutSpacing" p="1">
        {/* Bulk approve */}
        <HStack bg="orange.100" space={2} p="3" borderRadius="8">
          <Box
            w="8"
            h="8"
            alignItems="center"
            pl="1.5"
            pt="1"
            justifyContent="center"
            borderRadius="full"
            bgColor="rgba(232, 106, 16, 0.15)"
            mt="2"
          >
            <CoffeeIcon />
          </Box>
          <VStack space="3" p="1" flex="1">
            <Heading fontSize="md">{t("Pending approval")}</Heading>
            <Text flexWrap="wrap" mr="6">
              {t(
                "Approve results that have been submitted by the home team and acknowledged by the away team"
              )}
            </Text>
            <Pressable
              w="100%"
              padding="2"
              bg="rs.primary_purple"
              onPress={() => {
                navigation.navigate("ResultApproval", {
                  divisionId: division.id,
                });
              }}
              justifyContent="center"
              alignItems="center"
              borderRadius="2xl"
            >
              <Text color="white" fontWeight="bold" fontSize={16}>
                {t("View")}
              </Text>
            </Pressable>
          </VStack>
        </HStack>
        {results.map((group) => {
          return (
            <VStack space="2">
              <HStack width="100%" alignItems="center" my="2">
                <Text
                  flex="1"
                  textAlign="center"
                  fontWeight="bold"
                  color="rs_secondary.orange"
                  fontSize="md"
                  ml="8"
                >
                  {`${t("Season")} ${group.season} - ${t("Round")} ${
                    group.round
                  }`}
                </Text>
              </HStack>
              {group.matchResults &&
                group.matchResults.length > 0 &&
                group.matchResults.map((matchResult) => {
                  return (
                    <DivisionMatchResultItem
                      onPressDetail={() => {
                        navigation.navigate("MatchResult", {
                          matchResultId: matchResult.id,
                        });
                      }}
                      matchResult={matchResult}
                    />
                  );
                })}
            </VStack>
          );
        })}
      </VStack>
    );
  };

  if (divisionTeamValidating) {
    <Loading />;
  }
  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: division.name,
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack space="4" my="2">
        {tabSelectors()}
      </VStack>
      {activePage === 0 && tableView()}
      {activePage === 1 && fixtureView()}
      {activePage === 2 && resultView()}
    </HeaderLayout>
  );
}
