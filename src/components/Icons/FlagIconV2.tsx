/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import Svg, { G, Path, Rect } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface FlagIconV2Props extends InterfaceIconProps {
  fillColor?: string;
}

export function FlagIconV2(props: FlagIconV2Props) {
  return (
    <Icon size="lg" viewBox="0 0 20 22" {...props}>
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M17.7372 18.778C17.7372 18.9393 17.6516 19.0674 17.5036 19.1299C17.3533 19.1925 17.2032 19.1637 17.0884 19.0509L13.5147 15.5553C13.2184 15.2663 12.8304 15.1219 12.4423 15.1219C12.0564 15.1219 11.6682 15.2663 11.372 15.5553L7.79828 19.051C7.68358 19.164 7.53128 19.1927 7.3831 19.13C7.2349 19.0674 7.14945 18.9393 7.14945 18.7781V4.53132C7.14945 4.32079 7.32048 4.14893 7.53129 4.14893H17.3553C17.566 4.14893 17.7372 4.32078 17.7372 4.53132L17.7372 18.778ZM17.3554 3H7.53131C6.68641 3 5.99998 3.68698 5.99998 4.5316V18.7784C5.99998 19.4059 6.35886 19.9468 6.93675 20.19C7.51668 20.433 8.15309 20.3116 8.60163 19.8731L12.1753 16.3773C12.3235 16.233 12.5633 16.233 12.7095 16.3773L16.2832 19.8731C16.5794 20.1622 16.957 20.3134 17.345 20.3134C17.5473 20.3134 17.7519 20.2727 17.9479 20.19C18.5279 19.9468 18.8867 19.4059 18.8867 18.7784L18.8866 4.5316C18.8866 3.68698 18.1981 3 17.3553 3H17.3554Z"
          fill="black"
        />
      </Svg>
    </Icon>
  );
}

export function FilledFlagIconV2(props: FlagIconV2Props) {
  return (
    <Icon size="lg" viewBox="0 0 20 22" {...props}>
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M17.7372 18.778C17.7372 18.9393 17.6516 19.0674 17.5036 19.1299C17.3533 19.1925 17.2032 19.1637 17.0884 19.0509L13.5147 15.5553C13.2184 15.2663 12.8304 15.1219 12.4423 15.1219C12.0564 15.1219 11.6683 15.2663 11.372 15.5553L7.7983 19.051C7.6836 19.164 7.5313 19.1927 7.38311 19.13C7.23491 19.0674 7.14947 18.9393 7.14947 18.7781V4.53132C7.14947 4.32079 7.32049 4.14893 7.5313 4.14893H17.3554C17.566 4.14893 17.7372 4.32078 17.7372 4.53132L17.7372 18.778ZM17.3554 3H7.53132C6.68642 3 6 3.68698 6 4.5316V18.7784C6 19.4059 6.35887 19.9468 6.93677 20.19C7.51669 20.433 8.1531 20.3116 8.60164 19.8731L12.1753 16.3773C12.3235 16.233 12.5633 16.233 12.7095 16.3773L16.2832 19.8731C16.5794 20.1622 16.957 20.3134 17.345 20.3134C17.5474 20.3134 17.7519 20.2727 17.9479 20.19C18.5279 19.9468 18.8867 19.4059 18.8867 18.7784L18.8866 4.5316C18.8866 3.68698 18.1981 3 17.3553 3H17.3554Z"
          fill="white"
        />
        <Rect x="7" y="4" width="11" height="12" fill="white" />
        <Rect
          x="10.7019"
          y="8.37427"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(23.8695 10.7019 8.37427)"
          fill="white"
        />
        <Rect
          x="12.7019"
          y="7"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(23.8695 12.7019 7)"
          fill="white"
        />
        <Rect
          x="10.7019"
          y="6"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(23.8695 10.7019 6)"
          fill="white"
        />
        <Rect
          x="11.7966"
          y="9.36646"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(-25.3039 11.7966 9.36646)"
          fill="white"
        />
        <Rect
          x="12.0642"
          y="6.95459"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(-25.3039 12.0642 6.95459)"
          fill="white"
        />
        <Rect
          x="10"
          y="7.81445"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(-25.3039 10 7.81445)"
          fill="white"
        />
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M17.7372 18.778C17.7372 18.9393 17.6516 19.0674 17.5036 19.1299C17.3533 19.1925 17.2032 19.1637 17.0884 19.0509L13.5147 15.5553C13.2184 15.2663 12.8304 15.1219 12.4423 15.1219C12.0564 15.1219 11.6683 15.2663 11.372 15.5553L7.7983 19.051C7.6836 19.164 7.5313 19.1927 7.38311 19.13C7.23491 19.0674 7.14947 18.9393 7.14947 18.7781V4.53132C7.14947 4.32079 7.32049 4.14893 7.5313 4.14893H17.3554C17.566 4.14893 17.7372 4.32078 17.7372 4.53132L17.7372 18.778ZM17.3554 3H7.53132C6.68642 3 6 3.68698 6 4.5316V18.7784C6 19.4059 6.35887 19.9468 6.93677 20.19C7.51669 20.433 8.1531 20.3116 8.60164 19.8731L12.1753 16.3773C12.3235 16.233 12.5633 16.233 12.7095 16.3773L16.2832 19.8731C16.5794 20.1622 16.957 20.3134 17.345 20.3134C17.5474 20.3134 17.7519 20.2727 17.9479 20.19C18.5279 19.9468 18.8867 19.4059 18.8867 18.7784L18.8866 4.5316C18.8866 3.68698 18.1981 3 17.3553 3H17.3554Z"
          fill="white"
        />
      </Svg>
    </Icon>
  );
}

export function SelectedFlagIconV2(props: FlagIconV2Props) {
  return (
    <Icon size="lg" viewBox="0 0 20 22" {...props}>
      <Svg width="20" height="22" viewBox="0 0 20 22" fill="none">
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M17.7372 18.778C17.7372 18.9393 17.6516 19.0674 17.5036 19.1299C17.3533 19.1925 17.2032 19.1637 17.0884 19.0509L13.5147 15.5553C13.2184 15.2663 12.8304 15.1219 12.4423 15.1219C12.0564 15.1219 11.6683 15.2663 11.372 15.5553L7.7983 19.051C7.6836 19.164 7.5313 19.1927 7.38311 19.13C7.23491 19.0674 7.14947 18.9393 7.14947 18.7781V4.53132C7.14947 4.32079 7.32049 4.14893 7.5313 4.14893H17.3554C17.566 4.14893 17.7372 4.32078 17.7372 4.53132L17.7372 18.778ZM17.3554 3H7.53132C6.68642 3 6 3.68698 6 4.5316V18.7784C6 19.4059 6.35887 19.9468 6.93677 20.19C7.51669 20.433 8.1531 20.3116 8.60164 19.8731L12.1753 16.3773C12.3235 16.233 12.5633 16.233 12.7095 16.3773L16.2832 19.8731C16.5794 20.1622 16.957 20.3134 17.345 20.3134C17.5474 20.3134 17.7519 20.2727 17.9479 20.19C18.5279 19.9468 18.8867 19.4059 18.8867 18.7784L18.8866 4.5316C18.8866 3.68698 18.1981 3 17.3553 3H17.3554Z"
          fill="#66CEE1"
        />
        <Rect x="7" y="4" width="11" height="12" fill="#66CEE1" />
        <Rect
          x="10.7019"
          y="8.37427"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(23.8695 10.7019 8.37427)"
          fill="#66CEE1"
        />
        <Rect
          x="12.7019"
          y="7"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(23.8695 12.7019 7)"
          fill="#66CEE1"
        />
        <Rect
          x="10.7019"
          y="6"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(23.8695 10.7019 6)"
          fill="#66CEE1"
        />
        <Rect
          x="11.7966"
          y="9.36646"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(-25.3039 11.7966 9.36646)"
          fill="#66CEE1"
        />
        <Rect
          x="12.0642"
          y="6.95459"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(-25.3039 12.0642 6.95459)"
          fill="#66CEE1"
        />
        <Rect
          x="10"
          y="7.81445"
          width="2.23359"
          height="11.6195"
          rx="1.1168"
          transform="rotate(-25.3039 10 7.81445)"
          fill="#66CEE1"
        />
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M17.7372 18.778C17.7372 18.9393 17.6516 19.0674 17.5036 19.1299C17.3533 19.1925 17.2032 19.1637 17.0884 19.0509L13.5147 15.5553C13.2184 15.2663 12.8304 15.1219 12.4423 15.1219C12.0564 15.1219 11.6683 15.2663 11.372 15.5553L7.7983 19.051C7.6836 19.164 7.5313 19.1927 7.38311 19.13C7.23491 19.0674 7.14947 18.9393 7.14947 18.7781V4.53132C7.14947 4.32079 7.32049 4.14893 7.5313 4.14893H17.3554C17.566 4.14893 17.7372 4.32078 17.7372 4.53132L17.7372 18.778ZM17.3554 3H7.53132C6.68642 3 6 3.68698 6 4.5316V18.7784C6 19.4059 6.35887 19.9468 6.93677 20.19C7.51669 20.433 8.1531 20.3116 8.60164 19.8731L12.1753 16.3773C12.3235 16.233 12.5633 16.233 12.7095 16.3773L16.2832 19.8731C16.5794 20.1622 16.957 20.3134 17.345 20.3134C17.5474 20.3134 17.7519 20.2727 17.9479 20.19C18.5279 19.9468 18.8867 19.4059 18.8867 18.7784L18.8866 4.5316C18.8866 3.68698 18.1981 3 17.3553 3H17.3554Z"
          fill="#66CEE1"
        />
      </Svg>
    </Icon>
  );
}
