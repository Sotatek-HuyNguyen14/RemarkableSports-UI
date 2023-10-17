/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-props-no-spreading */

import { inject, observer } from "mobx-react";
import React from "react";
import { Text, Pressable, HStack } from "native-base";
import MeetCoachCell from "./MeetCoachCell";
import MeetCoachViewModel from "./MeetCoachViewModel";
import RouteName from "../../routers/RouteName";
import HeaderLayout from "../../components/Layout/HeaderLayout";

type Props = {
  navigation: any;
  route: any;
};

const viewModel = new MeetCoachViewModel();

function MeetCoach({ navigation, route }: Props) {
  const onPressSection = (tappedSection: any) => {
    viewModel.setSections(
      viewModel.sections.map((section) => {
        if (section.value === tappedSection.value) {
          section.isActive = true;
        } else {
          section.isActive = false;
        }
        return section;
      })
    );
  };

  const renderCoachList = () => {
    return viewModel.coachLists.map((coach, index) => {
      return (
        <MeetCoachCell
          onPressCell={() => {
            navigation.navigate(RouteName.REQUEST_DETAILS, { route });
          }}
          coach={coach}
        />
      );
    });
  };

  const renderSections = () => {
    return (
      <HStack style={{ marginTop: 16 }}>
        {viewModel.sections.map((section, index) => {
          const fontWeight = section.isActive ? "700" : null;
          const marginLeft = index !== 0 ? "4" : null;
          const color = section.isActive ? "#000000" : "#D9D9D9";
          return (
            <Pressable
              key={`home_screen_section_${section.value}`}
              ml={marginLeft}
              onPress={() => onPressSection(section)}
            >
              <Text fontSize="xl" fontWeight={fontWeight} color={color}>
                {section.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    );
  };

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: "Meet coach",
        onPress: () => {
          navigation?.goBack();
        },
      }}
    >
      {renderSections()}
      {renderCoachList()}
    </HeaderLayout>
  );
}

export default inject("store")(observer(MeetCoach));
