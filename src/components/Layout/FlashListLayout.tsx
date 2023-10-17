import { useNavigation } from "@react-navigation/native";
import { Pressable, useTheme } from "native-base";
import React, { PropsWithChildren, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  StyleProp,
  ViewStyle,
  Platform,
  BackHandler,
  Keyboard,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  KeyboardAwareFlatList,
  KeyboardAwareFlatListProps,
} from "react-native-keyboard-aware-scroll-view";
import { FlashList, FlashListProps } from "@shopify/flash-list";
import Header, { Props as HeaderProps } from "../Header/Header";
import HeaderLayout from "./HeaderLayout";

interface FlashListLayoutProps {
  headerProps?: HeaderProps;
  containerProps?: StyleProp<ViewStyle>;
  flashListProps?: FlashListProps<any>;
  isSticky?: boolean;
  boxProps?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  supportPullToRefresh?: boolean;
  refreshing: boolean;
  onRefresh?: () => void;
  alternativeView?: JSX.Element;
}

export default function FlashListLayout({
  headerProps,
  flashListProps,
  isSticky = false,
  boxProps,
  supportPullToRefresh,
  refreshing = false,
  onRefresh,
  alternativeView,
}: PropsWithChildren<FlashListLayoutProps>): JSX.Element {
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

  const onRefreshData = React.useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

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

  if (alternativeView) {
    return (
      <HeaderLayout headerProps={headerProps}>{alternativeView}</HeaderLayout>
    );
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginBottom: 10,
      }}
      {...(boxProps as object)}
    >
      {isSticky ? headerComponent : undefined}
      <FlashList
        data={flashListProps?.data}
        renderItem={flashListProps?.renderItem}
        estimatedItemSize={200}
        keyExtractor={flashListProps?.keyExtractor}
        ListHeaderComponent={flashListProps?.ListHeaderComponent}
        ListEmptyComponent={flashListProps?.ListEmptyComponent}
        extraData={flashListProps?.extraData}
        showsVerticalScrollIndicator={false}
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
      />
    </SafeAreaView>
  );
}
