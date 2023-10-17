import React from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  StyledProps,
  Switch,
  Text,
  useTheme,
} from "native-base";
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

interface FormSwitchProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  title: string;
  isDisabledSwitch?: boolean;
  onText?: string;
  offText?: string;
  controllerProps: UseControllerProps<TFieldValues, TName>;
  stylesProps?: StyledProps;
  shouldTwoSideLabel?: boolean;
  styleForm?: "style1" | "style2";
  isTitleHeading?: boolean;
}

export default function FormSwitch<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  title,
  controllerProps,
  isDisabledSwitch,
  onText,
  offText,
  stylesProps,
  shouldTwoSideLabel = false,
  isTitleHeading = true,
  styleForm = "style1",
}: FormSwitchProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
  } = useController({ ...controllerProps });
  const themes = useTheme();

  return (
    <Box {...stylesProps}>
      <HStack
        justifyContent="space-between"
        alignItems="center"
        height={styleForm === "style1" ? "16" : null}
      >
        <Heading
          fontSize={styleForm === "style1" ? "20" : "16"}
          maxW="80%"
          isTruncated
          fontWeight={
            styleForm === "style1" || isTitleHeading ? "bold" : "normal"
          }
        >
          {title}
        </Heading>
        {/* {shouldTwoSideLabel ? twoLabelsContent() : oneLabelContent()} */}
        {styleForm === "style1" && (
          <Flex flexDirection="row" alignItems="center">
            <Switch
              size="sm"
              trackColor={{ true: themes.colors.rs.primary_purple }}
              disabled={isDisabledSwitch}
              isChecked={value}
              onToggle={() => {
                onChange(!value);
              }}
            />
            <Text ml="1" fontSize="20">
              {value ? onText : offText}
            </Text>
          </Flex>
        )}
        {styleForm === "style2" && (
          <Flex flexDirection="row" alignItems="center">
            <Text ml="1" fontSize="16">
              {onText}
            </Text>
            <Switch
              size="sm"
              trackColor={{ true: themes.colors.rs.primary_purple }}
              disabled={isDisabledSwitch}
              isChecked={value}
              onToggle={() => {
                onChange(!value);
              }}
            />
            <Text ml="1" fontSize="16">
              {offText}
            </Text>
          </Flex>
        )}
      </HStack>
    </Box>
  );
}
