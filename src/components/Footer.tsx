"use client";
import { ModeToggle } from "./ModeToggle";

export default function Footer() {
  return (
    <footer className="grid grid-cols-3 w-full mt-4 text-muted-foreground text-xs">
      <ModeToggle />
      <span className="flex flex-col items-center justify-center">
        <span>copyright 2024</span>
        <span className="text-center">
          open source under{" "}
          <a
            className="underline"
            href={`https://github.com/jaasonw/bsv2/blob/main/LICENSE`}
          >
            mit license
          </a>
        </span>
      </span>{" "}
      <span className="flex flex-col items-end">
        <a
          href={`https://github.com/jaasonw/bsv2`}
          className="text-right hover:underline"
        >
          view source on github
        </a>
        <a
          href="https://jason-wong.me/donate"
          className="text-right hover:underline"
        >
          buy me a coffee
        </a>
      </span>
    </footer>
  );
}
