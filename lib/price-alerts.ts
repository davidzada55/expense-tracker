import { z } from "zod";

export type PriceAlertDirection = "above" | "below";

export type PriceAlert = {
  id: string;
  symbol: string;
  target_price: number;
  direction: PriceAlertDirection;
  triggered: boolean;
  triggered_at: string | null;
  created_at: string;
};

export const priceAlertInputSchema = z.object({
  symbol: z
    .string({ required_error: "יש להזין סימול מניה" })
    .trim()
    .min(1, "יש להזין סימול מניה")
    .max(10, "סימול המניה ארוך מדי")
    .transform((value) => value.toUpperCase()),
  target_price: z.coerce
    .number({
      required_error: "יש להזין מחיר יעד",
      invalid_type_error: "מחיר היעד חייב להיות מספר",
    })
    .positive("מחיר היעד חייב להיות גדול מאפס"),
  direction: z.enum(["above", "below"], {
    required_error: "יש לבחור כיוון התראה",
    invalid_type_error: "כיוון התראה לא תקין",
  }),
});

export type PriceAlertInput = z.infer<typeof priceAlertInputSchema>;
export type PriceAlertFormInput = z.input<typeof priceAlertInputSchema>;

export const priceAlertIdSchema = z
  .string()
  .uuid("מזהה ההתראה חייב להיות UUID תקין");

export function isAlertTriggered(
  alert: PriceAlert,
  currentPrice: number,
): boolean {
  if (alert.direction === "above") {
    return currentPrice >= alert.target_price;
  }

  return currentPrice <= alert.target_price;
}

export function getDirectionLabel(direction: PriceAlertDirection): string {
  return direction === "above" ? "מעל" : "מתחת";
}
