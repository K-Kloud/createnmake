import { useTranslation } from "react-i18next";
export const Hero = () => {
  const {
    t
  } = useTranslation('common');
  return <section className="py-0 px-[12px]">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
          {t('hero.title', 'Create & Make')}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          {t('hero.subtitle', 'Turn your ideas into reality with AI-powered design generation and connect with skilled artisans to bring your creations to life.')}
        </p>
      </div>
    </section>;
};