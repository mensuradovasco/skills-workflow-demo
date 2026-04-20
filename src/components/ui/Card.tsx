import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  eyebrow?: string;
};

export function Card({ children, className = "", title, eyebrow }: CardProps) {
  return (
    <section className={`card ${className}`}>
      {(eyebrow || title) && (
        <div className="card-header">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          {title && <h2>{title}</h2>}
        </div>
      )}
      {children}
    </section>
  );
}
