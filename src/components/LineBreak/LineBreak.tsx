import React from "react";
import { View, ViewStyle } from "react-native";

function LineBreak({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: "#D0D5DD", ...style }]} />;
}

export default LineBreak;
