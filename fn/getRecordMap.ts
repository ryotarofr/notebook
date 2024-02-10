/**
 * 指定した2つの field をkeyとvalueに用いて、objectの配列からobjectを作成する。
 *
 * @param objects - 変換元のobject配列
 * @param keyFieldName - keyとして用いるfield
 * @param valueFieldName - valueとして用いるfield
 */
export const getRecordMap = <
  T,
  KeyField extends {[Key in keyof T]: T[Key] extends PropertyKey ? Key : never}[keyof T],
  Key extends T[KeyField] extends PropertyKey ? T[KeyField] : never,
  ValueField extends keyof T,
>(
  objects: T[],
  keyFieldName: KeyField,
  valueFieldName: ValueField,
): Record<Key, T[ValueField]> => {
  return Object.fromEntries(
    objects.map((it) => {
      const key = it[keyFieldName];
      const value = it[valueFieldName];
      return [key, value];
    }),
  );
};
