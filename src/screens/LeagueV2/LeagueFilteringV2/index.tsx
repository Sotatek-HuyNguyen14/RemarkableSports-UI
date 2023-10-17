/* eslint-disable eqeqeq */
import React, { useState } from "react";
import { Button, Heading, useTheme, VStack } from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { AxiosError } from "axios";

import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import { showApiToastError } from "../../../components/ApiToastError";
import { FixtureType } from "../../../models/responses/League";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import { LeagueFlow } from "../LeagueScreenV2";
import {
  combineFixturesWithMatchResultData,
  getAllDivisionMatchResults,
  getFixture,
} from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";
import { isBlank } from "../../../utils/strings";

export type VenueFilteringScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "LeagueFilteringV2"
>;

export type VenueFilteringRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "LeagueFilteringV2"
>;

interface VenueFilteringScreenProps {
  navigation: VenueFilteringScreenNavigationProp;
  route: VenueFilteringRouteProp;
}

export interface LeagueFilteringV2Form {
  date: string;
  type: FixtureType;
  typeText: string;
  division: string;
  divisionText: string;
  team: string;
  teamText: string;
  round: string;
  roundText: string;
}

const t = getTranslation([
  "screen.LeagueFiltering",
  "constant.button",
  "validation",
  "formInput",
  "leagueTerms",
]);

export default function LeagueFilteringV2({
  navigation,
  route,
}: VenueFilteringScreenProps) {
  const { space } = useTheme();
  const { flow, league, selectedDivisionId, roundsData } = route.params;
  const [isOpen, setIsOpen] = useState({
    type: false,
    date: false,
    division: false,
    team: false,
    round: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, isDirty },
    trigger,
  } = useForm<LeagueFilteringV2Form>({
    mode: "onChange",
    defaultValues: {
      division: selectedDivisionId?.toString(),
    },
  });

  const division = watch("division");
  const divisionName = league.divisions.filter(
    (div) => div.id.toString() === division
  )[0]?.name;
  const divisionOptions = league.divisions.map((div) => ({
    label: div.name,
    value: div.id.toString(),
  }));
  const teamOptions =
    league.divisions
      .find(
        (div) => div.id.toString() === division && div.name === divisionName
      )
      ?.teams.map((team) => ({
        label: team.name,
        value: team.id.toString(),
      })) || [];
  const roundOptions = roundsData
    .filter((round) => round.divisionId.toString() === division)
    .map((round) => ({
      label: round.round.toString(),
      value: `${round.divisionId}_${round.round}`,
    }));

  // console.log(
  //   `${watch("type")} ${watch("division")} ${watch("team")} ${watch("round")}`
  // );

  const onSearch = async (formValue: LeagueFilteringV2Form) => {
    try {
      setIsLoading(true);
      const filterType = formValue.type || undefined;
      const divisionId = formValue.division;
      const teamId = formValue.team || undefined;
      const roundId = formValue.roundText || undefined;

      const allFixtures = await getFixture({ divisionId });
      const allMatchesResult = await getAllDivisionMatchResults({ divisionId });
      const combineMatchResultAndFixtures = combineFixturesWithMatchResultData(
        allFixtures || [],
        allMatchesResult || []
      );

      const results = combineMatchResultAndFixtures
        // Filter by type
        .filter((fixtureMatchResultItem) => {
          if (!filterType || (filterType && isBlank(filterType))) {
            return true;
          }
          if (filterType === "Fixture") {
            return !fixtureMatchResultItem.matchResult;
          }
          return fixtureMatchResultItem.matchResult !== undefined;
        })
        // Filter by teamId
        .filter((fixtureMatchResultItem) => {
          if (teamId && !isBlank(teamId)) {
            return (
              fixtureMatchResultItem.fixture.homeTeam.id.toString() == teamId ||
              fixtureMatchResultItem.fixture.awayTeam.id.toString() == teamId
            );
          }
          return true;
        })
        // Filter by round
        .filter((fixtureMatchResultItem) => {
          if (roundId && !isBlank(roundId)) {
            return fixtureMatchResultItem.fixture.round.toString() == roundId;
          }
          return true;
        });

      navigation.navigate("LeagueFilterFixtureResultV2", {
        flow: route.params.flow,
        results,
      });
      setIsLoading(false);
    } catch (e) {
      const error = e as AxiosError;
      showApiToastError(e);
      console.log("fail, value: ", e);

      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }
  return (
    <HeaderLayout
      isSticky
      KeyboardAwareScrollViewProps={{ bounces: false }}
      headerProps={{
        title: t("Fixture and Result Filter"),
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      <VStack space="4" flex="1" py="defaultLayoutSpacing">
        {/* Type components */}
        <Heading size="md">{t("Type")}</Heading>
        <FormInput
          label={t("Type")}
          controllerProps={{
            name: "typeText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, type: true }));
          }}
        />
        {/* Division components */}
        {flow === LeagueFlow.audience && (
          <>
            <Heading size="md">{t("Division")}</Heading>
            <FormInput
              label={t("Division")}
              controllerProps={{
                name: "divisionText",
                control,
                rules: {
                  required: true,
                },
                defaultValue: divisionName,
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => {
                setIsOpen((prev) => ({ ...prev, division: true }));
              }}
            />
          </>
        )}

        {/* Team components */}
        {flow === LeagueFlow.audience && (
          <>
            <Heading size="md">{t("Team")}</Heading>
            <FormInput
              label={t("Team")}
              controllerProps={{
                name: "teamText",
                control,
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => {
                setIsOpen((prev) => ({ ...prev, team: true }));
              }}
            />
          </>
        )}

        {/* Round components */}
        <Heading size="md">{t("Round")}</Heading>
        <FormInput
          label={t("Round")}
          controllerProps={{
            name: "roundText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, round: true }));
          }}
        />

        <SingleSelectModal
          isOpen={isOpen.type}
          onCloseWithValue={(val) => {
            setValue("typeText", val);
            setIsOpen((prev) => ({ ...prev, type: false }));
          }}
          title={`${t("Select")}${t("Type")}`}
          confirmButtonText={t("Confirm")}
          options={[
            {
              label: t(FixtureType.fixture),
              value: FixtureType.fixture,
            },
            {
              label: t(FixtureType.result),
              value: FixtureType.result,
            },
          ]}
          controllerProps={{
            name: "type",
            control,
          }}
        />
        <SingleSelectModal
          isOpen={isOpen.round}
          onCloseWithValue={(val) => {
            setValue(
              "roundText",
              roundOptions.filter((option) => option.value === val)[0]?.label
            );
            setIsOpen((prev) => ({ ...prev, round: false }));
          }}
          title={`${t("Select")}${t("Round")}`}
          confirmButtonText={t("Confirm")}
          options={roundOptions}
          controllerProps={{
            name: "round",
            control,
          }}
        />

        <SingleSelectModal
          title={`${t("Select")}${t("Division")}`}
          confirmButtonText={t("Confirm")}
          isOpen={isOpen.division}
          onCloseWithValue={(val) => {
            setValue(
              "divisionText",
              val
                ? divisionOptions.filter((option) => option.value === val)[0]
                    ?.label
                : ""
            );
            setValue("team", "");
            setValue("teamText", "");
            setIsOpen((prev) => ({ ...prev, division: false }));
          }}
          options={divisionOptions}
          controllerProps={{
            name: "division",
            control,
          }}
        />
        <SingleSelectModal
          title={`${t("Select")}${t("Team")}`}
          confirmButtonText={t("Confirm")}
          isOpen={isOpen.team}
          onCloseWithValue={(val) => {
            setValue(
              "teamText",
              teamOptions.filter((option) => option.value === val)[0]?.label
            );
            setIsOpen((prev) => ({ ...prev, team: false }));
          }}
          options={teamOptions}
          controllerProps={{
            name: "team",
            control,
          }}
        />
        <Button
          isDisabled={!isValid}
          style={{ marginTop: "auto" }}
          onPress={handleSubmit(onSearch)}
        >
          {t("Confirm")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
