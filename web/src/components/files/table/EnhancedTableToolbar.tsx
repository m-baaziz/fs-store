import React from "react";
import cn from "classnames";
import { Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import {
  createStyles,
  Toolbar,
  Typography,
  lighten,
  Tooltip,
  IconButton,
} from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    highlight:
      theme.palette.type === "light"
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: "1 1 100%",
    },
  });

type EnhancedTableToolbarProps = WithStyles<typeof styles> & {
  className?: string;
  title: string;
  numSelected: number;
  onDeleteClick: () => void;
};

function EnhancedTableToolbar(
  props: EnhancedTableToolbarProps
): React.ReactElement {
  const { classes, className, title, numSelected, onDeleteClick } = props;

  const handleDeleteClick = () => {
    onDeleteClick();
  };

  return (
    <Toolbar
      className={cn(classes.root, {
        [className]: true,
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          className={classes.title}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {title}
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </Toolbar>
  );
}

export default withStyles(styles)(EnhancedTableToolbar);
