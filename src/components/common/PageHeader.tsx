
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground text-center md:text-left mt-2 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
};
