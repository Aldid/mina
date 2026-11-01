import { SkinMetrics, SkincareRoutine, SkincareStep, SkinType, ZoneAnalysis } from '../types';

/**
 * Rules-based cosmetic routine suggestions for Mina's demonstration profiles.
 * The scores are not measured biomarkers and do not establish a diagnosis.
 * Actual symptoms, product instructions and individual tolerance take priority.
 */
export function generateSkincareProtocol(metrics: SkinMetrics): SkincareRoutine {
  const { skinType, hydration, sebumControl, rednessSensitivity, poreClarity, barrierHealth } = metrics;
  // Conservative demo rule, not a clinically validated threshold.
  const needsGentleCare = skinType === 'Sensitive' || rednessSensitivity < 60 || barrierHealth < 60;

  const amSteps: SkincareStep[] = [];
  const pmSteps: SkincareStep[] = [];
  const keyIngredients: { ingredient: string; benefit: string }[] = [];
  const ingredientsToAvoid: { ingredient: string; reason: string }[] = [];
  const weeklyRituals: string[] = [];
  const lifestyleTips: string[] = [];

  // ==========================================
  // AM ROUTINE (Утренний уход: Защита и свежесть)
  // ==========================================

  // Шаг 1: Утреннее очищение
  if (skinType === 'Dry' || needsGentleCare) {
    amSteps.push({
      order: 1,
      phase: 'Cleanse',
      productName: 'Мягкий очищающий крем-гель с аминокислотами',
      productType: 'Непенящаяся деликатная эмульсия',
      targetConcerns: ['Сохранение липидного слоя', 'Защита от чувства стянутости'],
      keyActives: ['Пантенол (B5)', 'Растительный глицерин', 'Экстракт овса'],
      usageAdvice: 'Умывайся чуть теплой водой. Не три лицо, а аккуратно промокни мягким хлопковым полотенцем.',
    });
  } else if (skinType === 'Oily') {
    amSteps.push({
      order: 1,
      phase: 'Cleanse',
      productName: 'Мягкий очищающий гель для кожи, склонной к блеску',
      productType: 'Привычное очищающее средство без абразивных частиц',
      targetConcerns: ['Удаление загрязнений и избытка себума', 'Комфорт после умывания'],
      keyActives: ['Глицерин', 'Мягкие очищающие компоненты'],
      usageAdvice: 'Нанеси по инструкции, мягко распредели подушечками пальцев и смой чуть тёплой водой. Если кожа щиплет, прекрати использование.',
    });
  } else {
    amSteps.push({
      order: 1,
      phase: 'Cleanse',
      productName: 'Балансирующий гель с экстрактом зеленого чая',
      productType: 'Мягкий ежедневный гель для умывания',
      targetConcerns: ['Утренняя свежесть', 'Поддержание естественного pH'],
      keyActives: ['Экстракт центеллы азиатской', 'Зеленый чай', 'Аллантоин'],
      usageAdvice: 'Нанеси на влажные ладони, мягко распредели круговыми движениями и смой теплой водой.',
    });
  }

  // Шаг 2: Тонизирование и гидратация
  if (hydration < 60 || skinType === 'Dry' || needsGentleCare) {
    amSteps.push({
      order: 2,
      phase: 'Tone & Prep',
      productName: 'Глубоко увлажняющий тонер-эссенция с 5 видами гиалуроновой кислоты',
      productType: 'Шелковистый увлажняющий тонер',
      targetConcerns: ['Дополнительное увлажнение по потребности', 'Комфорт кожи'],
      keyActives: ['Гиалуроновая кислота (микро и макро)', 'Бета-глюкан', 'Пантенол'],
      usageAdvice: 'Необязательный шаг. Если средство уже подходит, нанеси по инструкции без трения. При дискомфорте пропусти его.',
    });
  } else {
    amSteps.push({
      order: 2,
      phase: 'Tone & Prep',
      productName: 'Освежающий балансирующий тонер с центеллой и ниацинамидом',
      productType: 'Легкий успокаивающий водный тонер',
      targetConcerns: ['Нормализация водного баланса', 'Ровный микрорельеф'],
      keyActives: ['Гидролат центеллы 84%', 'Ниацинамид 2%', 'Экстракт ромашки'],
      usageAdvice: 'Протри лицо смоченным ватным диском или мягко приложи ладони к лицу для впитывания.',
    });
  }

  // Шаг 3: Активная утренняя сыворотка
  if (needsGentleCare) {
    amSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Успокаивающая Cica-сыворотка с мадекассосидом',
      productType: 'Барьерный успокаивающий концентрат',
      targetConcerns: ['Комфорт чувствительной кожи', 'Дополнительный увлажняющий уход'],
      keyActives: ['Мадекассосид', 'Центелла азиатская', 'Пантенол 5%'],
      usageAdvice: 'Не добавляй новое средство при раздражении. Этот шаг можно пропустить; используй только знакомую формулу, которая уже переносится комфортно.',
    });
  } else if (sebumControl < 60 || skinType === 'Oily') {
    amSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Себорегулирующая сыворотка с ниацинамидом и цинком',
      productType: 'Матирующий легкий серум',
      targetConcerns: ['Уход за кожей, склонной к блеску', 'Видимость пор'],
      keyActives: ['Ниацинамид', 'Цинк PCA'],
      usageAdvice: 'Необязательный шаг для уже знакомого средства. Следуй инструкции производителя и пропусти при жжении или раздражении.',
    });
  } else {
    amSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Антиоксидантная сыворотка-сияние с витамином C и феруловой кислотой',
      productType: 'Осветляющая сыворотка для ровного тона',
      targetConcerns: ['Дополнительный антиоксидантный уход', 'Видимость неровного тона'],
      keyActives: ['Стабильный витамин C (E-AA)', 'Феруловая кислота', 'Витамин E'],
      usageAdvice: 'Необязательный шаг: используй по инструкции, если средство уже подходит. Сыворотка не заменяет солнцезащиту.',
    });
  }

  // Шаг 4: Дневной увлажняющий крем
  if (!needsGentleCare && (skinType === 'Oily' || sebumControl < 50)) {
    amSteps.push({
      order: 4,
      phase: 'Hydrate & Seal',
      productName: 'Невесомый крем-гель без масел (Oil-Free Water Gel)',
      productType: 'Матирующий крем-флюид',
      targetConcerns: ['Увлажнение без липкости', 'Бархатистый матовый финиш'],
      keyActives: ['Сок березы', 'Гиалуронат натрия', 'Экстракт центеллы'],
      usageAdvice: 'Нанеси комфортное количество по инструкции. Оценивай переносимость всей формулы, а не только список ингредиентов.',
    });
  } else {
    amSteps.push({
      order: 4,
      phase: 'Hydrate & Seal',
      productName: 'Восстанавливающий барьерный крем-шелк с церамидами',
      productType: 'Шелковистый ламеллярный крем',
      targetConcerns: ['Поддержка увлажнения', 'Комфорт при сухом воздухе'],
      keyActives: ['Церамиды NP, AP, EOP', 'Сквалан', 'Фитосфингозин'],
      usageAdvice: 'Разогрей крем между пальцами и мягкими прижимающими движениями нанеси на лицо и шею.',
    });
  }

  // Шаг 5: Невесомая защита от солнца SPF 50+
  amSteps.push({
    order: 5,
    phase: 'Sun Defense',
    productName: 'Солнцезащитное средство SPF 50+ широкого спектра',
    productType: 'Подходящая по переносимости защита UVA/UVB',
    targetConcerns: ['Профилактика пигментации', 'Защита от UVA/UVB лучей и фотостарения'],
    keyActives: ['Фильтры UVA/UVB'],
    usageAdvice: 'Наноси достаточное количество по инструкции примерно за 15 минут до выхода, включая шею и уши. На улице обновляй примерно каждые 2 часа и после плавания или потоотделения. Текстура и переносимость зависят от конкретной формулы.',
  });

  // ==========================================
  // PM ROUTINE (Вечерний уход: Восстановление и релакс)
  // ==========================================

  // Шаг 1: Первый этап демакияжа (Гидрофильное очищение)
  pmSteps.push({
    order: 1,
    phase: 'Cleanse',
    productName: 'Гидрофильный бальзам с маслом жожоба и центеллой',
    productType: 'Тающий очищающий щербет-бальзам',
    targetConcerns: ['Удаление стойкой косметики или солнцезащиты по необходимости'],
    keyActives: ['Масло жожоба', 'Масло рисовых отрубей', 'Экстракт центеллы'],
    usageAdvice: 'Этот дополнительный этап нужен не всем. Если снимаешь стойкую косметику или SPF, используй подходящее средство по инструкции, без долгого трения.',
  });

  // Шаг 2: Второй этап очищения
  pmSteps.push({
    order: 2,
    phase: 'Cleanse',
    productName: 'Нежная пенка для умывания с физиологическим pH 5.5',
    productType: 'Успокаивающая пенка с пантенолом',
    targetConcerns: ['Мягкое очищение', 'Комфорт после умывания'],
    keyActives: ['Аминокислоты яблока', 'Аллантоин', 'Пантенол'],
    usageAdvice: 'Мягко умойся чуть тёплой водой по инструкции средства. Второй очищающий этап не обязателен, если одного достаточно; не добивайся ощущения «скрипа».',
  });

  // Шаг 3: Вечернее тонизирование
  pmSteps.push({
    order: 3,
    phase: 'Tone & Prep',
    productName: 'Восстанавливающий молочный тонер-комфорт',
    productType: 'Двухфазный питательный тонер',
    targetConcerns: ['Восстановление гидробаланса после дня', 'Мягкость и бархатистость'],
    keyActives: ['Глицерин', 'Церамиды'],
    usageAdvice: 'Необязательный дополнительный шаг для знакомого средства. Следуй инструкции и пропускай при раздражении.',
  });

  // Шаг 4: Ночной интенсивный уход
  if (needsGentleCare) {
    pmSteps.push({
      order: 4,
      phase: 'Target & Treat',
      productName: 'Бережный вечер без новых активов',
      productType: 'Необязательный шаг: можно пропустить',
      targetConcerns: ['Комфорт чувствительной кожи', 'Снижение нагрузки от дополнительных средств'],
      keyActives: ['Глицерин', 'Пантенол'],
      usageAdvice: 'При чувствительности или раздражении не вводи кислоты и новые активы. Достаточно привычного очищения и увлажнения. При выраженной или сохраняющейся реакции обратись к дерматологу.',
    });
  } else if (poreClarity < 60 || sebumControl < 50) {
    pmSteps.push({
      order: 4,
      phase: 'Target & Treat',
      productName: 'Необязательная сыворотка с бетаином салицилатом 2%',
      productType: 'Дополнительный эксфолиирующий уход по переносимости',
      targetConcerns: ['Уход за кожей с видимыми закупоренными порами'],
      keyActives: ['Бетаин салицилат 2%', 'Цинк PCA', 'Центелла'],
      usageAdvice: 'Оценка по фото не является основанием начинать кислотный уход. Рассматривай только уже знакомое средство по его инструкции; не совмещай новые активы и пропусти при раздражении. Бетаин салицилат 2% не равен салициловой кислоте 2%.',
    });
  } else {
    pmSteps.push({
      order: 4,
      phase: 'Target & Treat',
      productName: 'Необязательная увлажняющая сыворотка с пептидами',
      productType: 'Дополнительный косметический уход',
      targetConcerns: ['Дополнительное увлажнение по потребности'],
      keyActives: ['Matrixyl 3000', 'Медные пептиды', 'Гиалуроновая кислота'],
      usageAdvice: 'Этот шаг можно пропустить. Если средство уже подходит, используй по инструкции без сильного растягивания кожи.',
    });
  }

  // Шаг 5: Ночной питательный крем-бальзам
  pmSteps.push({
    order: 5,
    phase: 'Hydrate & Seal',
    productName: 'Ночной крем глубокого восстановления с церамидами и скваланом',
    productType: 'Питательный барьерный крем «вторая кожа»',
    targetConcerns: ['Поддержка увлажнения', 'Комфорт сухой кожи'],
    keyActives: ['Комплекс 5 церамидов', 'Сквалан сахарного тростника', 'Холестерол'],
    usageAdvice: 'Нанеси комфортное количество по инструкции. При жжении, зуде или новой реакции прекрати использование и оцени необходимость консультации специалиста.',
  });

  // ==========================================
  // Твои супер-ингредиенты и чего избегать
  // ==========================================
  keyIngredients.push(
    {
      ingredient: 'Центелла азиатская (Cica)',
      benefit: 'Встречается в косметических формулах для чувствительной кожи; переносимость зависит от всего состава.',
    },
    {
      ingredient: 'Ниацинамид (Витамин B3, 2–5%)',
      benefit: 'Может использоваться в уходе за кожей, склонной к блеску. Больше концентрация не обязательно лучше; ориентируйся на переносимость.',
    },
    {
      ingredient: 'Церамиды NP / AP / EOP',
      benefit: 'Липиды в составе увлажняющих средств для поддержки защитного барьера кожи.',
    },
    {
      ingredient: 'Гиалуроновая кислота разной массы',
      benefit: 'Увлажняющий компонент; результат зависит от готовой формулы и состояния кожи.',
    }
  );

  ingredientsToAvoid.push(
    {
      ingredient: 'Денатурированный спирт (Alcohol Denat)',
      reason: 'Некоторые спиртосодержащие формулы могут раздражать сухую или чувствительную кожу. Оценивай готовое средство и свою реакцию.',
    },
    {
      ingredient: 'Средства, вызывающие жжение или стянутость',
      reason: 'При повторяющемся дискомфорте прекрати использование. Мягкость очищения зависит от готовой формулы, а не только названия одного компонента.',
    },
    {
      ingredient: 'Отдушки и эфирные масла при известной реакции',
      reason: 'Если ранее была реакция, избегай её подтверждённого триггера. «Натуральный» состав не гарантирует переносимость.',
    }
  );

  weeklyRituals.push(
    'Раз в неделю пересмотри записи: какие средства были комфортны, а после каких возникал дискомфорт.',
    'Новое средство сначала протестируй на небольшом участке 7–10 дней по инструкции. При реакции прекрати использование; это не заменяет аллергологическое обследование.'
  );

  lifestyleTips.push(
    'Отмечай сон, стресс и время на улице как контекст. Совпадение с ощущениями кожи само по себе не доказывает причину.',
    'Старайся снимать кожу при одинаковом освещении; яркость фото не является измерением увлажнённости.',
    'При сухом воздухе можно рассмотреть увлажнитель с регулярной очисткой по инструкции. Это не заменяет подходящий уход.'
  );

  return {
    am: amSteps,
    pm: pmSteps,
    weeklyRituals,
    keyIngredientsToSeek: keyIngredients,
    ingredientsToAvoid,
    lifestyleAndDietTips: lifestyleTips,
  };
}

/**
 * Предустановленные профили Mina для мгновенного ознакомления
 */
export const MINA_PRESETS = [
  {
    id: 'preset-combination-urban',
    title: 'Комбинированная и стресс',
    subtitle: 'Блеск в Т-зоне к середине дня и сухость щек от кондиционеров',
    tag: '🌿 Баланс',
    badgeText: 'Популярный типаж',
    icon: '🌿',
    avatarBg: 'bg-gradient-to-tr from-amber-100 via-rose-100 to-teal-100 text-stone-700',
    avatarColor: 'from-amber-400 to-rose-400',
    previewMetrics: {
      skinType: 'Combination' as SkinType,
      score: 74,
      primaryConcern: 'Баланс Т-зоны и легкое увлажнение щек',
    },
    sampleMetrics: {
      overallHealthScore: 74,
      skinType: 'Combination' as SkinType,
      primaryConcern: 'Блеск в Т-зоне и стянутость щек',
      secondaryConcern: 'Защита от городской пыли и стресса',
      hydration: 68,
      sebumControl: 54,
      barrierHealth: 76,
      poreClarity: 62,
      rednessSensitivity: 78,
      firmnessElasticity: 82,
      eyeAreaFatigue: 68,
      zones: [
        {
          zone: 'Forehead' as const,
          metric: 'Баланс блеска',
          score: 58,
          severity: 'Mild' as const,
          observation: 'Легкий блеск на лбу к середине дня, поры в нормальном тонусе.',
          recommendation: 'Используй легкий утренний флюид с ниацинамидом 2%.',
        },
        {
          zone: 'T-Zone' as const,
          metric: 'Чистота пор',
          score: 52,
          severity: 'Mild' as const,
          observation: 'Небольшие черные точки на крыльях носа и слегка заметные поры.',
          recommendation: 'Привычное мягкое очищение по потребности; новые кислоты не подбираются по демонстрационному профилю.',
        },
        {
          zone: 'Cheeks' as const,
          metric: 'Влажность щек',
          score: 76,
          severity: 'Optimal' as const,
          observation: 'Кожа на щеках спокойная, но требует регулярной легкой гидратации.',
          recommendation: 'Увлажняющий тонер с гиалуроновой кислотой в 2 слоя.',
        },
        {
          zone: 'Under-Eye' as const,
          metric: 'Свежесть взгляда',
          score: 68,
          severity: 'Mild' as const,
          observation: 'В иллюстративном профиле отмечен менее свежий вид зоны вокруг глаз; причина не определена.',
          recommendation: 'Освежающий крем-гель с пептидами и кофеином утром.',
        },
        {
          zone: 'Chin' as const,
          metric: 'Защитный барьер',
          score: 78,
          severity: 'Optimal' as const,
          observation: 'В этом демонстрационном профиле не отмечен дискомфорт подбородка; это не результат осмотра.',
          recommendation: 'Поддерживай уход барьерным ночным кремом с церамидами.',
        },
      ],
    },
  },
  {
    id: 'preset-sensitive-cica',
    title: 'Чувствительная и сухая',
    subtitle: 'Ощущение стянутости после умывания, реакция на холод и ветер',
    tag: '🌸 Барьер',
    badgeText: 'Требует заботы',
    icon: '🌸',
    avatarBg: 'bg-gradient-to-tr from-rose-100 via-pink-100 to-amber-50 text-rose-800',
    avatarColor: 'from-rose-400 to-pink-500',
    previewMetrics: {
      skinType: 'Sensitive' as SkinType,
      score: 61,
      primaryConcern: 'Успокаивающий уход и снятие покраснений',
    },
    sampleMetrics: {
      overallHealthScore: 61,
      skinType: 'Sensitive' as SkinType,
      primaryConcern: 'Снятие покраснений и восстановление барьера',
      secondaryConcern: 'Глубокая защита от чувства стянутости',
      hydration: 44,
      sebumControl: 68,
      barrierHealth: 51,
      poreClarity: 74,
      rednessSensitivity: 48,
      firmnessElasticity: 70,
      eyeAreaFatigue: 62,
      zones: [
        {
          zone: 'Forehead' as const,
          metric: 'Уровень влаги',
          score: 58,
          severity: 'Mild' as const,
          observation: 'Мелкие линии поверхностной сухости при мимике.',
          recommendation: 'Успокаивающая эссенция с центеллой и пантенолом.',
        },
        {
          zone: 'T-Zone' as const,
          metric: 'Липидный баланс',
          score: 70,
          severity: 'Optimal' as const,
          observation: 'Поры чистые, избыточного жирного блеска нет.',
          recommendation: 'Избегай агрессивных сульфатных пенок для умывания.',
        },
        {
          zone: 'Cheeks' as const,
          metric: 'Чувствительность щек',
          score: 42,
          severity: 'Needs Attention' as const,
          observation: 'В иллюстративном профиле есть покраснение щёк; состояние сосудов по нему не определяется.',
          recommendation: 'Привычный бережный уход по переносимости. При стойком покраснении обратись к дерматологу.',
        },
        {
          zone: 'Under-Eye' as const,
          metric: 'Тонкая кожа век',
          score: 55,
          severity: 'Mild' as const,
          observation: 'Очень нежная зона, склонная к сухости.',
          recommendation: 'Питательный бальзам для век без отдушек со скваланом.',
        },
        {
          zone: 'Chin' as const,
          metric: 'Шелушения',
          score: 50,
          severity: 'Needs Attention' as const,
          observation: 'Локальная сухость и стянутость по контуру подбородка.',
          recommendation: 'Наноси восстанавливающий церамидный крем густым слоем на ночь.',
        },
      ],
    },
  },
  {
    id: 'preset-oily-blemish',
    title: 'Склонная к блеску и порам',
    subtitle: 'Активный себум в Т-зоне, расширенные поры и следы постакне',
    tag: '🫧 Матовость',
    badgeText: 'Очищение и баланс',
    icon: '🫧',
    avatarBg: 'bg-gradient-to-tr from-teal-100 via-emerald-100 to-sky-100 text-teal-800',
    avatarColor: 'from-emerald-400 to-teal-500',
    previewMetrics: {
      skinType: 'Oily' as SkinType,
      score: 65,
      primaryConcern: 'Деликатное сужение пор и контроль себума',
    },
    sampleMetrics: {
      overallHealthScore: 65,
      skinType: 'Oily' as SkinType,
      primaryConcern: 'Контроль жирного блеска и чистота пор',
      secondaryConcern: 'Сглаживание микрорельефа и следов постакне',
      hydration: 55,
      sebumControl: 42,
      barrierHealth: 72,
      poreClarity: 46,
      rednessSensitivity: 64,
      firmnessElasticity: 86,
      eyeAreaFatigue: 75,
      zones: [
        {
          zone: 'Forehead' as const,
          metric: 'Выработка себума',
          score: 45,
          severity: 'Needs Attention' as const,
          observation: 'Заметный блеск уже к середине рабочего дня.',
          recommendation: 'Сыворотка с Цинком PCA и ниацинамидом для бархатного финиша.',
        },
        {
          zone: 'T-Zone' as const,
          metric: 'Чистота пор на носу',
          score: 38,
          severity: 'Needs Attention' as const,
          observation: 'Черные точки и расширенные поры на спинке носа.',
          recommendation: 'Мягкое очищение без трения. Кислотный уход не назначается по демонстрационному профилю.',
        },
        {
          zone: 'Cheeks' as const,
          metric: 'Ровность тона',
          score: 65,
          severity: 'Mild' as const,
          observation: 'Небольшие следы после старых воспалений.',
          recommendation: 'Поддерживай привычную солнцезащиту. Выбор дополнительного ухода зависит от причины изменений и переносимости.',
        },
        {
          zone: 'Under-Eye' as const,
          metric: 'Свежесть взгляда',
          score: 78,
          severity: 'Optimal' as const,
          observation: 'Кожа вокруг глаз в отличном тонусе.',
          recommendation: 'Легкий увлажняющий гель с антиоксидантами.',
        },
        {
          zone: 'Chin' as const,
          metric: 'Баланс подбородка',
          score: 48,
          severity: 'Needs Attention' as const,
          observation: 'Склонность к закрытым комедонам вдоль линии челюсти.',
          recommendation: 'Не начинай новый актив по демонстрационному профилю. При беспокоящих высыпаниях обсуди уход с дерматологом.',
        },
      ],
    },
  },
  {
    id: 'preset-radiant-balanced',
    title: 'Сияющая Glass Skin',
    subtitle: 'Здоровый барьер, ровный фарфоровый тон и естественный глянец',
    tag: '✨ Сияние',
    badgeText: 'Идеальный баланс',
    icon: '✨',
    avatarBg: 'bg-gradient-to-tr from-purple-100 via-rose-100 to-amber-100 text-purple-800',
    avatarColor: 'from-purple-400 to-indigo-500',
    previewMetrics: {
      skinType: 'Normal' as SkinType,
      score: 89,
      primaryConcern: 'Поддержание антиоксидантного сияния',
    },
    sampleMetrics: {
      overallHealthScore: 89,
      skinType: 'Normal' as SkinType,
      primaryConcern: 'Поддержание антиоксидантного сияния',
      secondaryConcern: 'Сохранение упругости и защита от фотостарения',
      hydration: 88,
      sebumControl: 84,
      barrierHealth: 92,
      poreClarity: 85,
      rednessSensitivity: 89,
      firmnessElasticity: 91,
      eyeAreaFatigue: 82,
      zones: [
        {
          zone: 'Forehead' as const,
          metric: 'Гладкость и свет',
          score: 90,
          severity: 'Optimal' as const,
          observation: 'Идеально ровная текстура с деликатным светоотражением.',
          recommendation: 'Продолжай привычный уход и солнцезащиту. Антиоксидантная сыворотка — необязательный шаг.',
        },
        {
          zone: 'T-Zone' as const,
          metric: 'Чистота пор',
          score: 84,
          severity: 'Optimal' as const,
          observation: 'Поры узкие, чистые, жирный блеск отсутствует.',
          recommendation: 'Дополнительное отшелушивание не обязательно. Ориентируйся на ощущения и переносимость средств.',
        },
        {
          zone: 'Cheeks' as const,
          metric: 'Упругость и тургор',
          score: 92,
          severity: 'Optimal' as const,
          observation: 'Плотная, бархатистая, наполненная влагой кожа.',
          recommendation: 'Поддерживай пептидным уходом и гиалуроновой эссенцией.',
        },
        {
          zone: 'Under-Eye' as const,
          metric: 'Отдохнувший контур',
          score: 82,
          severity: 'Optimal' as const,
          observation: 'Отсутствие темных кругов, отличное увлажнение век.',
          recommendation: 'Легкий крем с пептидами и кофеином.',
        },
        {
          zone: 'Chin' as const,
          metric: 'Крепость барьера',
          score: 88,
          severity: 'Optimal' as const,
          observation: 'Однородный спокойный тон без раздражений.',
          recommendation: 'Ночной крем с церамидами для поддержания сияния.',
        },
      ],
    },
  },
];

/**
 * Demonstration only: derives synthetic profile scores from whole-image RGB.
 * No trained model, face detection, zone segmentation or validated measurement
 * of hydration, barrier function or any medical condition takes place here.
 */
export function analyzeImageHeuristics(canvas: HTMLCanvasElement): SkinMetrics {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return MINA_PRESETS[0].sampleMetrics;
  }

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalBrightness = 0;
  const count = data.length / 4;

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalR += r;
    totalG += g;
    totalB += b;
    totalBrightness += (r * 0.299 + g * 0.587 + b * 0.114);
  }

  const sampledCount = count / 4;
  const avgR = totalR / sampledCount;
  const avgG = totalG / sampledCount;
  const avgB = totalB / sampledCount;
  const avgBrightness = totalBrightness / sampledCount;

  // Calculate redness ratio
  const rednessRatio = avgR / (Math.max(1, (avgG + avgB) / 2));
  
  const skinType: SkinType =
    rednessRatio > 1.25 ? 'Sensitive' :
    avgBrightness > 160 ? 'Combination' :
    avgBrightness < 100 ? 'Dry' : 'Oily';

  const hydration = Math.min(95, Math.max(35, Math.round(avgBrightness * 0.45 + (skinType === 'Dry' ? -15 : 10))));
  const rednessSensitivity = Math.min(95, Math.max(30, Math.round(100 - (rednessRatio - 1) * 120)));
  const sebumControl = Math.min(95, Math.max(35, Math.round(skinType === 'Oily' ? 45 : skinType === 'Dry' ? 85 : 65)));
  const poreClarity = Math.min(95, Math.max(40, Math.round(sebumControl * 0.8 + 15)));
  const barrierHealth = Math.min(98, Math.max(45, Math.round((hydration + rednessSensitivity) / 2)));
  const eyeAreaFatigue = Math.min(95, Math.max(45, Math.round(avgBrightness * 0.5 + 20)));
  const firmnessElasticity = Math.min(95, Math.max(55, Math.round((barrierHealth + hydration) / 2)));

  const overallHealthScore = Math.round(
    hydration * 0.25 +
    barrierHealth * 0.25 +
    sebumControl * 0.2 +
    poreClarity * 0.15 +
    rednessSensitivity * 0.15
  );

  const zones: ZoneAnalysis[] = [
    {
      zone: 'Forehead',
      metric: 'Баланс себума',
      score: sebumControl,
      severity: sebumControl < 50 ? 'Needs Attention' : sebumControl < 70 ? 'Mild' : 'Optimal',
      observation: 'Иллюстративное значение из цвета всего кадра; лоб отдельно не анализировался.',
      recommendation: 'Отметь ощущения в дневнике; уход выбирается по твоим отметкам и переносимости.',
    },
    {
      zone: 'T-Zone',
      metric: 'Чистота пор',
      score: poreClarity,
      severity: poreClarity < 50 ? 'Needs Attention' : poreClarity < 70 ? 'Mild' : 'Optimal',
      observation: 'Иллюстративное значение: алгоритм не распознаёт поры и не анализирует Т-зону отдельно.',
      recommendation: 'Не начинай кислотный уход по этому значению. Для ежедневной базы подходит привычное мягкое очищение.',
    },
    {
      zone: 'Cheeks',
      metric: 'Демо-показатель щёк',
      score: rednessSensitivity,
      severity: rednessSensitivity < 50 ? 'Needs Attention' : rednessSensitivity < 70 ? 'Mild' : 'Optimal',
      observation: 'Цвет кадра зависит от освещения. Он не измеряет чувствительность кожи или состояние сосудов.',
      recommendation: 'При дискомфорте отметь его в дневнике. При стойком покраснении обратись к специалисту.',
    },
    {
      zone: 'Under-Eye',
      metric: 'Свежесть зоны вокруг глаз',
      score: eyeAreaFatigue,
      severity: eyeAreaFatigue < 55 ? 'Needs Attention' : 'Optimal',
      observation: 'Иллюстративное значение: причина усталого вида и состояние зоны вокруг глаз не определяются.',
      recommendation: 'Избегай трения; дополнительное средство вокруг глаз не обязательно.',
    },
    {
      zone: 'Chin',
      metric: 'Демо-показатель комфорта',
      score: barrierHealth,
      severity: barrierHealth < 60 ? 'Needs Attention' : 'Optimal',
      observation: 'Это синтетический показатель; функцию защитного барьера по нему оценить нельзя.',
      recommendation: 'Расскажи о своих ощущениях в дневнике и используй привычный уход по переносимости.',
    },
  ];

  return {
    overallHealthScore,
    skinType,
    primaryConcern:
      skinType === 'Sensitive' ? 'Снятие покраснений и защита барьера' :
      skinType === 'Oily' ? 'Контроль блеска и сужение пор' :
      skinType === 'Dry' ? 'Глубокое увлажнение и снятие стянутости' : 'Баланс Т-зоны и сияние',
    secondaryConcern: 'Ежедневная защита от фотостарения SPF 50+',
    hydration,
    sebumControl,
    barrierHealth,
    poreClarity,
    rednessSensitivity,
    firmnessElasticity,
    eyeAreaFatigue,
    zones,
  };
}
