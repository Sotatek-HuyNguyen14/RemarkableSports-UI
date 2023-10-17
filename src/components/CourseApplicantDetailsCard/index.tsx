import React, { Text, Pressable, VStack, HStack, Avatar } from "native-base";
import { useCallback } from "react";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { CourseApplicationResponse } from "../../models/responses/Course";
import { CourseApplicationStatus } from "../../models/responses/CourseApplication";
import { Player } from "../../models/User";
import { getCourseApplicationEnrollment } from "../../services/CourseServices";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";
import { formatUtcToLocalDate } from "../../utils/date";
import { formatName, getUserName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";
import ImageDirectory from "../../assets";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../constants/constants";

interface CourseApplicantDetailsCardProps {
  applicant: Player;
  onPressCard?: (card: any) => void;
  onPressApprove?: () => void;
  onPressReject?: () => void;
  onPressPlayerDetails?: (player: Player) => void;
  application: CourseApplicationResponse;
  shouldRenderStatus?: boolean;
  footer?: JSX.Element;
  shouldShowUpcommingSession?: boolean;
  horizontalButtons?: boolean;
}
const t = getTranslation([
  "component.CourseApplicantDetailsCard",
  "constant.district",
  "constant.profile",
  "constant.button",
]);
function CourseApplicantDetailsCard({
  applicant,
  onPressApprove,
  onPressCard,
  onPressReject,
  application,
  onPressPlayerDetails,
  shouldRenderStatus = true,
  shouldShowUpcommingSession = false,
  horizontalButtons = false,
  footer,
}: CourseApplicantDetailsCardProps) {
  const { courseId, playerId } = application;
  const { data: applicationEnrollments, mutate } = useSWR(
    formatCoreUrl(`/course/${courseId}/application/${playerId}/enrollment`),
    () => getCourseApplicationEnrollment(courseId, playerId)
  );
  // operations like re-apply course creates new application record, while applicationEnrollments includes enrollments from all applications
  // make sure it only filters the enrollments from corresponding application
  const filteredApplicationEnrollments = applicationEnrollments
    ? applicationEnrollments
        .filter(
          (app) =>
            application.upcommingSessions.findIndex((session) => {
              return session.courseSessionId === app.courseSessionId;
            }) !== -1
        )
        ?.sort(
          (a, b) =>
            a.courseSessionFrom.getTime() - b.courseSessionFrom.getTime()
        )
    : [];
  const upcommingSession = application.upcommingSessions.sort(
    (a, b) => a.courseSessionFrom.getTime() - b.courseSessionFrom.getTime()
  )[0];
  const sessionLeft =
    application.upcommingSessions.length >= 1
      ? application.upcommingSessions.length
      : 0;

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );
  return (
    <Pressable
      onPress={() => {
        onPressCard?.(application);
      }}
      flexDirection="column"
    >
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
          {`${applicant?.firstName?.charAt(0)}${applicant?.lastName?.charAt(
            0
          )}`}
        </Avatar>

        <VStack space="1" flex="1">
          <Text fontSize="md">{`${getUserName(applicant)}`}</Text>
          {shouldShowUpcommingSession ? (
            <>
              {upcommingSession && (
                <Text color="#6D6D6D">{`${t("Upcoming Session")}: ${
                  upcommingSession
                    ? formatUtcToLocalDate(upcommingSession.courseSessionFrom)
                    : ""
                }`}</Text>
              )}
              {upcommingSession && (
                <Text color="#6D6D6D">{`${t(
                  "Sessions left"
                )}: ${sessionLeft}`}</Text>
              )}
            </>
          ) : (
            <>
              {filteredApplicationEnrollments.length > 0 &&
                filteredApplicationEnrollments[0] && (
                  <Text
                    color="rs_secondary.grey"
                    numberOfLines={2}
                    flexWrap="wrap"
                  >
                    {`${t("Start")}: ${formatUtcToLocalDate(
                      filteredApplicationEnrollments[0].courseSessionFrom
                    )}`}
                  </Text>
                )}
              {filteredApplicationEnrollments &&
                filteredApplicationEnrollments.length > 0 && (
                  <Text
                    color="rs_secondary.grey"
                    numberOfLines={2}
                    flexWrap="wrap"
                  >
                    {`${t("Number of sessions")}: ${
                      filteredApplicationEnrollments.length
                    }`}
                  </Text>
                )}
            </>
          )}

          <Pressable
            onPress={() => {
              onPressPlayerDetails?.(applicant);
            }}
          >
            <Text color="rs.primary_purple">
              {t("Player details")}
              {">"}
            </Text>
          </Pressable>
          {footer}
        </VStack>
        {shouldRenderStatus &&
          application.status !== CourseApplicationStatus.Pending && (
            <VStack space={2}>
              <Text
                fontWeight={600}
                color={
                  application.status === CourseApplicationStatus.Approve
                    ? "rs_secondary.green"
                    : "rs_secondary.error"
                }
              >
                {t(application.status)}
              </Text>
            </VStack>
          )}
        {application.status === CourseApplicationStatus.Pending &&
          !horizontalButtons && (
            <VStack space={2}>
              <Pressable
                h="9"
                w="108"
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
                h="9"
                w="108"
                borderColor={REJECT_BUTTON_COLOR}
                borderRadius="2xl"
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
      {application.status === CourseApplicationStatus.Pending &&
        horizontalButtons && (
          <HStack mt="3" space={2}>
            <Pressable
              h="10"
              flex="1"
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
              h="10"
              flex="1"
              borderColor={REJECT_BUTTON_COLOR}
              borderRadius="2xl"
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
    </Pressable>
  );
}
export default CourseApplicantDetailsCard;
