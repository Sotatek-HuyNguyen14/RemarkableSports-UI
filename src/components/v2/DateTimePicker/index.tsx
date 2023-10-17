import React, { useState } from "react";
import {
  Box,
  Button,
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
} from "native-base";
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

const t = getTranslation(["component.DateTimePicker", "constant.button"]);

LocaleConfig.locales.en = {
  dayNamesShort: [
    t("Sun"),
    t("Mon"),
    t("Tue"),
    t("Wed"),
    t("Thu"),
    t("Fri"),
    t("Sat"),
  ],
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  today: "Aujourd'hui",
};

LocaleConfig.defaultLocale = "en";

export const monthData = [
  {
    label: "Jan",
    value: "01",
  },
  {
    label: "Feb",
    value: "02",
  },
  {
    label: "Mar",
    value: "03",
  },
  {
    label: "Apr",
    value: "04",
  },
  {
    label: "May",
    value: "05",
  },
  {
    label: "Jun",
    value: "06",
  },
  {
    label: "Jul",
    value: "07",
  },
  {
    label: "Aug",
    value: "08",
  },
  {
    label: "Sep",
    value: "09",
  },
  {
    label: "Oct",
    value: "10",
  },
  {
    label: "Nov",
    value: "11",
  },
  {
    label: "Dec",
    value: "12",
  },
];

interface DateTimePickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  mode: "date" | "time" | "datetime";
  controllerProps: UseControllerProps<TFieldValues, TName>;
  isShow: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onChangeValue?: (value: string) => void;
  defaultDate?: string;
  onDefaultDate?: (value: string) => void;
  onCloseWithValue?: (value: string) => void;
}

export default function DateTimePicker<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  controllerProps,
  mode,
  isShow,
  onClose,
  title,
  description,
  defaultDate,
  onChangeValue,
  onDefaultDate,
  onCloseWithValue,
}: DateTimePickerProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
    fieldState: { error, isDirty },
    formState: { errors },
  } = useController({ ...controllerProps });

  const { colors } = useTheme();
  const [calendarShow, setCalendarShow] = useState(false);
  const [monthPickerShow, setMonthPickerShow] = useState(false);
  const [yearPickerShow, setYearPickerShow] = useState(false);
  const localDate = [{ label: value, tail: "localDate" }];

  const datePicker = () => {
    return (
      <Pressable
        mt="4"
        onPress={() => {
          setCalendarShow(true);
        }}
      >
        <HStack
          space="3"
          px="4"
          py="2.5"
          alignItems="center"
          borderWidth="1.5"
          borderColor={error ? "rs_secondary.error" : "gray.300"}
          borderRadius="xl"
        >
          <CalendarIcon />
          <VStack>
            <Text fontWeight="medium" color="gray.500">
              {t("Date")}
            </Text>
            <Text fontWeight="bold" fontSize="md">
              {`${new Date(selectedDate).toLocaleString(i18n.currentLocale(), {
                month: "long",
              })} ${new Date(selectedDate).getDate()}, ${new Date(
                selectedDate
              ).getFullYear()}`}
            </Text>
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  const timePicker = () => {};

  const pickerContent = () => {
    return (
      <Modal.Content>
        <Modal.Header
          pt="4"
          borderBottomWidth="1"
          _text={{
            fontSize: "lg",
          }}
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          {title && (
            <HStack space="2" alignItems="center">
              <HStack borderRadius="sm" w="4" h="10" bg="purple.300" />
              <Text fontSize="lg" fontWeight="bold">
                {title}
              </Text>
            </HStack>
          )}
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <VStack space="2">
            {description && (
              <Text fontSize="sm" color="gray.700">
                {description}
              </Text>
            )}
            {(mode === "date" || mode === "datetime") && datePicker()}
            {(mode === "time" || mode === "datetime") && timePicker()}
          </VStack>
        </Modal.Body>
      </Modal.Content>
    );
  };

  const selectedDate = value || formatDateToCalendar(new Date());
  const initDate = formatDateToCalendar(new Date());
  const currentYearNumber = parseInt(initDate.split("-")[0], 10);
  const [minYearData, setMinYearData] = useState(currentYearNumber - 6);
  const [maxYearData, setMaxYearData] = useState(currentYearNumber + 5);
  const yearData: { label: string; value: string }[] = [];

  for (let i = minYearData; i <= maxYearData; i += 1) {
    yearData.push({ label: i.toString(), value: i.toString() });
  }

  const daysInMonth = (month: string, year: string) => {
    return new Date(year, month, 0).getDate();
  };

  const validateDate = (date: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(new Date(date).getTime())) {
      // Date is not valid
      const month = date.split("-")[1];
      const year = date.split("-")[0];
      const numberOfDays = daysInMonth(month, year);
      const newDate = `${year}-${month}-${numberOfDays}`;
      onChange(newDate);
      onChangeValue?.(newDate);
    } else {
      onChange(date);
      onChangeValue?.(date);
    }
  };

  const monthPicker = () => {
    const currentMonth = selectedDate.split("-")[1];

    return (
      <VStack mt="3" space="3" w="100%" alignItems="center">
        <HStack
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          px="6"
        >
          <Pressable
            onPress={() => {
              // Minus year
              const currentYear = selectedDate.split("-")[0];
              const prevYear = parseInt(currentYear, 10) - 1;
              const day = selectedDate.split("-")[2];
              const month = selectedDate.split("-")[1];
              const newDate = `${prevYear}-${month}-${day}`;
              validateDate(newDate);
            }}
          >
            <LeftArrowIcon />
          </Pressable>
          <Pressable
            onPress={() => {
              setYearPickerShow(true);
            }}
            bgColor="rs.white"
            shadow="9"
            borderRadius="md"
            style={{
              shadowOffset: {
                width: 5,
                height: 5,
              },
              shadowOpacity: 0.1,
            }}
            px="2"
            py="2"
          >
            <Text fontWeight="bold">{selectedDate.split("-")[0]}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              // Increase one year
              const currentYear = selectedDate.split("-")[0];
              const nextYear = parseInt(currentYear, 10) + 1;
              const day = selectedDate.split("-")[2];
              const month = selectedDate.split("-")[1];
              const newDate = `${nextYear}-${month}-${day}`;
              validateDate(newDate);
            }}
          >
            <RightArrowIcon />
          </Pressable>
        </HStack>
        <HStack width="100%" flexWrap="wrap" justifyContent="center">
          {monthData.map((month) => {
            const isSelected = currentMonth === month.value;
            return (
              <Pressable
                key={`month_item_${month.label}`}
                bg={isSelected ? "rs.primary_purple" : "rs.white"}
                borderRadius="md"
                m="2"
                width="25%"
                p="4"
                justifyContent="center"
                alignItems="center"
                onPress={() => {
                  const day = selectedDate.split("-")[2];
                  const year = selectedDate.split("-")[0];
                  const newDate = `${year}-${month.value}-${day}`;
                  validateDate(newDate);
                  setMonthPickerShow(false);
                }}
              >
                <Text
                  fontWeight={isSelected ? "bold" : "normal"}
                  color={isSelected ? "rs.white" : "rs.black"}
                >
                  {t(month.label)}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </VStack>
    );
  };

  const yearPicker = () => {
    return (
      <VStack mt="3" space="3" w="100%" alignItems="center">
        <HStack
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          px="6"
        >
          <Pressable
            onPress={() => {
              // Minus year data to 12
              setMinYearData(minYearData - 12);
              setMaxYearData(maxYearData - 12);
            }}
          >
            <LeftArrowIcon />
          </Pressable>
          <Pressable
            onPress={() => {
              setYearPickerShow(true);
            }}
          >
            <Text fontWeight="bold">{`${minYearData} - ${maxYearData}`}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              // Increase year data to 12
              setMinYearData(minYearData + 12);
              setMaxYearData(maxYearData + 12);
            }}
          >
            <RightArrowIcon />
          </Pressable>
        </HStack>
        <HStack width="100%" flexWrap="wrap" justifyContent="center">
          {yearData.map((year) => {
            const isSelected = selectedDate.split("-")[0] === year.value;
            return (
              <Pressable
                key={`year_item_${year.label}`}
                bg={isSelected ? "rs.primary_purple" : "rs.white"}
                borderRadius="md"
                m="2"
                width="25%"
                p="4"
                justifyContent="center"
                alignItems="center"
                onPress={() => {
                  const day = selectedDate.split("-")[2];
                  const month = selectedDate.split("-")[1];
                  const newDate = `${year.value}-${month}-${day}`;
                  validateDate(newDate);
                  setYearPickerShow(false);
                }}
              >
                <Text
                  fontWeight={isSelected ? "bold" : "normal"}
                  color={isSelected ? "rs.white" : "rs.black"}
                >
                  {year.label}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </VStack>
    );
  };

  const picker = () => {
    if (monthPickerShow) {
      return monthPicker();
    }

    if (yearPickerShow) {
      return yearPicker();
    }

    return (
      <Calendar
        initialDate={selectedDate}
        markingType="custom"
        markedDates={{
          [selectedDate]: {
            textColor: colors.rs.white,
            customStyles: {
              container: {
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.rs.primary_purple,
                backgroundColor: colors.rs.primary_purple,
                width: 35,
                height: 35,
              },
              text: {
                color: colors.rs.white,
              },
            },
          },
          [formatDateToCalendar(new Date())]: {
            textColor: colors.rs.primary_purple,
            customStyles: {
              container: {
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.rs.primary_purple,
                backgroundColor: colors.rs.white,
                width: 35,
                height: 35,
              },
              text: {
                color: colors.rs.primary_purple,
              },
            },
          },
        }}
        onDayPress={(day) => {
          if (day.dateString !== value) {
            onChange(day.dateString);
            onChangeValue?.(day.dateString);
            setCalendarShow(false);
          } else {
            onChange("");
            onChangeValue?.("");
            setCalendarShow(false);
          }
        }}
        // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
        monthFormat="yyyy MM"
        onPressArrowLeft={(subtractMonth) => subtractMonth()}
        // Handler which gets executed when press arrow icon right. It receive a callback can go next month
        onPressArrowRight={(addMonth) => addMonth()}
        theme={{
          textDayFontWeight: "bold",
          textDayFontSize: 14,
        }}
        renderArrow={(direction) =>
          direction === "left" ? <LeftArrowIcon /> : <RightArrowIcon />
        }
        renderHeader={(date) => {
          const monthLabel = monthData[new Date(date).getMonth()].label;
          return (
            <HStack space="2">
              <Pressable
                onPress={() => {
                  setMonthPickerShow(true);
                }}
                bgColor="rs.white"
                shadow="9"
                borderRadius="md"
                style={{
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 0.1,
                }}
                px="2"
                py="2"
              >
                <Text fontWeight="bold">{t(monthLabel)}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setYearPickerShow(true);
                }}
                bgColor="rs.white"
                shadow="9"
                borderRadius="md"
                style={{
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 0.1,
                }}
                px="2"
                py="2"
              >
                <Text fontWeight="bold">{`${new Date(
                  date
                ).getFullYear()}`}</Text>
              </Pressable>
            </HStack>
          );
        }}
      />
    );
  };

  const calendarContent = () => {
    return (
      <Modal.Content bg="rs.white" flex="1" w="100%" p="2" mt="auto">
        <Modal.Header
          bg="rs.white"
          pt="4"
          borderBottomWidth="1"
          _text={{
            fontSize: "lg",
          }}
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          {title && (
            <HStack space="2" alignItems="center">
              <Text fontSize="lg" fontWeight="bold">
                {title}
              </Text>
            </HStack>
          )}
          <Modal.CloseButton />
        </Modal.Header>
        <VStack space="3" mt="3" bg="rs.white">
          {picker()}
        </VStack>
        <Button
          onPress={() => {
            onClose();
            onCloseWithValue?.(selectedDate);
            onChange(selectedDate);
            onDefaultDate?.(selectedDate);
            cleanUpState();
          }}
          mt="auto"
          mb="4"
        >
          {t("Save")}
        </Button>
      </Modal.Content>
    );
  };

  const cleanUpState = () => {
    setCalendarShow(false);
    setMonthPickerShow(false);
    setYearPickerShow(false);
  };

  return (
    <Modal
      isOpen={isShow}
      onClose={() => {
        onClose();
        onChange(defaultDate);
        cleanUpState();
      }}
    >
      {calendarContent()}
    </Modal>
  );
}

/* Usage:
        <DateTimePicker
            description="Choose a date and time in the future you want your product to be published"
            title="Reschedule product"
            isShow={show}
            mode="date"
            controllerProps={{ name: "date", control }}
            onClose={() => {
              setShow(false);
            }}
          />
*/
