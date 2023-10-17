import { useNavigation } from "@react-navigation/native";
import { Box, Pressable, useTheme } from "native-base";
import React, { PropsWithChildren, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  StyleProp,
  ViewStyle,
  Platform,
  BackHandler,
  Keyboard,
  RefreshControl,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps as KeyboardProps,
} from "react-native-keyboard-aware-scroll-view";
import { APP_SCROLL_VIEW_TEST_ID } from "../../../e2e/helpers";
import Header, { Props as HeaderProps } from "../Header/Header";

interface HeaderLayoutProps {
  headerProps?: HeaderProps;
  containerProps?: StyleProp<ViewStyle>;
  KeyboardAwareScrollViewProps?: KeyboardProps;
  isSticky?: boolean;
  boxProps?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  supportPullToRefresh?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function HeaderLayout({
  children,
  headerProps,
  containerProps,
  KeyboardAwareScrollViewProps,
  isSticky = false,
  boxProps,
  scrollEnabled = true,
  supportPullToRefresh = false,
  onRefresh,
  refreshing = false,
}: PropsWithChildren<HeaderLayoutProps>): JSX.Element {
  const { space } = useTheme();
  const navigation = useNavigation();
  const headerComponent = (
    <Pressable
      _pressed={{
        opacity: 1,
      }}
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <Header
        containerStyle={{ marginHorizontal: space.defaultLayoutSpacing }}
        headerLabelStyle={{ fontWeight: "700", fontSize: 16 }}
        {...headerProps}
      />
    </Pressable>
  );

  const onAndroidBack = useCallback(() => {
    // if there is no back key then Intercepts the Android physical return key
    if (headerProps?.hasBackButton !== false) {
      if (headerProps?.onBack) {
        headerProps?.onBack();
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
    return true;
  }, [headerProps, navigation]);

  useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", onAndroidBack);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onAndroidBack);
    }
  }, [onAndroidBack]);

  const contentView = () => {
    return (
      <Box flex="1" style={{ ...(containerProps as object) }}>
        {children}
      </Box>
    );
  };

  const onRefreshData = React.useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginBottom: 10,
      }}
      {...(boxProps as object)}
    >
      {isSticky ? headerComponent : undefined}
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        refreshControl={
          supportPullToRefresh ? (
            <RefreshControl
              colors={["transparent"]}
              style={{ backgroundColor: "transparent" }}
              progressBackgroundColor="transparent"
              refreshing={refreshing}
              onRefresh={onRefreshData}
              tintColor="#FFFFFF"
            />
          ) : null
        }
        keyboardShouldPersistTaps="never"
        {...KeyboardAwareScrollViewProps}
        scrollEnabled={scrollEnabled}
        testID={APP_SCROLL_VIEW_TEST_ID}
      >
        {!isSticky ? headerComponent : undefined}
        {contentView()}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
