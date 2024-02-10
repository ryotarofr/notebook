// "use client"

// import {
//   ComponentPropsWithRef,
//   ReactNode,
//   useEffect,
//   useId,
//   useState,
// } from "react";
// import { Check, ChevronsUpDown } from "lucide-react"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "@/components/ui/command"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import { Input } from "./input"
// import { Override } from "@/types/override"
// import { getMappedObject } from "@/fn/getMappedObject";
// import { partializeSetState } from "@/fn/partializeSetState";
// import { Option } from "./ComboBox/Option";

// import styles from "./ComboBox.module.scss";
// import clsx from "clsx";

// const frameworks = [
//   {
//     value: "next.js",
//     label: "Next.js",
//   },
//   {
//     value: "sveltekit",
//     label: "SvelteKit",
//   },
//   {
//     value: "nuxt.js",
//     label: "Nuxt.js",
//   },
//   {
//     value: "remix",
//     label: "Remix",
//   },
//   {
//     value: "astro",
//     label: "Astro",
//   },
// ]

// export const Combobox = <
//   T extends Record<string, string>,
//   FreeInput extends boolean,
//   Value extends ((FreeInput extends true ? string : keyof T) | undefined)
// >({
//   suggestions,
//   value: currentKey,
//   setValue,
//   freeInput,
//   filterable = false,
//   children,
//   ...wrappedProps
// }: Override<
//   Omit<ComponentPropsWithRef<typeof Input>, "type">,
//   {
//     suggestions: T;
//     value: Value;
//     setValue: (inout: Value) => void;
//     filterable?: boolean;
//     freeInput?: FreeInput;
//   }
// >): ReactNode => {
//   const [open, setOpen] = useState(false)
//   const datalistId = useId();
//   const required = wrappedProps.required;
//   const readOnly = wrappedProps.readOnly;

//   const keys: (keyof T)[] = Object.keys(suggestions);
//   const findKey = (value: string): Value => {
//     return keys.find((key) => suggestions[key] === value) as Value;
//   };
//   const findValueOr = (key?: Value): string => {
//     if (key === undefined) return "";
//     return suggestions[key]?.toString() ?? key.toString();
//   };

//   const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
//   const [rawInput, setRawInput] = useState<string>(findValueOr(currentKey));

//   // 描画選択肢と選択中の状態
//   const [options, setOptions] = useState(Object.entries(suggestions));
//   useEffect(() => setOptions(Object.entries(suggestions)), [suggestions]);
//   const [focused, setFocused] = useState<boolean>(false);

//   // 選択肢表示時に選択中要素までスクロール
//   const [optionsFocusFns, _setOptionsFocusFns] = useState<Record<string, () => void>>(
//     getMappedObject(suggestions, () => () => console.error("focus fnction don't initialized.")),
//   );
//   const setOptionsFocusFns = partializeSetState(_setOptionsFocusFns);
//   useEffect(() => {
//     focused
//       && currentKey
//       && optionsFocusFns?.[currentKey as string]?.();
//   }, [focused]);

//   const [focusedOption, setFocusedOption] = useState<Value>();
//   const focusNext = () => {
//     const currentIndex = options.findIndex(([key]) => key === focusedOption);
//     const nextIndex = currentIndex + 1;
//     const next = options[nextIndex]?.[0] ?? options[0]?.[0];
//     if (next === undefined) return;
//     setFocusedOption(next as Value);
//     optionsFocusFns[next]?.();
//   };
//   const focusPrev = () => {
//     const currentIndex = options.findIndex(([key]) => key === focusedOption);
//     const prevIndex
//       = currentIndex === -1 || currentIndex === 0
//         ? options.length - 1
//         : currentIndex - 1;
//     const prev = options[prevIndex]?.[0];
//     if (prev === undefined) return;
//     setFocusedOption(prev as Value);
//     optionsFocusFns[prev]?.();
//   };

//   // 選択肢のソート
//   useEffect(() => {
//     if (!filterable) return;
//     const input = rawInput;
//     const inputWithoutCase = input.toLocaleLowerCase();
//     const options = Object.entries(suggestions);
//     setOptions(
//       options
//         .sort()
//         .sort(([, prevValue], [, nextValue]) =>
//           sortWithIncludes(prevValue, nextValue)(inputWithoutCase))
//         .sort(([, prevValue], [, nextValue]) =>
//           sortWithIncludes(prevValue, nextValue)(input))
//         .sort(([, prevValue], [, nextValue]) =>
//           sortWithStartsWith(prevValue, nextValue)(inputWithoutCase))
//         .sort(([, prevValue], [, nextValue]) =>
//           sortWithStartsWith(prevValue, nextValue)(input)),
//     );
//   }, [rawInput, suggestions, filterable]);


//   return (

//   )
// }

// const sortWithStartsWith
//   = (prev: string, next: string) =>
//     (input: string) =>
//       next.startsWith(input) || !prev.startsWith(input)
//         ? 1 : -1;
// const sortWithIncludes
//   = (prev: string, next: string) =>
//     (input: string) =>
//       next.includes(input) || !prev.includes(input)
//         ? 1 : -1;


"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

export function Combobox() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select framework..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {frameworks.map((framework) => (
              <CommandItem
                key={framework.value}
                value={framework.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === framework.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {framework.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
