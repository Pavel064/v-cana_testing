import { useEffect, useState, useMemo } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'

import { useTranslation } from 'next-i18next'
import { useForm, useWatch } from 'react-hook-form'

import { useLanguages, useMethod } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

// TODO не работает если создавать ОБС
function ProjectCreate() {
  const router = useRouter()
  const { t } = useTranslation(['projects'])
  const [customSteps, setCustomSteps] = useState('')
  const [customResources, setCustomResources] = useState('')
  const [method, setMethod] = useState()
  const [resourcesUrl, setResourcesUrl] = useState()

  const { user } = useCurrentUser()
  const [languages] = useLanguages(user?.access_token)
  const [methods] = useMethod(user?.access_token)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onChange' })

  const methodId = useWatch({ control, name: 'methodId' })

  useEffect(() => {
    if (methods && methodId) {
      const selectedMethod = methods.find(
        (el) => el.id.toString() === methodId.toString()
      )
      if (selectedMethod) {
        setMethod(selectedMethod)
        setCustomSteps(JSON.stringify(selectedMethod.steps, null, 2))
        setCustomResources(selectedMethod.resources)
        console.log(methodId, methods, selectedMethod.resources)
      }
    }
  }, [methodId, methods])

  useEffect(() => {
    if (methods) {
      setValue('methodId', methods?.[0]?.id)
    }
  }, [methods, setValue])

  useEffect(() => {
    if (languages) {
      setValue('languageId', languages?.[0]?.id)
    }
  }, [languages, setValue])

  const onSubmit = async (data) => {
    const { title, code, languageId } = data
    if (!title || !code || !languageId) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post('/api/projects', {
        title,
        language_id: languageId,
        code,
        method_id: method.id,
        steps: method.steps,
        resources: resourcesUrl,
      })
      .then((result) => {
        const {
          status,
          headers: { location },
        } = result
        if (status === 201) {
          router.push(location)
        }
      })
      .catch((error) => console.log(error))
  }

  const inputs = [
    {
      id: 1,
      title: 'Имя проекта',
      classname: errors?.title ? 'input-invalid' : 'input',
      placeholder: 'Title',
      register: {
        ...register('title', {
          required: true,
        }),
      },
      errorMessage: errors?.title ? errors?.title.message : '',
    },
    {
      id: 2,
      title: 'Код проекта',
      classname: errors?.code ? 'input-invalid' : 'input',
      placeholder: 'Code',
      register: {
        ...register('code', {
          required: true,
          pattern: {
            value: /^[a-z\d\-]{2,12}\_[a-z\d\-]{1,12}$/i,
            message:
              'Use the language code and the project code separated by an underscore',
          },
        }),
      },
      errorMessage: errors?.code ? errors?.code.message : '',
    },
  ]

  const setResources = useMemo(() => {
    const listOfResources = []
    for (const resource in customResources) {
      if (Object.hasOwnProperty.call(customResources, resource)) {
        const isPrimary = customResources[resource]
        listOfResources.push(
          <div className={isPrimary ? 'bg-slate-400' : ''} key={resource}>
            {resource}:{' '}
            <input
              value={resourcesUrl?.[resource] ?? ''}
              onChange={(e) =>
                setResourcesUrl((prev) => ({ ...prev, [resource]: e.target.value }))
              }
            />
          </div>
        )
      }
    }
    return listOfResources
  }, [customResources, resourcesUrl])

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>
          Повесить слушателя чтобы проверять, есть такой код проекта или нет. Либо на ввод
          с задержкой, либо на отправку.
        </p>
        {inputs.map((el) => (
          <div key={el.title}>
            <div>{el.title}</div>
            <input
              className={`${el.classname} max-w-sm`}
              placeholder={el.placeholder}
              {...el.register}
            />
            {el.errorMessage && <span>{' ' + el.errorMessage}</span>}
          </div>
        ))}
        <div>{t('Language')}</div>
        <select
          className="input max-w-sm"
          placeholder={t('Language')}
          {...register('languageId')}
        >
          {languages &&
            languages.map((el) => {
              return (
                <option key={el.id} value={el.id}>
                  {el.orig_name}
                </option>
              )
            })}
        </select>
        <div>{t('Method')}</div>
        <select
          placeholder={t('Method')}
          {...register('methodId')}
          className="input max-w-sm"
          defaultValue={methods?.[0]?.id}
        >
          {methods &&
            methods.map((el) => {
              return (
                <option key={el.id} value={el.id}>
                  {el.title} ({el.type})
                </option>
              )
            })}
        </select>
        <br />
        <p>
          Тут самое сложное, так как это будет настройка шагов метода. Нужно как-то
          аккуратно его разрешить исправлять, не давать чего-то лишнего исправить. Это
          массив из шагов. Может для одного шага сделать компонент. У шага есть такие
          параметры.
        </p>
        <pre>
          {`"title": Название шага, даем юзеру возможность перевода этого поля
"description": Описание шага, возможность редактировать
"time": время, сколько минут длится шаг
"count_of_users": сколько юзеров выполняют этот шаг
"intro": введение в шаг в формате MD
"config": [ массив объектов, в котором прописано какие карточки и ресурсы отображать тут
 Пока что редактировать не будем давать
  Пример объекта
    "size": размер блока, ширина экрана - 6 единиц
    "tools": [ массив объектов тулсов. Есть наши стандартные, и есть пользовательские
        "name": название тулсы, редактор, заметки, глава и т.д.
        "config": а тут конфиг этого компонента`}
        </pre>
        <textarea
          cols="50"
          rows="30"
          onChange={(e) => setCustomSteps(e.target.value)}
          value={customSteps}
        />
        <br />
        <p>
          Нужно превратить в форму. Сейчас сюда приходит объект. Ключ - это идентификатор
          ресурса в шагах метода. Тут нет каких-то правил, можно называть как хочешь.
          Главное чтоб он встречался в шагах. Значение - булево. Тут только один тру,
          остальные фолс. Тру означает основной ресурс с которого будет вестись перевод. У
          нас это смысловой перевод. Это нужно тут в форме как-то показать, чтоб юзер знал
          что с него идет перевод. Форма такая, указан айди ресурса, точечка или жирным
          выделен основной, а рядом пустое поле куда юзер вводит ссылку на гит. Ссылка
          должна быть определенного формата, там должен быть коммит обязательно.
        </p>
        <textarea
          cols="50"
          rows="6"
          disabled={true}
          value={JSON.stringify(customResources, null, 2)}
        />
        <br />
        <pre>
          {`literal
https://git.door43.org/ru_gl/ru_rlob/src/commit/94fca1416d1c2a0ff5d74eedb0597f21bd3b59b6
simplified
https://git.door43.org/ru_gl/ru_rsob/src/commit/03519d2d1f66a07ba42d7a62afb75393cf83fa1c
tn
https://git.door43.org/ru_gl/ru_tn/src/commit/cd4216222c098dd1a58e49c0011e6b3220f9ef38
tq
https://git.door43.org/ru_gl/ru_tq/src/commit/787f3f48f4ada9f0a29451b5ef318125a5fd6c7a
tw
https://git.door43.org/ru_gl/ru_tw/src/commit/ea337e3dc7d8e9100af1224d1698b58abb53849d
twl
https://git.door43.org/ru_gl/ru_twl/src/commit/17383807b558d6a7268cb44a90ac105c864a2ca1
`}
        </pre>
        {setResources}
        <br />
        <p>
          После того как нажимают на кнопку сохранить, мы делаем следующее: <br />
          1. Получаем манифесты всех ресурсов чтобы записать в таблицу проектов, в колонку
          Ресурсы. <br />
          Создаем вот такой объект
        </p>
        <pre>
          {`"тут идентификатор который в шагах у нас": {
"owner": "unfoldingword",
"repo": "en_ult",
"commit": "acf32a196",
"manifest": "{}" // а здесь будет манифест в нужном формате
},`}
        </pre>
        <p>
          2. Особенно мы обработаем основной ресурс, с которого будет идти перевод.
          Возьмем его манифест и сделаем такую структуру{' '}
        </p>
        <pre>
          {`{
  "resource": "тут идентификатор этого основного ресурса",
  "books": [ // массив из списка книг
    {
      "name": "gen", // айди книги
      "link": "unfoldingword/en_ult/raw/commit/a3c1876/01_GEN.usfm" // ссылка на нее
    },
  ]
}`}
        </pre>
        <p>
          3. Все шаги мы переносим в таблицу степс, и связываем с созданным проектом.
          <br />
          Сейчас этого кода нет, нужно подумать на сколько это критично. Мне кажется что
          для первой версии мы можем создать проект в ручную, и отложить разработку на
          время после запуска
        </p>
        <input className="btn-cyan btn-filled" type="submit" />
      </form>
    </div>
  )
}

export default ProjectCreate
