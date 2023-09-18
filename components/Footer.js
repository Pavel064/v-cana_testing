import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { useRecoilValue } from 'recoil'

import Translators from 'components/Translators'
import ProgressBar from 'components/ProgressBar'
import ButtonLoading from './ButtonLoading'

import { stepConfigState } from './state/atoms'
export default function Footer({
  loading = false,
  textCheckbox,
  handleClick,
  textButton,
  href,
}) {
  const [isStepPage, setIsStepPage] = useState(false)
  const [checked, setChecked] = useState(false)

  const stepConfig = useRecoilValue(stepConfigState)
  const { t } = useTranslation('common')
  const router = useRouter()
  const { step } = router?.query

  useEffect(() => {
    setChecked(false)
  }, [step])

  useEffect(() => {
    setIsStepPage(router.pathname === '/translate/[project]/[book]/[chapter]/[step]')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname])

  return (
    <div className="flex flex-col justify-between items-center px-4 mx-auto w-full max-w-7xl bg-blue-150 md:flex-row-reverse lg:px-0">
      <div className="relative flex items-center h-12 md:h-16">
        <div className="flex flex-row items-center space-x-6">
          <div className="space-x-1.5 items-center">
            <label className="cursor-pointer p-3">
              <input
                className="h-[17px] w-[17px] cursor-pointer accent-cyan-600"
                type="checkbox"
                checked={checked}
                onChange={() => setChecked((prev) => !prev)}
              />
              <span className="ml-2">{textCheckbox}</span>
            </label>
          </div>
          {href ? (
            <Link href={href} legacyBehavior>
              <button className="btn-cyan !px-6" disabled={!checked}>
                {textButton}
              </button>
            </Link>
          ) : (
            <ButtonLoading
              onClick={handleClick}
              className="relative btn-cyan w-28 text-center"
              disabled={!checked}
              isLoading={loading}
            >
              {textButton}
            </ButtonLoading>
          )}
        </div>
      </div>
      {isStepPage && (
        <>
          <div className="pb-3 md:pb-0">
            <ProgressBar
              amountSteps={stepConfig.last_step}
              currentStep={stepConfig.current_step}
            />
          </div>
          <div className="flex gap-2.5 items-center pb-3 md:pb-0">
            <div>{t('Participants')}:</div>
            <Translators
              projectCode={stepConfig.project_code}
              size="34px"
              clickable={true}
            />
          </div>
        </>
      )}
    </div>
  )
}
