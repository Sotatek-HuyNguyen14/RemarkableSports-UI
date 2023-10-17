import { getTranslation } from "../utils/translation";

const t = getTranslation("constant.area");

export default function getArea() {
  return [
    { label: t("HK"), value: "HK" },
    { label: t("KLN"), value: "KLN" },
    { label: t("NT"), value: "NT" },
  ];
}
