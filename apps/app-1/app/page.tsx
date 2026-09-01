import { getHelloMessage } from "@repo/utils";

export default function Page() {
  return <h1>{getHelloMessage("app 1")}</h1>;
}
