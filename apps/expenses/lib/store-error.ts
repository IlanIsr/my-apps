/** An expected, user-facing store failure. Mapped to an error code by the actions. */

export type StoreErrorCode = "not-found" | "barcode-taken";

export class StoreError extends Error {
  constructor(public readonly code: StoreErrorCode) {
    super(code);
    this.name = "StoreError";
  }
}
