import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { Text, Pressable, VStack, HStack, Avatar } from "native-base";
import ImageDirectory from "../../assets";
import {
  TeamMember,
  TeamApplicationStatus,
} from "../../models/responses/League";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatFileUrl } from "../../services/ServiceUtil";
import { formatName, getUserName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../constants/constants";

interface TeamManageDetailsCardProps {
  onPressApprove?: () => void;
  onPressReject?: () => void;
  onRemove?: () => void;
  isLoading?: boolean;
  member: TeamMember;
  shouldShowStatus?: boolean;
  isRequest?: boolean;
}

const t = getTranslation([
  "component.TeamManageDetailsCard",
  "constant.button",
]);

function TeamManageDetailsCard({
  onPressApprove,
  onPressReject,
  onRemove,
  member,
  shouldShowStatus = true,
  isRequest = true,
  isLoading,
}: TeamManageDetailsCardProps) {
  const displayName = getUserName(member.memberInfo);
  const profileImage = member?.memberInfo?.profilePicture
    ? formatFileUrl(member?.memberInfo?.profilePicture)
    : undefined;

  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();

  const statusColor = (status: TeamApplicationStatus) => {
    switch (status) {
      case TeamApplicationStatus.Approved:
        return "rs_secondary.green";
      case TeamApplicationStatus.Pending:
        return "rs_secondary.orange";
      default:
        return "rs_secondary.error";
    }
  };
  return (
    <HStack space="2" py="defaultLayoutSpacing">
      <Avatar
        size="sm"
        source={
          profileImage
            ? {
                uri: formatFileUrl(profileImage),
              }
            : ImageDirectory.LOGO_SPLASH
        }
      >
        Thumb nail
      </Avatar>
      <VStack space="1" flex="1">
        <Text fontSize="md">{`${displayName}`}</Text>
        <Pressable
          onPress={() => {
            if (member?.memberInfo)
              navigation.navigate("UserProfileViewer", {
                user: {
                  ...member?.memberInfo,
                  id: member.userId,
                  sub: member.userId,
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
      {isRequest &&
        shouldShowStatus &&
        member?.status !== TeamApplicationStatus.Pending && (
          <VStack space={2}>
            <Text fontWeight={600} color={statusColor(member?.status)}>
              {t(member?.status)}
            </Text>
          </VStack>
        )}

      {isRequest && member?.status === TeamApplicationStatus.Pending && (
        <VStack space={2}>
          <Pressable
            h="9"
            w="108"
            bg={APPROVE_BUTTON_COLOR}
            _pressed={{ opacity: 0.5 }}
            _disabled={{ bg: "rs.lightGrey" }}
            disabled={isLoading}
            borderRadius="2xl"
            justifyContent="center"
            alignItems="center"
            onPress={() => {
              onPressApprove?.();
            }}
          >
            <Text fontWeight={600} color="rs.white">
              {t("Approve")}
            </Text>
          </Pressable>
          <Pressable
            h="9"
            w="108"
            _pressed={{ opacity: 0.5 }}
            _disabled={{ bg: "rs.lightGrey" }}
            disabled={isLoading}
            borderColor={REJECT_BUTTON_COLOR}
            borderRadius="2xl"
            borderWidth={1}
            justifyContent="center"
            alignItems="center"
            bg="rs.white"
            onPress={() => {
              onPressReject?.();
            }}
          >
            <Text color={REJECT_BUTTON_COLOR} fontWeight={600}>
              {t("Reject")}
            </Text>
          </Pressable>
        </VStack>
      )}
      {!isRequest && member?.status === TeamApplicationStatus.Approved && (
        <Pressable
          h="9"
          w="108"
          _pressed={{ opacity: 0.5 }}
          _disabled={{ bg: "rs.lightGrey" }}
          disabled={isLoading}
          bg="rs.primary_purple"
          borderRadius="2xl"
          justifyContent="center"
          alignItems="center"
          onPress={() => {
            onRemove?.();
          }}
        >
          <Text fontWeight={600} color={isLoading ? "rs.black" : "rs.white"}>
            {t("Remove")}
          </Text>
        </Pressable>
      )}
    </HStack>
  );
}

export default TeamManageDetailsCard;
