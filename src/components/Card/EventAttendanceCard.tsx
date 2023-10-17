import React, { useEffect, useState } from "react";
import {
  Heading,
  HStack,
  Avatar,
  Center,
  Pressable,
  Text,
  VStack,
  Badge,
} from "native-base";
import Card from "./Card";
import ChooseIcon from "../Icons/ChooseIcon";
import UnChoose from "../Icons/UnChoose";
import SquareBox from "../Icons/SquareBox";
import { formatName } from "../../utils/name";
import { formatFileUrl } from "../../services/ServiceUtil";
import Loading from "../Loading";
import CrossIcon from "../Icons/CrossIcon";
import RectangleCrossIcon from "../Icons/RectangleCrossIcon";
import RectangleBlueCheckIcon from "../Icons/RectangleBlueCheckIcon";
import CheckIcon from "../Icons/CheckIcon";
import RectangleRedCrossIcon from "../Icons/RectangleRedCrossIcon";
import { getTranslation } from "../../utils/translation";
import { EventAttendanceStatus } from "../../models/responses/Event";
import ImageDirectory from "../../assets";

const t = getTranslation("component.AttendanceCard");

export interface AttendanceCardProps {
  displayName: string | string[];
  profilePicture?: string;
  defaultStatus?: string;
  onRightBoxPress: (newStatus: EventAttendanceStatus) => void;
  isLoading?: boolean;
  shouldShowAvt?: boolean;
}

export default function EventAttendanceCard({
  profilePicture,
  defaultStatus,
  displayName,
  onRightBoxPress,
  isLoading = false,
  shouldShowAvt = true,
}: AttendanceCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const shouldShowLeave = defaultStatus === EventAttendanceStatus.Leave;
  const shouldShowBlueChecked =
    !shouldShowLeave && defaultStatus === EventAttendanceStatus.Present;
  const shouldShowAbsent =
    !shouldShowLeave && defaultStatus === EventAttendanceStatus.Absent;

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack space={4} alignItems="center" justifyContent="space-between">
        {shouldShowAvt && (
          <Avatar
            size="sm"
            source={
              profilePicture
                ? { uri: formatFileUrl(profilePicture) }
                : ImageDirectory.LOGO_SPLASH
            }
          >
            {displayName}
          </Avatar>
        )}
        <Text fontSize="md">{displayName}</Text>
      </HStack>
      {!isLoading ? (
        <HStack space="2">
          {!shouldShowLeave && (
            <HStack space="2">
              {shouldShowBlueChecked ? (
                <Pressable
                  _pressed={{ opacity: 0.5 }}
                  onPress={() => {
                    onRightBoxPress(EventAttendanceStatus.Unknown);
                  }}
                >
                  <RectangleBlueCheckIcon />
                </Pressable>
              ) : (
                <Pressable
                  _pressed={{ opacity: 0.5 }}
                  onPress={() => {
                    onRightBoxPress(EventAttendanceStatus.Present);
                  }}
                >
                  <ChooseIcon />
                </Pressable>
              )}
              {shouldShowAbsent ? (
                <Pressable
                  _pressed={{ opacity: 0.5 }}
                  onPress={() => {
                    onRightBoxPress(EventAttendanceStatus.Unknown);
                  }}
                >
                  <RectangleRedCrossIcon />
                </Pressable>
              ) : (
                <Pressable
                  _pressed={{ opacity: 0.5 }}
                  onPress={() => {
                    onRightBoxPress(EventAttendanceStatus.Absent);
                  }}
                >
                  <RectangleCrossIcon />
                </Pressable>
              )}
            </HStack>
          )}

          {shouldShowLeave && (
            <Badge
              borderColor="rs_secondary.orange"
              variant="outline"
              bg="rs_secondary.orange"
              _text={{ color: "rs.white" }}
              mr={3}
            >
              {t("Leave")}
            </Badge>
          )}
        </HStack>
      ) : (
        <Center>
          <Loading />
        </Center>
      )}
    </HStack>
  );
}
