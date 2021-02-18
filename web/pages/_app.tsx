import React from "react";
import type { AppProps } from "next/app";
import { useMediaQuery } from "@material-ui/core";

import Layout from "../src/components/layout/Layout";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  const preferLightTheme = useMediaQuery("(prefers-color-scheme: light)");

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <Layout theme={preferLightTheme ? "light" : "dark"}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
