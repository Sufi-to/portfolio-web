import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[76rem] px-5 py-24 sm:px-8">
      <p className="t-data text-reject">404, no rows returned</p>
      <h1 className="mt-4 t-h1">That page doesn&rsquo;t exist.</h1>
      <p className="mt-4 text-quartz/80">
        Head back <Link href="/" className="underline decoration-seam underline-offset-4">home</Link> or browse{" "}
        <Link href="/projects/" className="underline decoration-seam underline-offset-4">all projects</Link>.
      </p>
    </div>
  );
}
