import React, { useRef, useState } from "react";
import {
  Pressable,
  HStack,
  VStack,
  Flex,
  Text,
  Switch,
  Toast,
} from "native-base";
import { Linking, Platform, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useForm } from "react-hook-form";
import { inject } from "mobx-react";
import RNRestart from "react-native-restart";
import { nativeApplicationVersion } from "expo-application";
import { useAuth } from "../../hooks/UseAuth";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { getTranslation } from "../../utils/translation";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import LanguageIcon from "../../components/Icons/LanguageIcon";
import BiometricIcon from "../../components/Icons/BiometricIcon";
import LogoutIcon from "../../components/Icons/LogoutIcon";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { Store } from "../../stores";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import {
  biometricalStorageModel,
  BIOMETRIC_TYPE,
  DEVICE_OS,
} from "../../utils/crypto";
import PasswordIcon from "../../components/Icons/PasswordIcon";
import { deleteAccount } from "../../services/AuthServices";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import useNotification from "../../hooks/UseNotification";
import { isBlank } from "../../utils/strings";
import RightArrowIcon from "../../components/Icons/RightArrowIcon";
import AccountIcon from "../../components/Icons/AccountIcon";
import { showApiToastErrorWithMessage } from "../../components/ApiToastError";

interface columnsModel {
  label: string;
}
type SettingsScreenBaseProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "SettingsScreen"
>;

export interface SettingsScreenProps extends SettingsScreenBaseProps {
  store: Store;
}

const t = getTranslation([
  "screen.SettingsScreen.SettingsScreen",
  "constant.button",
]);

const languageList = [
  { label: "English", value: "en" },
  { label: "繁體中文", value: "zh-hk" },
];

function SettingsScreen(props: SettingsScreenProps) {
  const { navigation, store } = props;

  const { logout } = useAuth();
  const [columns, setColumns] = useState<columnsModel>();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const languageIndex = languageList.findIndex(
    (l) => l.value === store.language
  );
  const [isValid, setIsValid] = useState(false);
  const { control, watch } = useForm({ mode: "onChange" });

  React.useEffect(() => {
    const subscription = watch(async (value, { name, type }) => {
      if (name === "language" && type === "change") {
        await store.setLanguage(value[name]);
      }
    });
    return () => subscription.unsubscribe();
  }, [store, watch]);

  React.useEffect(() => {
    if (store.biometricalType && !isBlank(store.biometricalType)) {
      const data = { label: store.biometricalType };
      setColumns(data);
      setIsChecked(true);
    }
    getDeviceBiometrics();
  }, [store]);

  const onClose = () => {
    setIsOpen((pre) => !pre);
  };

  const getDeviceBiometrics = async () => {
    try {
      const result =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (result.length) {
        result.forEach((item, index) => {
          switch (item) {
            case LocalAuthentication.AuthenticationType.FINGERPRINT:
              if (Platform.OS === "ios") {
                setColumns({
                  label: BIOMETRIC_TYPE.TouchID,
                });
              } else {
                setColumns({
                  label: BIOMETRIC_TYPE.Fingerprint,
                });
              }
              break;
            case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
              if (Platform.OS === "ios") {
                setColumns({
                  label: BIOMETRIC_TYPE.FaceID,
                });
              } else {
                setColumns({
                  label: BIOMETRIC_TYPE.FacialRecognition,
                });
              }
              break;
            case LocalAuthentication.AuthenticationType.IRIS:
              if (Platform.OS === "android") {
                setColumns({
                  label: BIOMETRIC_TYPE.IRIS,
                });
              }
              break;
            default:
              break;
          }
        });
      } else {
        setIsValid(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onBioSwitch = async (biometricalType: string) => {
    try {
      const result = await LocalAuthentication.getEnrolledLevelAsync();
      if (result === LocalAuthentication.SecurityLevel.BIOMETRIC) {
        const { username, password } = store;
        const newBiometricalType = !isChecked ? biometricalType : "";
        const data: biometricalStorageModel = {
          username: username!,
          password: password!,
          biometricalType: newBiometricalType,
        };

        if (data) {
          AsyncStorage.setItem(DEVICE_OS, JSON.stringify(data), () => {
            setIsChecked((old) => !old);
            store.setBiometricalType(newBiometricalType);
          });
        }
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  const { cleanUpNotifications } = useNotification();

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Setting"),
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      <VStack flex="1" space={4} bg="rs.button_light">
        <Pressable mt="4" key="Language">
          <HStack
            px="defaultLayoutSpacing"
            justifyContent="space-between"
            alignItems="center"
            bg="white"
            height="16"
          >
            <Flex flexDirection="row">
              <LanguageIcon color="white" alignSelf="center" />
              <Text fontWeight="500" ml="2" fontSize="md" color="black">
                {t("Language")}
              </Text>
            </Flex>
            <TouchableOpacity
              onPress={() => {
                setIsOpenModal(true);
              }}
            >
              <Text fontSize="lg" color="#6D6D6D" fontWeight="500">
                {languageList[languageIndex]?.label}
              </Text>
            </TouchableOpacity>
          </HStack>
        </Pressable>

        <Pressable
          key="Account"
          onPress={() => {
            navigation.navigate("SettingAccount");
          }}
        >
          <HStack
            px="defaultLayoutSpacing"
            justifyContent="space-between"
            alignItems="center"
            borderRadius={4}
            bg="white"
            height="16"
          >
            <Flex flexDirection="row">
              <AccountIcon
                props={{
                  size: "md",
                }}
              />
              <Text fontWeight="500" ml="2" fontSize="md" color="black">
                {t("Account")}
              </Text>
            </Flex>
            <RightArrowIcon />
          </HStack>
        </Pressable>

        <Pressable
          key="Logout"
          onPress={() => {
            onClose();
          }}
        >
          <HStack
            px="defaultLayoutSpacing"
            justifyContent="space-between"
            alignItems="center"
            borderRadius={4}
            bg="white"
            height="16"
          >
            <Flex flexDirection="row">
              <LogoutIcon
                color="rs.white"
                strokeColor="rs_secondary.error"
                alignSelf="center"
              />
              <Text
                fontWeight="bold"
                ml="2"
                fontSize="md"
                color="rs_secondary.error"
              >
                {t("Logout")}
              </Text>
            </Flex>
          </HStack>
        </Pressable>

        <HStack mb="2" space="8" mt="auto" mx="defaultLayoutSpacing">
          <Text color="#B3B6B8">{`${t(
            "Version"
          )} ${nativeApplicationVersion}`}</Text>
          <Pressable
            onPress={() => {
              const url =
                "https://www.freeprivacypolicy.com/live/4d2dec44-c9b0-42a5-9b85-ad72e0cb95b3";
              Linking.canOpenURL(url)
                .then((result) => {
                  if (result) {
                    Linking.openURL(url);
                  } else {
                    showApiToastErrorWithMessage(t("You cannot open this url"));
                  }
                })
                .catch(() => {
                  showApiToastErrorWithMessage(t("You cannot open this url"));
                });
            }}
          >
            <Text color="#B3B6B8" textDecorationLine="underline">
              {t("Terms and Conditions")}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
      <ConfirmationModal
        isOpen={isOpen}
        title={t("Are you sure to log out?")}
        confirmText={t("Yes")}
        onConfirm={async () => {
          onClose();
          try {
            await cleanUpNotifications();
          } catch (cleanError: any) {
            console.log(cleanError);
          }
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "LogIn" }] });
        }}
        cancelText={t("Cancel")}
        onCancel={onClose}
      />
      <ConfirmationModal
        isOpen={isDeleteAccountOpen}
        title={t("Are you sure to delete your account?")}
        confirmText={t("Yes")}
        onConfirm={async () => {
          try {
            try {
              await cleanUpNotifications();
            } catch (cleanError: any) {
              console.log(cleanError);
            }
            setDeleteAccountOpen(false);
            await deleteAccount();
            await logout();

            // Force restart the app
            RNRestart.Restart();
          } catch (error) {
            console.log(error);
            Toast.show({
              id: "deleteAccountFailure",
              duration: 2000,
              placement: "top",
              render: () => {
                return (
                  <MessageToast
                    type={MesssageToastType.Success}
                    title={t("Failure")}
                    body={t("Deleted failure")}
                  />
                );
              },
            });
          }
        }}
        cancelText={t("Cancel")}
        onCancel={() => {
          setDeleteAccountOpen(false);
        }}
      />
      <SingleSelectModal
        title={t("Language")}
        confirmButtonText={t("Save")}
        options={languageList}
        defaultIndex={languageIndex}
        controllerProps={{
          name: "language",
          control,
          rules: {
            required: true,
          },
        }}
        isOpen={isOpenModal}
        onClose={() => {
          setIsOpenModal(false);
        }}
      />
    </HeaderLayout>
  );
}
export default inject("store")(SettingsScreen);
