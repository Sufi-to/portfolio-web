export function PageIntro({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="mx-auto max-w-[76rem] px-5 pt-14 sm:px-8 sm:pt-20">
      <h1 className="t-h1">{title}</h1>
      {children && <div className="measure mt-4 text-lead leading-[1.6] text-quartz/85">{children}</div>}
    </header>
  );
}
