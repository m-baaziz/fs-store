import React from "react";
import cn from "classnames";
import { Theme, makeStyles } from "@material-ui/core/styles";
import {
  TableHead,
  TableCell,
  TableRow,
  Checkbox,
  TableSortLabel,
  SortDirection,
  TableCellProps,
} from "@material-ui/core";

export type HeadCell<T> = {
  id: keyof T;
  numeric: boolean;
  disablePadding: boolean;
  label: string;
  cellProps?: TableCellProps;
};

const styles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
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
}));

type EnhancedTableHeadProps<T> = {
  className?: string;
  headCells: HeadCell<T>[];
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: SortDirection;
  orderBy: keyof T;
  numSelected: number;
  rowCount: number;
  onRequestSort: (key: keyof T) => void;
  additionalHeaders?: string[];
};

export default function EnhancedTableHead<T>(
  props: EnhancedTableHeadProps<T>
): React.ReactElement {
  const classes = styles();
  const {
    className,
    headCells,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    additionalHeaders,
  } = props;

  const createSortHandler = (property: keyof T) => () => {
    onRequestSort(property);
  };

  return (
    <TableHead className={cn(classes.root, className)}>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all desserts" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id as string}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={
                orderBy === headCell.id ? (order as "asc" | "desc") : "asc"
              }
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        {additionalHeaders
          ? additionalHeaders.map((additionHeader) => (
              <TableCell key={additionHeader} align="right" padding="default">
                {additionHeader}
              </TableCell>
            ))
          : null}
      </TableRow>
    </TableHead>
  );
}
