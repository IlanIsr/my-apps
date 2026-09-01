import { getHelloMessage } from "@repo/utils";

export default function Page() {
  return <h1>{getHelloMessage("app 2")}</h1>;
}
