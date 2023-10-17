import React from "react";
import { Box, IconButton } from "native-base";
import { View, Text, ViewStyle, StyleProp, TextStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LeftArrowIcon from "../Icons/LeftArrowIcon";

export interface Props {
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
  hasBackButton?: boolean;
  leftComponent?: JSX.Element | JSX.Element[];
  rightComponent?: JSX.Element | JSX.Element[];
  headerLabelStyle?: StyleProp<TextStyle>;
  headerLabelContainerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  shouldRenderBackBtn?: boolean;
  onBack?: () => void;
}

function Header({
  title,
  containerStyle,
  hasBackButton = true,
  leftComponent,
  rightComponent,
  headerLabelStyle,
  headerLabelContainerStyle,
  onPress,
  onBack,
}: Props) {
  const navigation = useNavigation();
  return (
    <View
      style={{
        marginBottom: 10,
        marginTop: 10,
        position: "relative",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 40,
        ...(containerStyle as object),
      }}
    >
      {/* Left */}
      <Box
        w="10"
        position="relative"
        justifyContent="center"
        alignItems="center"
        zIndex="1"
      >
        {hasBackButton && navigation.canGoBack() && (
          <IconButton
            onPress={() => {
              if (onBack) {
                onBack();
              } else {
                navigation.goBack();
              }
            }}
            icon={<LeftArrowIcon />}
          />
        )}
      </Box>
      {/* Title */}
      <Box
        position="absolute"
        left="0"
        w="full"
        pt="2"
        justifyContent="center"
        alignItems="center"
        style={[headerLabelContainerStyle]}
      >
        <Text style={[{ fontWeight: "bold" }, headerLabelStyle]}>{title}</Text>
      </Box>

      {/* Right */}
      {rightComponent !== null && rightComponent}
    </View>
  );
}

export default Header;
