import React from "react";
import Head from "next/head";
import { withStyles, WithStyles } from "@material-ui/core/styles";
import { createStyles } from "@material-ui/core";

import FileController from "../src/components/files/FileController";
import Upload from "../src/components/files/Upload";
import FileTable from "../src/components/files/table/FileTable";
import Notification from "../src/components/Notification";

const styles = () =>
  createStyles({
    root: {
      height: "100%",
      display: "grid",
      gridTemplate:
        "  \
        '   .    '  2em \
        ' upload '  1fr \
        '   .    '  2em \
        ' table   ' 2fr \
        '   .    '  1em \
        / 1fr            \
      ",
    },
    upload: { gridArea: "upload" },
    table: { gridArea: "table" },
  });

type HomeProps = WithStyles<typeof styles>;

function Home(props: HomeProps): React.ReactElement {
  const { classes } = props;
  const [error, setError] = React.useState<string>("");

  const handleNotificationClose = () => {
    setError("");
  };

  return (
    <>
      <Head>
        <title>FS Store</title>
      </Head>
      <div className={classes.root}>
        <FileController onError={setError}>
          <Upload className={classes.upload} onError={setError} />
          <FileTable className={classes.table} />
        </FileController>
        <Notification
          content={error}
          severity="error"
          timeout={6000}
          onClose={handleNotificationClose}
        />
      </div>
    </>
  );
}

export default withStyles(styles)(Home);
