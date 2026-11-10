"use client";

type Line = { title: string; selectedColor?: string; price: number; quantity: number };
type PrintableOrder = {
  trackingCode: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  items: Line[];
};

export function OrderDocument({ order, kind, close }: { order: PrintableOrder; kind: "invoice" | "packing"; close: () => void }) {
  const invoice = kind === "invoice";
  const amount = (value: number) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(value);
  return <div className="rounded-xl border bg-white p-5">
    <div className="mb-4 flex gap-2 print:hidden">
      <button type="button" className="btn-grad btn-grad--fit rounded-lg px-4 py-2 text-white" onClick={() => window.print()}>Print</button>
      <button type="button" className="rounded-lg border px-4 py-2" onClick={close}>Close preview</button>
    </div>
    <article className="order-print-document space-y-4" aria-label={invoice ? "Invoice preview" : "Packing slip preview"}>
      <h2 className="text-2xl font-bold">{invoice ? "Order invoice" : "Packing slip"}</h2>
      <p>Order reference {order.trackingCode}</p>
      <address className="not-italic">{order.customerName}<br />{order.phone}<br />{order.address}, {order.district}</address>
      <table className="w-full border-collapse text-left">
        <thead><tr className="border-b"><th scope="col" className="py-2">Product</th><th scope="col">Quantity</th>{invoice && <th scope="col">Amount</th>}</tr></thead>
        <tbody>{order.items.map((line, index) => <tr key={index} className="border-b"><td className="py-2">{line.title}{line.selectedColor ? " · " + line.selectedColor : ""}</td><td>{line.quantity}</td>{invoice && <td>{amount(line.price * line.quantity)}</td>}</tr>)}</tbody>
      </table>
      {invoice && <dl className="ml-auto grid max-w-xs grid-cols-2 gap-2">
        <dt>Subtotal</dt><dd>{amount(order.subtotal)}</dd>
        <dt>Delivery</dt><dd>{amount(order.deliveryFee)}</dd>
        <dt>Discount</dt><dd>{amount(order.discount)}</dd>
        <dt className="font-bold">Order total</dt><dd className="font-bold">{amount(order.total)}</dd>
      </dl>}
    </article>
  </div>;
}
