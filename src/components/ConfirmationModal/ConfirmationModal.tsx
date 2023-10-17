import {
  AlertDialog,
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Text,
  VStack,
  Circle,
} from "native-base";
import React from "react";
import { getTranslation } from "../../utils/translation";
import TipDialogIcon from "../Icons/TipDialogIcon";
import TipSuccessIcon from "../Icons/TipSuccessIcon";
import TipsIcon from "../Icons/TipsIcon";
import LocationIcon from "../Icons/LocationIcon";

const t = getTranslation("component.Button");
interface ConfirmationModalProps {
  alertType?: "Success" | "Alert" | "Fail" | "customize";
  title: string;
  description?: string;
  confirmText: string;
  isLoading?: boolean;
  onConfirm: () => void;
  cancelText?: string;
  onCancel?: () => void;
  onClose?: () => void;
  isOpen: boolean;
  shouldRenderIcon?: boolean;
  verticalButtons?: boolean;
  customizeIcon?: JSX.Element;
}

export default function ConfirmationModal({
  alertType,
  title,
  description,
  confirmText,
  isLoading,
  onConfirm,
  cancelText,
  onCancel,
  onClose,
  isOpen,
  shouldRenderIcon = true,
  verticalButtons = false,
  customizeIcon,
}: ConfirmationModalProps) {
  const cancelRef = React.useRef();

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose || onCancel}
    >
      <AlertDialog.Content w="90%" p="defaultLayoutSpacing" borderRadius="3xl">
        {alertType === "customize" && shouldRenderIcon && customizeIcon && (
          <Center>{customizeIcon}</Center>
        )}
        {alertType === "Success" && shouldRenderIcon && (
          <Center>
            <Box
              w="12"
              h="12"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="rgba(5,194,140,0.15)"
            >
              <TipSuccessIcon />
            </Box>
          </Center>
        )}
        {alertType === "Fail" && shouldRenderIcon && (
          <Center>
            <Box
              w="12"
              h="12"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="rgba(231,16,16,0.15)"
            >
              <TipDialogIcon />
            </Box>
          </Center>
        )}

        {alertType === "Alert" && shouldRenderIcon && (
          <Center>
            <Circle
              mb={2}
              size={12}
              bg="rgba(5, 105, 225, 0.15)"
              alignItems="center"
              justifyContent="center"
            >
              <TipsIcon color="#0569FF" props={{ size: "lg" }} />
            </Circle>
          </Center>
        )}

        <AlertDialog.Body alignItems="center">
          <Heading fontSize="20" textAlign="center">
            {title}
          </Heading>
          {description ? (
            <Text mt="defaultLayoutSpacing" textAlign="center" fontSize="16">
              {description}
            </Text>
          ) : null}
        </AlertDialog.Body>
        {verticalButtons && (
          <VStack space={3}>
            <Button
              ref={cancelRef}
              isLoadingText={t("Loading")}
              isLoading={isLoading}
              variant="solid"
              onPress={() => {
                onConfirm();
              }}
            >
              {confirmText}
            </Button>
            {cancelText ? (
              <Button ref={cancelRef} variant="outline" onPress={onCancel}>
                {cancelText}
              </Button>
            ) : null}
          </VStack>
        )}
        {!verticalButtons && (
          <HStack space={3}>
            {cancelText ? (
              <Button
                flex={1}
                ref={cancelRef}
                variant="outline"
                onPress={onCancel}
              >
                {cancelText}
              </Button>
            ) : null}
            <Button
              flex={1}
              ref={cancelRef}
              isLoading={isLoading}
              isLoadingText={t("Loading")}
              variant="solid"
              onPress={() => {
                onConfirm();
              }}
            >
              {confirmText}
            </Button>
          </HStack>
        )}
      </AlertDialog.Content>
    </AlertDialog>
  );
}
