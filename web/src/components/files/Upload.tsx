import React from "react";
import cn from "classnames";
import { Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import { createStyles, Box } from "@material-ui/core";
import { useDropzone } from "react-dropzone";

import FileContext from "../../contexts/file-context";

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    dropzone: {
      height: "100%",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      borderWidth: 2,
      borderRadius: 2,
      borderStyle: "dashed",
      backgroundColor: "#fafafa",
      color: theme.palette.text.secondary,
      outline: "none",
      transition: "border .24s ease-in-out",
    },
    activeDropzone: { borderColor: "#2196f3" },
    acceptDropzone: { borderColor: "#00e676" },
    rejectDropzone: { borderColor: "#ff1744" },
    inputContainer: {
      height: "100%",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      outline: "none",
    },
    input: {},
  });

type UploadProps = WithStyles<typeof styles> & {
  className?: string;
  onError: (error: string) => void;
};

function Upload(props: UploadProps): React.ReactElement {
  const { classes, className, onError } = props;
  const { uploadFile } = React.useContext(FileContext);

  const onFileDrop = async (files: File[]) => {
    try {
      await Promise.all(files.map(uploadFile));
    } catch (e) {
      onError(e);
    }
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop: onFileDrop,
  });

  return (
    <div className={cn(classes.root, className)}>
      <Box
        className={cn({
          [classes.dropzone]: true,
          [classes.activeDropzone]: isDragActive,
          [classes.acceptDropzone]: isDragAccept,
          [classes.rejectDropzone]: isDragReject,
        })}
      >
        <div className={classes.inputContainer} {...getRootProps()}>
          <input className={classes.input} {...getInputProps()} />
          <p>Drag and drop a file, or click to select one</p>
        </div>
      </Box>
    </div>
  );
}

export default withStyles(styles)(Upload);
