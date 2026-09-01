import { getHelloMessage } from "@repo/utils";

export default function Page() {
  return (
    <>
      <h1>{getHelloMessage("app 1")}</h1>
      <p>Only app 1 changed</p>
    </>
  );
}
