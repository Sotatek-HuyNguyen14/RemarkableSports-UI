import { parseISO } from "date-fns";
import { Box, HStack, Pressable, VStack, Text } from "native-base";
import React from "react";
import { CourseResponse } from "../../models/responses/Course";
import { getTranslation } from "../../utils/translation";
import CourseCard from "../Card/CourseCard";

export interface CourseListProps {
  courseList: CourseResponse[];
  onPressCourse?: (course: CourseResponse) => void;
  onEdit?: (course: CourseResponse) => void;
  onDelete?: (course: CourseResponse) => void;
  onRollCall?: (course: CourseResponse) => void;
  onManage?: (course: CourseResponse) => void;
}

const t = getTranslation(["component.CourseList", "constant.button"]);

export default function CourseList({
  courseList,
  onPressCourse,
  onEdit,
  onDelete,
  onRollCall,
  onManage,
}: CourseListProps) {
  return (
    <VStack space="4" mb="5">
      {courseList.map((item) => {
        const shouldShowEdit = onEdit;
        const shouldShowManage = onManage;

        return (
          <Pressable
            key={`${item.id}${item.district}`}
            onPress={() => {
              onPressCourse?.(item);
            }}
          >
            <CourseCard
              onPress={() => {
                onPressCourse?.(item);
              }}
              key={`${item.id}${item.district}`}
              course={item}
              footer={
                <HStack space={3}>
                  {shouldShowManage && (
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => {
                        onManage?.(item);
                      }}
                    >
                      <Box
                        bg="rs.primary_purple"
                        h="10"
                        flex={1}
                        borderRadius={16}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="md" textAlign="center" color="rs.white">
                          {t("Manage")}
                        </Text>
                      </Box>
                    </Pressable>
                  )}
                  {shouldShowEdit && (
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => {
                        onEdit?.(item);
                      }}
                    >
                      <Box
                        bg="rs.white"
                        h="10"
                        flex={1}
                        borderWidth={0.5}
                        borderColor="rs.primary_purple"
                        borderRadius={16}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize="md"
                          textAlign="center"
                          color="rs.primary_purple"
                        >
                          {t("Edit")}
                        </Text>
                      </Box>
                    </Pressable>
                  )}
                </HStack>
              }
            />
          </Pressable>
        );
      })}
    </VStack>
  );
}
