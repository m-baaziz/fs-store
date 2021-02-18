import React from "react";
import Link from "next/link";
import cn from "classnames";
import { withStyles, WithStyles } from "@material-ui/core/styles";
import { createStyles } from "@material-ui/core";

const styles = () =>
  createStyles({
    root: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    menuIconContainer: { margin: "auto", marginLeft: 0 },
    moreIconContainer: { margin: "auto", marginRight: 0 },
    icon: { color: "inherit" },
    title: { cursor: "pointer", margin: "auto" },
  });

type HeadbarProps = WithStyles<typeof styles> & {
  className?: string;
};

function Headbar(props: HeadbarProps): React.ReactElement {
  const { classes, className } = props;

  return (
    <div className={cn(classes.root, className)}>
      <Link href="/">
        <h2 className={classes.title}>FS Store</h2>
      </Link>
    </div>
  );
}

export default withStyles(styles)(Headbar);
