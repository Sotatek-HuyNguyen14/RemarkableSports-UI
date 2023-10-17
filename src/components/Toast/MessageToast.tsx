import React from "react";
import { Box, Heading, HStack, Text, VStack } from "native-base";
import TipSuccessIcon from "../Icons/TipSuccessIcon";
import { getTranslation } from "../../utils/translation";
import TipDialogIcon from "../Icons/TipDialogIcon";
import CloseIcon from "../Icons/CloseIcon";
import ReminderIcon from "../Icons/ReminderIcon";
import RequestIcon from "../Icons/RequestIcon";

export enum MesssageToastType {
  Success,
  Reminder,
  Reject,
  Request,
  Error,
}
const t = getTranslation("component.Toast.MesssageToast");
export interface MesssageToastProps {
  type: MesssageToastType;
  title: string;
  body?: string;
  onPress?: () => void;
}
export default function MessageToast({
  type,
  title,
  body,
  onPress,
}: MesssageToastProps) {
  const renderIcon = () => {
    switch (type) {
      case MesssageToastType.Success:
        return (
          <Box
            w="12"
            h="12"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            mr="defaultLayoutSpacing"
            bg="rgba(5,194,140,0.15)"
          >
            <TipSuccessIcon />
          </Box>
        );

      case MesssageToastType.Reminder:
        return (
          <Box
            w="12"
            h="12"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            mr="defaultLayoutSpacing"
            bg="rgba(5,105,255,0.15)"
          >
            <ReminderIcon />
          </Box>
        );
      case MesssageToastType.Reject:
        return (
          <Box
            w="12"
            h="12"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            mr="defaultLayoutSpacing"
            bg="rgba(241,101,20,0.15)"
          >
            <TipDialogIcon />
          </Box>
        );
      case MesssageToastType.Request:
        return (
          <Box
            w="12"
            h="12"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            mr="defaultLayoutSpacing"
            bg="rgba(241,101,20,0.15)"
          >
            <RequestIcon />
          </Box>
        );
      case MesssageToastType.Error:
        return (
          <Box
            w="12"
            h="12"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            mr="defaultLayoutSpacing"
            bg="rgba(241,101,20,0.15)"
          >
            <CloseIcon size="2xl" />
          </Box>
        );

      default:
        break;
    }
  };

  return (
    <HStack
      alignItems="center"
      justifyContent="center"
      mx="defaultLayoutSpacing"
      p="defaultLayoutSpacing"
      alignSelf="center"
      w="343"
      shadow="9"
      style={{
        shadowOffset: {
          width: 5,
          height: 5,
        },
        shadowOpacity: 0.1,
      }}
      borderColor="rs.white"
      borderRadius="2xl"
      borderWidth="1"
      bgColor="rs.white"
    >
      {renderIcon()}
      <VStack flex={1}>
        <Heading>{title}</Heading>
        {body && <Text>{body}</Text>}
        {onPress && (
          <Text
            color="rs.primary_purple"
            onPress={() => {
              onPress();
            }}
          >
            {t("See details")}
          </Text>
        )}
      </VStack>
    </HStack>
  );
}
