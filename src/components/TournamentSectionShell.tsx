import Link from "next/link";

interface TournamentSectionShellProps {
  eyebrow: string;
  title: string;
  description: string;
  status?: "Available" | "Live" | "Coming Soon";
  children?: React.ReactNode;
}

export default function TournamentSectionShell({
  eyebrow,
  title,
  description,
  status = "Coming Soon",
  children,
}: TournamentSectionShellProps) {
  return (
    <>
      <section className="sectionHero">
        <div>
          <div className="smallLabel sectionEyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className={`sectionStatus sectionStatus${status.replace(" ", "")}`}>
          {status}
        </span>
      </section>

      {children ?? (
        <section className="card sectionPlaceholder">
          <div className="placeholderMark">CC</div>
          <h2>This section is ready to build.</h2>
          <p>
            The tournament hub and permanent route are in place. Content and
            functionality will be added here without changing the overall navigation.
          </p>
          <Link className="secondaryButton" href="/">Return to tournament hub</Link>
        </section>
      )}
    </>
  );
}
