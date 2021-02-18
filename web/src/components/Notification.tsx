import React from "react";
import cn from "classnames";
import { withStyles, WithStyles } from "@material-ui/core/styles";
import { createStyles, Snackbar } from "@material-ui/core";
import { Color, Alert } from "@material-ui/lab";

const styles = () =>
  createStyles({
    root: {},
  });

type NotificationProps = WithStyles<typeof styles> & {
  className?: string;
  content: string;
  severity: Color;
  timeout: number;
  onClose: () => void;
};

function Notification(props: NotificationProps): React.ReactElement {
  const { classes, className, content, severity, timeout, onClose } = props;
  const [show, setShow] = React.useState<boolean>(content.length > 0);
  const [label, setLabel] = React.useState<string>(content);

  const handleClose = () => {
    setShow(false);
  };

  React.useEffect(() => {
    if (content.length > 0) {
      setLabel(content);
      setShow(true);
    }
  }, [setShow, content]);

  React.useEffect(() => {
    if (!show) {
      onClose();
    }
  }, [onClose, show]);

  return (
    <Snackbar
      className={cn(classes.root, className)}
      open={show}
      autoHideDuration={timeout}
      onClose={handleClose}
      ClickAwayListenerProps={{
        mouseEvent: false,
        touchEvent: false,
      }}
    >
      <Alert onClose={handleClose} severity={severity}>
        {label}
      </Alert>
    </Snackbar>
  );
}

export default withStyles(styles)(Notification);
