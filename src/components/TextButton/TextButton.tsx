import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Fonts from "../../assets/font/fonts";

interface Props {
  label?: string;
  labelStyle?: {};
  buttonContainerStyle?: {};
  onPress?: () => void;
  isApiCalling?: boolean;
  disabled?: boolean;
}

function TextButton({
  label,
  labelStyle,
  buttonContainerStyle,
  onPress,
  isApiCalling = false,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.container, buttonContainerStyle]}
      onPress={onPress}
    >
      {isApiCalling === false ? (
        <Text style={[styles.textStyle, labelStyle]}>{label}</Text>
      ) : (
        <ActivityIndicator size="small" color="white" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    color: "#fff",
    fontWeight: "700",
    lineHeight: 21,
    fontSize: 18,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#31095E",
    padding: 16,
    borderRadius: 16,
  },
});
export default TextButton;
