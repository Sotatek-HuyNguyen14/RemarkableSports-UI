/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unsafe-optional-chaining */
import React, { useCallback, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CompositeNavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Box, useTheme, VStack } from "native-base";
import useSWR from "swr";
import { LayoutAnimation, Pressable } from "react-native";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import {
  CoachBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
} from "../../../routers/Types";
import GhostTabbar from "../../../components/GhostTabBar";
import { formatMeetupApiUrl } from "../../../services/ServiceUtil";
import {
  O3CoachingStatus,
  queryContacts,
  queryO3CoachMeetups,
} from "../../../services/O3Services";
import {
  LocalContactsData,
  O3MeetupStatus,
  O3Response,
  OneOnOneStatus,
} from "../../../models/responses/O3Response";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { getTranslation } from "../../../utils/translation";
import MeetupCard from "../../../components/Card/MeetupCard";
import ContactsCard from "../../../components/Card/ContactsCard";
import NoDataComponent from "../../../components/NoDataComponent";

export type CoachRequestListScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<CoachBottomTabNavigatorParamList, "CoachRequestList">,
  NativeStackNavigationProp<MainStackNavigatorParamList>
>;

interface CoachRequestListScreenNavigationProps {
  navigation: CoachRequestListScreenNavigationProp;
}

const t = getTranslation([
  "screen.CoachScreens.RequestList",
  "constant.tabType",
]);

enum ActiveTab {
  Recent = "Recent",
  Contacts = "Contacts",
}
interface TabItem {
  label: string;
  value: O3CoachingStatus;
}

function CoachRequests({ navigation }: CoachRequestListScreenNavigationProps) {
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [firstTabIndex, setFirstTabIndex] = React.useState(0);

  const tabItems: TabItem[] = [
    {
      label: t("Pending"),
      value: O3CoachingStatus.Applied,
    },
    {
      label: t("Upcoming"),
      value: O3CoachingStatus.Coaching,
    },
    {
      label: t("Completed"),
      value: O3CoachingStatus.Coaching,
    },
  ];
  const { space, colors } = useTheme();

  const availableTabs = [t(ActiveTab.Recent), t(ActiveTab.Contacts)];

  const {
    data: contactsData,
    error: contactsError,
    isValidating: contactsValidating,
    isLoading: contactsLoading,
    mutate: contactsMutate,
  } = useSWR(formatMeetupApiUrl("/1on1/contact"), () => queryContacts());

  const {
    data: coachingList,
    error: coachListError,
    isValidating: isCoachingValidating,
    isLoading: coachingLoading,
    mutate: coachingListMutate,
  } = useSWR<O3Response[]>(
    formatMeetupApiUrl(`/1on1/${O3CoachingStatus.Coaching}`),
    (_p) => queryO3CoachMeetups(O3CoachingStatus.Coaching)
  );

  const {
    data: applieds,
    error: appliedError,
    isValidating: appliedValidating,
    isLoading: appliedLoading,
    mutate: appliedMutate,
  } = useSWR<O3Response[]>(
    formatMeetupApiUrl(`/1on1/${O3CoachingStatus.Applied}`),
    (_p) => queryO3CoachMeetups(O3CoachingStatus.Applied)
  );

  const mutateAll = useCallback(() => {
    coachingListMutate();
    contactsMutate();
    appliedMutate();
  }, [coachingListMutate, appliedMutate, contactsMutate]);

  const confirmeds = coachingList
    ? coachingList.filter(
        (val: { status: O3MeetupStatus }) =>
          val.status !== O3MeetupStatus.Completed
      )
    : [];
  const finisheds = coachingList
    ? coachingList.filter(
        (val: { status: O3MeetupStatus }) =>
          val.status === O3MeetupStatus.Completed
      )
    : [];

  // useFocusEffect(
  //   React.useCallback(() => {
  //     mutate();
  //     appliedMutate();
  //     contactsMutate();
  //   }, [mutate, appliedMutate, contactsMutate])
  // );

  const sortHide = (array: O3Response[]) => {
    const interestedPlayer =
      Array.isArray(array) && array
        ? array
            ?.filter((item) => item.oneOnOneCoachSuggestion !== "Hide")
            .sort(
              (lhs, rhs) =>
                lhs?.createdAt?.valueOf() - rhs?.createdAt?.valueOf()
            )
        : [];
    const notInterestedPlayer =
      Array.isArray(array) && array
        ? array
            ?.filter((item) => item.oneOnOneCoachSuggestion === "Hide")
            .sort(
              (lhs, rhs) =>
                lhs?.createdAt?.valueOf() - rhs?.createdAt?.valueOf()
            )
        : [];
    return interestedPlayer.concat(notInterestedPlayer);
  };

  const recentView = () => {
    const unwrappedApplieds = applieds || [];

    const recentIndexs = [
      unwrappedApplieds.length ?? 0,
      confirmeds.length ?? 0,
      finisheds.length ?? 0,
    ];

    const localTabItems = tabItems.map((val, index) => ({
      ...val,
      label: `${val.label}(${recentIndexs[index]})`,
    }));

    const dataList = sortHide(
      activeTabIndex === 0
        ? unwrappedApplieds
        : activeTabIndex === 1
        ? confirmeds
        : finisheds
    );

    const isValidating = appliedValidating || isCoachingValidating;

    if (isValidating) {
      return <Loading />;
    }

    const error = coachListError || appliedError;

    if (error) {
      return <ErrorMessage />;
    }

    return (
      <>
        <Box p="defaultLayoutSpacing">
          <GhostTabbar
            defaultIndex={activeTabIndex}
            activateColor={colors.rs.primary_purple}
            unActivateColor={colors.rs.inputLabel_grey}
            items={localTabItems.map((i) => i.label)}
            onPress={(item: string, index: number) => {
              // setCoachingStatus(localTabItems[index].value);
              setActiveTabIndex(index);
            }}
          />
        </Box>

        {dataList.length === 0 ? (
          <NoDataComponent />
        ) : (
          <VStack space="4">
            {dataList
              .sort((a, b) => b.fromTime.valueOf() - a.fromTime.valueOf())
              .map((request) => (
                <MeetupCard
                  key={request.id}
                  meetup={request}
                  onPress={() => {
                    navigation.navigate("CoachO3Details", {
                      o3: request,
                    });
                  }}
                />
              ))}
          </VStack>
        )}
      </>
    );
  };
  const contactsView = () => {
    if (contactsValidating) {
      return (
        <VStack space={4} py={4}>
          <Loading />
        </VStack>
      );
    }

    if (contactsError) {
      return (
        <VStack space={4} py={4}>
          <ErrorMessage />
        </VStack>
      );
    }

    let localContactsData: LocalContactsData[] = [];

    if (contactsData && contactsData?.length > 0) {
      localContactsData = contactsData
        .map((contact) => {
          if (
            contact &&
            contact.oneOnOneCoachs &&
            contact.oneOnOneCoachs.length > 0
          ) {
            return {
              ...contact,
              times: contact.oneOnOneCoachs?.filter(
                (oneOnOne) =>
                  oneOnOne.status === OneOnOneStatus.Completed ||
                  oneOnOne.status === OneOnOneStatus.Matched
              )?.length,
            };
          }
          return {
            ...contact,
            times: 0,
          };
        })
        ?.filter((val) => val.times > 0);
    }

    if (localContactsData.length === 0) {
      return (
        <VStack space={4} py={4}>
          <NoDataComponent />
        </VStack>
      );
    }

    return (
      <VStack space={4} py={4}>
        {localContactsData
          .sort((a, b) => b.times - a.times)
          .map((request, index) => (
            <Pressable
              key={`contactsView_${request.playerId}_${index}`}
              onPress={() => {
                navigation.navigate("CoachContanctsDetails", {
                  contanct: request,
                });
              }}
            >
              <ContactsCard
                player={request.playerInfo}
                times={request?.times ?? 0}
              />
            </Pressable>
          ))}
      </VStack>
    );
  };

  const isFetchingData =
    isCoachingValidating || contactsValidating || appliedValidating;

  if (isFetchingData) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        hasBackButton: false,
        title: t("Meetup Records"),
        onPress: () => {
          navigation?.goBack();
        },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
      supportPullToRefresh
      onRefresh={() => {
        mutateAll();
      }}
    >
      <VStack mx="4" space={4}>
        <GhostTabbar
          isShowBottomLine
          isFlex
          defaultIndex={firstTabIndex}
          items={availableTabs}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setFirstTabIndex(index);
          }}
          activateColor={colors.rs.primary_purple}
          unActivateColor={colors.rs.inputLabel_grey}
          tabProps={{
            fontSize: 16,
            textAlign: "center",
            flex: 1,
          }}
        />
      </VStack>
      {firstTabIndex === 0 && recentView()}
      {firstTabIndex === 1 && contactsView()}
    </HeaderLayout>
  );
}

export default CoachRequests;
