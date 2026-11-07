import { asset } from "@/content/site";
import type { Project } from "@/content/types";

/** Real captures from a project's own repository, unedited. */
export function MediaGallery({ project: p }: { project: Project }) {
  if (!p.media?.length) return null;
  return (
    <div>
      <p className="t-micro text-silver">The running app{p.mediaDate ? `, recorded ${p.mediaDate}` : ""}</p>
      <ul className="mt-3 grid gap-3 md:grid-cols-3">
        {p.media.map((m) => (
          <li key={m.src}>
            <a href={asset(m.src)} target="_blank" rel="noopener" className="block overflow-hidden rounded-md border border-seam transition-colors hover:border-shale">
              <img src={asset(m.src)} alt={m.alt} width={m.width} height={m.height} loading="lazy" className="block h-auto w-full" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
