import React, { useEffect, useState } from "react";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Circle,
  Divider,
  Heading,
  HStack,
  Pressable,
  QuestionIcon,
  Text,
  Toast,
  VStack,
} from "native-base";
import axios from "axios";
import useSWR from "swr";
import FindCoachCard from "../../../components/Card/FindCoachCard";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import RoundedRedCrossIcon from "../../../components/Icons/RoundedRedCrossIcon";
import {
  O3MeetupStatus,
  O3Response,
} from "../../../models/responses/O3Response";
import {
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import AppliedCoachCard from "../../../components/Card/AppliedCoachCard";
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import ClockIcon from "../../../components/Icons/ClockIcon";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import LocationIcon from "../../../components/Icons/LocationIcon";
import MoneyIcon from "../../../components/Icons/MoneyIcon";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import {
  addBookmark,
  cancelBookmark,
  cancelMeetCoachO3Request,
  getCoachList,
  isDirectMeetup,
} from "../../../services/O3Services";
import CoachShortProfile from "../../../components/CoachShortProfile";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import FindCoachTipCard from "../../../components/Card/FindCoachTipCard";
import { Coach, UserType } from "../../../models/User";
import MagnifyingGlassIcon from "../../../components/Icons/MagnifyingGlassIcon";
import RightArrowIcon from "../../../components/Icons/RightArrowIcon";
import RefreshIconV2 from "../../../components/Icons/RefreshIconV2";
import { formatName, getUserName } from "../../../utils/name";
import FlagIcon from "../../../components/Icons/FlagIcon";
import {
  FlagIconV2,
  SelectedFlagIconV2,
} from "../../../components/Icons/FlagIconV2";
import ClockArrowIcon from "../../../components/Icons/ClockArrowIcon";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";

const t = getTranslation([
  "screen.PlayerScreens.O3AppliedCoach",
  "constant.district",
  "constant.button",
  "component.Coach.CoachProfile",
  "constant.profile",
]);

export type PlayerO3AppliedCoachNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<
    PlayerBottomTabNavigatorParamList,
    "PlayerO3AppliedCoach"
  >,
  NativeStackNavigationProp<MainStackNavigatorParamList>
>;

export type PlayerO3AppliedCoachRouteProp = RouteProp<
  PlayerBottomTabNavigatorParamList,
  "PlayerO3AppliedCoach"
>;

interface PlayerO3AppliedCoachScreenProps {
  navigation: PlayerO3AppliedCoachNavigationProp;
  route: PlayerO3AppliedCoachRouteProp;
}

let cachedCoachIds: string[] = [];
let allCoaches: Coach[] = [];

export default function PlayerO3AppliedCoach({
  navigation,
}: PlayerO3AppliedCoachScreenProps) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [isOpenCloseModal, setIsOpenCloseModal] = useState(false);
  const [tappedCoachId, setTappedCoachId] = useState<string>();
  const [favouritesCoaches, setFavouritesCoaches] = useState<Coach[]>([]);
  const [recommendCoaches, setRecommendCoaches] = useState<Coach[]>([]);

  const { data, error, isValidating, mutate } = useSWR<O3Response[]>(
    formatMeetupApiUrl("/1on1"),
    (path) =>
      axios
        .get(path)
        .then((res) =>
          Array.isArray(res.data)
            ? res.data.filter((d) => d.status === O3MeetupStatus.Pending)
            : []
        ),
    { refreshInterval: 300000 }
  );

  const {
    data: coachData,
    error: coachError,
    mutate: coachMutate,
    isValidating: coachIsValidating,
  } = useSWR<Coach[]>(formatMeetupApiUrl("/1on1/coachList"), () =>
    getCoachList().then((list) => {
      allCoaches = list;
      setFavouritesCoaches(list?.filter((val) => val.isBookMarked));
      if (cachedCoachIds.length > 0) {
        return list?.filter((coach) => cachedCoachIds.includes(coach.id));
      }
      return list;
    })
  );

  // useEffect(() => {
  //   if (cachedCoachIds.length === 0 && coachData && coachData.length > 0) {
  //     allCoaches = coachData;
  //   }
  // }, [coachData]);

  useFocusEffect(
    React.useCallback(() => {
      mutate();
      coachMutate();
    }, [coachMutate, mutate])
  );
  const onRefresh = React.useCallback(() => {
    if (coachData && coachData.length > 0) {
      if (cachedCoachIds.length === 0) {
        cachedCoachIds =
          coachData && coachData.length > 0
            ? coachData
                .sort(() => 0.5 - Math.random())
                .slice(0, 5)
                .map((coach) => coach.id)
            : [];
      }
      setRecommendCoaches(
        coachData.filter((coach) => cachedCoachIds.includes(coach.id))
      );
    }
  }, [coachData]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  // First broadcast request
  const o3Request =
    error || !Array.isArray(data) || data.length === 0
      ? null
      : data.filter((meetup) => !isDirectMeetup(meetup))[0];
  const shouldShowPendingRequest = data
    ? data.filter(
        (meetup) =>
          meetup.status === O3MeetupStatus.Pending && isDirectMeetup(meetup)
      ).length > 0
    : false;

  const isO3BoardCastIncluded = o3Request !== null && shouldShowPendingRequest;

  const showPlaceholder = !o3Request || o3Request.appliedCoachs.length === 0;

  const interestedO3 = o3Request
    ? o3Request.appliedCoachs
        .filter((o3) => !o3.isNotInterested)
        .sort((lhs, rhs) => rhs.score - lhs.score)
    : [];

  const notInterestedO3 = o3Request
    ? o3Request.appliedCoachs
        .filter((o3) => o3.isNotInterested)
        .sort((lhs, rhs) => rhs.score - lhs.score)
    : [];

  const o3Array = interestedO3.concat(notInterestedO3);

  const searchBanner = () => {
    return (
      <Pressable
        onPress={() => {
          navigation.navigate("PlayerO3SubmitRequest", {
            selectedCoachId: null,
            isSubmitO3RequestWithSelectedCoach: false,
          });
        }}
      >
        <HStack space="3" px="4" py="4" alignItems="center" bg="#F6F6F6">
          <Circle bgColor="rs.GPP_lightBlue">
            <MagnifyingGlassIcon size="xl" m="2" />
          </Circle>
          <VStack space="2" flex="1">
            <Text fontSize="lg" fontWeight="bold">
              {t("Search")}
            </Text>
            <Text>{t("Look for the right coach to meet up")}</Text>
          </VStack>
          <RightArrowIcon />
        </HStack>
      </Pressable>
    );
  };

  // Tab selectors
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const ActiveTabs = [
    { label: t("Recommendation"), value: "Recommendation" },
    { label: t("Favourite"), value: "Favourite" },
  ];
  const tabSelectors = () => {
    const tabItem = ({ label, index }: { label: string; index: number }) => {
      const isSelected = activeTabIndex === index;
      const color = isSelected ? "#31095E" : "#B3B6B8";
      const fontWeight = isSelected ? "bold" : "normal";

      return (
        <Pressable
          onPress={() => {
            setActiveTabIndex(index);
          }}
          key={`tabItem_${label}${index}`}
          flex="1"
          justifyContent="center"
          alignItems="center"
          p="4"
          borderBottomWidth="2"
          borderColor={color}
        >
          <Text fontSize="md" color={color} fontWeight={fontWeight}>
            {label}
          </Text>
        </Pressable>
      );
    };

    return (
      <HStack flex="1">
        {ActiveTabs.map((tab, index) => {
          return tabItem({ label: tab.label, index });
        })}
      </HStack>
    );
  };

  const onBookmark = async ({
    isMarked,
    coachId,
  }: {
    isMarked: boolean | undefined;
    coachId: string;
  }) => {
    try {
      if (isMarked) {
        await cancelBookmark(coachId);
        coachMutate();
      } else {
        await addBookmark(coachId);
        coachMutate();
      }
    } catch (e) {
      console.error("e:", e);
      showApiToastError(e);
    }
  };

  const coachItemCell = (coach: Coach) => {
    const {
      firstName,
      lastName,
      ranking,
      profilePicture,
      districts,
      isBookMarked,
      id,
    } = coach;
    const yearsAsCoach = new Date().getFullYear() - coach.startYearAsCoach;
    const coachExperience = yearsAsCoach.toString();

    const badgeItem = (label: string) => {
      return (
        <Badge
          key={`badge_${label}_coach_${coach.id}`}
          borderColor="#31095E"
          variant="outline"
          bg="rs.white"
          _text={{ color: "#31095E", fontSize: 14 }}
          m={1}
          p="1"
          px="2"
          minW="10"
          borderRadius="full"
        >
          {label}
        </Badge>
      );
    };

    return (
      <HStack alignItems="center" space="2" py="4">
        <Avatar
          size="md"
          source={
            profilePicture ? { uri: formatFileUrl(profilePicture) } : undefined
          }
        >
          {firstName}
        </Avatar>

        <VStack flex="1">
          <Text fontSize={16} fontWeight={700}>
            {getUserName(coach)}
          </Text>
          <Text>{`${t("Coached for")} ${coachExperience} ${t("years")}`}</Text>
          <HStack>
            {[
              coach.coachLevel ? t(coach.coachLevel) : "-",
              coach.ranking ? `${t("Rank")} ${coach.ranking}` : "-",
              coach.style ? t(coach.style) : "-",
            ]
              .filter((label) => label !== "-")
              .map((label) => {
                return badgeItem(label);
              })}
          </HStack>
        </VStack>
        <Pressable
          disabled={!coachError && coachIsValidating}
          mr="0.5"
          _pressed={{ opacity: 0.5 }}
          onPress={async () => {
            setTappedCoachId(coach.id);
            await onBookmark({ isMarked: isBookMarked, coachId: id });
            setTappedCoachId(null);
          }}
        >
          {isBookMarked ? <SelectedFlagIconV2 /> : <FlagIconV2 />}
        </Pressable>
      </HStack>
    );
  };

  const generateNewRecommendCoach = () => {
    cachedCoachIds = allCoaches
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((coach) => coach.id);
    coachMutate();
  };

  const recommendationView = () => {
    return (
      <VStack space="3" px="2">
        <HStack alignItems="center" justifyContent="space-between">
          <Heading>{t("Recommended Coaches")}</Heading>
          <Pressable
            _pressed={{ opacity: 0.5 }}
            onPress={() => {
              generateNewRecommendCoach();
            }}
          >
            <RefreshIconV2 size="lg" />
          </Pressable>
        </HStack>

        {recommendCoaches.length > 0 &&
          recommendCoaches
            .sort((a, b) => {
              if (a.id > b.id) return 1;
              if (b.id > a.id) return -1;
              return 0;
            })
            .map((coachApplied) => {
              return (
                <Pressable
                  key={`suggested_coach_${coachApplied.id}`}
                  onPress={() => {
                    navigation.navigate("UserProfileViewer", {
                      user: {
                        ...coachApplied,
                        userType: UserType.Coach,
                      },
                      isFavouriteCoach: coachApplied.isBookMarked,
                    });
                  }}
                >
                  <VStack space="2">
                    {coachItemCell(coachApplied)}
                    <Divider />
                  </VStack>
                </Pressable>
              );
            })}
      </VStack>
    );
  };

  const favouriteView = () => {
    if (favouritesCoaches?.length === 0) {
      return (
        <VStack
          flex="1"
          h="100%"
          mt="10"
          px="2"
          space={1}
          justifyContent="center"
          alignItems="center"
        >
          <RoundedRedCrossIcon fillColor="#E08700" />
          <Text fontSize="md" mt="2" fontWeight="bold">
            {t("No favourite coach yet")}
          </Text>
          <Text fontSize="md">
            {t("You can bookmark your favourite coaches")}
          </Text>
        </VStack>
      );
    }
    return (
      <VStack space="3" px="2">
        {favouritesCoaches &&
          favouritesCoaches.length > 0 &&
          favouritesCoaches.map((coachApplied) => {
            return (
              <Pressable
                key={`favorite_coach_${coachApplied.id}`}
                onPress={() => {
                  navigation.navigate("UserProfileViewer", {
                    user: {
                      ...coachApplied,
                      userType: UserType.Coach,
                    },
                    isFavouriteCoach: coachApplied.isBookMarked,
                  });
                }}
              >
                <VStack space="2">
                  {coachItemCell(coachApplied)}
                  <Divider />
                </VStack>
              </Pressable>
            );
          })}
      </VStack>
    );
  };

  const o3RequestView = () => {
    if (o3Request) {
      const price =
        o3Request.minTuitionFee !== 0 && o3Request.maxTuitionFee !== 0
          ? `${o3Request.minTuitionFee} - ${o3Request.maxTuitionFee} ${t(
              "hkd/hr"
            )}`
          : `${o3Request.proposedFee} ${t("hkd/hr")}`;
      return (
        <VStack>
          {isO3BoardCastIncluded &&
            pendingRequestBanner(t("Pending Direct Request"))}
          <Box flex={1} bg="rs.grey" pb="4">
            <FindCoachTipCard containerProps={{ p: "4" }} />
            <VStack space={4} mx="defaultLayoutSpacing">
              {o3Request?.venue && (
                <HStack flex="1" alignItems="flex-start" space="2">
                  <LocationIcon mt={1} />
                  <Text>{o3Request?.venue}</Text>
                </HStack>
              )}
              {!o3Request?.venue && (
                <HStack flex="1" alignItems="center" space="2">
                  <QuestionIcon />
                  <Text>{t("Venue is missing")}</Text>
                </HStack>
              )}
              <HStack flex="1" alignItems="center" space="2">
                <MoneyIcon />
                <Text>{price}</Text>
              </HStack>
              <HStack alignItems="center" space="2">
                <CalendarIcon />
                <Text>{formatUtcToLocalDate(o3Request.fromTime)}</Text>
                <HStack flex="1" alignItems="center" space="2">
                  <ClockIcon />
                  <Text>
                    {formatUtcToLocalTime(o3Request.fromTime)} -{" "}
                    {formatUtcToLocalTime(o3Request.endTime)}
                  </Text>
                </HStack>
              </HStack>

              {o3Request.status === O3MeetupStatus.Matched && (
                <Box mt={4}>
                  <CoachShortProfile
                    heading="Matched Coach"
                    coach={
                      o3Request.appliedCoachs.find(
                        (ac) => ac.coachId === o3Request.pickedCoachId
                      )?.coachInfo
                    }
                  />
                </Box>
              )}

              <Box w="full" alignSelf="center">
                <Button
                  bg="#31095E"
                  color="rs.white"
                  size="sm"
                  onPress={() => {
                    setIsOpenCloseModal(true);
                  }}
                >
                  {t("Cancel")}
                </Button>
              </Box>
            </VStack>
          </Box>

          {o3Request?.status === O3MeetupStatus.Pending && (
            <Heading mx="defaultLayoutSpacing" mt={4}>
              {t("Applied coach")}
            </Heading>
          )}

          {o3Request?.status === O3MeetupStatus.Pending && (
            <VStack space="4" mx="defaultLayoutSpacing">
              {showPlaceholder && (
                <VStack alignItems="center" mt="4">
                  <RoundedRedCrossIcon mt="4" />
                  <Text fontSize="md" fontWeight="bold">
                    {t("No coach applied yet")}
                  </Text>
                  <Text fontSize="md">{t("Please wait for a moment")}</Text>
                </VStack>
              )}

              {o3Array.length > 0 &&
                o3Array.map((appliedCoach) => (
                  <AppliedCoachCard
                    isNotInterested={appliedCoach.isNotInterested}
                    key={appliedCoach.oneOnOneCoachId}
                    fromTime={o3Request.fromTime}
                    toTime={o3Request.endTime}
                    coach={appliedCoach.coachInfo}
                    fee={appliedCoach.fee}
                    isShowLocation={!o3Request.venue}
                    location={appliedCoach.venue}
                    onConfirmButtonPress={() =>
                      navigation.navigate("PlayerO3AppliedCoachDetails", {
                        o3: o3Request,
                        appliedCoach,
                        isForceBackToPlayerMeetupList: false,
                      })
                    }
                    onDetailsButtonPress={() =>
                      navigation.navigate("PlayerO3AppliedCoachDetails", {
                        o3: o3Request,
                        appliedCoach,
                        isForceBackToPlayerMeetupList: false,
                      })
                    }
                  />
                ))}
            </VStack>
          )}
          <ConfirmationModal
            isOpen={isOpenCloseModal}
            alertType="Fail"
            title={t("Are you sure to cancel the meetup")}
            confirmText={t("Yes")}
            cancelText={t("No")}
            isLoading={isCanceling}
            onConfirm={() => {
              if (o3Request) {
                cancelMeetCoachO3Request({ id: o3Request.id }).finally(() => {
                  setIsOpenCloseModal(false);
                  setIsCanceling(false);
                  mutate();
                });
              }
            }}
            onCancel={() => setIsOpenCloseModal(false)}
          />
        </VStack>
      );
    }
  };

  const pendingRequestBanner = (label: string) => {
    return (
      <HStack
        my="4"
        alignItems="center"
        justifyContent="space-between"
        px="4"
        py="2"
        bg="#66CEE133"
      >
        <Heading fontSize="md">{label}</Heading>
        <Pressable
          onPress={() => {
            navigation.navigate("PlayerPendingRequests");
          }}
        >
          <Text fontSize="md" color="#31095E">
            {t("View Status")}
          </Text>
        </Pressable>
      </HStack>
    );
  };

  const nonO3RequestView = () => {
    return (
      <>
        {shouldShowPendingRequest &&
          pendingRequestBanner(t("Pending Requests"))}
        {searchBanner()}

        <VStack space="4" mx="2">
          {tabSelectors()}
          {activeTabIndex === 0 && recommendationView()}
          {activeTabIndex === 1 && favouriteView()}
        </VStack>
      </>
    );
  };

  if (isValidating) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      headerProps={{
        title: t("Meet coach"),
        hasBackButton: false,
        rightComponent: (
          <Pressable
            onPress={() => {
              navigation.navigate("PlayerMeetupRecords");
            }}
          >
            <ClockArrowIcon size="2xl" />
          </Pressable>
        ),
      }}
    >
      {o3Request ? o3RequestView() : nonO3RequestView()}
    </HeaderLayout>
  );
}
