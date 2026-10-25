import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

/**
 * Bloque le rendu jusqu'au chargement des polices déclarées dans index.css.
 * Sans ça, Chrome headless peut rendre la première frame avec une police de
 * repli (FOUT) — la vidéo n'est alors pas reproductible d'une machine à l'autre.
 */
export const useFonts = (families: string[]): void => {
  const [handle] = useState(() => delayRender("chargement des polices"));
  const key = families.join("|");

  useEffect(() => {
    const list = key.split("|");
    Promise.all([
      ...list.map((f) => document.fonts.load(`900 100px "${f}"`)),
      document.fonts.load(`400 40px "${list[0]}"`),
    ])
      .then(() => document.fonts.ready)
      .finally(() => continueRender(handle));
  }, [key, handle]);
};
