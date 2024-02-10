"use client"

import { Combobox } from "@/components/combobox";
import { useState } from "react";

interface shikenNames {
  [key: string]: string;
}

type App = {
  shikenName?: keyof typeof shikenNames;
}

type SearchFormProps = {
  shikenType: keyof typeof shikenTypes,

}


const shikenTypes = {
  1: "type1",
  2: "type2",
}

const shikenNames: shikenNames = {
  "": "",
  "test1": "test111"
}

export default function Home() {
  const [searchForm, setSearchForm] = useState<SearchFormProps>({
    shikenType: 1,
  })
  return (
    <div>
      <Combobox />
    </div>
  )
}
