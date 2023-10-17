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
import { Platform, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useForm } from "react-hook-form";
import { inject } from "mobx-react";
import RNRestart from "react-native-restart";
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
import TrashIcon from "../../components/Icons/TrashIcon";
import RedTrashIcon from "../../components/Icons/RedTrashIcon";
import EmailIcon from "../../components/Icons/EmailIcon";

interface columnsModel {
  label: string;
}
type SettingAccountBaseProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "SettingAccount"
>;

export interface SettingAccountProps extends SettingAccountBaseProps {
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

function SettingAccount(props: SettingAccountProps) {
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
        title: t("Account"),
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      <VStack flex="1" space={4} bg="rs.button_light">
        <Pressable
          onPress={() => {
            navigation.navigate("ChangeEmail");
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
              <EmailIcon alignSelf="center" />
              <Text fontWeight="500" ml="2" fontSize="md" color="black">
                {t("Change Email")}
              </Text>
            </Flex>
          </HStack>
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate("ChangePassword");
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
              <PasswordIcon alignSelf="center" />
              <Text fontWeight="500" ml="2" fontSize="md" color="black">
                {t("Change password")}
              </Text>
            </Flex>
          </HStack>
        </Pressable>

        <Pressable key="Biometric Login">
          <HStack
            px="defaultLayoutSpacing"
            justifyContent="space-between"
            alignItems="center"
            borderRadius={4}
            bg="white"
            height="16"
          >
            <Flex flexDirection="row">
              <BiometricIcon alignSelf="center" />
              <Text fontWeight="500" ml="2" fontSize="md" color="black">
                {t("Biometric Login")}
              </Text>
            </Flex>
            <Switch
              key="biometricSwitch"
              size="sm"
              disabled={isValid}
              onToggle={() => {
                if (columns?.label) {
                  onBioSwitch(columns.label);
                }
              }}
              isChecked={isChecked}
            />
          </HStack>
        </Pressable>

        <Pressable
          key="Delete Account"
          onPress={() => {
            setDeleteAccountOpen(true);
          }}
        >
          <HStack
            px="defaultLayoutSpacing"
            justifyContent="space-between"
            alignItems="center"
            borderRadius={4}
            bg="white"
            height="16"
            color="red"
          >
            <HStack space="1">
              <RedTrashIcon size="lg" color="red.400" />
              <Flex color="red" flexDirection="row">
                <Text fontWeight="500" fontSize="md" color="rs_secondary.error">
                  {t("Delete Account")}
                </Text>
              </Flex>
            </HStack>
          </HStack>
        </Pressable>
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
export default inject("store")(SettingAccount);
