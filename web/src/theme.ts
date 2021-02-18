import { createMuiTheme, Theme } from "@material-ui/core/styles";
import { grey, yellow, deepPurple } from "@material-ui/core/colors";
import { ThemePreference } from "./types/theme-preference";

const theme = (themePreference: ThemePreference): Theme => {
  console.log("theme = ", themePreference);

  return createMuiTheme({
    palette: {
      background: {
        default: "white",
      },
      text: {
        primary: grey[900],
      },
      primary: {
        main: deepPurple[600],
      },
      secondary: {
        main: yellow[800],
      },
    },
  });
};

export default theme;
