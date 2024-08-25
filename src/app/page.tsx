"use client";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createTable,
  getPartialPrice,
  Item,
  validateTotals,
} from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Form() {
  const [items, setItems] = useState<Item[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentPerson, setCurrentPerson] = useState<string>("");
  const [tipInput, setTipInput] = useState<number>(0);
  const [taxInput, setTaxInput] = useState<number>(0);
  const [tipAsProportion, setTipAsProportion] = useState<boolean>(false);
  const [table, setTable] = useState<
    (string | { id: string; buyer: string })[][]
  >([[]]);
  const [tip, setTip] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);

  // adds or removes a person from the list of buyers of an item
  function toggleBuyer(item: number, person: string) {
    if (items[item].buyers.includes(person)) {
      items[item].buyers = items[item].buyers.filter((i: any) => i !== person);
    } else {
      items[item].buyers = [...items[item].buyers, person];
    }
    setTable(createTable(items, people, tip, tax, tipAsProportion));
  }

  // adds a person to the group
  function addPerson() {
    setPeople([...people, currentPerson]);
    setCurrentPerson("");
  }

  // adds the current form item to the list
  function addItem() {
    setItems([
      ...items,
      {
        name: currentItem,
        price: Number(currentPrice),
        buyers: [],
      },
    ]);
    setCurrentItem("");
    setCurrentPrice(0);
  }

  function reset() {
    setItems([]);
    setPeople([]);
    setCurrentItem("");
    setCurrentPrice(0);
    setCurrentPerson("");
    setTipInput(0);
    setTaxInput(0);
    setTipAsProportion(false);
  }

  useEffect(() => {
    setTable(createTable(items, people, tip, tax, tipAsProportion));
  }, [items, people, tip, tax, tipAsProportion]);

  useEffect(() => {
    setTip(Number(tipInput));
    setTax(Number(taxInput));
  }, [tipInput, taxInput]);

  return (
    <Card className="w-6xl">
      <CardHeader>
        <CardTitle>bill splitter v2</CardTitle>
        <CardDescription>created by jasonw</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.length !== 0 || people.length !== 0 ? (
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
                  <></>
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
                              {getPartialPrice(items, item.id, item.buyer) !=
                              "0.00"
                                ? `$${getPartialPrice(items, item.id, item.buyer)}`
                                : "-"}
                            </Button>
                          </TableCell>
                        );
                      } else {
                        let classnames = "text-right font-bold";
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
        ) : (
          <></>
        )}
      </CardContent>
      <CardFooter className="flex flex-col w-full">
        <div className="flex flex-col w-full border rounded-md p-5 gap-5">
          <h3 className="w-full font-lg font-bold">Input some data to begin</h3>
          <form
            className=" w-full flex gap-2 flex-col justify-center"
            onSubmit={(event) => event.preventDefault()}
          >
            <Input
              value={currentPerson}
              onChange={(event) => setCurrentPerson(event.target.value)}
            ></Input>
            <Button className="w-full" type="submit" onClick={addPerson}>
              add person
            </Button>
          </form>
          <Separator></Separator>

          <form
            className=" w-full flex gap-2 flex-col justify-center"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="flex">
              <Input
                className="w-full"
                value={currentItem}
                onChange={(event) => setCurrentItem(event.target.value)}
              ></Input>
              <Input
                className="w-28"
                value={currentPrice}
                onChange={(event) =>
                  setCurrentPrice(parseFloat(event.target.value))
                }
                type="number"
              ></Input>
            </div>
            <Button className="w-full" type="submit" onClick={addItem}>
              add item
            </Button>
          </form>
          <div className="flex flex-col gap-1 w-full">
            <Label className="w-1/3">Tax paid</Label>
            <Input
              value={taxInput}
              onChange={(event) => setTaxInput(parseFloat(event.target.value))}
              type="number"
            ></Input>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <Label className="w-1/3">Tip paid</Label>
            <Input
              value={tipInput}
              onChange={(event) => setTipInput(parseFloat(event.target.value))}
              type="number"
            ></Input>
          </div>
          <div className="flex w-full items-center justify-between">
            {tipAsProportion ? (
              <div className="flex flex-col">
                <Label>Tip as pecent of subtotal</Label>
                <Label className="text-gray-400">
                  Everyone tips proportional to their meal
                </Label>
              </div>
            ) : (
              <div className="flex flex-col">
                <Label>Tip split evenly</Label>
                <Label className="text-gray-400">Everyone tips the same</Label>
              </div>
            )}
            <Switch
              checked={tipAsProportion}
              onCheckedChange={(checked) => setTipAsProportion(checked)}
            ></Switch>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            type="submit"
            onClick={reset}
          >
            reset
          </Button>
          <Footer></Footer>
        </div>
      </CardFooter>
    </Card>
  );
}
