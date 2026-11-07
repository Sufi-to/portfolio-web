import { Panel } from "./Panel";

/** The title panel every inner page opens with. */
export function PageIntro({ name, title, lead, children }: { name: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <Panel name={`input · ${name}`} tag="TXT" portId={name} out="right">
      <header className="px-3.5 pb-4 pt-3">
        <h1 className="t-h1">{title}</h1>
        {lead && <p className="mt-2 font-[family-name:var(--font-code)] text-[0.8125rem] leading-[1.5] text-signal">{lead}</p>}
        {children && <div className="mt-3 space-y-3 text-[0.9375rem] leading-[1.6] text-quartz/85">{children}</div>}
      </header>
    </Panel>
  );
}
