import {
  CompositeNavigationProp,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Heading,
  HStack,
  Pressable,
  Spinner,
  VStack,
  Text,
  Input,
} from "native-base";
import React, { useCallback, useState } from "react";
import useSWRImmutable from "swr/immutable";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { Venue } from "../../../models/requests/Venue";
import {
  ClubBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
} from "../../../routers/Types";
import { getVenuesByParams } from "../../../services/VenueServices";
import { getTranslation } from "../../../utils/translation";
import VenueItemList from "../../../components/VenueList";
import { showApiToastError } from "../../../components/ApiToastError";
import BannerButton from "../../../components/BannerButton";
import MagnifyingGlassIcon from "../../../components/Icons/MagnifyingGlassIcon";
import FilterIconV2 from "../../../components/Icons/FilterIconV2";
import CrossIcon from "../../../components/Icons/RoundedCrossIcon";

const t = getTranslation(["screen.ClubScreens.VenueList", "constant.button"]);

export type VenueListNavigationProps = CompositeNavigationProp<
  NativeStackNavigationProp<ClubBottomTabNavigatorParamList, "ClubVenueList">,
  NativeStackNavigationProp<MainStackNavigatorParamList>
>;

export type VenueRouteProp = RouteProp<
  ClubBottomTabNavigatorParamList,
  "ClubVenueList"
>;

interface VenueListScreenNavigationProps {
  navigation: VenueListNavigationProps;
  route: VenueRouteProp;
}

export default function VenueList({
  navigation,
}: VenueListScreenNavigationProps) {
  const [searchString, setSearchString] = useState("");
  const [deleteVenueId, setDeleteVenueId] = React.useState<number>();
  const [isModalOpen, setModalOpen] = React.useState(false);

  const {
    data: venues,
    isValidating,
    mutate,
  } = useSWRImmutable<Venue[]>("/venue", (url) =>
    getVenuesByParams(url, { arg: { name: searchString } })
  );

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  const renderVenueBookingRequests = () => {
    if (isValidating) return <Spinner />;

    return venues && venues.length !== 0 ? (
      VenueItemList({
        venues,
        onPressVenue: (venue: Venue) => {
          // See venue details
          navigation.navigate("ClubVenueDetails", { venue });
        },
        onPressManage: (venue: Venue) => {
          navigation.navigate("ManageVenue", { venue });
        },
        onPressDelete: async (venue: Venue) => {
          // Delete venue booking
          setDeleteVenueId(venue.id);
          setModalOpen(true);
        },
        onPressEdit: (venue: Venue) => {
          // Update venue booking
          navigation.navigate("ClubUpdateVenue", {
            venue,
          });
        },
      })
    ) : (
      <VStack flex={1} space={4} justifyContent="center" alignItems="center">
        <CrossIcon />
        <Heading size="sm">No result found</Heading>
        <Text textAlign="center">
          We cannot find any venue matching your search yet
        </Text>
      </VStack>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Venue list"),
        hasBackButton: false,
      }}
      supportPullToRefresh
      onRefresh={() => {
        mutate();
      }}
    >
      <VStack space="4" flex={1}>
        <BannerButton
          headerLabel={t("Create Venue")}
          description={t("Tap here to create a new venue")}
          onPress={() => {
            navigation.navigate("ClubAddVenue");
          }}
        />
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
                onPress={() => {
                  mutate();
                }}
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
        <VStack space="4" mx="4" flex={1} justifyContent="center">
          {renderVenueBookingRequests()}
        </VStack>
      </VStack>

      {/* <ConfirmationModal
        alertType="Fail"
        confirmText={t("Yes, delete")}
        cancelText={t("Cancel")}
        isOpen={isModalOpen}
        onCancel={() => {
          setModalOpen(false);
        }}
        title={t("Are you sure to delete this venue you created?")}
        description={t(
          "Once the venue delete participants are not longer to reach this venue"
        )}
        onConfirm={async () => {
          setModalOpen(false);
          if (deleteVenueId) {
            try {
              await deleteVenue(deleteVenueId);
              if (!Toast.isActive("deleteSuccess"))
                Toast.show({
                  id: "deleteSuccess",
                  duration: 2000,
                  render: () => {
                    return (
                      <MessageToast
                        type={MesssageToastType.Success}
                        title={t("Your venue is deleted")}
                      />
                    );
                  },
                });
              mutateVenueBookings();
            } catch (error) {
              showApiToastError(error);
            }
          }
        }}
      /> */}
    </HeaderLayout>
  );
}
