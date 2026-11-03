import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cx } from "./cx";

export function Table({ className, ...p }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className={cx("w-full border-collapse text-sm tabular", className)} {...p} />
    </div>
  );
}
export function Th({ className, ...p }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cx("h-10 border-b border-border px-4 text-left text-xs font-normal text-muted", className)} {...p} />;
}
export function Td({ className, ...p }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cx("h-12 border-b border-border px-4 align-middle [tr:last-child>&]:border-b-0", className)} {...p} />;
}
