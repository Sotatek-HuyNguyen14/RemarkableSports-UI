import Constants from "expo-constants";

const { APP_ENV } = Constants.manifest?.extra ?? {};

interface ApiUrlSetting {
  apiHost: string;
  fileHost: string;
}

const urlSettings = new Map<string, ApiUrlSetting>();

urlSettings.set("production", {
  apiHost: "https://app.remarkable-sports.com",
  fileHost: "https://remarkable-sports.sgp1.digitaloceanspaces.com",
});

urlSettings.set("staging", {
  apiHost: "https://app-uat.remarkable-sports.com",
  fileHost: "https://remarkable-sports-uat.sgp1.digitaloceanspaces.com",
});

urlSettings.set("development", {
  apiHost: "https://app-dev.remarkable-sports.com",
  fileHost: "https://remarkable-sports-dev.sgp1.digitaloceanspaces.com",
});

export default APP_ENV && urlSettings.has(APP_ENV)
  ? urlSettings.get(APP_ENV)
  : {
      apiHost: "https://app-dev.remarkable-sports.com",
      fileHost: "https://remarkable-sports-dev.sgp1.digitaloceanspaces.com",
    };
