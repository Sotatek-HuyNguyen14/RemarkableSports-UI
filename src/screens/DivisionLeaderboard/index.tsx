/* eslint-disable react/no-array-index-key */
import { VStack, Text, HStack, Box, useTheme, Pressable } from "native-base";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LayoutAnimation } from "react-native";
import { useForm } from "react-hook-form";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import LeagueCard from "../../components/Card/LeagueCard";
import { getLeaderboard } from "../../services/LeagueServices";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import NoDataComponent from "../../components/NoDataComponent";
import LineBreak from "../../components/LineBreak/LineBreak";
import GhostTabbar from "../../components/GhostTabBar";
import {
  LeaderboardIndividualResponse,
  LeaderboardTeamResponse,
} from "../../models/responses/League";
import { formatName, getUserName } from "../../utils/name";

export type DivisionLeaderboardProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "DivisionLeaderboard"
>;

enum ActiveTab {
  Team = "Team",
  Individual = "Individual",
}
const t = getTranslation(["screen.DivisionLeaderboard", "constant.button"]);

export default function DivisionLeaderboard({
  navigation,
  route,
}: DivisionLeaderboardProps) {
  const { league } = route.params;
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, isSubmitting },
    watch,
  } = useForm<{
    division: {
      label: string | number;
      value: string;
    };
  }>({
    mode: "onChange",
    defaultValues: {
      division: league?.divisions?.length
        ? {
            label: league.divisions[0].id,
            value: league.divisions[0].name,
          }
        : { label: "", value: "" },
    },
  });
  const [isOpen, setIsOpen] = useState({
    division: false,
  });
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const divisionForm = watch("division");
  const availableTabs = [t(ActiveTab.Team), t(ActiveTab.Individual)];
  const [isInfo, setIsInfo] = React.useState({
    isTab1Loading: false,
    isTab1Error: false,
    isTab2Loading: false,
    isTab2Error: false,
  });
  const [playerLeaderboard, setPlayerLeaderboard] = React.useState<
    LeaderboardIndividualResponse[]
  >([]);
  const [teamLeaderboard, setTeamLeaderboard] = React.useState<
    LeaderboardTeamResponse[]
  >([]);
  const selectedDivision = league.divisions?.find(
    (divisions) => divisions.id === divisionForm.label
  );

  const getLeaderboardApi = useCallback(() => {
    if (selectedDivision) {
      if (activeTabIndex === 0) {
        setIsInfo((pre) => ({
          ...pre,
          isTab1Loading: true,
          isTab1Error: true,
        }));
        getLeaderboard({ divisionId: selectedDivision?.id, type: "team" })
          .then((data) => {
            setTeamLeaderboard(data ?? []);
            setIsInfo((pre) => ({
              ...pre,
              isTab1Loading: false,
              isTab1Error: false,
            }));
          })
          .catch((e) => {
            console.log("e1:", e);
            setTeamLeaderboard([]);
            setIsInfo((pre) => ({
              ...pre,
              isTab1Loading: false,
              isTab1Error: true,
            }));
          });
      }
      if (activeTabIndex === 1) {
        setIsInfo((pre) => ({
          ...pre,
          isTab2Loading: true,
          isTab2Error: true,
        }));
        getLeaderboard({ divisionId: selectedDivision?.id, type: "individual" })
          .then((data) => {
            setPlayerLeaderboard(data ?? []);
            setIsInfo((pre) => ({
              ...pre,
              isTab2Loading: false,
              isTab2Error: false,
            }));
          })
          .catch((e) => {
            console.log("e2:", e);
            setPlayerLeaderboard([]);
            setIsInfo((pre) => ({
              ...pre,
              isTab2Loading: false,
              isTab2Error: true,
            }));
          });
      }
    }
  }, [activeTabIndex, selectedDivision]);

  useEffect(() => {
    getLeaderboardApi();
  }, [getLeaderboardApi]);

  const renturnBg = (index: number) => {
    switch (index) {
      case 1:
        return theme.colors.rs.GPP_lightBlue;
      case 2:
        return theme.colors.rs.inputLabel_grey;
      case 3:
        return theme.colors.rs.medium_orange;
      default:
        return null;
    }
  };

  const renderTeamItem = () => {
    return (
      <VStack py="defaultLayoutSpacing">
        <HStack px="defaultLayoutSpacing" mb="4">
          <Text flex={0.45} fontWeight="bold">
            # {t("Team")}
          </Text>
          <Text flex={0.11} fontWeight="bold">
            {t("P")}
          </Text>
          <Text flex={0.11} fontWeight="bold">
            {t("W")}
          </Text>
          <Text flex={0.11} fontWeight="bold">
            {t("D")}
          </Text>
          <Text flex={0.11} fontWeight="bold">
            {t("L")}
          </Text>
          <Text flex={0.11} fontWeight="bold">
            {t("Pts")}
          </Text>
        </HStack>
        {teamLeaderboard?.map((row, index) => {
          return (
            <HStack
              p="defaultLayoutSpacing"
              bg={index % 2 === 0 ? "rs.lightGrey" : "rs.grey"}
              key={`teamLeaderboard_${index}`}
              justifyContent="center"
            >
              <HStack space={2} flex={0.45}>
                <Box
                  w="21"
                  h="21"
                  bg={renturnBg(index + 1)}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontWeight="bold">{index + 1}</Text>
                </Box>
                <Pressable
                  onPress={() => {
                    if (selectedDivision)
                      navigation.navigate("TeamStatistic", {
                        divisionId: selectedDivision?.id,
                        teamId: row.team.id,
                      });
                  }}
                >
                  {row.team.name ? (
                    <Text fontWeight="bold" color="rs.primary_purple">
                      {row.team.name}
                    </Text>
                  ) : (
                    <Text />
                  )}
                  <LineBreak
                    style={{ backgroundColor: theme.colors.rs.primary_purple }}
                  />
                </Pressable>
              </HStack>
              <Text flex={0.11} fontWeight="bold">
                {row.matchPlayed}
              </Text>
              <Text flex={0.11} fontWeight="bold">
                {row.matchWinned}
              </Text>
              <Text flex={0.11} fontWeight="bold">
                {row.matchDrew}
              </Text>
              <Text flex={0.11} fontWeight="bold">
                {row.matchLost}
              </Text>
              <Text flex={0.11} fontWeight="bold">
                {row.points}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    );
  };

  const renderIndividualItem = () => {
    return (
      <VStack>
        <HStack px="defaultLayoutSpacing" mb="4">
          <Text flex={0.55} fontWeight="bold">
            # {t("Player")}
          </Text>
          <Text flex={0.1125} fontWeight="bold">
            {t("P")}
          </Text>
          <Text flex={0.1125} fontWeight="bold">
            {t("W")}
          </Text>
          <Text flex={0.1125} fontWeight="bold">
            {t("%")}
          </Text>
          <Text flex={0.1125} fontWeight="bold">
            {t("Pts")}
          </Text>
        </HStack>
        {playerLeaderboard?.map((row, index) => {
          return (
            <HStack
              px="defaultLayoutSpacing"
              bg={index % 2 === 0 ? "rs.lightGrey" : "rs.grey"}
              py={2.5}
              key={`playerLeaderboard_${index}`}
            >
              <HStack space={2} flex={0.55}>
                <Box
                  w="21"
                  h="21"
                  bg={renturnBg(index + 1)}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontWeight="bold">{index + 1}</Text>
                </Box>
                <Pressable
                  onPress={() => {
                    if (selectedDivision) {
                      navigation.navigate("IndividualStatistic", {
                        teamId: row.team.id,
                        team: row.team,
                        divisionId: selectedDivision.id,
                        displayName: getUserName(row.player.memberInfo),
                        playerId: row.player.userId,
                      });
                    }
                  }}
                >
                  {row.player.memberInfo ? (
                    <Text fontWeight="bold" color="rs.primary_purple">
                      {getUserName(row.player.memberInfo)}
                    </Text>
                  ) : (
                    <Text />
                  )}
                  <LineBreak
                    style={{ backgroundColor: theme.colors.rs.primary_purple }}
                  />
                  <Text fontSize={12} color="rs_secondary.grey">
                    {row.team.name}
                  </Text>
                </Pressable>
              </HStack>
              <Text flex={0.1125} fontWeight="bold" alignSelf="center">
                {row.gamePlayed}
              </Text>
              <Text flex={0.1125} fontWeight="bold" alignSelf="center">
                {row.gameWinned}
              </Text>
              <Text flex={0.1125} fontWeight="bold" alignSelf="center">
                {row.winRate}%
              </Text>
              <Text flex={0.1125} fontWeight="bold" alignSelf="center">
                {row.points}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Statistic"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack space={4}>
        <Box px="defaultLayoutSpacing">
          <LeagueCard
            leagueName={
              selectedDivision
                ? selectedDivision.name || t("Please select division")
                : "N/A"
            }
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, division: true }));
            }}
          />
        </Box>
        <VStack mx="4" space={4}>
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
        </VStack>
        {isInfo.isTab1Loading && activeTabIndex === 0 && <Loading />}
        {isInfo.isTab2Loading && activeTabIndex === 1 && <Loading />}
        {!isInfo.isTab1Loading &&
          isInfo.isTab1Error &&
          activeTabIndex === 0 && <ErrorMessage />}
        {!isInfo.isTab2Loading &&
          isInfo.isTab2Error &&
          activeTabIndex === 1 && <ErrorMessage />}
        {!isInfo.isTab1Error &&
          !isInfo.isTab1Loading &&
          (!teamLeaderboard || !teamLeaderboard.length) &&
          activeTabIndex === 0 && <NoDataComponent content={t("No data")} />}
        {!isInfo.isTab2Loading &&
          !isInfo.isTab2Error &&
          (!playerLeaderboard || !playerLeaderboard.length) &&
          activeTabIndex === 1 && <NoDataComponent content={t("No data")} />}
        {activeTabIndex === 0 &&
          !isInfo.isTab1Loading &&
          !isInfo.isTab1Error &&
          teamLeaderboard.length > 0 &&
          renderTeamItem()}
        {activeTabIndex === 1 &&
          !isInfo.isTab2Loading &&
          !isInfo.isTab2Error &&
          playerLeaderboard.length > 0 &&
          renderIndividualItem()}
      </VStack>
      <SingleSelectModal
        confirmButtonText={t("Confirm")}
        isOpen={isOpen.division}
        isReturnObj
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, division: false }));
        }}
        title={t("division")}
        options={
          league.divisions.map((val) => ({
            label: val.id,
            value: val.name,
          })) || []
        }
        controllerProps={{
          name: "division",
          control,
          rules: { required: t("Please select division") },
        }}
      />
    </HeaderLayout>
  );
}
