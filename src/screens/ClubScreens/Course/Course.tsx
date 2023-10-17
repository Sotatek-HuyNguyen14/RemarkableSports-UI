import { observer } from "mobx-react";
import { Text, Image, Pressable } from "native-base";
import React from "react";
import { SafeAreaView, StyleProp, ViewStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Header from "../../../components/Header/Header";
import LeftArrowIcon from "../../../components/Icons/LeftArrowIcon";

type Props = {
  navigation;
};

@observer
class CourseScreen extends React.Component<Props> {
  render() {
    const { navigation } = this.props;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        >
          {/* Header */}
          <Header
            title="Course"
            headerLabelContainerStyle={{
              justifyContents: "center",
              alignItems: "center",
              marginBottom: 27,
            }}
            headerLabelStyle={{ fontWeight: "700", fontSize: 16 }}
            leftComponent={
              <Pressable
                onPress={() => {
                  navigation.goBack();
                }}
                style={{ color: "black" } as StyleProp<ViewStyle>}
              >
                <LeftArrowIcon />
              </Pressable>
            }
            rightComponent={
              <Pressable
                onPress={() => {
                  navigation.navigate("AddCourse");
                }}
                style={{ color: "black" } as StyleProp<ViewStyle>}
              >
                <Text style={{ fontWeight: "700", fontSize: 24 }}>+</Text>
              </Pressable>
            }
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

export default CourseScreen;
