import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Box, Center, Text, View, Pressable, useTheme } from "native-base";

function TabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const { space } = useTheme();
  return (
    <View
      style={{
        flexDirection: "column",
        backgroundColor: "white",
        height: "12%",
        paddingBottom: space.defaultLayoutSpacing,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "#D0D5DD",
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel;

          const { tabBarIcon } = options;

          // Only available for visible button, button in Meetup button won't have access
          const isFocused = state.index === index;

          // Render nothing for hidden icon screens
          if (!label) return null;

          if (label === "Meetup") {
            return (
              <Box
                display="flex"
                flex="1"
                key={route.key}
                marginTop="-16"
                zIndex="1"
              >
                {tabBarIcon?.({
                  focused: isFocused,
                  color: "",
                  size: 0,
                })}
              </Box>
            );
          }

          return (
            <Box display="flex" flex="1" h="full" key={route.key}>
              <Pressable
                onPress={() => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented)
                    // The `merge: true` option makes sure that the params inside the tab screen are preserved
                    navigation.navigate(route.name, { merge: true });
                }}
                onLongPress={() => {
                  navigation.emit({
                    type: "tabLongPress",
                    target: route.key,
                  });
                }}
              >
                <Center w="full" h="full">
                  {tabBarIcon?.({
                    focused: isFocused,
                    color: "",
                    size: 0,
                  })}
                  <Text color="rs.black" fontSize="11" mt="1.5">
                    {label}
                  </Text>
                </Center>
              </Pressable>
            </Box>
          );
        })}
      </View>
    </View>
  );
}

export default TabBar;
