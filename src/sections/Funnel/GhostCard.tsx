/**
 * GhostCard — placeholder apagado (Plan 09-02 Task 1, estático).
 *
 * Os "outros pacientes": presentes mas esmaecidos (opacity 0.32), nunca se
 * movem, nunca animam. Provam que Marina é a história e o board é o palco.
 * Puramente decorativo → aria-hidden. SEM copy (linhas abstratas, não texto).
 */
export function GhostCard() {
  return (
    <div
      aria-hidden="true"
      className="rounded-[10px] border border-[#181a26] bg-[#0f1019] px-[11px] py-2.5 opacity-[0.32]"
    >
      <div className="mb-[7px] h-2 w-3/5 rounded-[4px] bg-[#262838]" />
      <div className="h-1.5 w-2/5 rounded-[4px] bg-[#1c1e2c]" />
    </div>
  );
}
