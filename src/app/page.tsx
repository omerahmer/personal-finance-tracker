import InfoCardContainer from "@/components/info-card-container";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { ModeToggle } from "@/components/ui/theme-picker";
import { PlusIcon } from "lucide-react";
import WeeklySpending from "@/components/weekly-spending"
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-cols-8 gap-8 m-8">
      <div className="flex flex-row justify-between col-span-full">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-green-400 text-transparent bg-clip-text">
          Personal Finance Tracker
        </h1>
        <div className="flex flex-row justify-between gap-2">
          <ModeToggle />
          <DatePicker />
          <Button variant={'outline'}>Export CSV</Button>
          <Link href={'/new'}>
            <Button>
              <PlusIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      <InfoCardContainer />
      <div className="col-span-3">
        <WeeklySpending />
      </div>
      <div className="col-span-5">
        {/*<TableCard />*/}
      </div>
    </div>
  );
}
