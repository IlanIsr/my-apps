import { latestPrices, type PricePoint } from "./grocery-logic";

/** `productId → storeId → listed unit price` of the latest purchase (for prefill). */
export function lastListedPrices(points: PricePoint[]) {
  return Object.fromEntries(
    [...latestPrices(points)].map(([productId, byStore]) => [
      productId,
      Object.fromEntries(
        [...byStore].map(([storeId, p]) => [storeId, p.listedPrice]),
      ),
    ]),
  );
}
