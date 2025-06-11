"use client";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  createTable,
  getPartialAmount,
  getPartialSubtotal,
  getSubtotal,
  getTotal,
} from "@/lib/utils";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { BillContext, BillContextType, BillProvider } from "@/components/BillProvider";
import PhotoUpload from "@/components/PhotoUpload";

export default function Form() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [personFormOpen, setPersonFormOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    // setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  const context = use(BillContext) as BillContextType;
  const {
    items,
    setItems,
    people,
    setPeople,
    currentItem,
    setCurrentItem,
    currentPrice,
    setCurrentPrice,
    currentPerson,
    setCurrentPerson,
    tipInput,
    setTipInput,
    taxInput,
    setTaxInput,
    tipAsProportion,
    setTipAsProportion,
    tip,
    setTip,
    tax,
    setTax,
    setTable,
    deleteItem
  } = context;


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
    setPeople([
      ...people,
      currentPerson === "" ? "person" + (people.length + 1) : currentPerson,
    ]);
    setCurrentPerson("");
  }

  // adds the current form item to the list
  function addItem() {
    setItems([
      ...items,
      {
        name: currentItem === "" ? "item" + (items.length + 1) : currentItem,
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
    setTipAsProportion(true);
  }

  useEffect(() => {
    setTable(createTable(items, people, tip, tax, tipAsProportion));
  }, [items, people, tip, tax, tipAsProportion]);

  useEffect(() => {
    setTip(Number(tipInput));
    setTax(Number(taxInput));
  }, [tipInput, taxInput]);

  return (
    <Card className="w-6xl p-6">
      <CardHeader>
        <CardTitle>bill splitter v2</CardTitle>
        <CardDescription>created by jasonw</CardDescription>
      </CardHeader>
      <Table>
        <TableBody>
          {items.map((item, i) => (
            <TableRow
              key={i}
            >
              <TableCell onClick={() => toggleBuyer(i, people[current - 1])}>
                <div className="flex">
                  <div
                    className={`bg-black mr-1 w-1 ${item.buyers.includes(people[current - 1]) ? "" : "hidden"}`}
                  ></div>
                  <div className="flex flex-col">
                    {item.name}
                    <div className="flex flex-row gap-2">
                      <span>
                        {(() => {
                          const { buyers } = item;
                          const buyerCount = buyers.length;

                          if (buyerCount === 1) {
                            return `${buyers[0]} bought this`;
                          }

                          if (buyerCount === 2) {
                            return `${buyers[0]} and ${buyers[1]} bought this`;
                          }

                          if (buyerCount > 2) {
                            const allButLast = buyers.slice(0, -1).join(", ");
                            const lastBuyer = buyers[buyers.length - 1];
                            return `${allButLast}, and ${lastBuyer} bought this`;
                          }

                          return "No one got this";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right" onClick={() => toggleBuyer(i, people[current - 1])}>
                ${item.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(i);
                  }}
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-bold" colSpan={3}>
              <AlertDialog open={itemFormOpen}>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    setItemFormOpen(true);
                  }}
                >
                  Add Item
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Add Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      <form
                        className="w-full flex gap-2 flex-col justify-center"
                        onSubmit={(event) => {
                          event.preventDefault();
                          setItemFormOpen(false);
                          addItem();
                        }}
                      >
                        <div className="flex">
                          <Input
                            className="w-full"
                            value={currentItem}
                            placeholder="Item"
                            onChange={(event) =>
                              setCurrentItem(event.target.value)
                            }
                          ></Input>
                          <Input
                            className="w-28"
                            value={currentPrice}
                            placeholder="Price"
                            onChange={(event) =>
                              setCurrentPrice(parseFloat(event.target.value))
                            }
                            type="number"
                          ></Input>
                        </div>
                        <div className="flex gap-2">
                          <Button className="w-full" type="submit">
                            Add Item
                          </Button>
                          <AlertDialogCancel
                            type="button"
                            onClick={() => setItemFormOpen(false)}
                          >
                          </AlertDialogCancel>

                        </div>
                      </form>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
          {items.length > 0 ? (
            <>
              <TableRow>
                <TableCell className="font-bold" colSpan={2}>Subtotal</TableCell>
                <TableCell className="text-right font-bold">
                  ${getSubtotal(items).toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold" colSpan={2}>Tax</TableCell>
                <TableCell className="text-right font-bold">
                  <div className="flex flex-col">
                    <span>${tax.toFixed(2)}</span>
                    <span className="text-gray-400">
                      (
                      {getSubtotal(items) != 0
                        ? ((tax / getSubtotal(items)) * 100).toFixed(2)
                        : "0.00"}
                      %)
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold" colSpan={2}>Tip</TableCell>
                <TableCell className="text-right font-bold">
                  ${tip.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold" colSpan={2}>Total</TableCell>
                <TableCell className="text-right font-bold">
                  ${getTotal(tip, tax, items)}
                </TableCell>
              </TableRow>
            </>
          ) : (
            ""
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-3 p-4">
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
      </div>
      <div className="flex flex-col justify-center items-center">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          setApi={setApi}
          className="w-10/12"
        >
          <CarouselContent className="">
            {people.map((name, index) => (
              <CarouselItem
                key={index}
                className={people.length > 2 ? "basis-1/2" : ""}
              >
                <Card key={index} className="flex justify-center">
                  {name}
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="py-2 text-center text-sm text-muted-foreground">
          {people.length > 0
            ? `Select the items that ${people[current - 1]} bought`
            : "Add some people to the tab to get started"}
        </div>
        <AlertDialog open={personFormOpen}>
          <Button
            className="w-full"
            onClick={() => {
              setPersonFormOpen(true);
            }}
          >
            Add Person
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Person</AlertDialogTitle>
              <AlertDialogDescription>
                <form
                  className="w-full flex gap-2 flex-col justify-center"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setPersonFormOpen(false);
                    addPerson();
                  }}
                >
                  <Input
                    value={currentPerson}
                    placeholder="Enter person's name"
                    onChange={(event) => setCurrentPerson(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button className="w-full" type="submit">
                      Add Person
                    </Button>
                    <AlertDialogCancel
                      type="button"
                      onClick={() => setPersonFormOpen(false)}
                    >
                      Cancel
                    </AlertDialogCancel>
                  </div>
                </form>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Table>
        <TableBody>
          {people.map((person, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold">{person}</span>
                  <ol>
                    {items.map((item, j) => (
                      <li className="flex justify-between" key={j}>
                        <span>
                          {item.buyers.includes(person) ? item.name : ""}
                        </span>
                        <span>
                          {item.buyers.includes(person)
                            ? `$${(item.price / item.buyers.length).toFixed(2)}`
                            : ""}
                        </span>
                      </li>
                    ))}
                    <li className="flex justify-between font-bold">
                      <span>Subtotal</span>
                      <span>
                        {getPartialSubtotal(person, items).toFixed(2)}
                      </span>
                    </li>
                    <li className="flex justify-between font-bold">
                      <span>Tax</span>
                      <span>
                        ${getPartialAmount(person, tax, items).toFixed(2)}
                      </span>
                    </li>
                    <li className="flex justify-between font-bold">
                      <span>Tip</span>
                      <span>
                        $
                        {(tipAsProportion
                          ? getPartialAmount(person, tip, items)
                          : tip / people.length
                        ).toFixed(2)}
                      </span>
                    </li>
                    <li className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        $
                        {(
                          items.reduce(
                            (acc, item) =>
                              item.buyers.includes(person)
                                ? acc + item.price / item.buyers.length
                                : acc,
                            0,
                          ) +
                          (tipAsProportion
                            ? getPartialAmount(person, tip, items)
                            : tip / people.length) +
                          getPartialAmount(person, tax, items)
                        ).toFixed(2)}
                      </span>
                    </li>
                  </ol>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        variant="outline"
        className="w-full"
        type="submit"
        onClick={reset}
      >
        reset
      </Button>
      <PhotoUpload></PhotoUpload>
      <a className="block mt-4 underline">
        <Link href="/">Return to the classic UI</Link>
      </a>
      <Footer></Footer>
    </Card>
  );
}
