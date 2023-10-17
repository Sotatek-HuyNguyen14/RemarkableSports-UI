import { Text, HStack, Badge, Box, VStack } from "native-base";
import React from "react";
import { Pressable, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import SettingIcon from "../../components/Icons/SettingIcon";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { Coach, Player, ClubStaff, UserType } from "../../models/User";
import { useAuth } from "../../hooks/UseAuth";
import CoachProfile from "../../components/Coach/CoachProfile";
import PlayerProfile from "../../components/Player/PlayerProfile";
import ClubStaffProfile from "../../components/ClubStaff/ClubStaffProfile";
import PencilIcon from "../../components/Icons/PencilIcon";
import { PROFILE_EDIT_BUTTON_TEST_ID } from "./constants";

export type ProfileScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ProfileScreen"
>;

const t = getTranslation("screen.ProfileScreen.ProfileScreen");

function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user } = useAuth();

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        hasBackButton: false,
        title: t("Profile"),
        rightComponent: (
          <HStack space="4" alignItems="center">
            {user?.userType !== UserType.ClubStaff && (
              <TouchableOpacity
                testID={PROFILE_EDIT_BUTTON_TEST_ID}
                onPress={() => {
                  if (user?.userType === UserType.Player) {
                    navigation.navigate("PlayerUpdateProfile", {
                      player: user as Player,
                    });
                  } else if (user?.userType === UserType.Coach) {
                    navigation.navigate("CoachUpdateProfile", {
                      coach: user as Coach,
                    });
                  } else {
                    navigation.navigate("ClubUpdateProfile", {
                      clubStaff: user as ClubStaff,
                    });
                  }
                }}
              >
                <PencilIcon size="lg" color="white" alignSelf="center" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SettingsScreen");
              }}
            >
              <SettingIcon size="md" color="white" alignSelf="center" />
            </TouchableOpacity>
          </HStack>
        ),
      }}
      isSticky
    >
      <VStack flex={1}>
        {user?.userType === UserType.Coach && (
          <CoachProfile
            onPressJoinClub={() => {
              navigation.navigate("JoinClubScreen");
            }}
            coach={user as Coach}
            ProfileStyleProps={{ p: "defaultLayoutSpacing" }}
          />
        )}

        {user?.userType === UserType.Player && (
          <PlayerProfile
            onPressJoinClub={() => {
              navigation.navigate("JoinClubScreen");
            }}
            player={user as Player}
            ProfileStyleProps={{ p: "defaultLayoutSpacing" }}
          />
        )}

        {user?.userType === UserType.ClubStaff && (
          <ClubStaffProfile
            onEdit={() => {
              navigation.navigate("ClubUpdateProfile", {
                clubStaff: user as ClubStaff,
              });
            }}
            onEditClub={() => {
              if ((user as ClubStaff).club) {
                navigation.navigate("ClubUpdateClub", {
                  club: (user as ClubStaff).club,
                });
              }
            }}
            onManage={() => {
              if ((user as ClubStaff).club) {
                navigation.navigate("ClubProcess", {
                  club: (user as ClubStaff).club,
                });
              }
            }}
            clubStaff={user as ClubStaff}
            ProfileStyleProps={{ p: "defaultLayoutSpacing" }}
          />
        )}
      </VStack>
    </HeaderLayout>
  );
}

export default ProfileScreen;
