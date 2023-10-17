import React from "react";
import { Avatar, Heading, HStack, Pressable, Text, VStack } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Player, UserType } from "../../models/User";
import { formatFileUrl } from "../../services/ServiceUtil";
import { formatName, getUserName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../constants/constants";

const t = getTranslation([
  "component.ApplicantListItem",
  "constant.profile",
  "constant.button",
]);

export interface ApplicantListItemProps {
  player: Player;
  onApprove?: () => void;
  onReject?: () => void;
  status?: "pending" | "approved" | "rejected";
}

export default function ApplicantListItem({
  player,
  onApprove,
  onReject,
  status,
}: ApplicantListItemProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();

  return (
    <HStack
      space="2"
      py="defaultLayoutSpacing"
      borderTopColor="rs.lightGrey"
      borderTopWidth={1}
    >
      <Avatar
        size="sm"
        source={
          player.profilePicture
            ? {
                uri: formatFileUrl(player.profilePicture),
              }
            : undefined
        }
      >
        {`${player.firstName.charAt(0)}${player.lastName.charAt(0)}`}
      </Avatar>
      <HStack flex={1}>
        <VStack flex={1.77} space={2} mr="0.5">
          <Heading fontWeight={500}>{getUserName(player)}</Heading>
          <VStack>
            <Text color="rs_secondary.grey">
              {new Date().getFullYear() - player.startYearAsPlayer}{" "}
              {t("yrs exp")} . {t(player.handUsed)} . {t("Rank")}{" "}
              {player.ranking}
            </Text>
            <Text color="rs_secondary.grey">
              {t(player.rubber)} . {t(player.backRubber)}
            </Text>
          </VStack>
          <Pressable
            onPress={() => {
              navigation.navigate("UserProfileViewer", {
                user: {
                  ...player,
                  userType: UserType.Player,
                },
              });
            }}
          >
            <Text color="rs.primary_purple">
              {t("Player details")}
              {">"}
            </Text>
          </Pressable>
        </VStack>
        {/* waiting status code */}
        {status === "pending" && (
          <VStack space={2} flex={1}>
            <Pressable
              h="9"
              w="108"
              bg={APPROVE_BUTTON_COLOR}
              borderRadius="2xl"
              justifyContent="center"
              alignItems="center"
              onPress={() => onApprove?.()}
            >
              <Text fontWeight={600} color="rs.white">
                {t("Approve")}
              </Text>
            </Pressable>
            <Pressable
              h="9"
              w="108"
              borderColor={REJECT_BUTTON_COLOR}
              borderRadius="2xl"
              borderWidth={1}
              justifyContent="center"
              alignItems="center"
              onPress={() => onReject?.()}
            >
              <Text color={REJECT_BUTTON_COLOR} fontWeight={600}>
                {t("Reject")}
              </Text>
            </Pressable>
          </VStack>
        )}
        {status === "approved" && (
          <Text color="rs_secondary.green" fontSize={14}>
            {t("Approved")}
          </Text>
        )}
        {status === "rejected" && (
          <Text color="rs_secondary.error" fontSize={14}>
            {t("Rejected")}
          </Text>
        )}
      </HStack>
    </HStack>
  );
}
