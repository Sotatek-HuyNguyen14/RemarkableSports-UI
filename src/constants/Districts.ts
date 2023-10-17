import { getTranslation } from "../utils/translation";

const t = getTranslation("constant.district");

export default function getDistricts() {
  return {
    HK: [
      { label: t("HK.CW"), value: "HK.CW" },
      { label: t("HK.EA"), value: "HK.EA" },
      { label: t("HK.SO"), value: "HK.SO" },
      { label: t("HK.WC"), value: "HK.WC" },
    ],
    KLN: [
      { label: t("HK.KC"), value: "HK.KC" },
      { label: t("HK.KU"), value: "HK.KU" },
      { label: t("HK.SS"), value: "HK.SS" },
      { label: t("HK.WT"), value: "HK.WT" },
      { label: t("HK.YT"), value: "HK.YT" },
    ],
    NT: [
      { label: t("HK.IS"), value: "HK.IS" },
      { label: t("HK.KI"), value: "HK.KI" },
      { label: t("HK.NO"), value: "HK.NO" },
      { label: t("HK.SK"), value: "HK.SK" },
      { label: t("HK.ST"), value: "HK.ST" },
      { label: t("HK.TP"), value: "HK.TP" },
      { label: t("HK.TW"), value: "HK.TW" },
      { label: t("HK.TM"), value: "HK.TM" },
      { label: t("HK.YL"), value: "HK.YL" },
    ],
  } as { [key: string]: { label: string; value: string }[] };
}

export function getAllDistricts() {
  return [
    { label: t("HK.CW"), value: "HK.CW" },
    { label: t("HK.EA"), value: "HK.EA" },
    { label: t("HK.SO"), value: "HK.SO" },
    { label: t("HK.WC"), value: "HK.WC" },
    { label: t("HK.KC"), value: "HK.KC" },
    { label: t("HK.KU"), value: "HK.KU" },
    { label: t("HK.SS"), value: "HK.SS" },
    { label: t("HK.WT"), value: "HK.WT" },
    { label: t("HK.YT"), value: "HK.YT" },
    { label: t("HK.IS"), value: "HK.IS" },
    { label: t("HK.KI"), value: "HK.KI" },
    { label: t("HK.NO"), value: "HK.NO" },
    { label: t("HK.SK"), value: "HK.SK" },
    { label: t("HK.ST"), value: "HK.ST" },
    { label: t("HK.TP"), value: "HK.TP" },
    { label: t("HK.TW"), value: "HK.TW" },
    { label: t("HK.TM"), value: "HK.TM" },
    { label: t("HK.YL"), value: "HK.YL" },
  ];
}
