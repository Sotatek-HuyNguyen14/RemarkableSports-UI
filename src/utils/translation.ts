import { Scope, TranslateOptions } from "i18n-js";
import I18n from "../language/index";

export function getTranslation(scope: Scope) {
  if (typeof scope === "string") {
    return (key: string, options?: TranslateOptions) =>
      I18n.t(`${scope}.${key}`, options);
  }

  return (key: string, options?: TranslateOptions) => {
    const multipleScopes = scope.map((s) => ({
      scope: `${s}.${key}` as Scope,
    }));
    return I18n.t(`${scope}.${key}`, { ...options, defaults: multipleScopes });
  };
}

export default { getTranslation };
