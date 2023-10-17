import React from "react";
import { Icon } from "native-base";
import { G, Path, Svg, Defs, Rect, ClipPath } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function BinIcon(props: InterfaceIconProps) {
  return (
    <Icon size="2xl" viewBox="0 0 30 26" {...props}>
      <Svg width="30" height="26" viewBox="0 0 30 26" fill="none">
        <G clip-path="url(#clip0_68_7144)">
          <Path
            d="M23.3047 2.31423H17.1132V0.835711C17.1132 0.0348714 16.3431 -0.612061 15.3882 -0.612061H8.61144C7.62561 -0.612061 6.88649 0.0349264 6.88649 0.835711V2.31423H0.694953C0.202045 2.31423 -0.198242 2.71475 -0.198242 3.20743C-0.198242 3.70034 0.202271 4.10062 0.694953 4.10062L2.14273 4.10084L3.49814 20.6732C3.49814 22.4906 5.00758 24 6.85569 24H17.1441C18.9924 24 20.5017 22.5215 20.5017 20.7039L21.8571 4.06993H23.3048C23.7977 4.06993 24.198 3.66941 24.198 3.17673C24.1983 2.68361 23.7977 2.31401 23.3048 2.31401L23.3047 2.31423ZM8.64219 2.34496V1.17436H15.3574V2.34496H8.64219ZM20.0703 4.07013L18.7459 20.5809V20.6426C18.7459 21.5051 18.0066 22.2444 17.1441 22.2444L6.82483 22.2442C5.96232 22.2442 5.22298 21.5048 5.22298 20.6116L3.86757 4.07003L20.0703 4.07013Z"
            fill="black"
          />
          <Path
            d="M8.33417 17.5003C8.33417 17.9623 8.73468 18.3629 9.22736 18.3629C9.72027 18.3629 10.1206 17.9623 10.1206 17.4387L9.72005 8.81366C9.72005 8.5672 9.62765 8.3517 9.44286 8.16668C9.25807 8.01261 9.04235 7.92022 8.79588 7.95094C8.54942 7.95094 8.33391 8.07407 8.17986 8.22813C8.0258 8.41292 7.9334 8.65937 7.96413 8.87512L8.33417 17.5003Z"
            fill="black"
          />
          <Path
            d="M14.8029 18.3629C15.2958 18.3629 15.6654 18.0241 15.7271 17.5312L16.1276 8.87534C16.1276 8.41337 15.7887 8.01283 15.3268 7.95117H15.296C14.8341 7.95117 14.4335 8.29002 14.3719 8.78293L13.9404 17.4079C13.9097 17.6544 13.9711 17.9009 14.1561 18.0856C14.31 18.2704 14.5257 18.363 14.8029 18.363L14.8029 18.3629Z"
            fill="black"
          />
        </G>
        <Defs>
          <ClipPath id="clip0_68_7144">
            <Rect width="24" height="24" fill="white" />
          </ClipPath>
        </Defs>
      </Svg>
    </Icon>
  );
}
