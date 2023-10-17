/* eslint-disable react/no-array-index-key */
import { VStack, Text, HStack, Box, useTheme, Pressable } from "native-base";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LayoutAnimation } from "react-native";
import { useForm } from "react-hook-form";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import LeagueCard from "../../../components/Card/LeagueCard";
import { getLeaderboard } from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import NoDataComponent from "../../../components/NoDataComponent";
import LineBreak from "../../../components/LineBreak/LineBreak";
import GhostTabbar from "../../../components/GhostTabBar";
import {
  LeaderboardIndividualResponse,
  LeaderboardTeamResponse,
} from "../../../models/responses/League";
import { formatName, getUserName } from "../../../utils/name";

export type AudiencePlayerStatisticProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "AudiencePlayerStatistic"
>;

enum ActiveTab {
  Team = "Team",
  Individual = "Individual",
}
const t = getTranslation([
  "screen.DivisionLeaderboard",
  "constant.button",
  "leagueTerms",
]);

export default function AudiencePlayerStatistic({
  navigation,
  route,
}: AudiencePlayerStatisticProps) {
  const { division } = route.params;
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
      division,
    },
  });
  const [isOpen, setIsOpen] = useState({
    division: false,
  });
  const [activeTabIndex, setActiveTabIndex] = React.useState(1);
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
  const selectedDivision = division;

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
        return "#FFC70042";
      case 2:
        return "#9AADB133";
      case 3:
        return "#83180033";
      default:
        return null;
    }
  };

  const renderIndividualItem = () => {
    return (
      <VStack>
        <HStack mb="4">
          <HStack flex={0.5}>
            <Box flex={0.3} alignItems="center">
              <Text fontWeight="bold">#</Text>
            </Box>
            <Text flex={0.7} fontWeight="bold">{`${t("Player")}`}</Text>
          </HStack>
          <Text flex={0.125} fontWeight="bold" textAlign="center">
            {t("P")}
          </Text>
          <Text flex={0.125} fontWeight="bold" textAlign="center">
            {t("W")}
          </Text>
          <Text flex={0.125} fontWeight="bold" textAlign="center">
            {t("%")}
          </Text>
          <Text flex={0.125} fontWeight="bold" textAlign="center">
            {t("Pts")}
          </Text>
        </HStack>
        {playerLeaderboard?.map((row, index) => {
          return (
            <HStack
              bg={renturnBg(index + 1)}
              py={2.5}
              key={`playerLeaderboard_${index}`}
            >
              <HStack flex={0.5} alignItems="center">
                <Box flex={0.3} alignItems="center">
                  <Text fontWeight="bold">{index + 1}</Text>
                </Box>
                <Pressable
                  flex={0.7}
                  flexWrap="wrap"
                  onPress={() => {
                    if (selectedDivision) {
                      navigation.navigate("LeaguePlayerIndividualStatistic", {
                        teamId: row.team.id,
                        team: row.team,
                        divisionId: selectedDivision.id,
                        displayName: getUserName(row.player.memberInfo),
                        playerId: row.player.userId,
                        ranking: index + 1,
                        flow: route.params.flow,
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
              <Text
                flex={0.125}
                fontWeight="bold"
                alignSelf="center"
                textAlign="center"
              >
                {row.gamePlayed}
              </Text>
              <Text
                flex={0.125}
                fontWeight="bold"
                alignSelf="center"
                textAlign="center"
              >
                {row.gameWinned}
              </Text>
              <Text
                flex={0.125}
                fontWeight="bold"
                alignSelf="center"
                textAlign="center"
              >
                {row.winRate}%
              </Text>
              <Text
                flex={0.125}
                fontWeight="bold"
                alignSelf="center"
                textAlign="center"
              >
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
        title: t("Player List"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack space={4}>
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
        {activeTabIndex === 1 &&
          !isInfo.isTab2Loading &&
          !isInfo.isTab2Error &&
          playerLeaderboard.length > 0 &&
          renderIndividualItem()}
      </VStack>
    </HeaderLayout>
  );
}
