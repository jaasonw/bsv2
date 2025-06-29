import { BillContext, BillContextType } from "@/components/BillProvider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPartialPrice, validateTotals } from "@/lib/utils";
import React, { use } from "react";

interface BillTableProps {
  onEditItem: (index: number) => void;
}

export default function BillTable({ onEditItem }: BillTableProps) {
  const context = use(BillContext) as BillContextType;
  const {
    items,
    people,
    tip,
    tax,
    tipAsProportion,
    table,
    setTable,
    createTable,
  } = context;

  // Get responsive class based on number of people
  const getTableWidthClass = () => {
    if (people.length <= 2) return "max-w-2xl";
    if (people.length <= 4) return "max-w-4xl";
    if (people.length <= 6) return "max-w-6xl";
    return "max-w-full";
  };

  function toggleBuyer(item: number, person: string) {
    if (items[item].buyers.includes(person)) {
      items[item].buyers = items[item].buyers.filter((i: any) => i !== person);
    } else {
      items[item].buyers = [...items[item].buyers, person];
    }
    setTable(createTable(items, people, tip, tax, tipAsProportion));
  }

  return (
    <div className="w-full flex justify-center">
      <div className={`w-full ${getTableWidthClass()}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[100px] text-right"
                key="blank"
              ></TableHead>
              {people.map((person) => (
                <TableHead key={person} className="text-right px-3">
                  {person}
                </TableHead>
              ))}
              <TableHead className="text-right" key="price">
                Price
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.map((row: any, i: number) =>
              i === 0 ? (
                <React.Fragment key="header-spacer"></React.Fragment>
              ) : (
                <TableRow key={i}>
                  {row.map((item: any, j: number) => {
                    if (item.hasOwnProperty("id")) {
                      return (
                        <TableCell key={j} className="text-right p-0">
                          <Button
                            variant="ghost"
                            className="h-full w-full text-right items-end justify-end p-3"
                            onClick={() => toggleBuyer(item.id, item.buyer)}
                          >
                            {getPartialPrice(items, item.id, item.buyer) !==
                            "0.00"
                              ? `$${getPartialPrice(items, item.id, item.buyer)}`
                              : "-"}
                          </Button>
                        </TableCell>
                      );
                    } else {
                      const classnames = "text-right font-bold";
                      const isItemRow = i <= items.length;

                      if (j === 0 && isItemRow) {
                        return (
                          <TableCell
                            key={j}
                            className={`${classnames} cursor-pointer`}
                            onClick={() => onEditItem(i - 1)}
                          >
                            {item}
                          </TableCell>
                        );
                      }

                      if (
                        j == row.length - 1 &&
                        row[j - 1].id &&
                        items[row[j - 1].id].buyers.length == 0
                      ) {
                        return (
                          <TableCell
                            key={j}
                            className={`${classnames} text-red-500`}
                          >
                            {item}
                          </TableCell>
                        );
                      } else if (
                        i == table.length - 1 &&
                        !validateTotals(
                          people,
                          tip,
                          tax,
                          tipAsProportion,
                          items,
                        )
                      ) {
                        return (
                          <TableCell
                            key={j}
                            className={`${classnames} text-red-500`}
                          >
                            {item}
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell key={j} className={classnames}>
                          {item}
                        </TableCell>
                      );
                    }
                  })}
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
