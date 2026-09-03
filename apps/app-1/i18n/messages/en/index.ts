import type { Messages } from "../../types";
import { common } from "./common";
import { gregorianForm, hebrewForm, hebrewMonths } from "./forms";
import { home } from "./home";

export const en: Messages = {
  ...common,
  home,
  hebrewForm,
  gregorianForm,
  hebrewMonths,
};
