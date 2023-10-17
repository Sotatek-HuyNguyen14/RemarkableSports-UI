import {
  VStack,
  IconButton,
  HStack,
  Heading,
  Pressable,
  Text,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import NotificationBellIcon from "../../components/Icons/NotificationBellIcon";
import FilterIcon from "../../components/Icons/FilterIcon";
import TipsComponent from "../../components/TipsComponent";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import LeagueCard from "../../components/Card/LeagueCard";
import DivisionCard from "../../components/Card/DivisionCard";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getLeagues } from "../../services/LeagueServices";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import NoDataComponent from "../../components/NoDataComponent";
import GoldMedalIcon from "../../components/Icons/GoldMedalIcon";
import LeaderboardCard from "../../components/Card/LeaderboardCard";
import FilterIconV2 from "../../components/Icons/FilterIconV2";

export type LeagueScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeagueScreen"
>;

const t = getTranslation([
  "screen.LeagueScreen",
  "screen.leagueTerms",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

function LeagueScreen({ navigation, route }: LeagueScreenProps) {
  const {
    data: leagueList,
    isValidating: leagueListIsValidating,
    error: leagueListError,
    mutate: leagueListMutate,
  } = useSWR(formatCoreUrl("/league"), () => getLeagues());

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, isSubmitting },
    watch,
  } = useForm<{
    league: {
      label: string | number;
      value: string;
    };
  }>({
    mode: "onChange",
    defaultValues: {
      league: leagueList?.length
        ? {
            label: leagueList[0].id,
            value: `${leagueList[0].name}\n${t("Season")} ${
              leagueList[0].season
            }`,
          }
        : { label: "", value: "" },
    },
  });
  const [isOpen, setIsOpen] = useState({
    league: false,
  });
  const leagueForm = watch("league");

  useEffect(() => {
    if (leagueList?.length) {
      setValue("league", {
        label: leagueList[0].id,
        value: `${leagueList[0].name}\n${t("Season")} ${leagueList[0].season}`,
      });
    }
  }, [leagueList, setValue]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     leagueListMutate();
  //   }, [leagueListMutate])
  // );

  const selectedLeague = leagueList?.find(
    (league) => league.id === leagueForm?.label
  );

  const leaderBoard = () => {
    return (
      <Pressable
        onPress={() => {
          if (selectedLeague) {
            navigation.navigate("LeaderBoard", { league: selectedLeague });
          }
        }}
      >
        <HStack
          space="4"
          alignItems="center"
          justifyContent="space-between"
          bg="orange.500"
          p="4"
          borderRadius="10"
        >
          <HStack alignItems="center" space="4">
            <HStack
              w="10"
              h="10"
              borderRadius="full"
              bg="orange.400"
              alignItems="center"
              justifyContent="center"
            >
              <GoldMedalIcon props={{ size: "md" }} />
            </HStack>
            <Heading color="rs.white" fontSize="md">
              {t("LeaderBoard")}
            </Heading>
          </HStack>
          <Heading color="rs.white" fontSize="md">
            {">"}
          </Heading>
        </HStack>
      </Pressable>
    );
  };

  const filterBar = () => {
    return (
      <Pressable
        onPress={() => {
          if (selectedLeague) {
            navigation.navigate("LeagueFiltering", {
              league: selectedLeague,
            });
          }
        }}
      >
        <HStack
          bg="rs.lightGrey"
          px="defaultLayoutSpacing"
          py={3}
          borderRadius="2xl"
          justifyContent="space-between"
        >
          <Text>{t("Filter")}</Text>
          <FilterIconV2 />
        </HStack>
      </Pressable>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Remarkable Sports"),
        rightComponent: (
          <IconButton
            onPress={() => {
              navigation.navigate("NotificationCentre");
            }}
            icon={<NotificationBellIcon />}
          />
        ),
        headerLabelStyle: { fontSize: 24 },
        hasBackButton: false,
        headerLabelContainerStyle: { alignItems: "flex-start" },
      }}
      isSticky
      supportPullToRefresh
      onRefresh={() => {
        leagueListMutate();
      }}
    >
      <VStack px="defaultLayoutSpacing" space={4}>
        <TipsComponent
          icon={<FilterIcon props={{ size: "2xl" }} />}
          iconProps={{ alignItems: "flex-start", justifyContent: "flex-start" }}
          title={t("Join the team now")}
          body={t("Select division > choose team > click apply")}
          bg="rgba(232, 106, 16, 0.1)"
        />

        {filterBar()}
        <LeagueCard
          leagueName={
            leagueList && leagueForm && leagueForm.value
              ? leagueForm.value || t("Please select League")
              : "N/A"
          }
          onPress={() => {
            if (leagueList) setIsOpen((prev) => ({ ...prev, league: true }));
          }}
        />
        {/* {selectedLeague && leaderBoard()} */}
        {selectedLeague && (
          <LeaderboardCard
            title={t("Statistic")}
            onPress={() => {
              if (selectedLeague)
                navigation.navigate("DivisionLeaderboard", {
                  league: selectedLeague,
                });
            }}
          />
        )}
        {leagueListIsValidating && <Loading />}
        {!leagueListIsValidating && leagueListError && <ErrorMessage />}
        {!leagueListIsValidating &&
          !leagueListError &&
          selectedLeague &&
          selectedLeague?.divisions?.length &&
          selectedLeague?.divisions?.map((division) => (
            <DivisionCard
              key={`division_${division.name}_${division.id}`}
              divisionName={division.name}
              tier={division.tier}
              onPress={() => {
                navigation.navigate("DivisionScreen", {
                  divisionId: division.id,
                });
              }}
            />
          ))}
        {!leagueListIsValidating &&
          !leagueListError &&
          (!leagueList || !selectedLeague?.divisions.length) && (
            <NoDataComponent content={t("No data")} />
          )}
      </VStack>
      <SingleSelectModal
        isOpen={isOpen.league}
        isReturnObj
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, league: false }));
        }}
        title={t("League")}
        options={
          leagueList?.map((val) => ({
            label: val.id,
            value: `${val.name}\n${t("Season")} ${val.season}`,
          })) || []
        }
        controllerProps={{
          name: "league",
          control,
          rules: { required: t("Please select League") },
        }}
        confirmButtonText={t("Confirm")}
      />
    </HeaderLayout>
  );
}

export default LeagueScreen;
