import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const USER_TYPE_COACH = "CoachInfo";
const USER_TYPE_PLAYER = "PlayerInfo";
const USER_TYPE_CLUB_STAFF = "ClubInfo";
const SCOPE = "openid profile email roles offline_access";
const IMAGE_COMPRESS_QUALITY = 0.5; // 0 smallest size - 1 best quality, quality has obvious drop when <0.4 - 0.5
const APPROVE_BUTTON_COLOR = "#00B812";
const REJECT_BUTTON_COLOR = "#E71010";
export {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  USER_TYPE_CLUB_STAFF,
  USER_TYPE_COACH,
  USER_TYPE_PLAYER,
  SCOPE,
  IMAGE_COMPRESS_QUALITY,
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
};
