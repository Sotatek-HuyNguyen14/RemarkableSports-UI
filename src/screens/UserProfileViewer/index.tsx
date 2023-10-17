import {
  Box,
  Button,
  HStack,
  Pressable,
  Spinner,
  Text,
  VStack,
} from "native-base";
import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import PlayerProfile from "../../components/Player/PlayerProfile";
import CoachProfile from "../../components/Coach/CoachProfile";
import { ClubStaff, Coach, Player, UserType } from "../../models/User";
import ClubStaffProfile from "../../components/ClubStaff/ClubStaffProfile";
import FlagIcon from "../../components/Icons/FlagIcon";
import {
  FilledFlagIconV2,
  FlagIconV2,
} from "../../components/Icons/FlagIconV2";
import PaperPlaneIcon from "../../components/Icons/PaperPlaneIcon";
import {
  addBookmark,
  cancelBookmark,
  getCoachList,
} from "../../services/O3Services";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { showApiToastError } from "../../components/ApiToastError";
import { useAuth } from "../../hooks/UseAuth";
import ClubStaffProfileViewer from "../../components/ClubStaff/ClubStaffProfileViewer";

export type UserProfileViewerScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "UserProfileViewer"
>;

const t = getTranslation("screen.UserProfileViewerScreen");

export default function UserProfileViewer({
  route,
  navigation,
}: UserProfileViewerScreenProps) {
  const { user: storeUer } = useAuth();

  const { user, shouldShowEditButtonForStaff } = route.params;
  const userType = user?.userType;
  const userId = user.id;
  const isStaffEditable = shouldShowEditButtonForStaff;

  const [localUser, setLocalUser] = useState(user);

  const [isRefresh, setRefresh] = useState({
    isLoading: false,
    isError: false,
  });

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
        setRefresh({ isLoading: true, isError: false });
        const allCoachs = await getCoachList();
        setRefresh({ isLoading: false, isError: false });
        if (allCoachs.length > 0) {
          const myData = allCoachs.find((val) => val.id === localUser.id);
          if (myData) setLocalUser(myData);
        }
      } else {
        await addBookmark(coachId);
        setRefresh({ isLoading: true, isError: false });
        const allCoachs = await getCoachList();
        setRefresh({ isLoading: false, isError: false });
        if (allCoachs.length > 0) {
          const myData = allCoachs.find((val) => val.id === localUser.id);
          if (myData) setLocalUser(myData);
        }
      }
    } catch (e) {
      console.error("e:", e);
      setRefresh({ isLoading: false, isError: true });
      showApiToastError(e);
    }
  };

  return (
    <HeaderLayout
      headerProps={{
        title: userType === UserType.Coach ? t("Coach Profile") : t("Profile"),
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      {/* {isRefresh.isLoading && <Loading />} */}
      {!isRefresh.isLoading && isRefresh.isError && <ErrorMessage />}

      {!isRefresh.isError && (
        <Box>
          {userType === UserType.Player && (
            <PlayerProfile player={localUser as Player} isOther />
          )}
          {userType === UserType.Coach && localUser && (
            <VStack space="4" margin={4}>
              {userId !== storeUer?.id &&
                storeUer?.userType === UserType.Player && (
                  <VStack space="4" mx="3">
                    {!localUser.isBookMarked ? (
                      <Pressable
                        _pressed={{ opacity: 0.5 }}
                        disabled={isRefresh.isLoading}
                        onPress={() => {
                          onBookmark({
                            isMarked: localUser?.isBookMarked,
                            coachId: localUser.id,
                          });
                        }}
                      >
                        <HStack
                          justifyContent="center"
                          alignItems="center"
                          p="4"
                          borderWidth="1"
                          borderColor="rs.primary_purple"
                          space="2"
                          borderRadius="sm"
                        >
                          <FlagIconV2 />
                          <Text
                            color="rs.primary_purple"
                            fontSize="md"
                            fontWeight="bold"
                          >
                            {t("Save as Favourite")}
                          </Text>
                        </HStack>
                      </Pressable>
                    ) : (
                      <Pressable
                        _pressed={{ opacity: 0.5 }}
                        disabled={isRefresh.isLoading}
                        onPress={() => {
                          onBookmark({
                            isMarked: localUser?.isBookMarked,
                            coachId: localUser.id,
                          });
                        }}
                      >
                        <HStack
                          justifyContent="center"
                          alignItems="center"
                          p="3"
                          borderWidth="1"
                          borderColor="rs.primary_purple"
                          space="2"
                          borderRadius="sm"
                          bg="rs.primary_purple"
                          mb="2"
                        >
                          <FilledFlagIconV2 />
                          <Text
                            color="rs.white"
                            fontSize="md"
                            fontWeight="bold"
                          >
                            {t("Remove from Favourite")}
                          </Text>
                        </HStack>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => {
                        navigation.navigate("PlayerO3SubmitRequest", {
                          selectedCoachId: user.id,
                          isSubmitO3RequestWithSelectedCoach: true,
                        });
                      }}
                    >
                      <HStack
                        justifyContent="center"
                        alignItems="center"
                        p="3"
                        borderWidth="1"
                        borderColor="rs.primary_purple"
                        space="2"
                        borderRadius="sm"
                        bg="rs.primary_purple"
                        mb="2"
                      >
                        <PaperPlaneIcon />
                        <Text color="rs.white" fontSize="md" fontWeight="bold">
                          {t("Send Request")}
                        </Text>
                      </HStack>
                    </Pressable>
                  </VStack>
                )}
              <CoachProfile
                isHorizontalAvatarAndName
                isOther
                coach={localUser as Coach}
              />
            </VStack>
          )}
          {userType === UserType.ClubStaff && localUser && (
            <ClubStaffProfileViewer clubStaff={localUser as ClubStaff} />
          )}
        </Box>
      )}
    </HeaderLayout>
  );
}
