import React from "react";
import Head from "next/head";
import {
  withStyles,
  WithStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createStyles } from "@material-ui/core";

import Headbar from "./Headbar";

import myTheme from "../../theme";
import { ThemePreference } from "../../types/theme-preference";

const styles = () =>
  createStyles({
    container: {
      minHeight: "100vh",
      padding: "0 0.5rem",
      display: "grid",
      gridTemplate:
        "  \
        ' header '  auto   \
        ' main   '   1fr  \
        / 1fr \
      ",
    },
    header: {
      gridArea: "header",
    },
    main: {
      gridArea: "main",
    },
  });

type LayoutProps = WithStyles<typeof styles> & {
  theme: ThemePreference;
};

function Layout(
  props: React.PropsWithChildren<LayoutProps>
): React.ReactElement {
  const { children, classes, theme } = props;

  return (
    <>
      <Head>
        <title>FS Store</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={myTheme(theme)}>
        <CssBaseline />
        <div className={classes.container}>
          <Headbar className={classes.header} />
          <main className={classes.main}>{children}</main>
        </div>
      </ThemeProvider>
    </>
  );
}

export default withStyles(styles)(Layout);
