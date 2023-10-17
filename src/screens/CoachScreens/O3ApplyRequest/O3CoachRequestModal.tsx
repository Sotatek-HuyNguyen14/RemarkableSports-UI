import { VStack } from "native-base";
import { StyleSheet } from "react-native";
import Modal from "react-native-modal";
import React from "react";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../constants/constants";

export default function O3CoachRequestModal({
  header,
  body,
  footer,
  isMeetUpModalVisible,
  onBackdropPress,
}: {
  header: JSX.Element;
  body: JSX.Element;
  footer: JSX.Element;
  isMeetUpModalVisible: boolean;
  onBackdropPress: () => void;
}) {
  return (
    <Modal
      style={styles.modalContainer}
      isVisible={isMeetUpModalVisible}
      hasBackdrop
      backdropColor="#000000"
      backdropOpacity={0.3}
      onBackdropPress={() => {
        if (onBackdropPress) {
          onBackdropPress();
        }
      }}
    >
      <VStack style={styles.modalContentContainer}>
        {header}
        {body}
        {footer}
      </VStack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { justifyContent: "center", alignItems: "center" },
  modalContentContainer: {
    backgroundColor: "white",
    padding: 16,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.3,
    borderRadius: 16,
    alignItems: "center",
  },
});
