/** Date または DateTime 文字列を、日付のみの文字列に変換 */
export const dateTimeToDateStr = (
  /** 日付文字列 */
  dateTime: Date | string | undefined,
  /** 区切り文字 (デフォルト `"-"`) */
  delimiter: string = "-",
) => {
  if (!dateTime) {
    return "";
  }
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
  return `${
    date.getFullYear()
  }${delimiter}${
    String(date.getMonth() + 1).padStart(2, "0")
  }${delimiter}${
    String(date.getDate()).padStart(2, "0")
  }`;
};

/** Date または DateTime 文字列を、[時/分/秒]の数値に変換 */
export const dateTimeToHmsInput = (
  /** 日付文字列 */
  dateTime: Date | string | undefined,
  /** 変換先の時/分/秒 */
  to: "hour" | "min" | "sec",
) => {
  if (!dateTime) {
    return undefined;
  }
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
  if (isInvalidDate(date)) {
    return undefined;
  }
  return (
    to === "hour"
      ? date.getHours()
      : to === "min"
        ? date.getMinutes()
        : date.getSeconds()
  );
};

/** DateInput の編集を DateTime 文字列に反映 */
export const inputDateToDateTime = (
  /** 日付文字列 */
  dateTime: string | undefined,
  /** DateInput の編集後の value */
  newDateStr: string | undefined,
) => {
  if (!newDateStr) {
    return undefined;
  }
  const date = dateTime ? new Date(dateTime) : new Date(new Date().toLocaleDateString("en-US"));
  const match = (newDateStr ?? "").match(/^(\d{4})-(\d\d)-(\d\d)$/);
  if (!match) {
    return dateTime;
  }
  date.setFullYear(Number(match[1]));
  date.setMonth(Number(match[2]) - 1);
  date.setDate(Number(match[3]));
  return date.toISOString();
};

/** [時/分/秒]の編集を DateTime 文字列に反映 */
export const inputHmsToDateTime = (
  /** 日付文字列 */
  dateTime: string | undefined,
  /** [時/分/秒]の編集後の value */
  newVal: number | undefined,
  /** 変換元の[時/分/秒] */
  from: "hour" | "min" | "sec",
) => {
  if (newVal == null) {
    return dateTime;
  }
  // 日付がまだない場合は今日に設定
  let date = dateTime ? new Date(dateTime) : getTodayDate();
  if (isInvalidDate(date)) {
    date = getTodayDate();
  }
  switch (from) {
  case "hour": {
    date.setHours(newVal);
    break;
  }
  case "min": {
    date.setMinutes(newVal);
    break;
  }
  case "sec": {
    date.setSeconds(newVal);
    break;
  }
  default:
  }
  return date.toISOString();
};

export const isInvalidDate = (date: Date) => Number.isNaN(date.getTime());

/** 今日 0:00:00 の Date を取得 */
export const getTodayDate = () => {
  const date = createZeroTimeDateFrom(new Date());
  setZeroTimeToDate(date);
  return date;
};

/** Date の時刻部分を 0:00:00 に置き換えたものを引数の Date から作成する */
export const createZeroTimeDateFrom = (date: Date | string) => {
  const newDate = new Date(date);
  setZeroTimeToDate(newDate);
  return newDate;
};

/** Date の時刻部分を 0:00:00 に置き換える。引数の Date を書き換える */
export const setZeroTimeToDate = (date: Date) => {
  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);
  date.setHours(0);
};
