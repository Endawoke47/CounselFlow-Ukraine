"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css";

type IProps = {
  selected: Date | undefined;
  setSelected: (date: Date) => void;
}
function Calendar({selected, setSelected}: IProps) {
  return (
    <DayPicker
      animate
      mode="single"
      selected={selected}
      onSelect={setSelected}
      required={true}
      className="p-3"
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }