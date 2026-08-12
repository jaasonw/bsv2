"use client";

export default function Footer() {
  return (
    <footer className="mt-4 grid w-full grid-cols-1 items-center gap-3 text-xs text-muted-foreground sm:grid-cols-2">
      <span className="flex flex-col items-center justify-center sm:items-start">
        <span>copyright 2026</span>
        <span className="text-center sm:text-left">
          open source under{" "}
          <a
            className="underline"
            href={`https://github.com/jaasonw/bsv2/blob/master/LICENSE`}
          >
            mit license
          </a>
        </span>
      </span>{" "}
      <span className="flex flex-col items-center sm:items-end">
        <a
          href={`https://github.com/jaasonw/bsv2`}
          className="text-right hover:underline"
        >
          view source on github
        </a>
        <span className="text-right">
          ai tokens r not free pls consider{" "}
          <a
            href="https://jason-wong.me/donate"
            className="text-right underline"
          >
            donating
          </a>
        </span>
      </span>
    </footer>
  );
}
