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
import { AttendanceStatus } from "../../models/responses/Course";
import CrossIcon from "../Icons/CrossIcon";
import RectangleCrossIcon from "../Icons/RectangleCrossIcon";
import RectangleBlueCheckIcon from "../Icons/RectangleBlueCheckIcon";
import CheckIcon from "../Icons/CheckIcon";
import RectangleRedCrossIcon from "../Icons/RectangleRedCrossIcon";
import { getTranslation } from "../../utils/translation";

const t = getTranslation("component.AttendanceCard");

export interface AttendanceCardProps {
  displayName: string;
  profilePicture?: string;
  defaultStatus?: string;
  onRightBoxPress: (newStatus: AttendanceStatus) => void;
  isLoading?: boolean;
}

export default function AttendanceCard({
  displayName,
  profilePicture,
  defaultStatus,
  onRightBoxPress,
  isLoading = false,
}: AttendanceCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const shouldShowLeave = defaultStatus === AttendanceStatus.Leave;
  const shouldShowBlueChecked =
    !shouldShowLeave && defaultStatus === AttendanceStatus.Present;
  const shouldShowAbsent =
    !shouldShowLeave && defaultStatus === AttendanceStatus.Absent;

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack space={4} alignItems="center" justifyContent="space-between">
        {profilePicture ? (
          <Avatar
            size="sm"
            source={{ uri: formatFileUrl(profilePicture ?? "") }}
          >
            Thumbnail
          </Avatar>
        ) : (
          <Avatar size="sm" />
        )}
        <Text>{displayName}</Text>
      </HStack>
      {!isLoading ? (
        <HStack space="2">
          {!shouldShowLeave && (
            <HStack space="2">
              {shouldShowBlueChecked ? (
                <Pressable
                  onPress={() => {
                    onRightBoxPress(AttendanceStatus.Unknown);
                  }}
                >
                  <RectangleBlueCheckIcon />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    onRightBoxPress(AttendanceStatus.Present);
                  }}
                >
                  <ChooseIcon />
                </Pressable>
              )}
              {shouldShowAbsent ? (
                <Pressable
                  onPress={() => {
                    onRightBoxPress(AttendanceStatus.Unknown);
                  }}
                >
                  <RectangleRedCrossIcon />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    onRightBoxPress(AttendanceStatus.Absent);
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
