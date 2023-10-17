import React, {
  Button,
  Text,
  Pressable,
  VStack,
  Badge,
  Heading,
  HStack,
  Box,
} from "native-base";
import {
  CourseBookingResponse,
  PlayerAppliedStatus,
} from "../../models/Response";
import { UserType } from "../../models/User";
import { format24HTo12H } from "../../utils/date";
import { formatName, getUserName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";
import CalendarIcon from "../Icons/CalendarIcon";
import ClockIcon from "../Icons/ClockIcon";
import LocationIcon from "../Icons/LocationIcon";
import MoneyIcon from "../Icons/MoneyIcon";
import Card from "./Card";

interface CourseBookingCardProps {
  meetUpCourse: CourseBookingResponse;
  onPressCourseCard: (item: CourseBookingResponse) => void;
  onPressQuickApprove: (item: CourseBookingResponse) => void;
}

const t = getTranslation([
  "component.Card.CourseBookingCard",
  "constant.district",
  "constant.profile",
  "constant.button",
]);

function CourseBookingCard({
  meetUpCourse,
  onPressCourseCard,
  onPressQuickApprove,
}: CourseBookingCardProps) {
  const { course } = meetUpCourse;
  const displayName =
    course.creator.userType === UserType.Coach
      ? getUserName(course.creator)
      : course.club?.name;
  return (
    <Pressable
      onPress={() => {
        onPressCourseCard(meetUpCourse);
      }}
    >
      <VStack>
        <Card
          onPress={() => {
            onPressCourseCard(meetUpCourse);
          }}
          header={
            <VStack space="2">
              <HStack justifyContent="space-between">
                <HStack>
                  <Badge
                    borderColor="rs.lightBlue"
                    variant="outline"
                    bg="rs.lightBlue"
                    mr={3}
                    _text={{ color: "rs.white" }}
                  >
                    {displayName}
                  </Badge>
                  {course.level && (
                    <Badge
                      borderColor="rs_secondary.orange"
                      variant="outline"
                      bg="rs_secondary.orange"
                      _text={{ color: "rs.white" }}
                    >
                      {t(course.level)}
                    </Badge>
                  )}
                </HStack>
                {course.playerAppliedStatus &&
                  course.playerAppliedStatus !== PlayerAppliedStatus.Null && (
                    <Badge
                      variant="outline"
                      borderColor="rs_secondary.orange"
                      _text={{ color: "rs_secondary.orange" }}
                    >
                      {t(course.playerAppliedStatus)}
                    </Badge>
                  )}
              </HStack>
              <Heading noOfLines={2}>{course.name}</Heading>
            </VStack>
          }
          body={
            <>
              <HStack alignItems="center" space="2">
                <CalendarIcon />
                <Text>
                  {course.fromDate} to {course.toDate}
                </Text>
              </HStack>
              <HStack alignItems="center" space="2">
                <ClockIcon />
                <Text>
                  {`${format24HTo12H(course.startTime)} - ${format24HTo12H(
                    course.endTime
                  )}`}
                </Text>
              </HStack>
              <HStack flexWrap="wrap">
                <HStack flex="1" alignItems="center" space="2">
                  <LocationIcon />
                  <Text flex="1" numberOfLines={2}>
                    {t(course.district)}
                  </Text>
                </HStack>
                <HStack flex="1" alignItems="center" space="2">
                  <MoneyIcon />
                  <Text flex="1" numberOfLines={2}>
                    {course.fee} {t("hkd")}
                  </Text>
                </HStack>
              </HStack>
            </>
          }
          footer={
            <Button
              onPress={() => {
                onPressQuickApprove(meetUpCourse);
              }}
              w="40"
            >
              {t("Quick Approve")}
            </Button>
          }
        />
      </VStack>
    </Pressable>
  );
}

export default CourseBookingCard;
