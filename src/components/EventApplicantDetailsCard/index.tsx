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
import { formatName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../constants/constants";

interface EventApplicantDetailsCardProps {
  onPressCard?: (card: any) => void;
  onPressApprove?: () => void;
  onPressReject?: () => void;
  onPressPlayerDetails?: (player: User | Player | Coach | ClubStaff) => void;
  application: EventApplication;
  shouldShowStatus?: boolean;
  shouldShowPlayerDetails?: boolean;
  horizontalButton?: boolean;
  footer?: JSX.Element;
}

const t = getTranslation([
  "component.EventApplicantDetailsCard",
  "component.EventApplicantInfoCard",
  "constant.district",
  "constant.profile",
  "constant.button",
]);

function EventApplicantDetailsCard({
  onPressApprove,
  onPressCard,
  onPressReject,
  application,
  onPressPlayerDetails,
  shouldShowPlayerDetails = true,
  shouldShowStatus = true,
  horizontalButton = false,
  footer,
}: EventApplicantDetailsCardProps) {
  const displayName = getDisplayNameForApplication(application);
  const profileImage = profilePictureForApplication(application);
  const shouldShowAvt = application.teamName === null;
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();

  return (
    <Pressable
      _pressed={{ opacity: 0.5 }}
      onPress={() => {
        onPressCard?.(application);
      }}
      flexDirection="column"
    >
      <HStack space="2">
        {shouldShowAvt && (
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
        )}

        <VStack space="1" flex="1">
          <Text
            fontSize="md"
            fontWeight={application.teamName ? "bold" : "normal"}
            numberOfLines={2}
          >{`${displayName.slice(
            0,
            displayName.length > 20
              ? displayName.length / 2
              : displayName.length
          )}${displayName.length > 20 ? "..." : ""}`}</Text>
          {/* Team info */}
          {application.teamName &&
            application.eventParticipants &&
            application.eventParticipants.length > 0 &&
            application.eventParticipants.map((participant) => {
              return (
                <Text fontSize="md" color="rs.GPP_grey">
                  {participant.participantName}
                </Text>
              );
            })}
          {/* Team show applicant info */}
          {application.teamName &&
            application.eventParticipants &&
            application.eventParticipants.length > 0 &&
            application.isOnline &&
            shouldShowPlayerDetails && (
              <Pressable
                _pressed={{ opacity: 0.5 }}
                onPress={() => {
                  onPressPlayerDetails?.({
                    ...application.applicant,
                  });
                  navigation.navigate("UserProfileViewer", {
                    user: {
                      ...application.applicant,
                    },
                  });
                }}
              >
                <Text color="rs.primary_purple">
                  {t("Applicant details")}
                  {">"}
                </Text>
              </Pressable>
            )}
          {shouldShowPlayerDetails &&
            isSinglePlayerApplicationEvent(application) && (
              <Pressable
                _pressed={{ opacity: 0.5 }}
                onPress={() => {
                  onPressPlayerDetails?.({
                    ...application.applicant,
                  });
                  navigation.navigate("UserProfileViewer", {
                    user: {
                      ...application.applicant,
                    },
                  });
                }}
              >
                <Text color="rs.primary_purple">
                  {t("Player details")}
                  {">"}
                </Text>
              </Pressable>
            )}
        </VStack>
        {shouldShowStatus &&
          application.eventApplicationStatus !==
            EventApplicationStatus.Pending && (
            <VStack space={2}>
              <Text
                fontWeight={600}
                color={getColorForApplication(application)}
              >
                {t(application.eventApplicationStatus)}
              </Text>
            </VStack>
          )}

        {application.eventApplicationStatus ===
          EventApplicationStatus.Pending &&
          !horizontalButton && (
            <VStack space={2}>
              <Pressable
                h="9"
                w="108"
                _pressed={{ opacity: 0.5 }}
                bg={APPROVE_BUTTON_COLOR}
                borderRadius="4"
                justifyContent="center"
                alignItems="center"
                onPress={() => onPressApprove?.()}
              >
                <Text fontWeight={600} color="rs.white">
                  {t("Approve")}
                </Text>
              </Pressable>
              <Pressable
                _pressed={{ opacity: 0.5 }}
                h="9"
                w="108"
                borderColor={REJECT_BUTTON_COLOR}
                borderRadius="4"
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
      </HStack>
      {application.eventApplicationStatus === EventApplicationStatus.Pending &&
        horizontalButton && (
          <HStack mt="2" space={2}>
            <Pressable
              h="10"
              flex="1"
              _pressed={{ opacity: 0.5 }}
              bg={APPROVE_BUTTON_COLOR}
              borderRadius="2xl"
              justifyContent="center"
              alignItems="center"
              onPress={() => onPressApprove?.()}
            >
              <Text fontWeight={600} color="rs.white">
                {t("Approve")}
              </Text>
            </Pressable>
            <Pressable
              _pressed={{ opacity: 0.5 }}
              h="10"
              borderRadius="2xl"
              flex="1"
              borderColor={REJECT_BUTTON_COLOR}
              borderWidth={1}
              justifyContent="center"
              alignItems="center"
              onPress={() => onPressReject?.()}
            >
              <Text color={REJECT_BUTTON_COLOR} fontWeight={600}>
                {t("Reject")}
              </Text>
            </Pressable>
          </HStack>
        )}
      {footer && footer}
    </Pressable>
  );
}

export default EventApplicantDetailsCard;
