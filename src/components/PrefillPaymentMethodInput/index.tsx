import { Heading, VStack, Text, HStack, Pressable, Divider } from "native-base";
import React from "react";
import { PaymentType } from "../../models/responses/Event";
import { isBlank } from "../../utils/strings";
import { PurpleCheckedIcon, PurpleUncheckIcon } from "../Icons/PurpleCheckIcon";
import { getTranslation } from "../../utils/translation";

export interface PrefillPaymentMethodModelItem {
  id: number | string;
  clubId: number | string;
  paymentType: PaymentType;
  bankAccount?: string;
  identifier?: string;
  phoneNumber?: string;
  otherPaymentInfo?: string;
  accountName?: string;
  bankName?: string;
  isSelected: boolean;

  // Use for create and editing so that we can find the correct payment method for using
  personalId: string;
}

const t = getTranslation([
  "screen.ClubScreens.ClubProcess",
  "constant.button",
  "constant.profile",
  "toastMessage",
  "component.Player.PlayerProfile",
]);

interface PrefillPaymentMethodInputProps {
  paymentMethods: PrefillPaymentMethodModelItem[];
  onPressMethod?: (method: PrefillPaymentMethodModelItem) => void;
}

export default function PrefillPaymentMethodInput({
  paymentMethods,
  onPressMethod,
}: PrefillPaymentMethodInputProps) {
  const paymentMethodCellItem = (method: PrefillPaymentMethodModelItem) => {
    return (
      <Pressable
        onPress={() => {
          onPressMethod?.(method);
        }}
      >
        <VStack space="2">
          <HStack
            flex="1"
            alignItems="center"
            justifyContent="space-between"
            px="2"
          >
            <VStack space="2">
              <Heading fontSize="md">{method.paymentType}</Heading>
              {method.paymentType === "Bank" && (
                <VStack>
                  <Text>
                    {t("Bank Name")}:{method.bankName}
                  </Text>
                  <Text>
                    {t("Account Number")}:{method.bankAccount}
                  </Text>
                  <Text>
                    {t("Account Name")}:{method.accountName}
                  </Text>
                </VStack>
              )}
              {method.paymentType === "Others" && (
                <VStack>
                  <Text>{method.otherPaymentInfo}</Text>
                </VStack>
              )}
              {method.paymentType !== "Bank" &&
                method.paymentType !== "Others" && (
                  <VStack>
                    <Text>
                      {t("Phone Number")}:{method.phoneNumber}
                    </Text>
                    {method.identifier && (
                      <Text>
                        {t("ID")}:{method.identifier}
                      </Text>
                    )}
                    <Text>
                      {t("Account Name")}:{method.accountName}
                    </Text>
                  </VStack>
                )}
            </VStack>
            {method.isSelected ? <PurpleCheckedIcon /> : <PurpleUncheckIcon />}
          </HStack>
          <Divider mt="2" />
        </VStack>
      </Pressable>
    );
  };

  return (
    <VStack space="2">
      {paymentMethods.length > 0 &&
        paymentMethods.map((method) => {
          return paymentMethodCellItem(method);
        })}
    </VStack>
  );
}
