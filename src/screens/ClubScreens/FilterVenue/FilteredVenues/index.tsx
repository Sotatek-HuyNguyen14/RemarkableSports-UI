import React, { useState } from "react";
import { HStack, Heading, Input, Pressable, VStack, Text } from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import HeaderLayout from "../../../../components/Layout/HeaderLayout";
import MagnifyingGlassIcon from "../../../../components/Icons/MagnifyingGlassIcon";
import FilterIconV2 from "../../../../components/Icons/FilterIconV2";
import { MainStackNavigatorParamList } from "../../../../routers/Types";
import CrossIcon from "../../../../components/Icons/RoundedCrossIcon";
import VenueItemList from "../../../../components/VenueList";

type FilteredVenuesScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "FilteredVenues"
>;

export default function FilteredVenues({
  route,
  navigation,
}: FilteredVenuesScreenProps) {
  const { venues } = route.params;
  const [searchString, setSearchString] = useState("");
  const [displayedVenues, setDisplayedVenues] = useState(venues);

  const filterVenuesByName = (name: string) => {
    const filteredVenues = venues.filter((venue) =>
      venue.name.toLowerCase().includes(name.toLowerCase())
    );
    setDisplayedVenues(filteredVenues);
  };

  return (
    <HeaderLayout isSticky headerProps={{ title: "Venue List" }}>
      <VStack mx="defaultLayoutSpacing" space={4}>
        <HStack width="95%" alignSelf="center" space={2}>
          <Input
            value={searchString}
            onChangeText={(text) => setSearchString(text)}
            flex={1}
            placeholder="Search venue name"
            borderRadius={16}
            bgColor="rs.lightGrey"
            borderColor="rs.white"
            _focus={{ borderColor: "rs.white" }}
            InputRightElement={
              <Pressable
                mr={4}
                onPress={() => filterVenuesByName(searchString)}
              >
                <MagnifyingGlassIcon />
              </Pressable>
            }
          />
          <Pressable
            p={4}
            borderRadius={16}
            bgColor="rs.lightGrey"
            onPress={() => {
              navigation.navigate("VenueFilteringPage");
            }}
          >
            <FilterIconV2 />
          </Pressable>
        </HStack>
        {displayedVenues.length !== 0 ? (
          VenueItemList({ venues: displayedVenues })
        ) : (
          <VStack
            flex={1}
            space={4}
            justifyContent="center"
            alignItems="center"
          >
            <CrossIcon />
            <Heading size="sm">No result found</Heading>
            <Text textAlign="center">
              We cannot find any venue matching your search yet
            </Text>
          </VStack>
        )}
      </VStack>
    </HeaderLayout>
  );
}
