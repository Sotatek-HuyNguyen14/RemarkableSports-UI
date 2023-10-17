import React from "react";
import {
  HStack,
  Center,
  VStack,
  Heading,
  Text,
  Circle,
  Pressable,
} from "native-base";
import PlusIcon from "../Icons/PlusIcon";
import RightArrowIcon from "../Icons/RightArrowIcon";
import { isBlank } from "../../utils/strings";

export interface BannerButtonProps {
  headerLabel: string;
  description?: string;
  circleColor?: string;
  circleComponent?: JSX.Element;
  hasRightArrow?: boolean;
  onPress: () => void;
}

export default function BannerButton({
  headerLabel,
  description,
  circleColor = "rs.GPP_lightBlue",
  circleComponent = <PlusIcon size="xl" m="3" />,
  hasRightArrow = true,
  onPress = () => undefined,
}: BannerButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <HStack space="3" bgColor="#eee" p="3" alignItems="center">
        <Center>
          <Circle bgColor={circleColor}>{circleComponent}</Circle>
        </Center>
        <VStack flex="1" space="3" justifyContent="center">
          <Heading>{headerLabel}</Heading>
          {!isBlank(description) && <Text>{description}</Text>}
        </VStack>
        {hasRightArrow && <RightArrowIcon alignSelf="center" />}
      </HStack>
    </Pressable>
  );
}
