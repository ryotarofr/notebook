"use client"


import { Combobox } from "@/components/combobox";
import { partializeSetState } from "@/fn/partializeSetState";
import { useState } from "react";

interface shikenNames {
  [key: string]: string;
}

type App = {
  shikenName?: keyof typeof shikenNames;
}

type SearchFormProps = {
  shikenType: keyof typeof shikenTypes,
  shikenName?: keyof typeof shikenNames;

}


const shikenTypes = {
  1: "type1",
  2: "type2",
}

const shikenNames: shikenNames = {
  "": "",
  "test1": "test111",
  "test2": "test111"
}

export default function Home() {
  const [searchForm, setSearchForm] = useState<SearchFormProps>({
    shikenType: 1,
  })

  // partializeSetState を使って shikenName の部分化された setState 関数を取得
  const setShikenName = partializeSetState(setSearchForm)("shikenName");

  // shikenName の値を更新するためのイベントハンドラ
  const handleShikenNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    // 部分化された setState 関数を呼び出して shikenName を更新
    setShikenName(newValue);
  };

  console.log(searchForm.shikenName);

  return (
    <div>

      {/* <input
        type="text"
        value={searchForm.shikenName || ""}
        onChange={handleShikenNameChange}
      /> */}
      <Combobox />
    </div>
  )
}
