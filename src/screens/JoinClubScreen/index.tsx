import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Box, HStack, Pressable, Text, Toast, VStack } from "native-base";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";

import { useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import { ClubResponse } from "../../models/responses/Club";
import {
  getAllClubs,
  clubStaffJoinClub,
  coachJoinClub,
  playerJoinClub,
} from "../../services/ClubServices";
import { getTranslation } from "../../utils/translation";
import { formatCoreUrl } from "../../services/ServiceUtil";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import Loading from "../../components/Loading";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { MainStackNavigatorParamList } from "../../routers/Types";
import ClubDetails from "../../components/Club/ClubDetails";
import { ClubStatusType } from "../../models/requests/Club";
import { useAuth } from "../../hooks/UseAuth";
import { ClubStaff, Coach, Player, UserType } from "../../models/User";
import { showApiToastError } from "../../components/ApiToastError";
import FormInput from "../../components/FormInput/FormInput";
import MagnifyingGlassIcon from "../../components/Icons/MagnifyingGlassIcon";
import { isBlank } from "../../utils/strings";
import RoundedRedCrossIcon from "../../components/Icons/RoundedRedCrossIcon";

type CourseListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "JoinClubScreen"
>;

const JOIN_SUCCESSFUL_TOAST = "joinSuccessful";

const t = getTranslation(["screen.JoinClubScreen", "constant.button"]);

interface FormValue {
  search: string;
}

export default function JoinClubScreen({ navigation }: CourseListProps) {
  const {
    data: clubList,
    error: clubError,
    isValidating: clubIsValidating,
    mutate: clubMutate,
  } = useSWR<ClubResponse[]>(formatCoreUrl("/club"), getAllClubs);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [selectedClub, setSelectedClub] = React.useState<number | string>();
  const { user, updateUserInfo } = useAuth();
  const { control, watch } = useForm<FormValue>({
    defaultValues: {
      search: "",
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  useFocusEffect(
    React.useCallback(() => {
      clubMutate();
    }, [clubMutate])
  );

  const onConfirm = (item: ClubResponse) => {
    setSelectedClub(item.id);
    setModalOpen(true);
  };

  const requestJoinClub = async () => {
    try {
      if (selectedClub?.toString()) {
        if (user?.userType === UserType.ClubStaff) {
          await clubStaffJoinClub(selectedClub);
        }
        if (user?.userType === UserType.Coach) {
          await coachJoinClub(selectedClub);
        }
        if (user?.userType === UserType.Player) {
          await playerJoinClub(selectedClub);
        }

        if (!Toast.isActive(JOIN_SUCCESSFUL_TOAST)) {
          Toast.show({
            id: JOIN_SUCCESSFUL_TOAST,
            duration: 2000,
            placement: "top",
            render: () => {
              return (
                <MessageToast
                  type={MesssageToastType.Success}
                  title={t("Join")}
                  body={t("Successful application")}
                />
              );
            },
          });
        }
        clubMutate();
        await updateUserInfo();
        if (user?.userType === UserType.ClubStaff) {
          navigation.navigate("ClubNavigator");
        }
        if (user?.userType === UserType.Coach) {
          navigation.goBack();
        }
      }
    } catch (error: any) {
      console.log("error", error);
      showApiToastError(error);
    }
  };
  const result = clubList?.filter(
    (val) => val.approvalStatus === ClubStatusType.Approved
  );

  const joinView = (item: ClubResponse) => {
    return (
      <HStack space={3}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            onConfirm(item);
          }}
        >
          <Box
            bg="rs.primary_purple"
            style={{ height: 56 }}
            flex={1}
            borderRadius={16}
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontSize="lg"
              textAlign="center"
              color="rs.white"
              fontWeight="bold"
            >
              {t("Join")}
            </Text>
          </Box>
        </Pressable>
      </HStack>
    );
  };

  const footerView = (item: ClubResponse) => {
    if (user?.userType === UserType.Coach) {
      const localUser = user as Coach;
      if (localUser.clubCoaches?.length) {
        const myClubs = localUser.clubCoaches.filter(
          (val) =>
            val.approvalStatus === ClubStatusType.Approved ||
            val.approvalStatus === ClubStatusType.Pending
        );
        const resultClub = myClubs.find((club) => club.clubId === item.id);
        if (resultClub?.clubId) {
          return undefined;
        }
        return joinView(item);
      }
    }

    if (user?.userType === UserType.Player) {
      const localUser = user as Player;
      if (localUser.clubPlayers?.length) {
        const myClubs = localUser.clubPlayers.filter(
          (val) =>
            val.approvalStatus === ClubStatusType.Approved ||
            val.approvalStatus === ClubStatusType.Pending
        );
        const resultClub = myClubs.find((club) => club.clubId === item.id);
        if (resultClub?.clubId) {
          return undefined;
        }
        return joinView(item);
      }
    }

    if (user?.userType === UserType.ClubStaff) {
      const localUser = user as ClubStaff;
      if (
        localUser.club?.id &&
        (localUser.applyClubStatus === ClubStatusType.Approved ||
          localUser.applyClubStatus === ClubStatusType.Pending) &&
        localUser.club?.id === item.id
      ) {
        return undefined;
      }
      return joinView(item);
    }
    return joinView(item);
  };

  const searchBar = () => {
    return (
      <HStack alignItems="center">
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
                  setSearchQuery(searchText);
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
      </HStack>
    );
  };
  const searchText = watch("search");
  useEffect(() => {
    const subscribe = Keyboard.addListener("keyboardDidHide", (keyEvent) => {
      //  keyboard Did Hide to search
      setSearchQuery(searchText);
    });
    return () => subscribe?.remove();
  }, [searchText]);
  const clubResults = result
    ? result.filter((club) => {
        if (isBlank(searchQuery)) {
          return true;
        }

        return club.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];
  return (
    <HeaderLayout
      headerProps={{
        title: t("Club List"),
      }}
    >
      <VStack space="4" mb="5" mx="4" flex="1">
        {searchBar()}
        {clubIsValidating && <Loading />}
        {!clubIsValidating &&
          !clubError &&
          Array.isArray(clubResults) &&
          clubResults.length === 0 && (
            <VStack
              flex="1"
              justifyContent="center"
              alignItems="center"
              space="3"
            >
              <RoundedRedCrossIcon />
              <Text fontWeight="bold" fontSize="md">
                {t("No result found")}
              </Text>
              <Text textAlign="center">
                {t("We cannot find any club matching your search yet")}
              </Text>
            </VStack>
          )}
        {!clubIsValidating &&
          !clubError &&
          Array.isArray(result) &&
          clubResults.length > 0 &&
          clubResults.map((item) => {
            return (
              <Pressable
                key={`${item.name}${item.district}${item.address}`}
                onPress={() => {
                  navigation.navigate("AdminClubApproval", {
                    clubResponse: item,
                  });
                }}
              >
                <ClubDetails club={item} footer={footerView(item)} />
              </Pressable>
            );
          })}
      </VStack>
      <ConfirmationModal
        alertType="Success"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={isModalOpen}
        onCancel={() => {
          setModalOpen(false);
        }}
        title={t("Are you sure to join this club?")}
        onConfirm={async () => {
          setModalOpen(false);
          await requestJoinClub();
        }}
      />
    </HeaderLayout>
  );
}
