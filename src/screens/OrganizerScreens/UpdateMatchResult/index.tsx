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
import { getAllDistricts } from "../../../constants/Districts";
import { showApiToastError } from "../../../components/ApiToastError";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import ArrayTeamMemberInput, { PlayerInputType } from "./ArrayTeamMemberInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import { saveMatchResult } from "../../../services/LeagueServices";
import CustomInput from "../../../components/FormInput/CustomInput";
import { isBlank } from "../../../utils/strings";
import { UpdateMatchResultRequest } from "../../../models/requests/Leagues";
import { DivisionMatchResultResponse } from "../../../models/responses/League";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import { getUserName } from "../../../utils/name";
import { User } from "../../../models/User";

export type UpdateMatchResultPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "UpdateMatchResult"
>;

type UpdateMatchResultPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "UpdateMatchResult"
>;

export interface UpdateMatchResultProps
  extends UpdateMatchResultPropsBaseProps {
  store: Store;
  route: UpdateMatchResultPropsBaseProps;
  navigation: UpdateMatchResultPropsNavigationProp;
}

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
  "screen.SubmitMatchResult",
  "screen.OrganizerScreens.UpdateMatchResult",
  "constant.profile",
  "constant.button",
  "leagueTerms",
  "toastMessage",
]);

export default function UpdateMatchResult({
  navigation,
  route,
}: UpdateMatchResultProps) {
  const theme = useTheme();
  const today = new Date();
  const { matchResult } = route.params;

  const teamScoreOptions = Array.from(Array(50).keys()).map((val) => {
    return {
      value: val + 1,
      label: val + 1,
    };
  });
  const [matchResultUpdateSetData, setMatchResultUpdateSetData] = useState(
    JSON.parse(JSON.stringify(matchResult))
  );
  const [activePage, setActivePage] = useState(0);
  const [teamScoreOpen, setTeamScoreOpen] = useState(false);
  const [gameScoreOpen, setGameScoreOpen] = useState(false);
  const [homeTeamData, setHomeTeamData] = useState(
    matchResult.homeTeamPlayers.map((player) => {
      return {
        ...player,
        name: player.playerName,
        isForeignPlayer: player.isForeign,
        sex: player.sex,
        id: player.id,
        type: player.userId ? PlayerInputType.Selection : PlayerInputType.Other,
      };
    })
  );
  const [awayTeamData, setAwayTeamData] = useState(
    matchResult.awayTeamPlayers.map((player) => {
      return {
        ...player,
        name: player.playerName,
        isForeignPlayer: player.isForeign,
        sex: player.sex,
        id: player.id,
        type: player.userId ? PlayerInputType.Selection : PlayerInputType.Other,
      };
    })
  );

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
    formState: { isValid, isSubmitting, isDirty },
    watch,
    setValue,
    resetField,
    trigger,
    register,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      homeTeamName: matchResult.fixture.homeTeam.name,
      awayTeamName: matchResult.fixture.awayTeam.name,
      homeTeamEachMatchPoint: matchResult.homeTotalPoints.toString(),
      homeTeamNumberOfPlayerPoint: matchResult.homePlayerPoint.toString(),
      homeTeamAdditionalPoint: matchResult.homeAdditionalPoint.toString(),

      awayTeamEachMatchPoint: matchResult.awayTotalPoints.toString(),
      awayTeamNumberOfPlayerPoint: matchResult.awayPlayerPoint.toString(),
      awayTeamAdditionalPoint: matchResult.awayAdditionalPoint.toString(),

      selectedGameId: matchResult.gameResults[0].id,
      homeTeamGame1Score: getSetResult(0, 0, "home", matchResult),
      homeTeamGame2Score: getSetResult(0, 1, "home", matchResult),
      homeTeamGame3Score: getSetResult(0, 2, "home", matchResult),
      homeTeamGame4Score: getSetResult(0, 3, "home", matchResult),
      homeTeamGame5Score: getSetResult(0, 4, "home", matchResult),

      awayTeamGame1Score: getSetResult(0, 0, "away", matchResult),
      awayTeamGame2Score: getSetResult(0, 1, "away", matchResult),
      awayTeamGame3Score: getSetResult(0, 2, "away", matchResult),
      awayTeamGame4Score: getSetResult(0, 3, "away", matchResult),
      awayTeamGame5Score: getSetResult(0, 4, "away", matchResult),
    },
  });

  const [selectedSetResultInputKey, setSelectedResultInputKey] = useState();

  const [selectedKeyScore, setSelectedKeyScore] = useState();
  const [selectedGameKeyScore, setSelectedGameKeyScore] = useState();

  const selectedGameId = watch("selectedGameId");

  const selectedGame = matchResultUpdateSetData.gameResults.filter(
    (game) => game.id === selectedGameId
  )[0];

  const selectedGameIndex = matchResultUpdateSetData.gameResults.findIndex(
    (game) => game.id === selectedGameId
  );

  const gameOptions = matchResultUpdateSetData.gameResults.map((game) => {
    return {
      value: game.id,
      label: `${game.homePlayerName} VS ${game.awayPlayerName}`,
    };
  });

  const [gameSelectionOpen, setGameSelectionOpen] = useState(false);

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
            {t("Basic Info")}
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
            {t("Game result")}
          </Text>
        </Pressable>
      </HStack>
    );
  };

  const homeUserIdData = matchResult.homeTeamPlayers.filter(
    (user) => user.userId
  );
  const awayUserIdData = matchResult.awayTeamPlayers.filter(
    (user) => user.userId
  );

  const basicInfoView = () => {
    const homeTeamOptions = matchResult.fixture.homeTeam.members.map(
      (player) => {
        const foundedPlayer = matchResult.homeTeamPlayers.filter(
          (p) => p.userId === player.userId
        )[0];
        return {
          name: getUserName(player.memberInfo as User),
          isForeignPlayer: foundedPlayer?.isForeign || false,
          sex: player.memberInfo?.sex,
          id: player.id,
          type: player.userId
            ? PlayerInputType.Selection
            : PlayerInputType.Other,
          userId: player.userId,
        };
      }
    );
    homeTeamOptions.push({
      name: t("Other"),
      isForeignPlayer: false,
      sex: "Female",
      id: 8888888888888,
      type: PlayerInputType.Other,
      userId: null,
    });
    const awayTeamOptions = matchResult.fixture.awayTeam.members.map(
      (player) => {
        const foundedPlayer = matchResult.awayTeamPlayers.filter(
          (p) => p.userId === player.userId
        )[0];
        return {
          name: getUserName(player.memberInfo as User),
          isForeignPlayer: foundedPlayer?.isForeign || false,
          sex: player.memberInfo?.sex,
          id: player.id,
          type: player.userId
            ? PlayerInputType.Selection
            : PlayerInputType.Other,
          userId: player.userId,
        };
      }
    );
    awayTeamOptions.push({
      name: t("Other"),
      isForeignPlayer: false,
      sex: "Female",
      id: 9999999999999,
      type: PlayerInputType.Other,
      userId: null,
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
        <ArrayTeamMemberInput
          onChangeValue={(value) => {
            setHomeTeamData(value);
            // Trigger when it changed the player
            const newGameResult = matchResultUpdateSetData.gameResults.map(
              (game, index) => {
                return {
                  ...game,
                  homePlayerName: value[index].name,
                };
              }
            );
            matchResultUpdateSetData.gameResults = newGameResult;
            setMatchResultUpdateSetData(matchResultUpdateSetData);
          }}
          teamMemberOptions={homeTeamOptions.map((member) => {
            return {
              label: member.name,
              value: member.name,
              userId: member.userId,
            };
          })}
          header={`${t("Home Team")} ${t("Player")}`}
          label={t("Team name")}
          players={homeTeamData}
          userIdData={[...homeUserIdData, ...awayUserIdData]}
        />
        {/* Away team edit */}
        <ArrayTeamMemberInput
          onChangeValue={(value) => {
            setAwayTeamData(value);
            // Trigger when it changed the player
            const newGameResult = matchResultUpdateSetData.gameResults.map(
              (game, index) => {
                return {
                  ...game,
                  awayPlayerName: value[index].name,
                };
              }
            );
            matchResultUpdateSetData.gameResults = newGameResult;
            setMatchResultUpdateSetData(matchResultUpdateSetData);
          }}
          teamMemberOptions={awayTeamOptions.map((member) => {
            return {
              label: member.name,
              value: member.name,
              userId: member.userId,
            };
          })}
          header={`${t("Away Team")} ${t("Player")}`}
          label={t("Team name")}
          players={awayTeamData}
          userIdData={[...homeUserIdData, ...awayUserIdData]}
        />
      </VStack>
    );
  };

  const gameResultInputItem = (
    label: string,
    key:
      | "homeTeamEachMatchPoint"
      | "homeTeamNumberOfPlayerPoint"
      | "homeTeamAdditionalPoint"
      | "awayTeamEachMatchPoint"
      | "awayTeamNumberOfPlayerPoint"
      | "awayTeamAdditionalPoint"
  ) => {
    return (
      <HStack w="100%" justifyContent="space-between" alignItems="center">
        <Text>{label}</Text>
        <CustomInput
          controllerProps={{
            name: key,
            control,
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
      </HStack>
    );
  };

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
    const homeSetResultWatch = watch(homeGameKey);
    const awaySetResultWatch = watch(awayGameKey);
    return (
      <HStack alignItems="center" justifyContent="space-between">
        <Text ml="4" fontWeight="bold">
          {index}
        </Text>

        <HStack space="4">
          {/* Home team */}
          {selectedSetResultInputKey === homeGameKey ? (
            <CustomInput
              onChangeText={(text) => {
                const newValueMatchResult = matchResultUpdateSetData;
                if (
                  !newValueMatchResult.gameResults[selectedGameIndex]
                    .setResults[index - 1]
                ) {
                  const awayPlayerScore = newValueMatchResult.gameResults[
                    selectedGameIndex
                  ]?.setResults[index - 1]?.awayPlayerScore
                    ? newValueMatchResult.gameResults[selectedGameIndex]
                        .setResults[index - 1].awayPlayerScore
                    : 0;
                  newValueMatchResult.gameResults[
                    selectedGameIndex
                  ].setResults.push({
                    setNumber: index,
                    homePlayerScore: parseInt(text, 10),
                    awayPlayerScore,
                  });
                } else {
                  newValueMatchResult.gameResults[selectedGameIndex].setResults[
                    index - 1
                  ].homePlayerScore = parseInt(text, 10);
                }

                setMatchResultUpdateSetData(newValueMatchResult);
              }}
              shouldFocusOnAppear
              controllerProps={{
                name: homeGameKey,
                control,
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
              onChangeText={(text) => {
                const newValueMatchResult = matchResultUpdateSetData;
                if (
                  !newValueMatchResult.gameResults[selectedGameIndex]
                    .setResults[index - 1]
                ) {
                  const homePlayerScore = newValueMatchResult.gameResults[
                    selectedGameIndex
                  ]?.setResults[index - 1]?.homePlayerScore
                    ? newValueMatchResult.gameResults[selectedGameIndex]
                        .setResults[index - 1].homePlayerScore
                    : 0;
                  newValueMatchResult.gameResults[
                    selectedGameIndex
                  ].setResults.push({
                    setNumber: index,
                    homePlayerScore,
                    awayPlayerScore: parseInt(text, 10),
                  });
                } else {
                  newValueMatchResult.gameResults[selectedGameIndex].setResults[
                    index - 1
                  ].awayPlayerScore = parseInt(text, 10);
                }
                setMatchResultUpdateSetData(newValueMatchResult);
              }}
              shouldFocusOnAppear
              controllerProps={{
                name: awayGameKey,
                control,
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

  const gameResultView = () => {
    const homeTeamName = matchResult.fixture.homeTeam.name;
    const awayTeamName = matchResult.fixture.awayTeam.name;

    const totalPointHomeTeam =
      parseInt(watch("homeTeamEachMatchPoint") || "0" || "0", 10) +
      parseInt(watch("homeTeamNumberOfPlayerPoint") || "0", 10) +
      parseInt(watch("homeTeamAdditionalPoint") || "0", 10);

    const totalPointAwayTeam =
      parseInt(watch("awayTeamEachMatchPoint") || "0", 10) +
      parseInt(watch("awayTeamNumberOfPlayerPoint") || "0", 10) +
      parseInt(watch("awayTeamAdditionalPoint") || "0", 10);

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
    const newValueMatchResult = matchResultUpdateSetData;

    newValueMatchResult.gameResults[selectedGameIndex] = {
      ...newValueMatchResult.gameResults[selectedGameIndex],
      homeSetResult: resultGameHomePlayer,
      awaySetResult: resultGameAwayPlayer,
    };

    return (
      <VStack space="3">
        <Heading>{homeTeamName}</Heading>
        {gameResultInputItem(
          t("Points from each match"),
          "homeTeamEachMatchPoint"
        )}
        {gameResultInputItem(
          t("Points from no of players"),
          "homeTeamNumberOfPlayerPoint"
        )}
        {gameResultInputItem(t("Additional points"), "homeTeamAdditionalPoint")}

        {/* Total point */}
        <HStack mt="2" justifyContent="space-between" alignItems="center">
          <Text fontSize="md">{t("Total point")}</Text>
          <Pressable
            onPress={() => {
              setTeamScoreOpen(true);
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
              <Text fontSize="md">{totalPointHomeTeam}</Text>
            </HStack>
          </Pressable>
        </HStack>

        <Heading>{awayTeamName}</Heading>
        {gameResultInputItem(
          t("Points from each match"),
          "awayTeamEachMatchPoint"
        )}
        {gameResultInputItem(
          t("Points from no of players"),
          "awayTeamNumberOfPlayerPoint"
        )}
        {gameResultInputItem(t("Additional points"), "awayTeamAdditionalPoint")}
        {/* Total point */}
        <HStack mt="2" justifyContent="space-between" alignItems="center">
          <Text fontSize="md">{t("Total point")}</Text>
          <Pressable
            onPress={() => {
              setTeamScoreOpen(true);
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
              <Text fontSize="md">{totalPointAwayTeam}</Text>
            </HStack>
          </Pressable>
        </HStack>

        {/* Game selection */}
        <HStack mt="2" justifyContent="space-between" alignItems="center">
          <Pressable
            w="100%"
            onPress={() => {
              setGameSelectionOpen(true);
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
                <Text fontSize="md">{`${selectedGame.homePlayerName} VS ${selectedGame.awayPlayerName}`}</Text>
              </VStack>
              <DownArrowIcon size="sm" />
            </HStack>
          </Pressable>
        </HStack>
        {/* Game score input table */}
        <HStack
          w="100%"
          mt="4"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text flex="0.3" fontWeight="bold" />
          <HStack flex="0.7" justifyContent="space-between" px="2">
            <Text fontWeight="bold">{selectedGame.homePlayerName}</Text>
            <Text fontWeight="bold">{selectedGame.awayPlayerName}</Text>
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
            <Pressable onPress={() => {}}>
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
            </Pressable>
            {/* Away player */}
            <Pressable onPress={() => {}}>
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
            </Pressable>
          </HStack>
        </HStack>
      </VStack>
    );
  };

  const onSave = async (formValue: FormValue) => {
    try {
      const payload: UpdateMatchResultRequest = {
        resultId: matchResult.id,
      };
      // Add home / away player info
      payload.homeTeamPlayers = homeTeamData.map((data) => {
        return {
          userId: data.userId,
          teamMemberId: data.teamMemberId,
          teamId: data.teamId,
          playerName: data.name,
          sex: data.sex,
          isForeign: data.isForeign,
          isHomePlayer: true,
        };
      });
      payload.awayTeamPlayers = awayTeamData.map((data) => {
        return {
          userId: data.userId,
          teamMemberId: data.teamMemberId,
          teamId: data.teamId,
          playerName: data.name,
          sex: data.sex,
          isForeign: data.isForeign,
          isHomePlayer: false,
        };
      });

      // Add point info
      payload.homeAdditionalPoint = formValue.homeTeamAdditionalPoint;
      payload.awayAdditionalPoint = formValue.awayTeamAdditionalPoint;

      payload.homePlayerPoint = formValue.homeTeamNumberOfPlayerPoint;
      payload.awayPlayerPoint = formValue.awayTeamNumberOfPlayerPoint;

      payload.homeTotalPoints = formValue.homeTeamEachMatchPoint;
      payload.awayTotalPoints = formValue.awayTeamEachMatchPoint;

      // Add game results info
      payload.gameResults = matchResultUpdateSetData.gameResults;
      payload.submitted = true;

      await saveMatchResult(payload);
      showApiToastSuccess({
        title: `${t("Save")}${t("Success")}`,
        body: t("Match results are successfully updated"),
      });
      navigation.goBack();
    } catch (error) {
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
        title: t("Match result"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack space="4" flex="1">
        {tabSelectors()}
        <VStack flex="1">
          {activePage === 0 && basicInfoView()}
          {activePage === 1 && gameResultView()}
        </VStack>
        <Button onPress={handleSubmit(onSave)}>{t("Save")}</Button>
      </VStack>
      {selectedKeyScore && (
        <OneColumnPickerModal
          isOpen={teamScoreOpen}
          onClose={() => {
            setTeamScoreOpen(false);
          }}
          options={teamScoreOptions}
          controllerProps={{
            name: selectedKeyScore,
            control,
          }}
        />
      )}
      {selectedGameKeyScore && (
        <OneColumnPickerModal
          isOpen={gameScoreOpen}
          onClose={() => {
            setGameScoreOpen(false);
          }}
          options={teamScoreOptions}
          controllerProps={{
            name: selectedGameKeyScore,
            control,
          }}
        />
      )}
      <SingleSelectModal
        isOpen={gameSelectionOpen}
        onClose={() => {
          setGameSelectionOpen(false);
          setSelectedResultInputKey(null);
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
    </HeaderLayout>
  );
}
