import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { Text, Pressable, VStack, HStack, Avatar } from "native-base";
import useSWR from "swr";
import ImageDirectory from "../../assets";
import { CourseApplicationResponse } from "../../models/responses/Course";
import { CourseApplicationStatus } from "../../models/responses/CourseApplication";
import {
  EventApplication,
  EventApplicationStatus,
  EventType,
} from "../../models/responses/Event";
import {
  TeamApplicationStatus,
  TeamMember,
} from "../../models/responses/League";
import { ClubStaff, Coach, Player, User, UserType } from "../../models/User";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getCourseApplicationEnrollment } from "../../services/CourseServices";
import {
  getColorForApplication,
  getDisplayNameForApplication,
  isSinglePlayerApplicationEvent,
  profilePictureForApplication,
} from "../../services/EventServices";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";
import { formatUtcToLocalDate } from "../../utils/date";
import { formatName, getUserName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../constants/constants";
import RemoveIcon from "../Icons/RemoveIcon";

interface TeamRequestCardProps {
  onPressCard?: (card: any) => void;
  onPressApprove?: () => void;
  onPressReject?: () => void;
  onPressRemove?: () => void;
  onPressPlayerDetails?: (player: User | Player | Coach | ClubStaff) => void;
  application: TeamMember;
  shouldShowStatus?: boolean;
  shouldShowPlayerDetails?: boolean;
}

const t = getTranslation([
  "component.TeamRequestCard",
  "constant.district",
  "constant.profile",
  "constant.button",
]);

function TeamRequestCard({
  onPressApprove,
  onPressCard,
  onPressReject,
  onPressRemove,
  application,
  onPressPlayerDetails,
  shouldShowPlayerDetails = true,
  shouldShowStatus = true,
}: TeamRequestCardProps) {
  const displayName = getUserName(application.memberInfo);
  const profileImage = application.memberInfo?.profilePicture;
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();

  return (
    <Pressable
      onPress={() => {
        onPressCard?.(application);
      }}
    >
      <HStack space="2">
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
              navigation.navigate("UserProfileViewer", {
                user: {
                  ...application.memberInfo,
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

        {application.status === TeamApplicationStatus.Pending && (
          <VStack space={2}>
            <Pressable
              h="9"
              w="108"
              bg={APPROVE_BUTTON_COLOR}
              borderRadius="sm"
              justifyContent="center"
              alignItems="center"
              onPress={() => onPressApprove?.()}
            >
              <Text fontWeight={600} color="rs.white">
                {t("Approve")}
              </Text>
            </Pressable>
            <Pressable
              h="9"
              w="108"
              borderColor={REJECT_BUTTON_COLOR}
              borderRadius="sm"
              borderWidth={1}
              justifyContent="center"
              alignItems="center"
              onPress={() => onPressReject?.()}
            >
              <Text color={REJECT_BUTTON_COLOR} fontWeight={600}>
                {t("Reject")}
              </Text>
            </Pressable>
          </VStack>
        )}
        {application.status === TeamApplicationStatus.Approved && (
          <Pressable
            h="9"
            w="108"
            borderColor="#31095E"
            borderRadius="sm"
            borderWidth={1}
            justifyContent="center"
            alignItems="center"
            onPress={() => onPressRemove?.()}
          >
            <HStack space="2" justifyContent="center" alignItems="center">
              <RemoveIcon />
              <Text color="#31095E" fontWeight={600}>
                {t("Remove")}
              </Text>
            </HStack>
          </Pressable>
        )}
      </HStack>
    </Pressable>
  );
}

export default TeamRequestCard;
