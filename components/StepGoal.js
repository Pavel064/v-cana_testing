import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { steps } from 'utils/steps'
import Modal from './Modal'

function StepGoal() {
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const router = useRouter()
  const { step } = router.query
  const { t } = useTranslation(['steps', 'common'])

  const closeModal = () => {
    setShowModalStepGoal(false)
  }

  return (
    <>
      <button
        className="btn-cyan w-28"
        onClick={(e) => (setShowModalStepGoal(!showModalStepGoal), e.stopPropagation())}
      >
        {t('common:Goal')}
      </button>
      <Modal
        open={showModalStepGoal}
        closeModal={closeModal}
        title={t('common:Goal') + ':'}
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">{t(steps[step].stepGoal)}</p>
        </div>
      </Modal>
    </>
  )
}

export default StepGoal
