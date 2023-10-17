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
import {
  CourseApplicationResponse,
  CoursePaymentStatus,
} from "../../models/responses/Course";
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
import { formatName, getUserName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";

interface CoursePaymentInfoCardProps {
  onPressCard?: (card: any) => void;
  onPressStatus?: () => void;
  actionLabel?: string;
  onPressAction?: () => void;
  application: CourseApplicationResponse;
  icon?: JSX.Element;
  shouldShowStatus?: boolean;
}

const t = getTranslation([
  "component.CourseApplicantInfoCard",
  "constant.district",
  "constant.profile",
]);

function CoursePaymentInfoCard({
  onPressStatus,
  onPressCard,
  onPressAction,
  application,
  actionLabel,
  icon,
  shouldShowStatus = true,
}: CoursePaymentInfoCardProps) {
  const displayName = getUserName(application.playerInfo)?.toString();
  const profileImage = application.playerInfo?.profilePicture;
  const { colors } = useTheme();

  let bgColor = colors.rs.GPP_lightGreen;
  let statusColor = colors.rs.GPP_lightGreen;

  const ammount = application.numberOfSessions * application.course.fee;
  switch (application.paymentStatus) {
    case CoursePaymentStatus.Pending:
      bgColor = colors.rs.medium_orange;
      statusColor = colors.rs.medium_orange;
      break;
    case CoursePaymentStatus.Unpaid:
      bgColor = colors.rs.bg_grey;
      statusColor = colors.rs_secondary.error;
      break;
    case CoursePaymentStatus.Rejected:
      bgColor = colors.rs.bg_grey;
      statusColor = colors.rs_secondary.error;
      break;
    case CoursePaymentStatus.Refund:
      bgColor = colors.rs.bg_grey;
      statusColor = colors.rs.bg_grey;
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
      <HStack alignItems="center" justifyContent="space-between" w="full">
        <HStack alignItems="center" space="2">
          <Avatar
            size="sm"
            source={
              profileImage
                ? {
                    uri: formatFileUrl(profileImage),
                  }
                : undefined
            }
          >
            {`${application?.playerInfo?.firstName?.charAt(
              0
            )}${application?.playerInfo?.lastName?.charAt(0)}`}
          </Avatar>

          <VStack>
            <Text fontSize="md" numberOfLines={2}>{`${displayName.slice(
              0,
              displayName.length > 20
                ? displayName.length / 2
                : displayName.length
            )}${displayName.length > 20 ? "..." : ""}`}</Text>
            <Text color="gray.600">{`${t("Start date")}: ${formatUtcToLocalDate(
              application.enrollmentStartDate
            )}`}</Text>
            <Text color="gray.600">{`${t("Sessions")}: ${
              application.numberOfSessions
            }`}</Text>
            <Text color="gray.600">{`${t("Ammount")}: $${ammount}`}</Text>
          </VStack>
        </HStack>
        <HStack space={4}>
          {/* Status */}
          {shouldShowStatus && application.paymentStatus && (
            <Pressable
              onPress={() => {
                onPressStatus?.();
              }}
            >
              <Text color={statusColor} textDecorationLine="underline">
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

export default CoursePaymentInfoCard;
