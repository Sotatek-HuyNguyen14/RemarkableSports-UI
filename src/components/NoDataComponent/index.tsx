import { Avatar, Box, Heading, HStack, Modal, Text, VStack } from "native-base";
import React, { useState } from "react";
import { getTranslation } from "../../utils/translation";

const t = getTranslation("component.NoDataComponent");

export default function NoDataComponent({
  title,
  content,
  logoIcon,
}: {
  title?: string;
  content?: string;
  logoIcon?: JSX.Element;
}) {
  return (
    <VStack
      flex={1}
      p="defaultLayoutSpacing"
      pt="20"
      alignItems="center"
      space={2}
    >
      {logoIcon && logoIcon}
      {title && (
        <Heading fontSize={16} mt="2" textAlign="center">
          {title}
        </Heading>
      )}
      <Text px="defaultLayoutSpacing" textAlign="center">
        {content || t("No Data")}
      </Text>
    </VStack>
  );
}
