import React from "react";
import { Box, Heading, HStack, IBoxProps, Text, VStack } from "native-base";
import { string } from "prop-types";
import { Platform } from "react-native";

export interface TipsComponentProps {
  icon: React.ReactNode;
  title: string;
  body?: string;
  onPress?: () => void;
  submitText?: string;
  bg?: string;
  iconProps?: IBoxProps;
}
export default function TipsComponent({
  icon,
  title,
  body,
  onPress,
  submitText,
  bg,
  iconProps,
}: TipsComponentProps) {
  return (
    <HStack
      // alignItems="center"
      justifyContent="center"
      p="defaultLayoutSpacing"
      alignSelf="center"
      shadow={Platform.OS === "ios" ? "9" : null}
      style={{
        shadowOffset: {
          width: 5,
          height: 5,
        },
        shadowOpacity: 0.1,
      }}
      borderColor="rs.white"
      borderRadius="xl"
      borderWidth="1"
      bgColor={bg}
    >
      <Box
        w="6"
        h="6"
        alignItems="center"
        justifyContent="center"
        borderRadius="full"
        mr="defaultLayoutSpacing"
        {...iconProps}
      >
        {icon}
      </Box>
      <VStack flex={1}>
        <Heading fontSize="md">{title}</Heading>
        {body && <Text>{body}</Text>}
        {onPress && submitText && (
          <Text
            mt="2"
            fontSize={16}
            color="rs.primary_purple"
            onPress={() => {
              onPress();
            }}
          >
            {submitText}
          </Text>
        )}
      </VStack>
    </HStack>
  );
}
