import React, { Text, Pressable, VStack, HStack, Avatar } from "native-base";
import {
  CourseApplicationResponse,
  CourseLeaveRequest,
} from "../../models/responses/Course";
import { CourseApplicationStatus } from "../../models/responses/CourseApplication";
import { Player } from "../../models/User";
import { formatFileUrl } from "../../services/ServiceUtil";
import { formatUtcToLocalDate } from "../../utils/date";
import { formatName, getUserName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../constants/constants";

interface CourseLeaveRequestCardProps {
  applicant: Player;
  onPressCard?: (card: any) => void;
  onPressApprove?: () => void;
  onPressReject?: () => void;
  onPressPlayerDetails?: (player: Player) => void;
  application: CourseLeaveRequest;
}
const t = getTranslation([
  "component.CourseApplicantDetailsCard",
  "constant.district",
  "constant.profile",
  "constant.button",
]);
function CourseLeaveRequestCard({
  applicant,
  onPressApprove,
  onPressCard,
  onPressReject,
  application,
  onPressPlayerDetails,
}: CourseLeaveRequestCardProps) {
  return (
    <Pressable
      onPress={() => {
        onPressCard?.(application);
      }}
    >
      <VStack space="2">
        <HStack space="2">
          <Avatar
            size="sm"
            source={
              applicant && applicant.profilePicture
                ? {
                    uri: formatFileUrl(applicant.profilePicture),
                  }
                : undefined
            }
          >
            {`${applicant.firstName.charAt(0)}${applicant.lastName.charAt(0)}`}
          </Avatar>

          <VStack space="1" flex="1">
            <Text fontSize="md">{`${getUserName(applicant)}`}</Text>
            <Text color="rs_secondary.grey">
              {`${t("Leave")}: ${formatUtcToLocalDate(
                application.courseSessionInfo.courseSessionFrom
              )}`}
            </Text>
            <Text color="rs_secondary.grey">
              {`${t("Make up session")}: ${
                application.makeUpSessionInfo
                  ? formatUtcToLocalDate(
                      application.makeUpSessionInfo.courseSessionFrom
                    )
                  : "N/A"
              }`}
            </Text>
          </VStack>
        </HStack>
        <HStack space={2}>
          <Pressable
            flex="1"
            h="10"
            w="108"
            bg={APPROVE_BUTTON_COLOR}
            borderRadius="2xl"
            justifyContent="center"
            alignItems="center"
            onPress={() => onPressApprove?.()}
          >
            <Text fontWeight={700} color="rs.white">
              {t("Approve")}
            </Text>
          </Pressable>
          <Pressable
            flex="1"
            h="10"
            w="108"
            borderColor={REJECT_BUTTON_COLOR}
            borderRadius="2xl"
            borderWidth={1}
            justifyContent="center"
            alignItems="center"
            onPress={() => onPressReject?.()}
          >
            <Text color={REJECT_BUTTON_COLOR} fontWeight={700}>
              {t("Reject")}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    </Pressable>
  );
}
export default CourseLeaveRequestCard;
