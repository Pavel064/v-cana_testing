import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import i18nextConfig from 'next-i18next.config'

import { Menu } from '@headlessui/react'

function SwitchLocalization() {
  const { locale, asPath, push } = useRouter()
  const { t } = useTranslation('common')
  const supportedLngs = i18nextConfig.i18n.locales
  return (
    <div className="text-xs lg:text-sm font-bold relative">
      <Menu>
        <Menu.Button
          className="px-4 py-2 text-sm bg-th-background-primary rounded-[9rem] hover:opacity-70"
          onClick={(e) => e.stopPropagation()}
        >
          {t(locale.toUpperCase())}
        </Menu.Button>
        <Menu.Items className="absolute flex top-0 right-0 text-sm bg-th-background-primary rounded-2xl">
          <div className="flex flex-col">
            {supportedLngs.map((loc) => (
              <Menu.Item
                key={loc}
                as="div"
                onClick={(e) => {
                  push(asPath, undefined, { locale: loc })
                }}
                className="cursor-pointer px-4 py-2 hover:bg-th-primary-hover-backgroung last:rounded-b-2xl first:rounded-t-2xl hover:opacity-70"
              >
                <div className={`${locale === loc ? 'text-th-text-disabled' : ''}`}>
                  {t(loc.toUpperCase())}
                </div>
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>
    </div>
  )
}

export default SwitchLocalization
