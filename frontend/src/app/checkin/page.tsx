import type { Metadata } from "next";
import { CheckinGreeting } from "@/components/checkin-greeting";

export const metadata: Metadata = {
  title: "Émargement — GeoCheckin",
};

export default function CheckinPage() {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <CheckinGreeting />
    </div>
  );
}
