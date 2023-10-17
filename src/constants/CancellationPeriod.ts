import { getTranslation } from "../utils/translation";

const t = getTranslation("constant.cancellationPeriod");

export default [
  { label: t("24"), value: "24" },
  { label: t("48"), value: "48" },
  { label: t("72"), value: "72" },
];
