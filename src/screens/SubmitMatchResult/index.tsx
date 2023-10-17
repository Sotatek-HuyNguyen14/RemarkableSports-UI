/* eslint-disable @typescript-eslint/no-shadow */
import {
  VStack,
  useTheme,
  Text,
  HStack,
  Button,
  Pressable,
  Heading,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import { Alert, Keyboard, LayoutAnimation, StyleSheet } from "react-native";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import GhostTabbar from "../../components/GhostTabBar";
import { getTranslation } from "../../utils/translation";
import FormInput from "../../components/FormInput/FormInput";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import { PlayerInputType } from "../OrganizerScreens/UpdateMatchResult/ArrayTeamMemberInput";
import { MainStackNavigatorParamList } from "../../routers/Types";
import OneColumnPickerModal from "../../components/Modal/OneColumnPickerModal";
import CustomInput from "../../components/FormInput/CustomInput";
import {
  saveMatchResult,
  submitMatchResult,
} from "../../services/LeagueServices";
import { showApiToastError } from "../../components/ApiToastError";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { TestMatchResult } from "./MatchResultModel";
import { formatName, getUserName } from "../../utils/name";
import {
  UpdateMatchResultRequest,
  SubmitMatchResultRequest,
} from "../../models/requests/Leagues";
import {
  DivisionMatchResultResponse,
  MatchPlayer,
  TeamApplicationStatus,
} from "../../models/responses/League";
import ArrayTeamMemberSubmitInput from "./ArrayTeamMemberSubmitInput";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";

export type SubmitMatchResultProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "SubmitMatchResult"
>;

export interface FormValue {
  homeTeamName: string;
  awayTeamName: string;
  homeTeamPlayer: string[];
  awayTeamPlayer: string[];

  homeTeamEachMatchPoint: string;
  homeTeamNumberOfPlayerPoint: string;
  homeTeamAdditionalPoint: string;

  awayTeamEachMatchPoint: string;
  awayTeamNumberOfPlayerPoint: string;
  awayTeamAdditionalPoint: string;

  homeTeamGame1Score: string;
  homeTeamGame2Score: string;
  homeTeamGame3Score: string;
  homeTeamGame4Score: string;
  homeTeamGame5Score: string;

  awayTeamGame1Score: string;
  awayTeamGame2Score: string;
  awayTeamGame3Score: string;
  awayTeamGame4Score: string;
  awayTeamGame5Score: string;

  selectedGameId: string | number;
}

const t = getTranslation([
  "constant.district",
  "leagueTerms",
  "screen.SubmitMatchResult",
  "screen.OrganizerScreens.UpdateMatchResult",
  "constant.profile",
  "constant.button",
]);

enum ActiveTab {
  "Basic Info" = "Basic Info",
  "Game Result" = "Game Result",
}

const ARR_NUM = ["1", "2", "3", "4", "5"];

export default function SubmitMatchResult({
  navigation,
  route,
}: SubmitMatchResultProps) {
  const theme = useTheme();
  const { fixture, matchResult } = route.params;
  // need refresh TestMatchResult every time
  const localMatchResult: DivisionMatchResultResponse =
    matchResult || JSON.parse(JSON.stringify(TestMatchResult));

  let localHome: MatchPlayer[] = localMatchResult.homeTeamPlayers?.map(
    (val) => {
      return {
        ...val,
        name: val.playerName,
        playerName: val.playerName,
        isForeignPlayer: val.isForeign,
        sex: val.sex,
        id: val.id,
        type: val.userId ? PlayerInputType.Selection : PlayerInputType.Other,
      };
    }
  );
  let localAway: MatchPlayer[] = localMatchResult.awayTeamPlayers?.map(
    (val) => {
      return {
        ...val,
        name: val.playerName,
        playerName: val.playerName,
        isForeignPlayer: val.isForeign,
        sex: val.sex,
        id: val.id,
        type: val.userId ? PlayerInputType.Selection : PlayerInputType.Other,
      };
    }
  );

  if (fixture) {
    localMatchResult.fixture = fixture;
    localHome = fixture.homeTeam.members
      ?.filter((val) => val.status === TeamApplicationStatus.Approved)
      ?.map((member) => {
        const playerName = getUserName(member.memberInfo);
        return {
          ...member,
          playerName,
          // name: playerName,
          isForeignPlayer: false,
          sex: member.memberInfo?.sex,
          id: member?.id,
          type: member?.userId
            ? PlayerInputType.Selection
            : PlayerInputType.Other,
          shouldUseDefaultValue: true,
        };
      });

    localAway = fixture.awayTeam.members
      ?.filter((val) => val.status === TeamApplicationStatus.Approved)
      ?.map((member) => {
        const playerName = getUserName(member.memberInfo);
        return {
          ...member,
          playerName,
          // name: playerName,
          isForeignPlayer: false,
          sex: member.memberInfo?.sex,
          id: member?.id,
          type: member?.userId
            ? PlayerInputType.Selection
            : PlayerInputType.Other,
          shouldUseDefaultValue: true,
        };
      });

    if (localHome.length) {
      ARR_NUM.forEach((num, index) => {
        if (index > localHome.length - 1 && index < 5) {
          localHome.push({
            isForeignPlayer: false,
            sex: "Male",
            id: index - 99,
            type: PlayerInputType.Other,
            shouldUseDefaultValue: true,
          });
        }
      });
    }
    if (localAway.length) {
      ARR_NUM.forEach((num, index) => {
        if (index > localAway.length - 1 && index < 5) {
          localAway.push({
            isForeignPlayer: false,
            sex: "Male",
            id: index - 99,
            type: PlayerInputType.Other,
            shouldUseDefaultValue: true,
          });
        }
      });
    }

    localMatchResult.homeTeamPlayers = localHome;
    localMatchResult.awayTeamPlayers = localAway;
    localMatchResult.gameResults = localMatchResult.gameResults.map(
      (result, index) => {
        return {
          ...result,
          homePlayerName: localHome[index].playerName ?? localHome[index].name,
          awayPlayerName: localAway[index].playerName ?? localAway[index].name,
        };
      }
    );
  }

  if (localMatchResult.gameResults.length) {
    localMatchResult.gameResults = localMatchResult.gameResults.map(
      (result, j) => {
        ARR_NUM.forEach((num, index) => {
          if (index > result.setResults.length - 1 && index < 5) {
            result.setResults.push({
              setNumber: index + 1,
              homePlayerScore: 0,
              awayPlayerScore: 0,
            });
          }
        });
        return {
          ...result,
        };
      }
    );
  }

  const getSetResult = (
    gameIndex: number,
    resultIndex: number,
    team: "home" | "away",
    data: DivisionMatchResultResponse
  ) => {
    if (team === "home") {
      return (
        data.gameResults[gameIndex]?.setResults[
          resultIndex
        ]?.homePlayerScore.toString() || "0"
      );
    }
    if (team === "away") {
      return (
        data.gameResults[gameIndex]?.setResults[
          resultIndex
        ]?.awayPlayerScore.toString() || "0"
      );
    }
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, isSubmitting, isDirty },
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      homeTeamName: localMatchResult?.fixture.homeTeam.name,
      awayTeamName: localMatchResult?.fixture.awayTeam.name,
      homeTeamEachMatchPoint: localMatchResult.homeTotalPoints?.toString(),
      homeTeamNumberOfPlayerPoint: localMatchResult.homePlayerPoint?.toString(),
      homeTeamAdditionalPoint: localMatchResult.homeAdditionalPoint?.toString(),

      awayTeamEachMatchPoint: localMatchResult.awayTotalPoints?.toString(),
      awayTeamNumberOfPlayerPoint: localMatchResult.awayPlayerPoint?.toString(),
      awayTeamAdditionalPoint: localMatchResult.awayAdditionalPoint?.toString(),

      selectedGameId: localMatchResult.gameResults[0].gameNumber,
      homeTeamGame1Score: 0,
      homeTeamGame2Score: 0,
      homeTeamGame3Score: 0,
      homeTeamGame4Score: 0,
      homeTeamGame5Score: 0,

      awayTeamGame1Score: 0,
      awayTeamGame2Score: 0,
      awayTeamGame3Score: 0,
      awayTeamGame4Score: 0,
      awayTeamGame5Score: 0,
    },
  });

  const [matchResultUpdateSetData, setMatchResultUpdateSetData] =
    useState<DivisionMatchResultResponse>(localMatchResult);

  const availableTabs = [
    t(ActiveTab["Basic Info"]),
    t(ActiveTab["Game Result"]),
  ];
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [isOpen, setIsOpen] = useState({
    homePlayer: false,
    awayPlayer: false,
    game: false,
    submit: false,
  });

  const [selectedSetResultInputKey, setSelectedResultInputKey] = useState();
  const selectedGameId = watch("selectedGameId");
  const selectedGame = matchResultUpdateSetData.gameResults.filter(
    (game) => game.gameNumber === selectedGameId
  )[0];
  const selectedGameIndex = matchResultUpdateSetData.gameResults.findIndex(
    (game) => game.gameNumber === selectedGameId
  );
  const gameOptions = matchResultUpdateSetData.gameResults.map((game) => {
    return {
      value: game.gameNumber,
      label: `${game.homePlayerName} VS ${game.awayPlayerName}`,
    };
  });

  const [homeTeamData, setHomeTeamData] = useState(
    localHome?.filter((val, j) => j < 5) || [{}, {}, {}, {}, {}]
  );
  const [awayTeamData, setAwayTeamData] = useState(
    localAway?.filter((val, j) => j < 5) || [{}, {}, {}, {}, {}]
  );

  const gameScoreInput = (
    index: number,
    homeGameKey:
      | "homeTeamGame1Score"
      | "homeTeamGame2Score"
      | "homeTeamGame3Score"
      | "homeTeamGame4Score"
      | "homeTeamGame5Score"
      | "awayTeamGame1Score"
      | "awayTeamGame2Score"
      | "awayTeamGame3Score"
      | "awayTeamGame4Score"
      | "awayTeamGame5Score",
    awayGameKey:
      | "homeTeamGame1Score"
      | "homeTeamGame2Score"
      | "homeTeamGame3Score"
      | "homeTeamGame4Score"
      | "homeTeamGame5Score"
      | "awayTeamGame1Score"
      | "awayTeamGame2Score"
      | "awayTeamGame3Score"
      | "awayTeamGame4Score"
      | "awayTeamGame5Score"
  ) => {
    return (
      <HStack alignItems="center" justifyContent="space-between">
        <Text ml="4" fontWeight="bold">
          {index}
        </Text>

        <HStack space="4">
          {/* Home team */}
          {selectedSetResultInputKey === homeGameKey ? (
            <CustomInput
              isDismiss={isOpen.game}
              onChangeText={(text) => {
                const newValueMatchResult = matchResultUpdateSetData;
                newValueMatchResult.gameResults[selectedGameIndex].setResults[
                  index - 1
                ].homePlayerScore = parseInt(text, 10);
                const resultGameHomePlayer = newValueMatchResult.gameResults[
                  selectedGameIndex
                ]?.setResults.filter(
                  (set) => set.homePlayerScore > set.awayPlayerScore
                ).length;
                const resultGameAwayPlayer = newValueMatchResult.gameResults[
                  selectedGameIndex
                ]?.setResults?.filter(
                  (set) => set.awayPlayerScore > set.homePlayerScore
                ).length;
                newValueMatchResult.gameResults[selectedGameIndex] = {
                  ...newValueMatchResult.gameResults[selectedGameIndex],
                  homeSetResult: resultGameHomePlayer,
                  awaySetResult: resultGameAwayPlayer,
                };
                setMatchResultUpdateSetData(newValueMatchResult);
                setResultGameHomePlayer(resultGameHomePlayer);
                setResultGameAwayPlayer(resultGameAwayPlayer);
              }}
              shouldFocusOnAppear
              controllerProps={{
                name: homeGameKey,
                control,
              }}
              onBlur={() => {
                setValue(homeGameKey, "");
                setSelectedResultInputKey(null);
              }}
              inputProps={{
                paddingTop: 3,
                paddingBottom: 3,
                paddingLeft: 5,
                paddingRight: 5,
                borderRadius: 16,
                borderColor: "rs.white",
                keyboardType: "number-pad",
              }}
              containerProps={{
                style: {
                  backgroundColor: "gray.100",
                  width: 130,
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 0.1,
                  paddingX: 6,
                  paddingY: 4,
                },
                shadow: "9",
              }}
            />
          ) : (
            <Pressable
              onPress={() => {
                setSelectedResultInputKey(homeGameKey);
                setValue(
                  homeGameKey,
                  getSetResult(
                    selectedGameIndex,
                    index - 1,
                    "home",
                    matchResultUpdateSetData
                  )
                );
              }}
            >
              <HStack
                shadow="9"
                style={{
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 0.1,
                }}
                borderColor="rs.white"
                borderRadius="2xl"
                borderWidth="1"
                bgColor="rs.white"
                py="2"
                px="4"
                justifyContent="space-between"
                alignItems="center"
                space="4"
                w="32"
                h="10"
              >
                <Text>
                  {getSetResult(
                    selectedGameIndex,
                    index - 1,
                    "home",
                    matchResultUpdateSetData
                  )}
                </Text>
              </HStack>
            </Pressable>
          )}
          {/* Away team */}
          {selectedSetResultInputKey === awayGameKey ? (
            <CustomInput
              isDismiss={isOpen.game}
              onChangeText={(text) => {
                const newValueMatchResult = matchResultUpdateSetData;
                newValueMatchResult.gameResults[selectedGameIndex].setResults[
                  index - 1
                ].awayPlayerScore = parseInt(text, 10);
                const resultGameHomePlayer = newValueMatchResult.gameResults[
                  selectedGameIndex
                ]?.setResults.filter(
                  (set) => set.homePlayerScore > set.awayPlayerScore
                ).length;
                const resultGameAwayPlayer = newValueMatchResult.gameResults[
                  selectedGameIndex
                ]?.setResults?.filter(
                  (set) => set.awayPlayerScore > set.homePlayerScore
                ).length;
                newValueMatchResult.gameResults[selectedGameIndex] = {
                  ...newValueMatchResult.gameResults[selectedGameIndex],
                  homeSetResult: resultGameHomePlayer,
                  awaySetResult: resultGameAwayPlayer,
                };
                setMatchResultUpdateSetData(newValueMatchResult);
                setResultGameHomePlayer(resultGameHomePlayer);
                setResultGameAwayPlayer(resultGameAwayPlayer);
              }}
              shouldFocusOnAppear
              controllerProps={{
                name: awayGameKey,
                control,
              }}
              onBlur={() => {
                setValue(awayGameKey, "");
                setSelectedResultInputKey(null);
              }}
              inputProps={{
                paddingTop: 3,
                paddingBottom: 3,
                paddingLeft: 5,
                paddingRight: 5,
                borderRadius: 16,
                borderColor: "rs.white",
                keyboardType: "number-pad",
              }}
              containerProps={{
                style: {
                  backgroundColor: "gray.100",
                  width: 130,
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 0.1,
                  paddingX: 6,
                  paddingY: 4,
                },
                shadow: "9",
              }}
            />
          ) : (
            <Pressable
              onPress={() => {
                setSelectedResultInputKey(awayGameKey);
                setValue(
                  awayGameKey,
                  getSetResult(
                    selectedGameIndex,
                    index - 1,
                    "away",
                    matchResultUpdateSetData
                  )
                );
              }}
            >
              <HStack
                shadow="9"
                style={{
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 0.1,
                }}
                borderColor="rs.white"
                borderRadius="2xl"
                borderWidth="1"
                bgColor="rs.white"
                py="2"
                px="4"
                justifyContent="space-between"
                alignItems="center"
                space="4"
                w="32"
                h="10"
              >
                <Text>
                  {getSetResult(
                    selectedGameIndex,
                    index - 1,
                    "away",
                    matchResultUpdateSetData
                  )}
                </Text>
              </HStack>
            </Pressable>
          )}
        </HStack>
      </HStack>
    );
  };

  const isCanSave = () => {
    let isDisplay = true;
    const localTeam = [...homeTeamData, ...awayTeamData];
    if (localTeam.find((val) => !val?.name)) {
      isDisplay = false;
    }
    return isDisplay;
  };

  const [resultGameHomePlayer, setResultGameHomePlayer] = useState(
    matchResultUpdateSetData.gameResults[selectedGameIndex]?.setResults.filter(
      (set) => set.homePlayerScore > set.awayPlayerScore
    ).length
  );

  const [resultGameAwayPlayer, setResultGameAwayPlayer] = useState(
    matchResultUpdateSetData.gameResults[selectedGameIndex]?.setResults?.filter(
      (set) => set.awayPlayerScore > set.homePlayerScore
    ).length
  );

  const gameResultView = () => {
    const resultGameHomePlayer = matchResultUpdateSetData.gameResults[
      selectedGameIndex
    ]?.setResults.filter(
      (set) => set.homePlayerScore > set.awayPlayerScore
    ).length;

    const resultGameAwayPlayer = matchResultUpdateSetData.gameResults[
      selectedGameIndex
    ]?.setResults?.filter(
      (set) => set.awayPlayerScore > set.homePlayerScore
    ).length;

    if (!isCanSave()) {
      return (
        <Heading fontSize="md" textAlign="center" color="rs_secondary.error">
          {t("Please select 10 players on the basic info page")}
        </Heading>
      );
    }

    return (
      <VStack space="3">
        {/* Game selection */}
        <HStack mt="2" justifyContent="space-between" alignItems="center">
          <Pressable
            w="100%"
            onPress={() => {
              setIsOpen((previous) => ({ ...previous, game: true }));
            }}
          >
            <HStack
              shadow="9"
              style={{
                shadowOffset: {
                  width: 5,
                  height: 5,
                },
                shadowOpacity: 0.1,
              }}
              borderColor="rs.white"
              borderRadius="2xl"
              borderWidth="1"
              bgColor="rs.white"
              py="2"
              px="4"
              justifyContent="space-between"
              alignItems="center"
              space="4"
            >
              <VStack>
                <Text fontSize="xs" color="gray.700">
                  {t("Game")}
                </Text>
                <Text fontSize="md">
                  {selectedGame
                    ? `${selectedGame?.homePlayerName} VS ${selectedGame?.awayPlayerName}`
                    : t("Please select a game")}
                </Text>
              </VStack>
              <DownArrowIcon size="sm" />
            </HStack>
          </Pressable>
        </HStack>
        {/* Game score input table */}
        {selectedGame && (
          <>
            <HStack
              w="100%"
              mt="4"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text flex="0.3" fontWeight="bold" />
              <HStack flex="0.7" justifyContent="space-between" px="2">
                <Text fontWeight="bold">{selectedGame?.homePlayerName}</Text>
                <Text fontWeight="bold">{selectedGame?.awayPlayerName}</Text>
              </HStack>
            </HStack>
            {gameScoreInput(1, "homeTeamGame1Score", "awayTeamGame1Score")}
            {gameScoreInput(2, "homeTeamGame2Score", "awayTeamGame2Score")}
            {gameScoreInput(3, "homeTeamGame3Score", "awayTeamGame3Score")}
            {gameScoreInput(4, "homeTeamGame4Score", "awayTeamGame4Score")}
            {gameScoreInput(5, "homeTeamGame5Score", "awayTeamGame5Score")}
            {/* Result */}
            <HStack alignItems="center" justifyContent="space-between">
              <Text ml="4" fontWeight="bold">
                {t("Result")}
              </Text>

              <HStack space="4">
                {/* Home player */}
                <HStack
                  shadow="9"
                  style={{
                    shadowOffset: {
                      width: 5,
                      height: 5,
                    },
                    shadowOpacity: 0.1,
                  }}
                  borderColor="gray.200"
                  borderRadius="2xl"
                  borderWidth="1"
                  bgColor="gray.200"
                  py="2"
                  px="4"
                  justifyContent="space-between"
                  alignItems="center"
                  space="4"
                  w="32"
                >
                  <Text fontSize="md">{resultGameHomePlayer}</Text>
                </HStack>
                {/* Away player */}
                <HStack
                  shadow="9"
                  style={{
                    shadowOffset: {
                      width: 5,
                      height: 5,
                    },
                    shadowOpacity: 0.1,
                  }}
                  borderColor="gray.200"
                  borderRadius="2xl"
                  borderWidth="1"
                  bgColor="gray.200"
                  py="2"
                  px="4"
                  justifyContent="space-between"
                  alignItems="center"
                  space="4"
                  w="32"
                >
                  <Text fontSize="md">{resultGameAwayPlayer}</Text>
                </HStack>
              </HStack>
            </HStack>
            <VStack space={2} mt={10}>
              <Button
                isDisabled={!isValid || !isCanSave()}
                isLoading={isSubmitting}
                isLoadingText={t("Loading")}
                onPress={() =>
                  setIsOpen((previous) => ({
                    ...previous,
                    submit: true,
                  }))
                }
              >
                {t("Submit")}
              </Button>
              <Button
                isDisabled={!isValid || !isCanSave()}
                variant="outline"
                isLoading={isSubmitting}
                isLoadingText={t("Loading")}
                onPress={handleSubmit((formValue) => {
                  onSaveOrSubmit(formValue, "Save");
                })}
              >
                {t("Save")}
              </Button>
            </VStack>
          </>
        )}
      </VStack>
    );
  };

  const homeUserIdData = localMatchResult.fixture.homeTeam.members.filter(
    (user) => user.userId && user.status === TeamApplicationStatus.Approved
  );
  const awayUserIdData = localMatchResult.fixture.awayTeam.members.filter(
    (user) => user.userId && user.status === TeamApplicationStatus.Approved
  );

  const basicInfoView = () => {
    const homeTeamOptions: MatchPlayer[] = [];
    homeUserIdData?.forEach((player) => {
      if (
        player.userId &&
        !homeTeamOptions?.some((val) => val?.userId === player.userId)
      ) {
        const name = getUserName(player.memberInfo);

        homeTeamOptions.push({
          ...player,
          name,
          playerName: name,
          isForeignPlayer: false,
          sex: player.memberInfo?.sex,
          id: player?.id,
          type: PlayerInputType.Selection,
        });
      }
    });

    homeTeamOptions.push({
      name: t("Other"),
      isForeignPlayer: false,
      sex: "Female",
      id: 8888888888888,
      type: PlayerInputType.Other,
    });
    const awayTeamOptions: MatchPlayer[] = [];

    awayUserIdData?.forEach((player) => {
      if (
        player.userId &&
        !awayTeamOptions?.some((val) => val?.userId === player.userId)
      ) {
        const name = getUserName(player.memberInfo);
        awayTeamOptions.push({
          ...player,
          name,
          playerName: name,
          isForeignPlayer: false,
          sex: player.memberInfo?.sex,
          id: player?.id,
          type: PlayerInputType.Selection,
        });
      }
    });

    awayTeamOptions.push({
      name: t("Other"),
      isForeignPlayer: false,
      sex: "Female",
      id: 9999999999999,
      type: PlayerInputType.Other,
    });

    return (
      <VStack space="4">
        <FormInput
          isGreyedOut
          label={t("Home Team")}
          controllerProps={{
            name: "homeTeamName",
            control,
          }}
          inputProps={{
            editable: false,
          }}
        />
        <FormInput
          isGreyedOut
          label={t("Away Team")}
          controllerProps={{
            name: "awayTeamName",
            control,
          }}
          inputProps={{
            editable: false,
          }}
        />
        {/* Home team edit */}
        <ArrayTeamMemberSubmitInput
          onChangeValue={(value) => {
            setHomeTeamData(value);
            const newGameResult = matchResultUpdateSetData.gameResults.map(
              (game, index) => {
                return {
                  ...game,
                  homePlayerName: value[index]?.name,
                };
              }
            );
            matchResultUpdateSetData.gameResults = newGameResult;
            setMatchResultUpdateSetData({ ...matchResultUpdateSetData });
          }}
          teamMemberOptions={homeTeamOptions.map((member) => {
            return {
              label: member.name ?? member.playerName,
              value: member.name ?? member.playerName,
              userId: member.userId,
            };
          })}
          header={`${t("Home Team")}${t("Player")}`}
          label={t("Team name")}
          userIdData={[...homeTeamOptions, ...awayTeamOptions]}
          players={homeTeamData}
        />
        {/* Away team edit */}
        <ArrayTeamMemberSubmitInput
          onChangeValue={(value) => {
            setAwayTeamData(value);
            const newGameResult = matchResultUpdateSetData.gameResults.map(
              (game, index) => {
                return {
                  ...game,
                  awayPlayerName: value[index]?.name,
                };
              }
            );
            matchResultUpdateSetData.gameResults = newGameResult;
            setMatchResultUpdateSetData({
              ...matchResultUpdateSetData,
            });
          }}
          teamMemberOptions={awayTeamOptions.map((member) => {
            return {
              label: member.name ?? member.playerName,
              value: member.name ?? member.playerName,
              userId: member.userId,
            };
          })}
          header={`${t("Away Team")}${t("Player")}`}
          label={t("Team name")}
          userIdData={[...homeTeamOptions, ...awayTeamOptions]}
          players={awayTeamData}
        />
        <Button
          style={{ marginTop: 20 }}
          isDisabled={!isValid || !isCanSave()}
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit((formValue) =>
            onSaveOrSubmit(formValue, "Save")
          )}
        >
          {t("Save")}
        </Button>
      </VStack>
    );
  };

  const onSaveOrSubmit = async (
    formValue: FormValue,
    type: "Save" | "Submit"
  ) => {
    try {
      const payload: UpdateMatchResultRequest | SubmitMatchResultRequest = {
        resultId: matchResultUpdateSetData.id,
        fixtureId: matchResultUpdateSetData.fixture.id,
      };

      let newHomeTeamData: MatchPlayer[] = [];
      let newAwayTeamData: MatchPlayer[] = [];
      newHomeTeamData = homeTeamData.map((val) => {
        if (matchResult) {
          return {
            matchResultId: val?.matchResultId,
            teamId: localMatchResult.fixture.homeTeam.id,
            playerName: val.name,
            sex: val.sex,
            isForeign: val.isForeignPlayer,
            isHomePlayer: true,
            userId: val?.userId,
          };
        }

        return {
          teamId: localMatchResult.fixture.homeTeam.id,
          playerName: val.name,
          sex: val.sex,
          isForeign: val.isForeignPlayer,
          isHomePlayer: true,
          userId: val?.userId,
        };
      });

      newAwayTeamData = awayTeamData.map((val) => {
        if (matchResult) {
          return {
            matchResultId: val?.matchResultId,
            teamId: localMatchResult.fixture.awayTeam.id,
            playerName: val.name,
            sex: val.sex,
            isForeign: val.isForeignPlayer,
            isHomePlayer: false,
            userId: val?.userId,
          };
        }
        return {
          teamId: localMatchResult.fixture.awayTeam.id,
          playerName: val.name,
          sex: val.sex,
          isForeign: val.isForeignPlayer,
          isHomePlayer: false,
          userId: val?.userId,
        };
      });

      payload.homeTeamPlayers = newHomeTeamData;
      payload.awayTeamPlayers = newAwayTeamData;

      payload.homeAdditionalPoint = formValue.homeTeamAdditionalPoint;
      payload.awayAdditionalPoint = formValue.awayTeamAdditionalPoint;
      payload.homePlayerPoint = formValue.homeTeamNumberOfPlayerPoint;
      payload.awayPlayerPoint = formValue.awayTeamNumberOfPlayerPoint;
      payload.homeTotalPoints = formValue.homeTeamEachMatchPoint;
      payload.awayTotalPoints = formValue.awayTeamEachMatchPoint;
      payload.gameResults = matchResultUpdateSetData.gameResults;
      payload.submitted = type !== "Save";
      if (!matchResult) {
        await submitMatchResult(payload);
      } else {
        await saveMatchResult(payload);
      }
      if (type !== "Save") {
        showApiToastSuccess({
          title: t("Saved Successfully"),
          body: t("Remember to submit after you update the results later"),
        });
      } else {
        showApiToastSuccess({
          title: t("Saved Successfully"),
          body: t("Remember to submit after you update the results later"),
        });
      }
      navigation.goBack();
    } catch (error) {
      console.log("error:", error);
      showApiToastError(error);
    }
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      boxProps={{
        backgroundColor: "#F6F6F6",
      }}
      headerProps={{
        title: t("Match result"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack space={4} py="defaultLayoutSpacing" bg="rs.grey">
        <VStack px="defaultLayoutSpacing" space={4}>
          <GhostTabbar
            isShowBottomLine
            isFlex
            defaultIndex={activeTabIndex}
            items={availableTabs}
            onPress={(item: string, index: number) => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setActiveTabIndex(index);
            }}
            activateColor={theme.colors.rs.primary_purple}
            unActivateColor={theme.colors.rs.inputLabel_grey}
            tabProps={{
              fontSize: 16,
              textAlign: "center",
              flex: 1,
            }}
          />
          {activeTabIndex === 0 && basicInfoView()}
          {activeTabIndex === 1 && gameResultView()}
        </VStack>
      </VStack>
      <SingleSelectModal
        isOpen={isOpen.game}
        onClose={() => {
          setIsOpen((previous) => ({ ...previous, game: false }));
        }}
        title={t("Game")}
        confirmButtonText={t("Confirm")}
        options={gameOptions}
        controllerProps={{
          name: "selectedGameId",
          control,
          rules: {
            required: true,
          },
        }}
      />
      <ConfirmationModal
        isOpen={isOpen.submit}
        alertType="Alert"
        title={t("SubmitResult")}
        confirmText={t("Yes")}
        onConfirm={handleSubmit((formValue) => {
          setIsOpen((previous) => ({ ...previous, submit: false }));
          onSaveOrSubmit(formValue, "Submit");
        })}
        description={t("Are you sure to submit the match result?")}
        cancelText={t("Cancel")}
        onCancel={() => {
          setIsOpen((previous) => ({ ...previous, submit: false }));
        }}
      />
    </HeaderLayout>
  );
}
