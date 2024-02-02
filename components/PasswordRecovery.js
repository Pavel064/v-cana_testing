import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Link from 'next/link'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import SwitchLocalization from './SwitchLocalization'
import ButtonLoading from './ButtonLoading'

import useSupabaseClient from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'

import EyeIcon from 'public/eye-icon.svg'
import EyeOffIcon from 'public/eye-off-icon.svg'
import Progress from 'public/progress.svg'

function PasswordRecovery() {
  const supabase = useSupabaseClient()
  const { query, replace } = useRouter()
  const { t } = useTranslation('users')
  const { user, loading } = useCurrentUser()
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')

  const [isRecovering, setIsRecovering] = useState(false)
  const [error, setError] = useState('')
  const [successResult, setSuccessResult] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.log(error)
    }
  }
  const comparePasswords = (passFirst, passSecond) => {
    if (!passFirst || !passSecond) {
      return { error: true, message: 'NotAllFieldsFilled' }
    }
    if (passFirst.length < 6) {
      return { error: true, message: 'PasswordShouldBeLeastSix' }
    }
    if (passFirst !== passSecond) {
      return { error: true, message: 'PasswordsDontMatch' }
    }
    return { error: false, message: 'Success' }
  }
  const handleRecovery = () => {
    const { error, message } = comparePasswords(password, repeatPassword)
    if (error) {
      setError(message)
      return
    }
    if (user) {
      setIsRecovering(true)
      axios
        .put('/api/users/update_password', {
          password,
        })
        .then((res) => {
          if (res) {
            setSuccessResult(t('PasswordChanged'))
            signOut()
          }
        })
        .catch((error) => {
          setError(error?.response?.data?.error?.message ?? 'ProblemWithRecovery')
          console.log(error)
        })
        .finally(() => setIsRecovering(false))
    }
  }
  useEffect(() => {
    if (query?.token) {
      replace('/password-recovery', undefined, { shallow: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.token])

  function renderContent() {
    if (successResult) {
      return (
        <>
          <div>{successResult}</div>
          <Link href={'/'} className="mb-6 lg:mb-14 text-th-primary-200 hover:opacity-70">
            {t('GoToLogin')}
          </Link>
        </>
      )
    }

    if (query?.error) {
      return (
        <>
          <div>{t('UnSuccessRecovery')}</div>
          <Link href={'/'} className="mb-6 lg:mb-14 text-th-primary-200 hover:opacity-70">
            {t('GoToLogin')}
          </Link>
        </>
      )
    }

    if (loading) {
      return (
        <div className="flex justify-center">
          <Progress className="progress-custom-colors w-14 animate-spin stroke-th-primary-100" />
        </div>
      )
    }

    if (!user) {
      return (
        <>
          <div>{t('UnSuccessRecovery')}</div>
          <Link href={'/'} className="mb-6 lg:mb-14 text-th-primary-200 hover:opacity-70">
            {t('GoToLogin')}
          </Link>
        </>
      )
    }

    return (
      <>
        <p>{t('WriteNewPassword')}</p>
        <PasswordInput
          type="new"
          password={password}
          showPassword={showPassword}
          error={error}
          onChange={setPassword}
          onToggleShowPassword={() => setShowPassword((prev) => !prev)}
        />
        <p>{t('RepeatNewPassword')}</p>
        <PasswordInput
          type="repeat"
          password={repeatPassword}
          showPassword={showRepeatPassword}
          error={error}
          onChange={(value) => {
            setError('')
            setSuccessResult('')
            setRepeatPassword(value.trim())
          }}
          onToggleShowPassword={() => setShowRepeatPassword((prev) => !prev)}
        />
        {error && <div className="opacity-100 min-h-[1.5rem]">{t(error)}</div>}
        <ButtonLoading
          type="button"
          className="btn-primary relative self-center w-1/2 text-sm lg:text-base"
          onClick={handleRecovery}
          isLoading={isRecovering}
        >
          {t('UpdatePassword')}
        </ButtonLoading>
      </>
    )
  }

  return (
    <div className="flex flex-col p-5 lg:py-10 xl:px-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('PasswordRecovery')}</h1>
        <SwitchLocalization />
      </div>
      <form className="space-y-6 xl:space-y-10">
        <div className="flex flex-col gap-5 lg:justify-around">{renderContent()}</div>
      </form>
    </div>
  )
}

export default PasswordRecovery

function PasswordInput({
  type,
  password,
  showPassword,
  error,
  onChange,
  onToggleShowPassword,
}) {
  const fieldName = type === 'new' ? 'floating_password_new' : 'floating_password_repeat'
  return (
    <div className="relative z-0 w-full">
      <input
        name={fieldName}
        className={error ? 'input-invalid' : 'input-primary'}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => onChange(e.target.value)}
      />
      <span
        className="absolute right-2 bottom-2 cursor-pointer stroke-2 text-th-text-primary"
        onClick={onToggleShowPassword}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </span>
    </div>
  )
}
