import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PeriodSelectorProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onPresetSelect: (preset: "today" | "week" | "month" | "year") => void;
}

export const PeriodSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetSelect,
}: PeriodSelectorProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPresetSelect("today")}
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPresetSelect("week")}
        >
          7 dias
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPresetSelect("month")}
        >
          30 dias
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPresetSelect("year")}
        >
          1 ano
        </Button>
      </div>

      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(startDate, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground">até</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(endDate, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
