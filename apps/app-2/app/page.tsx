/**
 * app-2's stub home page. Renders a string from `@repo/utils` to prove the
 * shared-package wiring works; will be replaced by the planned Firestore
 * feature.
 */

import { getHelloMessage } from "@repo/utils";

export default function Page() {
  return <h1>{getHelloMessage("app 2")}</h1>;
}
