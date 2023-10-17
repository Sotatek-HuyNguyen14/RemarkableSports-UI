/* eslint-disable react/no-array-index-key */
import { VStack, Text, HStack, useTheme, Box } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getIndividualMatchRecords } from "../../services/LeagueServices";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import NoDataComponent from "../../components/NoDataComponent";
import { GameRecordsModel } from "../../models/responses/League";

export type IndividualStatisticProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "IndividualStatistic"
>;

const t = getTranslation("screen.IndividualStatistic");

export default function IndividualStatistic({
  navigation,
  route,
}: IndividualStatisticProps) {
  const { divisionId, teamId, team, displayName, playerId } = route.params;
  const theme = useTheme();
  let groupRecords: GameRecordsModel[][] = [];

  const {
    data: recordsData,
    isValidating,
    error,
    mutate,
  } = useSWR(
    formatCoreUrl(
      `result/division/${divisionId}/team/${teamId}/player/${playerId}`
    ),
    () =>
      getIndividualMatchRecords({
        divisionId,
        teamId,
        playerId,
      })
  );

  const groupingGameRecords = (gameRecords: GameRecordsModel[]) => {
    if (gameRecords?.length) {
      const groups: any = {};
      gameRecords.forEach((val: GameRecordsModel) => {
        const group = JSON.stringify(val.date);
        groups[group] = groups[group] || [];
        groups[group].push(val);
      });
      const arr = Object.values(groups);
      return arr;
    }

    return [];
  };

  const renderItem = (item: GameRecordsModel, index: number) => {
    const getColor = (awayOrhome: "home" | "away") => {
      let bg = "rs.GPP_lightGreen";
      if (item.gameResult.homeSetResult === item.gameResult.awaySetResult) {
        bg = "rs.button_grey";
      } else if (awayOrhome === "away") {
        if (item.gameResult.homeSetResult < item.gameResult.awaySetResult) {
          bg = "rs_secondary.error";
        }
      } else if (
        item.gameResult.awaySetResult < item.gameResult.homeSetResult
      ) {
        bg = "rs_secondary.error";
      }

      return bg;
    };
    const getOpponentPlayer = (itemRecord: GameRecordsModel) => {
      if (
        itemRecord.gameResult.homePlayerName &&
        itemRecord.gameResult.homePlayerName !== displayName
      ) {
        return {
          name: itemRecord.gameResult.homePlayerName,
          awayOrhome: "home",
          bg: getColor("home"),
        };
      }
      if (
        itemRecord.gameResult.awayPlayerName &&
        itemRecord.gameResult.awayPlayerName !== displayName
      ) {
        return {
          name: itemRecord.gameResult.awayPlayerName,
          awayOrhome: "away",
          bg: getColor("away"),
        };
      }

      return undefined;
    };

    const opponent = getOpponentPlayer(item);

    return (
      <VStack key={item.gameResult.id}>
        <HStack
          px="defaultLayoutSpacing"
          py="2"
          justifyContent="space-between"
          space={1}
          bg={index % 2 === 0 ? "rs.lightGrey" : "rs.grey"}
        >
          <VStack justifyContent="center" flex={1}>
            <Text textAlign="left" fontSize={12}>
              {(opponent && opponent.name) ?? "N/A"}
            </Text>
            <Text textAlign="left" fontSize={12}>
              {item.opponentTeam.name ?? "N/A"}
            </Text>
          </VStack>
          {opponent && (
            <HStack justifyContent="space-between" space={2} flex={1.5}>
              <Text textAlign="left" color={opponent.bg} fontSize={12} mr="2">
                {opponent && opponent.awayOrhome === "home"
                  ? `${item.gameResult.awaySetResult}-${item.gameResult.homeSetResult}`
                  : `${item.gameResult.homeSetResult}-${item.gameResult.awaySetResult}`}
              </Text>
              {item?.gameResult?.setResults.length > 0 &&
                item.gameResult.setResults
                  ?.sort((a, b) => {
                    if (a.id > b.id) return 1;
                    if (a.id < b.id) return -1;
                    return 0;
                  })
                  .map((val, j) => (
                    <Text
                      key={`setResults_${j}`}
                      textAlign="left"
                      fontSize={12}
                      color="rs_secondary.grey"
                    >
                      {opponent && opponent.awayOrhome === "home"
                        ? `${val.awayPlayerScore}-${val.homePlayerScore}`
                        : `${val.homePlayerScore}-${val.awayPlayerScore}`}
                    </Text>
                  ))}
            </HStack>
          )}
        </HStack>
      </VStack>
    );
  };

  if (recordsData?.gameRecords.length) {
    groupRecords = groupingGameRecords(recordsData?.gameRecords);
  }

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Individual Match Record"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      {isValidating && <Loading />}
      {!isValidating && error && <ErrorMessage />}
      {!isValidating && !error && !recordsData && (
        <NoDataComponent content={t("No Data")} />
      )}
      {!isValidating && !error && recordsData && (
        <VStack space={4} py="defaultLayoutSpacing">
          <HStack
            px="defaultLayoutSpacing"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text flex={1.3} fontWeight="bold">
              {t("Player")}
            </Text>
            <HStack flex={1.1} alignItems="center">
              <Text fontWeight="bold" flex={1} textAlign="center">
                {t("P")}
              </Text>
              <Text fontWeight="bold" flex={1} textAlign="center">
                {t("W")}
              </Text>
              <Text fontWeight="bold" flex={1} textAlign="center">
                {t("%")}
              </Text>
              <Text fontWeight="bold" flex={1} textAlign="center">
                {t("Pts")}
              </Text>
            </HStack>
          </HStack>
          <HStack px="defaultLayoutSpacing" py="2">
            <VStack flex={1.3}>
              <HStack>
                <Box
                  borderBottomColor="rs.primary_purple"
                  borderBottomWidth={1}
                >
                  <Text fontWeight="bold" color="rs.primary_purple">
                    {displayName}
                  </Text>
                </Box>
                <Box />
              </HStack>
              <Text color="rs_secondary.grey">{team.name ?? "N/A"}</Text>
            </VStack>
            <HStack flex={1.1} alignItems="center">
              <Text fontWeight="bold" flex={1} textAlign="center">
                {recordsData?.individualResult.gamePlayed}
              </Text>
              <Text fontWeight="bold" flex={1} textAlign="center">
                {recordsData?.individualResult.gameWinned}
              </Text>
              <Text fontWeight="bold" flex={1} textAlign="center">
                {recordsData?.individualResult.winRate}%
              </Text>
              <Text fontWeight="bold" flex={1} textAlign="center">
                {recordsData?.individualResult.points}
              </Text>
            </HStack>
          </HStack>
          {!isValidating &&
            !error &&
            groupRecords?.map((val: GameRecordsModel[], index) => {
              if (val?.length) {
                return (
                  <VStack key={`gameRecords_${index}}`} mt="5">
                    <Text
                      mb={2}
                      px="defaultLayoutSpacing"
                      color="rs.inputLabel_grey"
                      textAlign="left"
                      fontSize={12}
                    >
                      {val[0].date}
                    </Text>
                    {val.map((record: GameRecordsModel, l) =>
                      renderItem(record, l)
                    )}
                  </VStack>
                );
              }
            })}
        </VStack>
      )}
    </HeaderLayout>
  );
}
