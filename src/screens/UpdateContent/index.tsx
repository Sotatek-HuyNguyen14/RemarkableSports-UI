import React from "react";
import {
  VStack,
  useTheme,
  Heading,
  Text,
  Button,
  Toast,
  IconButton,
} from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isAfter, isFuture, isToday, parseISO } from "date-fns";

import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import FormInput from "../../components/FormInput/FormInput";
import RectangleImagePicker from "../../components/ImagePicker/RectangleImagePicker";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import {
  deletePostContent,
  editPostContent,
} from "../../services/ContentServices";
import { useAuth } from "../../hooks/UseAuth";
import { CreateContentRequest } from "../../models/requests/Content";
import { ContentResponse } from "../../models/responses/Content";
import TrashIcon from "../../components/Icons/TrashIcon";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { Role, UserType } from "../../models/User";
import { formatFileUrl } from "../../services/ServiceUtil";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import ThreeColumnPickerModal from "../../components/Modal/ThreeColumnPickerModal";
import { dateList, monthList, yearList } from "../../constants/Time";
import { formatUtcToLocalDate } from "../../utils/date";
import { showApiToastError } from "../../components/ApiToastError";
import { isYoutube } from "../../utils/strings";

export type NativeStackProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "UpdateContent"
>;

interface AddContentProps extends NativeStackProps {
  content: ContentResponse;
}

const t = getTranslation(["screen.Content", "constant.button", "validation"]);
const CREATE_SUCCESSFUL_TOAST = "createSuccessful";
const DELETE_SUCCESSFUL_TOAST = "deleteSuccessful";

export default function UpdateContent({ navigation, route }: AddContentProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { content } = route.params;
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    trigger,
  } = useForm<CreateContentRequest>({
    mode: "onChange",
    defaultValues: {
      title: content.title,
      content: content.content,
      fromDate: content?.fromDate
        ? formatUtcToLocalDate(content?.fromDate)
        : "",
      ytbUrl: content?.ytbUrl ?? "",
      toDate: content?.toDate ? formatUtcToLocalDate(content?.toDate) : "",
    },
  });
  const today = new Date();
  const [isOpen, setIsOpen] = React.useState({
    durationFrom: false,
    durationTo: false,
    isModalOpen: false,
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

  const goBack = () => {
    let backHome = "";
    let backTab = "";
    if (user?.role.some((r) => r === Role.Admin)) {
      backHome = "AdminNavigator";
      backTab = "AdminContent";
    }
    switch (user?.userType) {
      case UserType.Player:
        backHome = "PlayerNavigator";
        backTab = "PlayerContent";
        break;
      case UserType.Coach:
        backHome = "CoachNavigator";
        backTab = "CoachContent";
        break;
      case UserType.ClubStaff:
        backHome = "ClubNavigator";
        backTab = "ClubContent";
        break;
      default:
        break;
    }
    navigation.reset({
      index: 0,
      routes: [{ name: backHome, params: { screen: backTab } }],
    });
  };

  const processSubmit = async (formValue: CreateContentRequest) => {
    const data = { ...formValue, id: content.id };
    try {
      await editPostContent(data);
      if (!Toast.isActive(CREATE_SUCCESSFUL_TOAST)) {
        Toast.show({
          id: CREATE_SUCCESSFUL_TOAST,
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Saved")}
                body={t("Saved  successfully")}
              />
            );
          },
        });
      }
      goBack();
    } catch (error: any) {
      console.log("create_content_error:", error);
      showApiToastError(error);
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deletePostContent(id);

      if (!Toast.isActive(DELETE_SUCCESSFUL_TOAST)) {
        Toast.show({
          id: DELETE_SUCCESSFUL_TOAST,
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Deleted")}
                body={t("Delete  successfully")}
              />
            );
          },
        });
      }
      goBack();
    } catch (error: any) {
      console.log("delete_content_error:", error);
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
        title: t("Edit content"),
        containerStyle: {
          marginLeft: 0,
          marginRight: 15,
        },
        rightComponent: (
          <IconButton
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, isModalOpen: true }));
            }}
            icon={<TrashIcon />}
          />
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
                  return !v || isYoutube(v) || t("Only support YouTube URL");
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
          defaultImageUrl={
            content.fileUrl ? formatFileUrl(content.fileUrl) : undefined
          }
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
          {t("Save")}
        </Button>
      </VStack>
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Yes, delete")}
        cancelText={t("Cancel")}
        isOpen={isOpen.isModalOpen}
        onCancel={() => {
          setIsOpen((prev) => ({ ...prev, isModalOpen: false }));
        }}
        title={t("Are you sure to delete this content you created?")}
        description={t(
          "Once the content delete participants are not longer to reach this content"
        )}
        onConfirm={async () => {
          setIsOpen((prev) => ({ ...prev, isModalOpen: false }));
          await onDelete(content.id);
        }}
      />
    </HeaderLayout>
  );
}
