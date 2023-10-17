import { VStack } from "native-base";
import React from "react";
import Svg, { Ellipse, Path } from "react-native-svg";
import Card, { CardProps } from "./Card";

export interface HighlightCardProps extends Pick<CardProps, "containerProps"> {
  children: React.ReactNode;
}

export default function HighlightCard({
  children,
  ...otherProps
}: HighlightCardProps) {
  return (
    <Card
      containerProps={{
        backgroundColor: "rs.button_color",
        overflow: "hidden",
        ...otherProps.containerProps,
      }}
      body={
        <VStack flex="1">
          <Svg
            style={{
              position: "absolute",
              top: -32,
              left: -32,
              width: "111px",
              height: "119.78px",
            }}
            viewBox="0 0 90 81"
            fill="none"
          >
            <Ellipse
              cx="34.5"
              cy="21.0425"
              rx="55.5"
              ry="59.89"
              fill="#44A1E0"
            />
          </Svg>
          <Svg
            style={{
              position: "absolute",
              top: -30,
              right: -50,
              width: "208px",
              height: "224.45px",
            }}
            viewBox="0 0 151 203"
            fill="none"
          >
            <Path
              d="M176.214 159.611C167.661 168.404 156.942 174.354 145.339 176.749L43.868 67.4259C46.3919 55.0013 51.9987 43.5509 60.0885 34.2998C96.5161 -5.02656 144.128 -14.6056 182.832 27.1591C221.535 68.9237 212.658 120.302 176.214 159.611ZM63.4456 187.652C69.1737 183.279 75.5479 179.987 82.2969 177.916C92.3344 176.649 102.506 177.639 112.172 180.825L40.285 103.408C43.4062 114.228 44.2715 125.659 42.8189 136.883C41.0524 143.827 38.2093 150.399 34.4101 156.32C17.1082 178.317 0 186.398 0 194.427C0.436529 202.236 3.50823 209.603 8.63485 215.135C13.7615 220.667 20.588 223.982 27.825 224.453C35.2493 224.453 42.6414 206.81 63.4456 187.652Z"
              fill="#44A1E0"
            />
          </Svg>
          <VStack space="2">{children}</VStack>
        </VStack>
      }
    />
  );
}
