import React from "react";
import Head from "next/head";
import { withStyles, WithStyles } from "@material-ui/core/styles";
import { createStyles } from "@material-ui/core";

const styles = () =>
  createStyles({
    root: { height: "100%", display: "flex" },
    content: { margin: "auto" },
  });

type HomeProps = WithStyles<typeof styles>;

function Home(props: HomeProps): React.ReactElement {
  const { classes } = props;

  return (
    <>
      <Head>
        <title>FS Store</title>
      </Head>
      <div className={classes.root}>
        <div className={classes.content}>Content</div>
      </div>
    </>
  );
}

export default withStyles(styles)(Home);
