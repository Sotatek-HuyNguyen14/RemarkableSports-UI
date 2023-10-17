import { VStack, Pressable, useTheme, Text, HStack, Circle } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import EventCard from "../../components/Card/EventCard";
import { useAuth } from "../../hooks/UseAuth";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getEvents } from "../../services/JoinEventServices";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import FormInput from "../../components/FormInput/FormInput";
import MagnifyingGlassIcon from "../../components/Icons/MagnifyingGlassIcon";
import { EventFilteringForm } from "../EventFiltering";
import { FilterBadgeProps } from "../../components/Badge/FilterBadge";
import FilterBadge from "../../components/FilterList";
import { isEventFinished } from "../../services/EventServices";
import FilterIconV2 from "../../components/Icons/FilterIconV2";
import FlashListLayout from "../../components/Layout/FlashListLayout";
import NoDataComponent from "../../components/NoDataComponent";
import CrossIcon from "../../components/Icons/RoundedCrossIcon";
import { isBlank } from "../../utils/strings";

export type AllEventProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "AllEvent"
>;

const t = getTranslation(["screen.AllEvent", "formInput"]);

function processFilteringForm(
  filterValue: EventFilteringForm | null | undefined,
  navigation: AllEventProps["navigation"]
) {
  if (!filterValue) {
    return [];
  }
  const filterList = [];

  if (filterValue?.districtText) {
    filterList.push({
      label: filterValue?.districtText ?? t("District"),
      isActive: !!filterValue?.districtText,
      onPress: () => navigation.navigate("EventFiltering", { filterValue }),
    });
  }

  if (filterValue?.after) {
    filterList.push({
      label: `${t("After")} ${filterValue?.after}` ?? t("After"),
      isActive: !!filterValue?.after,
      onPress: () => navigation.navigate("EventFiltering", { filterValue }),
    });
  }
  if (filterValue?.before) {
    filterList.push({
      label: `${t("Before")} ${filterValue?.before}` ?? t("Before"),
      isActive: !!filterValue?.before,
      onPress: () => navigation.navigate("EventFiltering", { filterValue }),
    });
  }

  if (filterValue?.type) {
    filterList.push({
      label: filterValue?.typeText ?? t("Type"),
      isActive: !!filterValue?.type,
      onPress: () => navigation.navigate("EventFiltering", { filterValue }),
    });
  }

  return filterList.sort(
    (x, y) => Number(y.isActive) - Number(x.isActive)
  ) as FilterBadgeProps[];
}

interface FormValue {
  search: string;
}

function AllEvent({ navigation, route }: AllEventProps) {
  const initeValue = {
    area: undefined,
    areaText: undefined,
    district: undefined,
    districtText: undefined,
    after: undefined,
    before: undefined,
    type: undefined,
  };
  const { user } = useAuth();
  const { space } = useTheme();
  let [filterValue] = useState<EventFilteringForm | null | undefined>(
    initeValue
  );
  let filterText: string | undefined = "";
  if (route.params) ({ filterValue, filterText } = route.params);
  const {
    data: eventList,
    isValidating: eventIsValidating,
    error: eventError,
    mutate: eventListMutate,
  } = useSWR([formatCoreUrl("/event"), filterValue], ([path, param]) =>
    getEvents(param)
  );

  const { control, watch } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      search: !isBlank(filterText) ? filterText : undefined,
    },
  });
  const [searchWords, setSearchWords] = useState(
    !isBlank(filterText) ? filterText : ""
  );
  const searchQuery = watch("search");
  useEffect(() => {
    const subscribe = Keyboard.addListener("keyboardDidHide", (keyEvent) => {
      //  keyboard Did Hide to search
      setSearchWords(searchQuery);
      eventListMutate();
    });
    return () => subscribe?.remove();
  }, [searchQuery, eventListMutate]);
  const filteredBadgeOptions = useRef<FilterBadgeProps[]>(
    processFilteringForm(filterValue, navigation)
  );
  const [badgeOptions, setBadgeOptions] = useState<FilterBadgeProps[]>(
    filteredBadgeOptions.current
  );

  // refresh the list when focus
  // useFocusEffect(
  //   React.useCallback(() => {
  //     eventListMutate();
  //   }, [eventListMutate])
  // );

  useEffect(() => {
    if (route.params) {
      eventListMutate();
      setBadgeOptions(
        processFilteringForm(route.params.filterValue, navigation)
      );
    }
  }, [eventListMutate, navigation, route.params]);

  useEffect(() => {
    setBadgeOptions(processFilteringForm(filterValue, navigation));
  }, [filterValue, navigation]);

  const recommendedList = eventList
    ?.filter((val) => val.creator.id !== user?.sub && !isEventFinished(val))
    .filter((event) => {
      if (searchWords && !isBlank(searchWords)) {
        return event.name.toLowerCase().includes(searchWords.toLowerCase());
      }
      return true;
    });

  const filterBar = () => {
    return (
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
            navigation.navigate("EventFiltering", { filterValue });
          }}
        >
          <FilterIconV2 />
        </Pressable>
      </HStack>
    );
  };

  const headerComponent = (
    <VStack space="4" p="4">
      {filterBar()}
      <FilterBadge options={badgeOptions} />
    </VStack>
  );
  const emptyComponent = (
    <NoDataComponent
      logoIcon={
        <Circle
          size={12}
          alignItems="center"
          justifyContent="center"
          bg="rgba(233,16,16,0.15)"
        >
          <CrossIcon />
        </Circle>
      }
      title={t("No Event available")}
      content={t("Please search again")}
    />
  );

  if (eventIsValidating) {
    return <Loading />;
  }

  return (
    <FlashListLayout
      headerProps={{
        title: t("All event"),
        hasBackButton: true,
        headerLabelStyle: { fontSize: 16 },
        containerStyle: {
          alignItems: "center",
          marginLeft: 0,
          marginRight: space.defaultLayoutSpacing,
        },
      }}
      isSticky
      supportPullToRefresh
      onRefresh={() => {
        eventListMutate();
      }}
      flashListProps={{
        data: recommendedList,
        renderItem: ({ item }) => (
          <VStack space="4" p="4">
            <EventCard
              onPress={() => {
                navigation.navigate("PlayerEventDetails", {
                  event: item,
                });
              }}
              event={item}
              onManage={() => {
                navigation.navigate("ManageEvent", {
                  eventId: item.id,
                });
              }}
            />
          </VStack>
        ),
        keyExtractor: (item) => `${item.id}_${item.name}`,
        ListHeaderComponent: headerComponent,
        ListEmptyComponent: emptyComponent,
      }}
    />
  );
}

export default AllEvent;
