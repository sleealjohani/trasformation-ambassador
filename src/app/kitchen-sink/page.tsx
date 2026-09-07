import type { Metadata } from "next";
import { KitchenSink } from "./KitchenSink";

export const metadata: Metadata = {
  title: "نظام التصميم — جسر التحول",
  description: "معرض المكوّنات وقيم الهوية بكل حالاتها.",
  robots: { index: false, follow: false },
};

export default function KitchenSinkPage() {
  return <KitchenSink />;
}
