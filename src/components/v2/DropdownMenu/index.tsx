import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Modal,
  Pressable,
  StyledProps,
  Switch,
  Text,
  useTheme,
  VStack,
  ScrollView,
  ArrowUpIcon,
  ArrowDownIcon,
} from "native-base";
import { View } from "react-native";
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { Calendar, LocaleConfig } from "react-native-calendars";
import CalendarIcon from "../../Icons/CalendarIcon";
import LeftArrowIcon from "../../Icons/LeftArrowIcon";
import RightArrowIcon from "../../Icons/RightArrowIcon";
import { formatDateToCalendar } from "../../../utils/date";
import i18n from "../../../language/index";
import { getTranslation } from "../../../utils/translation";
import DownArrowIcon from "../../Icons/DownArrowIcon";

const t = getTranslation("component.DropdownMenu");

interface DropdownMenuProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  controllerProps: UseControllerProps<TFieldValues, TName>;
  placeholder: string;
  itemView: (item: { label: string; value: any }, isSelected: boolean) => void;
  items: { label: string; value: any }[];
  onChangeValue?: (value: any) => void;
}

export default function DropdownMenu<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  controllerProps,
  placeholder,
  items,
  itemView,
  onChangeValue,
}: DropdownMenuProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
    fieldState: { error, isDirty },
    formState: { errors },
  } = useController({ ...controllerProps });

  const [isExpand, setExpand] = useState(false);

  const arrowComponent = isExpand ? (
    <DownArrowIcon size="sm" style={{ transform: [{ rotate: "180deg" }] }} />
  ) : (
    <DownArrowIcon size="sm" />
  );

  const selectedItem = items.filter((item) =>
    value ? item.value === value : false
  )[0];

  return (
    <View style={{ zIndex: 2 }}>
      <Pressable onPress={() => setExpand(!isExpand)}>
        <HStack
          alignItems="center"
          justifyContent="space-between"
          px="4"
          py="2.5"
          borderWidth="1.5"
          borderColor={error ? "rs_secondary.error" : "gray.300"}
          borderRadius="xl"
          bg="rs.white"
        >
          <VStack>
            <Text
              fontSize={selectedItem ? "xs" : "md"}
              color={selectedItem ? "gray.700" : "rs.black"}
            >
              {placeholder}
            </Text>
            {selectedItem && <Text fontSize="md">{selectedItem.label}</Text>}
          </VStack>

          {arrowComponent}
        </HStack>
      </Pressable>

      {error && (
        <Text px="2" mt="2" color="rs_secondary.error">
          {error.message}
        </Text>
      )}

      {/* Drop down items */}
      {isExpand && (
        <View
          style={{
            position: "absolute",
            top: 50,
            backgroundColor: "white",
            zIndex: 999,
            width: "100%",
          }}
        >
          <ScrollView
            p="4"
            h="180"
            showsVerticalScrollIndicator
            px="4"
            py="2.5"
            borderWidth="1.5"
            borderColor="gray.300"
            borderRadius="xl"
            mt="2"
          >
            <VStack space="4">
              {items.map((item) => {
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      onChange(item.value);
                      onChangeValue?.(item.value);
                      setExpand(false);
                    }}
                  >
                    {itemView(item, value ? item.value === value : false)}
                  </Pressable>
                );
              })}
            </VStack>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

/*
        <DropdownMenu
          controllerProps={{ control, name: "name" }}
          placeholder="Country"
          items={[
            {
              label: "United State",
              value: "united_state",
            },
            {
              label: "Viet nam",
              value: "viet_nam",
            }
          ]}
          itemView={(item, isSelected) => {
            return (
              <HStack justifyContent="space-between" alignitems="center">
                <Text>{item.label}</Text>
                {isSelected && <CheckIcon />}
              </HStack>
            );
          }}
        />
*/
