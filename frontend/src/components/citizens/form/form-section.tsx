type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="space-y-4 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}
