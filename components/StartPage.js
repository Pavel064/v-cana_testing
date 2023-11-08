import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import AboutVersion from './AboutVersion'

import VcanaLogo from 'public/vcana-logo-color.svg'
import TtLogo from 'public/tt-logo.svg'

function StartPage({ children }) {
  const { t } = useTranslation('common')
  return (
    <>
      <div className="flex flex-col items-center sm:hidden">
        <div className="flex items-center mb-2">
          <VcanaLogo className="max-w-xs my-10 sm:max-w-md w-28" />
          <AboutVersion isMobileIndexPage={true} />
        </div>
        <div className="bg-th-secondary-10 w-[90vw] mb-10 rounded-lg shadow-lg">
          {children}
        </div>
        <div className="text-th-secondary-300 mb-4 text-center">{t('DevelopedBy')}</div>
        <Link href="https://texttree.org/" target="_blank">
          <TtLogo className="mb-4 h-7 logo text-th-secondary-300" />
        </Link>
      </div>

      <div className="hidden sm:flex">
        <div className="flex flex-col items-center justify-center w-1/2">
          <div className="flex flex-col items-center text-base xl:text-lg">
            <div className="flex flex-col relative items-center">
              <VcanaLogo className="w-44 xl:w-52 mb-4" />
              <AboutVersion />
            </div>
            <h1 className="my-4 text-center">{t('PlatformForBibleTranslate')}</h1>
            <div className="text-th-secondary-300 mb-2 text-xs">{t('DevelopedBy')}</div>
            <div className="p-2 text-th-secondary-300">
              <Link href="https://texttree.org/" target="_blank">
                <TtLogo className="h-10 logo" />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center my-4 w-1/2 min-h-[90vh] bg-[url('../public/login_image.jpg')] bg-cover bg-no-repeat rounded-l-lg lg:rounded-l-[48px] xl:rounded-l-[72px] 2xl:rounded-l-[120px]">
          <div className="w-5/6 xl:w-3/4 2xl:w-3/5 bg-th-secondary-10 rounded-lg shadow-lg">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default StartPage
