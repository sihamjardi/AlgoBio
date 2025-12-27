import { useEffect, useRef } from "react";
import * as NGL from "ngl";

interface Props {
  sequence: string;
}

export function DNAViewer({ sequence }: Props) {
  const proteinContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!proteinContainer.current) return;

    const stage = new NGL.Stage(proteinContainer.current, {
      backgroundColor: "white"
    });

    // Exemple : charger un ADN modèle (PDB)
    stage.loadFile("https://files.rcsb.org/download/1BNA.pdb")
      .then((comp: any) => {
        comp.addRepresentation("cartoon", { color: "blue" });
        comp.autoView();
      });

    return () => stage.dispose();
  }, [sequence]);

  return (
    <div
      ref={proteinContainer}
      style={{ width: "100%", height: "500px", borderRadius: "10px" }}
    />
  );
}
