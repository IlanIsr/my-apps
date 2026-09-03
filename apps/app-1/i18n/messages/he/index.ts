import type { Messages } from "../../types";
import { anniversary } from "./anniversary";
import { calendar } from "./calendar";
import { common } from "./common";
import { gregorianForm, hebrewForm, hebrewMonths } from "./forms";
import { home } from "./home";

export const he: Messages = {
  ...common,
  home,
  hebrewForm,
  gregorianForm,
  hebrewMonths,
  anniversary,
  calendar,
};
