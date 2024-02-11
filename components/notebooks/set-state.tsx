"use client"

import { useState } from "react";

interface shikenNames {
  [key: string]: string;
}

type SearchFormProps = {
  shikenType: keyof typeof shikenTypes,
  shikenName?: keyof typeof shikenNames;

}

const shikenTypes = {
  1: "type1",
  2: "type2",
} as const

const shikenNames: shikenNames = {
  "": "",
  "test1": "test111",
  "test2": "test111"
} as const


type shikenNameKey = keyof typeof shikenNames;

export const SetState = () => {
  const [searchForm, setSearchForm] = useState<SearchFormProps>({
    shikenType: 1,
  })

  // 初期値
  const [selectedShikenName, setSelectedShikenName] = useState<shikenNameKey>("test1")

  // キーを取得
  const selectedShikenNameKey = selectedShikenName;

  // バリューを取得
  const selectedShikenNameValue = shikenNames[selectedShikenNameKey]


  return (
    <div>
      {/* キー：バリュー */}
      {`${selectedShikenNameKey} : ${selectedShikenNameValue}`}
    </div>
  )
}
