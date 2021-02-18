import React from "react";
import cn from "classnames";
import { Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import {
  createStyles,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  TablePagination,
  SortDirection,
  IconButton,
} from "@material-ui/core";
import { GetApp as GetAppIcon } from "@material-ui/icons";
import { grey } from "@material-ui/core/colors";

import EnhancedTableToolbar from "./EnhancedTableToolbar";
import EnhancedTableHead, { HeadCell } from "./EnhancedTableHead";

import FileContext from "../../../contexts/file-context";
import { StoreFile } from "../../../types/file";
import { API_FILES_URL } from "../../../constants/file";

type SortResult = -1 | 0 | 1;
type FileTableProps = WithStyles<typeof styles> & {
  className?: string;
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
      backgroundColor: grey[100],
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
  });

const headCells: HeadCell<StoreFile>[] = [
  {
    id: "filename",
    numeric: false,
    disablePadding: true,
    label: "Filename",
    cellProps: {
      component: "th",
      id: "filename",
      scope: "row",
      padding: "none",
    },
  },
  {
    id: "contentType",
    numeric: true,
    disablePadding: false,
    label: "Content Type",
    cellProps: {
      align: "right",
    },
  },
  {
    id: "size",
    numeric: true,
    disablePadding: false,
    label: "Size (b)",
    cellProps: {
      align: "right",
    },
  },
  {
    id: "uploadDate",
    numeric: true,
    disablePadding: false,
    label: "Upload date",
    cellProps: {
      align: "right",
    },
  },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): SortResult {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<T>(
  order: SortDirection,
  orderBy: keyof T
): (a: T, b: T) => SortResult {
  return order === "desc"
    ? (a: T, b: T) => descendingComparator(a, b, orderBy)
    : (a: T, b: T) => -descendingComparator(a, b, orderBy) as SortResult;
}

function stableSort<T>(
  array: T[],
  comparator: (a: T, b: T) => SortResult
): T[] {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a: [T, number], b: [T, number]) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el: [T, number]) => el[0]);
}

function FileTable(props: FileTableProps): React.ReactElement {
  const { classes, className } = props;
  const { files, deleteFiles } = React.useContext(FileContext);
  const [tableFiles, setTableFiles] = React.useState<StoreFile[]>(files);
  const [order, setOrder] = React.useState<SortDirection>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof StoreFile>("uploadDate");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  React.useEffect(() => {
    setTableFiles(files);
  }, [setTableFiles, files]);

  const handleRequestSort = (property: keyof StoreFile) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = tableFiles.map((f) => f.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    id: string
  ) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = async () => {
    try {
      const [deletedIds] = await deleteFiles(selected);
      setTableFiles(tableFiles.filter((f) => !deletedIds.includes(f.id)));
      if (selected.length > 0) {
        setSelected(selected.filter((id) => !deletedIds.includes(id)));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const isSelected = (id: string): boolean => selected.indexOf(id) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, tableFiles.length - page * rowsPerPage);

  return (
    <div className={cn(classes.root, className)}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          title="Files"
          numSelected={selected.length}
          onDeleteClick={handleDeleteClick}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              headCells={headCells}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={tableFiles.length}
              additionalHeaders={[""]}
            />
            <TableBody>
              {stableSort(tableFiles, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                      {headCells.map((cell) => (
                        <TableCell key={cell.id} {...cell.cellProps}>
                          {row[cell.id]}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <a href={`${API_FILES_URL}/${row.id}`} download>
                          <IconButton aria-label="download">
                            <GetAppIcon />
                          </IconButton>
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 33 * emptyRows }}>
                  <TableCell colSpan={5} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tableFiles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

export default withStyles(styles)(FileTable);
