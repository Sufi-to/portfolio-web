import type { ReactNode, Ref } from "react";

type Side = "left" | "right";

interface Props {
  /** The operator's name, set in mono in the title bar: raw_post, work_index. */
  name: string;
  /** What kind of operator this is: TXT, DATA, SYS or VIEW. */
  tag: string;
  /** Short status beside the name. */
  meta?: ReactNode;
  /** Names this panel's ports so PatchCables can find them. */
  portId?: string;
  in?: Side;
  out?: Side;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  children: ReactNode;
}

/** A titled box on the patch. Everything the site shows sits in one of these. */
export function Panel({ name, tag, meta, portId, in: inSide, out: outSide, ref, className = "", children }: Props) {
  return (
    <div ref={ref} className={`panel ${className}`}>
      {inSide && <span aria-hidden className="port" data-side={inSide} data-port={`${portId}:in`} />}
      {outSide && <span aria-hidden className="port" data-side={outSide} data-port={`${portId}:out`} />}
      <div className="panel-bar">
        <span className="min-w-0 truncate">
          {name}
          {meta && <span className="text-shale/90"> &middot; {meta}</span>}
        </span>
        <span className="panel-tag">{tag}</span>
      </div>
      {children}
    </div>
  );
}
