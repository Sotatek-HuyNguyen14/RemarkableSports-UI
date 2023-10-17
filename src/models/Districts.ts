export enum AreaCode {
  HK = "HK",
  KLN = "KLN",
  NT = "NT",
}

export interface DistrictInfo {
  area: AreaCode;
  code: string;
}

export const Districts: DistrictInfo[] = [
  { area: AreaCode.HK, code: "HK.CW" },
  { area: AreaCode.HK, code: "HK.EA" },
  { area: AreaCode.HK, code: "HK.SO" },
  { area: AreaCode.HK, code: "HK.WC" },

  { area: AreaCode.KLN, code: "HK.KC" },
  { area: AreaCode.KLN, code: "HK.KU" },
  { area: AreaCode.KLN, code: "HK.SS" },
  { area: AreaCode.KLN, code: "HK.WT" },
  { area: AreaCode.KLN, code: "HK.YT" },

  { area: AreaCode.NT, code: "HK.IS" },
  { area: AreaCode.NT, code: "HK.KI" },
  { area: AreaCode.NT, code: "HK.NO" },
  { area: AreaCode.NT, code: "HK.SK" },
  { area: AreaCode.NT, code: "HK.ST" },
  { area: AreaCode.NT, code: "HK.TP" },
  { area: AreaCode.NT, code: "HK.TW" },
  { area: AreaCode.NT, code: "HK.TM" },
  { area: AreaCode.NT, code: "HK.YL" },
];
