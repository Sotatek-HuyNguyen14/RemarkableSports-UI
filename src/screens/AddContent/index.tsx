import React from "react";
import {
  VStack,
  useTheme,
  Heading,
  Text,
  Button,
  Toast,
  Pressable,
} from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isAfter, isToday, isFuture, parseISO } from "date-fns";

import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import FormInput from "../../components/FormInput/FormInput";
import RectangleImagePicker from "../../components/ImagePicker/RectangleImagePicker";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { addPostContent } from "../../services/ContentServices";
import { useAuth } from "../../hooks/UseAuth";
import { CreateContentRequest } from "../../models/requests/Content";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import ThreeColumnPickerModal from "../../components/Modal/ThreeColumnPickerModal";
import { dateList, monthList, yearList } from "../../constants/Time";
import { showApiToastError } from "../../components/ApiToastError";
import { getYoutubeId, isYoutube } from "../../utils/strings";

export type AddContentProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "AddContent"
>;

const t = getTranslation(["screen.Content", "constant.button", "validation"]);
const CREATE_SUCCESSFUL_TOAST = "createSuccessful";

export default function AddContent({ navigation, route }: AddContentProps) {
  const theme = useTheme();
  const eventId = route.params?.eventId;
  const { user } = useAuth();
  const today = new Date();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    trigger,
  } = useForm<CreateContentRequest>({
    mode: "onChange",
  });
  const [isOpen, setIsOpen] = React.useState({
    durationFrom: false,
    durationTo: false,
  });
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");
  const videoLink = watch("ytbUrl");

  React.useEffect(() => {
    if (fromDate && toDate) {
      trigger("fromDate");
      trigger("toDate");
    }
  }, [fromDate, toDate, trigger]);

  const processSubmit = async (formValue: CreateContentRequest) => {
    let formatValue = formValue;
    if (eventId) {
      formatValue = { ...formValue, resourceId: eventId, linkage: "Event" };
    }

    try {
      await addPostContent(formatValue);
      if (!Toast.isActive(CREATE_SUCCESSFUL_TOAST)) {
        Toast.show({
          id: CREATE_SUCCESSFUL_TOAST,
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Created")}
                body={t("Created  successfully")}
              />
            );
          },
        });
      }
      if (eventId) {
        navigation.navigate("AddEventSuccessful", { eventId });
      } else if (navigation.canGoBack()) navigation.goBack();
    } catch (error: any) {
      console.log("content_error", error);
      showApiToastError(error);
    }
  };

  return (
    <HeaderLayout
      containerProps={{ padding: theme.space.defaultLayoutSpacing }}
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Create content"),
        containerStyle: {
          marginHorizontal: 0,
        },
        hasBackButton: !eventId,
        rightComponent: eventId && (
          <Pressable
            onPress={() => {
              navigation.navigate("AddEventSuccessful", { eventId });
            }}
          >
            <Text mr="2" fontSize="md" color="rs.primary_purple">
              {t("Skip")}
            </Text>
          </Pressable>
        ),
      }}
      isSticky
    >
      <VStack space="4" flex="1">
        <Heading>{t("Content Name")}*</Heading>
        <FormInput
          label={t("Name")}
          inputProps={{
            multiline: true,
            maxLength: 50,
          }}
          isShowWords
          controllerProps={{
            name: "title",
            control,
            rules: { required: `${t("Title")} ${t("is required")}` },
          }}
        />
        <Heading>{t("Description")}*</Heading>
        <FormInput
          label={t("Description")}
          inputProps={{
            multiline: true,
            maxLength: 1000,
            blurOnSubmit: false,
          }}
          isShowWords
          controllerProps={{
            name: "content",
            control,
            rules: { required: `${t("Description")} ${t("is required")}` },
          }}
        />
        <Heading>{t("Video Link")}</Heading>
        <Text fontSize="sm" color="rs_secondary.grey">
          {t("Only support YouTube URL")}
        </Text>
        <FormInput
          label={t("Video Link")}
          inputProps={{ multiline: true, maxLength: 100 }}
          isShowWords
          controllerProps={{
            name: "ytbUrl",
            control,
            rules: {
              required: videoLink ? t("Only support YouTube URL") : "",
              validate: {
                isValid: (v) => {
                  return (
                    !v || !!getYoutubeId(v) || t("Only support YouTube URL")
                  );
                },
              },
            },
          }}
        />
        <Heading>{t("Image")}</Heading>
        <Text fontSize="sm" color="rs_secondary.grey">
          {t("Image must be less than 5MB")}
        </Text>
        <RectangleImagePicker
          placeholderText={t("Add Image")}
          manipulateSaveOptions={{ base64: false }}
          controllerProps={{
            name: "contentImage",
            control,
          }}
          imageProps={{
            width: "100%",
            height: 223,
          }}
        />
        <Button
          mt="auto"
          isDisabled={!isValid}
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit(processSubmit)}
        >
          {t("Create")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
