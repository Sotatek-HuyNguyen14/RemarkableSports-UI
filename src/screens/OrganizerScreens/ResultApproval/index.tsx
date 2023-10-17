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
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { Store } from "../../../stores";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import { getTranslation } from "../../../utils/translation";
import GhostTabbar from "../../../components/GhostTabBar";
import TipIcon from "../../../components/Icons/TipIcon";
import TipDialogIcon from "../../../components/Icons/TipDialogIcon";
import CoffeeIcon from "../../../components/Icons/CoffeeIcon";
import LightPubIcon from "../../../components/Icons/LightPubIcon";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { showApiToastError } from "../../../components/ApiToastError";
import {
  bulkApprove,
  getAllDivisionMatchResults,
} from "../../../services/LeagueServices";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import DivisionMatchResultItem from "../ManageDivision/DivisionResultItem";
import { DivisionMatchResultStatus } from "../../../models/responses/League";

export type ResultApprovalPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ResultApproval"
>;

type ResultApprovalPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "ResultApproval"
>;

export interface ResultApprovalProps extends ResultApprovalPropsBaseProps {
  store: Store;
  route: ResultApprovalPropsBaseProps;
  navigation: ResultApprovalPropsNavigationProp;
}

export interface FormValue {
  name: string;
  season: string;
  divisions: [];
  newTeam: { team: string }[];
  newEditedName: string;
}

const t = getTranslation([
  "constant.district",
  "constant.eventType",
  "screen.OrganizerScreens.ResultApproval",
  "constant.profile",
  "constant.button",
  "toastMessage",
]);

enum ActiveTab {
  Agreement = "Agreement",
  Rejection = "Rejection",
}

export default function ResultApproval({
  navigation,
  route,
}: ResultApprovalProps) {
  const theme = useTheme();
  const [activePage, setActivePage] = useState(0);
  const [confirmModal, setConfirmModal] = useState(false);

  const { divisionId } = route.params;
  const {
    data: matchResultsData,
    isValidating: matchResultValidating,
    error: matchError,
    mutate: matchResultMutate,
  } = useSWR(formatCoreUrl(`/division/${divisionId}`), () => {
    if (divisionId) {
      return getAllDivisionMatchResults({ divisionId });
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      matchResultMutate();
    }, [matchResultMutate])
  );

  const agreements = matchResultsData
    ? matchResultsData.filter(
        (result) => result.status === DivisionMatchResultStatus.Acknowledged
      )
    : [];
  const rejuctions = matchResultsData
    ? matchResultsData.filter(
        (result) => result.status === DivisionMatchResultStatus.Rejected
      )
    : [];
  const availableTabs = [
    `${t(ActiveTab.Agreement)}(${agreements.length ?? 0})`,
    `${t(ActiveTab.Rejection)}(${rejuctions.length ?? 0})`,
  ];

  const noDataView = (label: string) => {
    return (
      <VStack space="4" flex="1" alignItems="center">
        <Text mt="4" fontSize="md" fontWeight="bold">
          {t(`No ${label}`)}
        </Text>
        <Button
          w="100%"
          onPress={() => {
            navigation.goBack();
          }}
        >
          {t("Back to Result page")}
        </Button>
      </VStack>
    );
  };

  const agreementView = () => {
    if (!agreements || agreements.length === 0) {
      return noDataView("pending approval");
    }

    return (
      <VStack mt="4" space={4}>
        {/* Bulk approval view */}
        <HStack p="4" borderRadius="xl" bgColor="rgba(49, 9, 94, 0.1)">
          <LightPubIcon
            props={{ size: "xl", alignSelf: "flex-start", marginTop: 2 }}
          />
          <VStack space="3" p="3" flex={1}>
            <Heading fontSize="md">{t("Bulk Approve")}</Heading>
            <Text flexWrap="wrap">
              {t("You can approve all the result in one go")}
            </Text>
            <Button
              onPress={() => {
                setConfirmModal(true);
              }}
              w="100%"
              variant="solid"
              borderRadius="3xl"
              fontSize="xs"
            >
              <Text fontSize="md" fontWeight="bold" color="rs.white">
                {t("Bulk Approve")}
              </Text>
            </Button>
          </VStack>
        </HStack>
        {/* Match result items */}
        {agreements.map((agreementResult) => {
          return (
            <Pressable w="100%" key={agreementResult.id}>
              <DivisionMatchResultItem
                onPressDetail={() => {
                  navigation.navigate("MatchResult", {
                    matchResultId: agreementResult.id,
                  });
                }}
                matchResult={agreementResult}
              />
            </Pressable>
          );
        })}
      </VStack>
    );
  };

  const rejuctionView = () => {
    if (!rejuctions || rejuctions.length === 0) {
      return noDataView("rejection");
    }

    return (
      <VStack mt="4" alignItems="flex-start" justifyContent="flex-start">
        {/* Match result items */}
        {rejuctions.map((rejuctionResult) => {
          return (
            <Pressable w="100%" key={rejuctionResult.id}>
              <DivisionMatchResultItem
                onPressDetail={() => {
                  navigation.navigate("MatchResult", {
                    matchResultId: rejuctionResult.id,
                  });
                }}
                matchResult={rejuctionResult}
              />
            </Pressable>
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
        title: t("ResultApproval"),
      }}
      isSticky
    >
      <VStack mx="defaultLayoutSpacing">
        <GhostTabbar
          defaultIndex={activePage}
          items={availableTabs}
          activateColor="rs.primary_purple"
          unActivateColor="rs.inputLabel_grey"
          onPress={(item: string, index: number) => {
            setActivePage(index);
          }}
        />
        {activePage === 0 && agreementView()}
        {activePage === 1 && rejuctionView()}
      </VStack>
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Yes")}
        cancelText={t("Cancel")}
        isOpen={confirmModal}
        onCancel={() => {
          setConfirmModal(false);
        }}
        title={t("Bulk Approve")}
        description={t("Are you sure to bulk approve the match results")}
        onConfirm={async () => {
          setConfirmModal(false);
          try {
            await bulkApprove(agreements);
            showApiToastSuccess({
              title: `${t("Bulk Approve")}${t("Success")}`,
              body: t("Match results will be posted on Leaderboard"),
            });
          } catch (error) {
            showApiToastError(error);
          }
        }}
      />
    </HeaderLayout>
  );
}
