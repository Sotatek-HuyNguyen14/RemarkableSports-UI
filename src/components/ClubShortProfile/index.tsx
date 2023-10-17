import React from "react";
import {
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Pressable,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getTranslation } from "../../utils/translation";
import { formatFileUrl } from "../../services/ServiceUtil";
import { ClubStaff, Coach, UserType } from "../../models/User";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatName } from "../../utils/name";
import { ClubResponse } from "../../models/responses/Club";
import Card from "../Card/Card";
import { createRandomString } from "../../utils/strings";
import RightArrowIcon from "../Icons/RightArrowIcon";

export interface ClubShortProfileProps {
  club: ClubResponse;
  heading?: string;
  editable?: boolean;
  approval?: boolean;
}

const t = getTranslation([
  "component.ClubShortProfile",
  "constant.district",
  "constant.button",
]);

export default function ClubShortProfile({
  club,
  heading,
  editable = false,
  approval = false,
}: ClubShortProfileProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();

  const { profilePicture, name, address, district, relationship } = club;
  const approvedCoaches = club.clubCoaches
    ? club.clubCoaches.filter((coach) => coach.approvalStatus === "Approved")
    : [];

  return (
    <VStack space="4" bg="#66CEE11A" p="2">
      <HStack space="3" alignItems="center">
        <Avatar
          size="sm"
          source={
            profilePicture
              ? {
                  uri: formatFileUrl(profilePicture),
                }
              : undefined
          }
        >
          {name}
        </Avatar>

        <VStack space="2" flex="1">
          <Heading fontSize="lg">{name}</Heading>
          {address && <Text fontSize="md">{`${address}`}</Text>}
          <Text fontSize="md">
            {/* {t("Number of Coach %{number}", { number: approvedCoaches.length })} */}
            {`${approvedCoaches.length ?? 0} ${t("Coaches")}`}
          </Text>
          <HStack space={4}>
            {editable && (
              <Pressable
                onPress={() => {
                  navigation.navigate("ClubUpdateClub", {
                    club,
                  });
                }}
              >
                <Text color="rs.primary_purple" fontWeight="bold">
                  {t("Edit")}
                </Text>
              </Pressable>
            )}
            {approval && (
              <Pressable
                onPress={() => {
                  navigation.navigate("ClubProcess", {
                    club,
                  });
                }}
              >
                <Text color="rs.primary_purple" fontWeight="bold">
                  {t("Process")}
                </Text>
              </Pressable>
            )}
          </HStack>
        </VStack>
        <RightArrowIcon />
      </HStack>
    </VStack>
  );
}
