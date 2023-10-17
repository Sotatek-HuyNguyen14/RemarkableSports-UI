import Modal from "react-native-modal";
import { Button, Divider, HStack, IconButton, Text, View } from "native-base";
import React, { PropsWithChildren } from "react";
import CrossIcon from "../Icons/CrossIcon";

export interface PickerModalProps {
  isOpen: boolean;
  headerLabel: string;
  hasButton?: boolean;
  buttonLabel?: string;
  onClose: () => void;
  onButtonPress?: () => void;
}

function PickerModal({
  isOpen,
  headerLabel,
  children,
  hasButton,
  buttonLabel,
  onClose,
  onButtonPress,
}: PropsWithChildren<PickerModalProps>) {
  return (
    <Modal
      style={{
        justifyContent: "flex-end",
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
      }}
      isVisible={isOpen}
      backdropColor="#000000"
      backdropOpacity={0.6}
      onBackdropPress={onClose}
    >
      <View bgColor="rs.white" borderTopRadius="8">
        <HStack m="4" justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold">
            {headerLabel}
          </Text>
          <IconButton size="sm" onPress={onClose} icon={<CrossIcon />} />
        </HStack>
        <Divider />
        <View flexDir="row">{children}</View>
        {hasButton && (
          <Button m="3" mb="6" onPress={onButtonPress}>
            {buttonLabel}
          </Button>
        )}
      </View>
    </Modal>
  );
}

export default PickerModal;
