import {
  HStack,
  Heading,
  Pressable,
  Text,
  VStack,
  useTheme,
  ScrollView,
  Box,
} from "native-base";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { uniqueId } from "lodash";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Animated, Keyboard, LayoutAnimation } from "react-native";
import { useForm } from "react-hook-form";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import GhostTabbar from "../../components/GhostTabBar";
import EventCard from "../../components/Card/EventCard";
import { useAuth } from "../../hooks/UseAuth";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getEventApplied, getEvents } from "../../services/JoinEventServices";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import BannerButton from "../../components/BannerButton";
import HeaderLayout from "../../components/Layout/HeaderLayout";

import {
  EventApplicationStatus,
  EventResponse,
  PaymentStatus,
} from "../../models/responses/Event";
import {
  getEventPermissionById,
  isEventFinished,
  isEventHappening,
} from "../../services/EventServices";

import FlashListLayout from "../../components/Layout/FlashListLayout";
import NoDataComponent from "../../components/NoDataComponent";
import { UserType, ClubStaff } from "../../models/User";
import FeatureCardSlider from "../../components/FeatureCardSlider";
import { SCREEN_WIDTH } from "../../constants/constants";
import WrapCardSlider from "../../components/WrapCardSlider";
import FilterComponent from "../../components/FilterComponent";
import NoAccessRight from "../../components/NoAccessRight";
import ExclaimationIcon from "../../components/Icons/ExclaimationIcon";
import { isBlank } from "../../utils/strings";
import FilterIconV2 from "../../components/Icons/FilterIconV2";
import MagnifyingGlassIcon from "../../components/Icons/MagnifyingGlassIcon";
import FormInput from "../../components/FormInput/FormInput";

export type EventListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "EventList"
>;

const t = getTranslation([
  "screen.EventList",
  "constant.button",
  "formInput",
  "constant.tabType",
]);

enum ActiveTab {
  Existing = "Existing",
  Past = "Past",
  Pending = "Pending",
  Upcoming = "Upcoming",
  Completed = "Completed",
}

interface FormValue {
  search: string;
}

function EventList({ navigation }: EventListProps) {
  const { user } = useAuth();
  const {
    data: eventList,
    isValidating: eventIsValidating,
    error: eventError,
    mutate: eventListMutate,
  } = useSWR(
    formatCoreUrl("/event"),
    () =>
      getEvents().then((data) => {
        if (data && data.length) {
          data.sort(
            (a, b) =>
              new Date(b.eventSessions[0].date).getTime() -
              new Date(a.eventSessions[0].date).getTime()
          );
          return data;
        }
        return data;
      }),
    {
      revalidateOnFocus: false,
    }
  );

  const { control, watch } = useForm<FormValue>({ mode: "onChange" });
  const searchQuery = watch("search");
  const isFocused = useIsFocused();
  useEffect(() => {
    const subscribe = Keyboard.addListener("keyboardDidHide", (keyEvent) => {
      if (!isBlank(searchQuery) && isFocused) {
        navigation.navigate("AllEvent", { filterText: searchQuery });
      }
    });
    return () => subscribe?.remove();
  }, [navigation, searchQuery, isFocused]);

  const {
    data: appliedList,
    isValidating: appliedListIsValidating,
    error: appliedListError,
    mutate: appliedListMutate,
  } = useSWR(
    formatCoreUrl("/event/applied"),
    () =>
      getEventApplied().then((data) => {
        if (data && data.length) {
          data.sort(
            (a, b) =>
              new Date(b.eventSessions[0].date).getTime() -
              new Date(a.eventSessions[0].date).getTime()
          );
          return data;
        }
        return data;
      }),
    {
      revalidateOnFocus: false,
    }
  );

  const {
    data: permission,
    mutate: eventPermissiontMutate,
    isValidating: permissionValidating,
  } = useSWR(
    user?.sub ? formatCoreUrl(`/event-permission/${user?.sub}`) : null,
    () => (user?.sub ? getEventPermissionById(user?.id) : null)
  );
  const scrollX = useRef(new Animated.Value(0)).current;
  const isShowHostEvent =
    user?.userType === UserType.ClubStaff ||
    (permission && permission.canCreate);
  const shouldShowFooter =
    user?.userType === UserType.ClubStaff ||
    (permission && permission.canCreate);
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [searchWords, setSearchWords] = useState("");
  const mainTabs = [t("Host"), t("Participant")];
  const [mainTab, setMainTab] = useState(0);
  const mutateAll = useCallback(() => {
    eventListMutate();
    appliedListMutate();
    eventPermissiontMutate();
  }, [eventListMutate, appliedListMutate, eventPermissiontMutate]);

  // refresh the list when focus
  useFocusEffect(
    React.useCallback(() => {
      mutateAll();
    }, [mutateAll])
  );

  const applieds = appliedList
    ? appliedList?.filter((val) => {
        const filters = val.eventApplications.filter(
          (item, j) =>
            (item.applicant.id === user?.sub &&
              !val.fee &&
              (item.eventApplicationStatus === EventApplicationStatus.Pending ||
                item.eventApplicationStatus ===
                  EventApplicationStatus.WaitingList) &&
              item.paymentStatus === PaymentStatus.Paid &&
              !isEventFinished(val)) ||
            (val.fee &&
              item.applicant.id === user?.sub &&
              (item.eventApplicationStatus === EventApplicationStatus.Pending ||
                item.eventApplicationStatus ===
                  EventApplicationStatus.WaitingList ||
                item.eventApplicationStatus ===
                  EventApplicationStatus.Approved) &&
              item.paymentStatus !== PaymentStatus.Paid &&
              !isEventFinished(val))
        );
        if (!val.isHost && filters?.length) {
          return val;
        }
      })
    : [];

  const finishedList = appliedList
    ? appliedList?.filter((val) => {
        const result = isEventFinished(val);
        if (!val.isHost && result) {
          return val;
        }
      })
    : [];

  const confirmList = appliedList
    ? appliedList?.filter((val) => {
        const filters = val.eventApplications.filter(
          (item, j) =>
            item.applicant.id === user?.sub &&
            item.eventApplicationStatus === EventApplicationStatus.Approved &&
            item.paymentStatus === PaymentStatus.Paid &&
            !isEventFinished(val)
        );
        if (!val.isHost && filters?.length) {
          return val;
        }
      })
    : [];

  const recommendedList = eventList?.filter(
    (val) =>
      val.creator.id !== user?.sub &&
      !isEventFinished(val) &&
      !appliedList?.map((e) => e.id).includes(val.id)
  );

  const availableTabs = [
    `${t(ActiveTab.Pending)}(${applieds?.length ?? 0})`,
    `${t(ActiveTab.Upcoming)}(${confirmList?.length ?? 0})`,
    `${t(ActiveTab.Completed)}(${finishedList?.length ?? 0})`,
  ];

  const [creatorActiveTabIndex, setCreatorActiveTabIndex] = React.useState(0);
  const theme = useTheme();
  const createdEvents = eventList
    ? eventList.filter((event) => event.isHost)
    : [];
  const onGoingEvent = createdEvents
    ? createdEvents.filter((event) => {
        return isEventHappening(event) && !isEventFinished(event);
      })
    : [];
  const finishedEvent = createdEvents
    ? createdEvents.filter((event) => {
        return isEventFinished(event);
      })
    : [];
  const creatorAvailableTabs = [
    `${t(ActiveTab.Existing)}(${onGoingEvent.length ?? 0})`,
    `${t(ActiveTab.Past)}(${finishedEvent.length ?? 0})`,
  ];

  const shouldShowNoAccessRight =
    !permission || (permission && permission.canCreate);

  const dataList = () => {
    if (isShowHostEvent) {
      if (mainTab === 0) {
        if (creatorActiveTabIndex === 0) {
          return onGoingEvent;
        }
        if (creatorActiveTabIndex === 1) {
          return finishedEvent;
        }
      }

      if (mainTab === 1) {
        if (activeTabIndex === 0) {
          return applieds;
        }
        if (activeTabIndex === 1) {
          return confirmList;
        }

        if (activeTabIndex === 2) {
          return finishedList;
        }
      }
    } else {
      if (activeTabIndex === 0) {
        return applieds;
      }
      if (activeTabIndex === 1) {
        return confirmList;
      }
      if (activeTabIndex === 2) {
        return finishedList;
      }
    }
  };

  // For clubs we will show two tabs in both case having / not having Event permission
  const isUserHasHostRole =
    user?.userType === UserType.ClubStaff ||
    (permission !== null && permission?.canCreate);
  // Able to create event = Event permission granted + Can create
  const isUserAbleToCreateEvent =
    user?.userType === UserType.ClubStaff
      ? permission &&
        permission.canCreate &&
        (user as ClubStaff).applyClubStatus === "Approved"
      : permission && permission.canCreate;

  const shouldRenderTabbar =
    user?.userType === UserType.ClubStaff &&
    (user as ClubStaff).applyClubStatus === "Approved";

  const hostHeader = () => {
    return (
      <VStack space="4">
        {/* Create event banner */}
        {isUserAbleToCreateEvent && (
          <BannerButton
            headerLabel={t("Create")}
            description={t(
              "Tap here to create a new event and have fun with other player"
            )}
            onPress={() => {
              navigation.navigate("AddEvent");
            }}
          />
        )}

        {/* Existing - Past */}
        {shouldRenderTabbar && (
          <GhostTabbar
            boxProps={{ paddingX: 4 }}
            defaultIndex={creatorActiveTabIndex}
            items={creatorAvailableTabs}
            onPress={(item: string, index: number) => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setCreatorActiveTabIndex(index);
            }}
            activateColor={theme.colors.rs.primary_purple}
            unActivateColor={theme.colors.rs.inputLabel_grey}
            tabProps={{ fontSize: 16 }}
          />
        )}
      </VStack>
    );
  };

  const participantHeader = () => {
    return (
      <VStack space="4" mx="defaultLayoutSpacing">
        {/* Filter & Search */}
        {/* <FilterComponent
          onPress={() => {
            navigation.navigate("EventFiltering", {
              filterValue: {},
            });
          }}
        /> */}
        <HStack alignItems="center" space="3">
          <FormInput
            label={t("Search")}
            controllerProps={{
              name: "search",
              control,
            }}
            isBorderEnabled={false}
            containerProps={{
              flex: 1,
              bg: "rs.grey",
              borderRadius: "2xl",
              bgColor: "rs.grey",
              borderColor: "rs.grey",
              borderWidth: 0,
              shadow: "none",
            }}
            inputProps={{
              InputRightElement: (
                <Pressable
                  onPress={() => {
                    setSearchWords(searchQuery);
                  }}
                >
                  <MagnifyingGlassIcon flex={1} size="lg" mr="4" />
                </Pressable>
              ),
              bgColor: "rs.grey",
              borderColor: "rs.grey",
              borderWidth: "0",
              shadow: "none",
              _focus: { borderColor: "rs.grey" },
            }}
          />

          <Pressable
            p={4}
            borderRadius="2xl"
            bg="#F6F6F6"
            alignItems="center"
            justifyContent="center"
            onPress={() => {
              navigation.navigate("EventFiltering", {
                filterValue: {},
              });
            }}
          >
            <FilterIconV2 />
          </Pressable>
        </HStack>

        {/* Recommend events */}
        <HStack justifyContent="space-between">
          <Heading>{t("Recommended Event")}</Heading>
          <Pressable
            _pressed={{ opacity: 0.5 }}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              navigation.navigate("AllEvent");
            }}
          >
            <Text color="rs.primary_purple" fontSize={16}>
              {t("View all")}
            </Text>
          </Pressable>
        </HStack>

        <WrapCardSlider>
          {recommendedList?.length > 0 &&
            recommendedList.slice(0, 3).map((event) => (
              <EventCard
                boxProps={{
                  width: SCREEN_WIDTH - 32,
                  shadow: 0,
                  _pressed: { opacity: 1 },
                }}
                key={uniqueId()}
                event={event}
                onPress={() => {
                  navigation.navigate("PlayerEventDetails", {
                    event,
                  });
                }}
              />
            ))}
        </WrapCardSlider>
        {!eventIsValidating &&
          !eventError &&
          (!recommendedList || recommendedList?.length === 0) && (
            <NoDataComponent />
          )}

        {/* Pending - Upcomming - Finished  */}
        <GhostTabbar
          defaultIndex={activeTabIndex}
          items={availableTabs}
          activateColor="rs.primary_purple"
          unActivateColor="rs.inputLabel_grey"
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setActiveTabIndex(index);
          }}
        />
      </VStack>
    );
  };

  const headerComponent = (
    <VStack space="4" mb="4">
      {/* Host - Participant nav */}
      {isUserHasHostRole && (
        <GhostTabbar
          boxProps={{ paddingX: 4 }}
          isShowBottomLine
          isFlex
          defaultIndex={mainTab}
          items={mainTabs}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setMainTab(index);
          }}
          activateColor={theme.colors.rs.primary_purple}
          unActivateColor={theme.colors.rs.inputLabel_grey}
          tabProps={{
            fontSize: 16,
            textAlign: "center",
            flex: 1,
          }}
        />
      )}

      {/* Host header - Participant header switching */}
      {mainTab === 0 && isUserHasHostRole ? hostHeader() : participantHeader()}
    </VStack>
  );

  const emptyOrloading = () => {
    if (isShowHostEvent && mainTab === 0) {
      return (
        <VStack>
          {eventError && <ErrorMessage />}
          {!eventError &&
            creatorActiveTabIndex === 0 &&
            (!createdEvents ||
              (createdEvents && createdEvents.length === 0)) && (
              <NoDataComponent
                content={t("There is no %{type} event", { type: t("Created") })}
              />
            )}
          {!eventError &&
            creatorActiveTabIndex === 1 &&
            (!onGoingEvent || (onGoingEvent && onGoingEvent.length === 0)) && (
              <NoDataComponent
                content={t("There is no %{type} event", { type: t("OnGoing") })}
              />
            )}
          {!eventError &&
            creatorActiveTabIndex === 2 &&
            (!finishedEvent ||
              (finishedEvent && finishedEvent.length === 0)) && (
              <NoDataComponent
                content={t("There is no %{type} event", {
                  type: t("Finished"),
                })}
              />
            )}
        </VStack>
      );
    }
    if (!isShowHostEvent || mainTab === 1) {
      return (
        <VStack>
          {appliedListError && <ErrorMessage />}
          {!appliedListError &&
            activeTabIndex === 0 &&
            (!applieds || (applieds && applieds.length === 0)) && (
              <NoDataComponent
                content={t("There is no %{type} event", { type: t("Applied") })}
              />
            )}
          {!eventError &&
            activeTabIndex === 1 &&
            (!confirmList || (confirmList && confirmList.length === 0)) && (
              <NoDataComponent
                content={t("There is no %{type} event", {
                  type: t("Confirmed"),
                })}
              />
            )}
          {!eventError &&
            activeTabIndex === 2 &&
            (!finishedList || (finishedList && finishedList.length === 0)) && (
              <NoDataComponent
                content={t("There is no %{type} event", {
                  type: t("Finished"),
                })}
              />
            )}
        </VStack>
      );
    }
  };

  const unwrappedDataList = dataList() || [];
  const unwrappedEventList = eventList || [];

  const clubAlternativeView = () => {
    const staff = user as ClubStaff;
    if (
      (!permission || (permission && !permission.canCreate)) &&
      staff?.applyClubStatus &&
      staff.applyClubStatus !== "Approved"
    ) {
      return (
        <VStack>
          {headerComponent}
          <VStack flex="1" mt="20" mx="defaultLayoutSpacing">
            <NoAccessRight
              mt="20"
              description={t(
                "Your club does not have right to create event yet"
              )}
            />
          </VStack>
        </VStack>
      );
    }

    if (
      (!permission || (permission && !permission.canCreate)) &&
      createdEvents.length === 0
    ) {
      return (
        <VStack>
          {headerComponent}
          <VStack flex="1" mt="20" mx="defaultLayoutSpacing">
            <NoAccessRight
              mt="20"
              description={t(
                "Your club does not have right to create event yet"
              )}
            />
          </VStack>
        </VStack>
      );
    }

    if (permission && permission.canCreate && createdEvents.length === 0) {
      return (
        <VStack>
          {headerComponent}
          <HStack
            space="2"
            flex="1"
            alignItems="center"
            bg="#66CEE126"
            mt="4"
            mx="defaultLayoutSpacing"
            px="4"
            py="4"
            borderRadius="md"
          >
            <ExclaimationIcon props={{ customFill: "#66CEE1", size: "xl" }} />
            <Text fontSize="md" fontWeight="bold">
              {t("No Event")}
            </Text>
          </HStack>
        </VStack>
      );
    }
  };

  if (eventIsValidating || permissionValidating || appliedListIsValidating) {
    return <Loading />;
  }

  return (
    <FlashListLayout
      headerProps={{
        title: t("Event"),
        hasBackButton: false,
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
      flashListProps={{
        data: unwrappedDataList,
        renderItem: ({ item }) => (
          <VStack space="4" mb="5" mx="defaultLayoutSpacing">
            <EventCard
              onPress={() => {
                navigation.navigate("PlayerEventDetails", {
                  event: item,
                });
              }}
              event={item}
              shouldShowFooter={mainTab === 0 ? shouldShowFooter : null}
              onManage={() => {
                navigation.navigate("ManageEvent", {
                  eventId: item.id,
                });
              }}
              onEdit={() => {
                navigation.navigate("UpdateEvent", { event: item });
              }}
            />
          </VStack>
        ),
        keyExtractor: (item) => `${item.id}`,
        ListHeaderComponent: headerComponent,
        ListEmptyComponent: emptyOrloading(),
      }}
      // Show No Access right view for club stafs not having Event permission
      alternativeView={
        user?.userType === UserType.ClubStaff && mainTab === 0
          ? clubAlternativeView()
          : null
      }
      supportPullToRefresh
      onRefresh={() => {
        mutateAll();
      }}
    />
  );
}

export default EventList;
