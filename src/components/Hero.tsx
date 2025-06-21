import { useTranslation } from "react-i18next";
export const Hero = () => {
  const {
    t
  } = useTranslation('common');
  return <div className="min-h-[70vh] flex items-center justify-center my-0 py-0 px-0 mx-0">
      <div className="container text-center py-[16px] px-[17px] mx-0 my-0">
        <h1 className="text-5xl mb-6 text-primary hover:brightness-125 hover:shadow-[0_0_15px_rgba(0,255,157,0.5)] transition-all duration-300 rounded-lg font-bold md:text-5xl">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto md:text-sm">
          {t('hero.subtitle')}
        </p>
      </div>
    </div>;
};