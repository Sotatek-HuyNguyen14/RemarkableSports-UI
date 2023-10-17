/* eslint-disable react/forbid-prop-types */
import React from "react";
import { ScaledSheet } from "react-native-size-matters";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { useTheme } from "native-base";
import Fonts from "../assets/font/fonts";

function AppButton(props) {
  const themes = useTheme();
  const { style, textStyle, isLightButton, text, onPress } = props;
  const buttonStyle = StyleSheet.flatten([
    {
      backgroundColor: themes.colors.rs.button_color,
    },
    style,
    styles.container,
  ]);

  const buttonLightStyle = StyleSheet.flatten([
    {
      backgroundColor: themes.colors.rs.button_light,
      borderColor: themes.colors.rs.button_color,
      borderWidth: 1,
    },
    style,
    styles.container,
  ]);

  const textButtonStyle = StyleSheet.flatten([
    {
      color: isLightButton
        ? themes.colors.rs.button_color
        : themes.colors.rs.button_light,
    },
    textStyle,
    styles.text,
  ]);

  return (
    <TouchableOpacity
      style={isLightButton ? buttonLightStyle : buttonStyle}
      onPress={onPress}
    >
      <Text style={textButtonStyle}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingVertical: "10@vs",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8@ms",
  },
  text: {
    fontFamily: Fonts.regular,
    fontWeight: "500",
    fontSize: "14@ms",
  },
});

AppButton.propTypes = {
  onPress: PropTypes.func,
  style: PropTypes.object,
  textStyle: PropTypes.object,
  isLightButton: PropTypes.bool,
  text: PropTypes.string,
};

AppButton.defaultProps = {
  onPress: () => {},
  style: {},
  textStyle: {},
  isLightButton: false,
  text: "button",
};

export default AppButton;
