/* eslint-disable @typescript-eslint/no-empty-interface */
import { extendTheme } from "native-base";
import { getTranslation } from "../utils/translation";

const t = getTranslation("component.Button");

const nativeBaseTheme = extendTheme({
  colors: {
    primary: {
      50: "#C5D6FF",
      100: "#A9C2FF",
      200: "#8CAEFF",
      300: "#709AFF",
      400: "#5386FF",
      500: "#3772FF",
      600: "#2F61DA",
      700: "#2751B6",
      800: "#1F4191",
      900: "#17306D",
    },
    rs: {
      yellow: "#FEF104",
      skyBlue: "#4197D2",
      lightBlue: "#A4DBF5",
      lightGrey: "#EDEFF0",
      black: "#000000",
      white: "#FFFFFF",
      grey: "#F6F6F6",
      green: "#27A643",
      check: "#05C28C",
      red: "#FF523B",
      // Input colors
      inputLabel_grey: "#B3B6B8",
      bg_grey: "#E4E4E4",
      // Button colors
      button_color: "#31095E",
      button_pressed: "#3086C1",
      button_light: "#FAFAFA",
      button_grey: "#D7D7D7",
      primary_purple: "#31095E",
      medium_orange: "#E39053",
      GPP_lightBlue: "#66CEE1",
      GPP_lightGreen: "#00B812",
      GPP_orange: "#E08700",
      GPP_grey: "#909090",
    },
    rs_secondary: {
      green: "#27A643",
      error: "#E71010",
      grey: "#6D6D6D",
      orange: "#E86A10",
      purple: "#4158D2",
    },
  },
  components: {
    Avatar: {
      defaultProps: {
        bgColor: "rs.lightBlue",
      },
    },
    Badge: {
      defaultProps: {
        borderRadius: "12",
        _text: {
          color: "rs.white",
        },
      },
    },
    Button: {
      defaultProps: {
        variant: "solid",
        colorScheme: "primary",
        isLoadingText: t("Loading"),
      },
      variants: {
        solid: () => {
          return {
            borderRadius: "16",
            _disabled: {
              bgColor: "rs.button_grey",
              opacity: 1,
            },
            _text: {
              color: "rs.white",
            },
            _icon: {
              color: "rs.white",
            },
            _spinner: {
              color: "rs.white",
            },
            _pressed: {
              bg: "#31095E",
            },
            _light: {
              bg: "#31095E",
              _hover: {
                bg: "rs.primary_purple:alpha.10",
              },
              _pressed: {
                bg: "rs.primary_purple:alpha.20",
              },
            },
          };
        },
        outline: () => {
          return {
            borderWidth: "1px",
            borderRadius: "16",

            _light: {
              borderColor: "#31095E",
              _text: {
                color: "#31095E",
              },
              _icon: {
                color: "#31095E",
              },
              _spinner: {
                color: "#31095E",
              },
              _hover: {
                bg: "#31095E",
              },
              _pressed: {
                bg: "#31095E",
                _text: { color: "rs.white" },
              },
            },
          };
        },
        ghost: () => {
          return {
            borderRadius: "16",
            _light: {
              _text: {
                color: "rs.primary_purple",
              },
              _icon: {
                color: "rs.primary_purple",
              },
              _spinner: {
                color: "rs.primary_purple",
              },
              _hover: {
                color: "rs.primary_purple:alpha.10",
              },
              _pressed: {
                color: "rs.primary_purple:alpha.20",
              },
            },
            _text: {
              color: "rs.primary_purple",
            },
            _focus: {
              bg: "#ffffff",
            },
          };
        },
      },
      sizes: {
        md: {
          px: "3",
          py: "4",
          _text: {
            fontSize: "lg",
            fontWeight: "700",
            lineHeight: "24",
          },
          _icon: {
            size: "lg",
          },
        },
        sm: {
          px: "3",
          py: "2",
          _text: {
            fontSize: "sm",
            fontWeight: "700",
            lineHeight: "24",
          },
          _icon: {
            size: "sm",
          },
        },
      },
    },
    Heading: {
      defaultProps: {
        size: "md",
      },
    },
    IconButton: {
      defaultProps: {
        colorScheme: "black",
      },
    },
    Input: {
      defaultProps: {
        size: "lg",
        _focus: {
          borderColor: "rs.GPP_lightBlue",
        },
      },
      variants: {
        outline: () => {
          return {
            _focus: {
              bg: "#ffffff",
            },
          };
        },
      },
    },
    Modal: {
      baseStyle: {
        _backdrop: {
          color: "rs.black",
          opacity: 0.6,
        },
      },
      defaultProps: {
        size: "xl",
      },
    },
    ModalContent: {
      baseStyle: {
        borderRadius: "2xl",
      },
    },
    ModalBody: {
      baseStyle: {
        _text: {
          fontSize: "md",
          textAlign: "center",
        },
      },
    },
    ModalHeader: {
      baseStyle: {
        pt: "6",
        borderBottomWidth: "0",
        _text: {
          fontSize: "xl",
          fontWeight: "bold",
          textAlign: "center",
        },
      },
    },
    ModalFooter: {
      baseStyle: {
        pb: "6",
        borderTopWidth: "0",
      },
    },
    TextArea: {
      defaultProps: {
        borderRadius: "xl",
        bgColor: "rs.grey",
        borderColor: "rs.grey",
        p: "4",
        _focus: {
          bgColor: "rs.grey",
          borderColor: "rs.grey",
        },
      },
    },
    Pressable: {
      baseStyle: {
        _pressed: { opacity: 0.5 },
      },
    },
  },
  space: {
    /**
     * Apply to padding or margin
     */
    defaultLayoutSpacing: 16,
  },
});

// To enable typescript for custom theme tokens or variants
type NativeBaseTheme = typeof nativeBaseTheme;
declare module "native-base" {
  interface ICustomTheme extends NativeBaseTheme {}
}

export { nativeBaseTheme };

export default nativeBaseTheme;
