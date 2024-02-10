export const readFiles = <
  ReadMode extends keyof FileReadModeMap,
  Result extends FileReadModeMap[ReadMode]
>({
  readMode,
  accept,
}: {
  readMode: ReadMode;
  accept?: string;
}) => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  if (accept)
    input.accept = accept;
  input.click();
  return new Promise<Awaited<Result>[]>((resolve) => {
    input.addEventListener("change", async () => {
      const files = Array.from(input.files ?? []);
      const readers = await Promise.all(files.map((file) => {
        return new Promise<Result>((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            resolve(reader.result as Result);
          });
          reader.addEventListener("error", () => {
            reject(reader.error);
          });
          reader[readMode](file);
        });
      }));
      resolve(readers);
      input.remove();
    });
  });
};

type FileReadModeMap = {
  readAsArrayBuffer: ArrayBuffer;
  readAsBinaryString: string;
  readAsDataURL: string;
  readAsText: string;
};
