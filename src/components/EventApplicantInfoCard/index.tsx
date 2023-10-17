import React, {
  Text,
  Pressable,
  VStack,
  HStack,
  Avatar,
  useTheme,
} from "native-base";
import useSWR from "swr";
import ImageDirectory from "../../assets";
import { CourseApplicationResponse } from "../../models/responses/Course";
import { CourseApplicationStatus } from "../../models/responses/CourseApplication";
import {
  EventApplication,
  EventPaymentStatus,
} from "../../models/responses/Event";
import { Player } from "../../models/User";
import { getCourseApplicationEnrollment } from "../../services/CourseServices";
import {
  getColorForApplication,
  getDisplayNameForApplication,
  getPaymentStatusColorForApplication,
  profilePictureForApplication,
} from "../../services/EventServices";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";
import { formatUtcToLocalDate } from "../../utils/date";
import { formatName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";

interface EventApplicantInfoCardProps {
  onPressCard?: (card: any) => void;
  onPressStatus?: () => void;
  actionLabel?: string;
  onPressAction?: () => void;
  application: EventApplication;
  icon?: JSX.Element;
  shouldShowStatus?: boolean;
}

const t = getTranslation([
  "component.EventApplicantInfoCard",
  "constant.district",
  "constant.profile",
]);

function EventApplicantInfoCard({
  onPressStatus,
  onPressCard,
  onPressAction,
  application,
  actionLabel,
  icon,
  shouldShowStatus = true,
}: EventApplicantInfoCardProps) {
  const displayName = getDisplayNameForApplication(application);
  const profileImage = profilePictureForApplication(application);
  const { colors } = useTheme();
  const shouldShowAvt = application.teamName === null;
  let bgColor = colors.rs.GPP_lightGreen;

  switch (application.paymentStatus) {
    case EventPaymentStatus.Pending:
      bgColor = colors.rs.medium_orange;
      break;
    case EventPaymentStatus.Unpaid:
    case EventPaymentStatus.Rejected:
      bgColor = colors.rs.bg_grey;
      break;
    default:
      break;
  }

  return (
    <Pressable
      onPress={() => {
        onPressCard?.(application);
      }}
    >
      <HStack alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" space="2">
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

          <Text fontSize="md" numberOfLines={2}>{`${displayName.slice(
            0,
            displayName.length > 20
              ? displayName.length / 2
              : displayName.length
          )}${displayName.length > 20 ? "..." : ""}`}</Text>
        </HStack>
        <HStack space={4}>
          {/* Status */}
          {shouldShowStatus && (
            <Pressable
              onPress={() => {
                onPressStatus?.();
              }}
            >
              <Text
                color={getPaymentStatusColorForApplication(application)}
                textDecorationLine="underline"
              >
                {t(application.paymentStatus)}
              </Text>
            </Pressable>
          )}

          {actionLabel === "application" && icon && (
            <Pressable
              h="6"
              w="43"
              bg={bgColor}
              borderColor={bgColor}
              borderRadius="4"
              borderWidth={1}
              justifyContent="center"
              alignItems="center"
              onPress={() => onPressAction?.()}
            >
              <HStack justifyContent="center" space="2">
                {icon && icon}
              </HStack>
            </Pressable>
          )}
        </HStack>
        {/* Actions */}
        {actionLabel && !shouldShowStatus && onPressAction && (
          <Pressable
            h="9"
            minW="108"
            px="4"
            bg="rs.primary_purple"
            borderColor="rs.primary_purple"
            borderRadius="2xl"
            borderWidth={1}
            justifyContent="center"
            alignItems="center"
            onPress={() => onPressAction?.()}
          >
            <HStack justifyContent="center" space="2">
              {icon && icon}
              <Text fontWeight="bold" color="rs.white">
                {actionLabel}
              </Text>
            </HStack>
          </Pressable>
        )}
      </HStack>
    </Pressable>
  );
}

export default EventApplicantInfoCard;
