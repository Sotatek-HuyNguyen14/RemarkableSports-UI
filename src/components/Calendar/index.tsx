import React, { useMemo } from "react";
import { useTheme } from "native-base";
import {
  Calendar as RNCalendar,
  CalendarProps as RNCalendarProps,
} from "react-native-calendars";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";

import { CalendarResponse, formatId } from "../../models/responses/Calendar";
import { formatDateToCalendar } from "../../utils/date";
import LeftArrowIcon from "../Icons/LeftArrowIcon";
import RightArrowIcon from "../Icons/RightArrowIcon";

interface CalendarProps {
  selectedDate: string;
  meetupData: CalendarResponse[] | undefined;
  onPress: (val: string) => void;
  calendarProps?: RNCalendarProps;
  onMonthChange: (val: string) => void;
}

export default function Calendar({
  selectedDate,
  meetupData,
  onPress,
  calendarProps,
  onMonthChange,
}: CalendarProps) {
  const { colors } = useTheme();
  const currentDate = formatDateToCalendar(new Date());
  const activities = useMemo(() => {
    const res: { [key: string]: MarkingProps } = {};
    meetupData?.forEach((val) => {
      res[formatDateToCalendar(val.startTime)] = {
        marked: true,
        dots: [
          {
            key: formatId(val),
            color: colors.rs.primary_purple,
            selectedDotColor: colors.rs.primary_purple,
          },
        ],
      };
    });
    return res;
  }, [colors.rs.primary_purple, meetupData]);

  return (
    <RNCalendar
      initialDate={selectedDate}
      onMonthChange={(month) => {
        if (month.dateString !== selectedDate) {
          onMonthChange(month.dateString);
        }
      }}
      markingType="custom"
      theme={{
        textMonthFontWeight: "500",
        todayButtonFontWeight: "500",
        textDayHeaderFontWeight: "500",
        todayButtonFontSize: 14,
        textDayHeaderFontSize: 10,
        textMonthFontSize: 16,
        dayTextColor: colors.rs.black,
        textDefaultColor: colors.rs.black,
        selectedDayTextColor: colors.rs.black,
        // For date in other month
        todayTextColor: colors.rs.black,
        dotStyle: {
          width: 8,
          height: 8,
          borderRadius: 12,
          backgroundColor: colors.rs.primary_purple,
          color: colors.rs.primary_purple,
        },
        "stylesheet.calendar.main": {
          week: {
            marginVertical: 1.5,
            flexDirection: "row",
            justifyContent: "space-around",
          },
        },
        "stylesheet.calendar.header": {
          header: {
            flexDirection: "row",
            justifyContent: "center",
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: 6,
            alignItems: "center",
          },
          dayHeader: {
            // RNCalendar default values
            marginTop: 2,
            marginBottom: 7,
            width: 32,
            textAlign: "center",
            fontFamily: "System",
            // Figma values
            fontSize: 10,
            fontWeight: "700",
            color: colors.rs.black,
            letterSpacing: 1.5,
            lineHeight: 16,
            textTransform: "uppercase",
          },
          monthText: {
            fontSize: 16,
            fontFamily: "System",
            fontWeight: "400",
            color: colors.rs.black,
            margin: 10,
          },
        },
        "stylesheet.day.basic": {
          base: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          },
          text: {
            fontSize: 14,
            fontFamily: "System",
            fontWeight: "500",
            color: colors.rs.black,
            backgroundColor: "rgba(255, 255, 255, 0)",
          },
        },
        "stylesheet.dot": {
          dot: {
            width: 8,
            height: 8,
            position: "absolute",
            bottom: 4,
            // marginBottom: 4,
            marginHorizontal: 1,
            borderRadius: 16,
            opacity: 0,
          },
          visibleDot: {
            opacity: 1,
            backgroundColor: colors.rs.primary_purple,
          },
          selectedDot: {
            backgroundColor: colors.rs.primary_purple,
          },
          disabledDot: {
            backgroundColor: colors.rs.primary_purple,
          },
          inactiveDot: {
            backgroundColor: colors.rs.primary_purple,
          },
          todayDot: {
            backgroundColor: colors.rs.primary_purple,
          },
        },
      }}
      renderArrow={(direction) =>
        direction === "left" ? <LeftArrowIcon /> : <RightArrowIcon />
      }
      enableSwipeMonths
      onDayPress={(val) => onPress(val.dateString)}
      markedDates={{
        ...activities,
        [currentDate]: {
          marked: currentDate in activities,
          customStyles: {
            container: {
              borderRadius: 20,
              borderWidth: 1,
              width: 40,
              height: 40,
              borderColor: "rgba(102,206,225,1)",
            },
          },
        },
        [selectedDate]: {
          marked: meetupData?.reduce((prev, current) => {
            if (formatDateToCalendar(current.startTime) === selectedDate)
              return true;
            return prev;
          }, false),
          customStyles: {
            container: {
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(102,206,225,0.1)",
              backgroundColor: "rgba(102,206,225,0.1)",
              width: 40,
              height: 40,
            },
          },
        },
      }}
      {...calendarProps}
    />
  );
}
