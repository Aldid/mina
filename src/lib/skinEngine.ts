import { SkinMetrics, SkincareRoutine, SkincareStep, SkinType, ZoneAnalysis } from '../types';

/**
 * Mina Dermatological Skincare Protocol Generator
 * Generates clinical AM & PM routines, active ingredient matches,
 * contraindications, and lifestyle tips tailored strictly to biometric skin metrics.
 * 100% localized in warm, empathetic, and professional Russian.
 */
export function generateSkincareProtocol(metrics: SkinMetrics): SkincareRoutine {
  const { skinType, hydration, sebumControl, rednessSensitivity, poreClarity, eyeAreaFatigue } = metrics;

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
  if (skinType === 'Dry' || skinType === 'Sensitive') {
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
      productName: 'Очищающий себорегулирующий гель с мягкой BHA',
      productType: 'Слабокислотная освежающая пенка (pH 5.5)',
      targetConcerns: ['Удаление ночного себума', 'Очищение и сужение пор'],
      keyActives: ['Салициловая кислота 0.5%', 'Цинк PCA', 'Экстракт чайного дерева'],
      usageAdvice: 'Вспень горошину геля во влажных ладонях, помассируй Т-зону 30 секунд и смой прохладной водой.',
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
  if (hydration < 60 || skinType === 'Dry' || skinType === 'Sensitive') {
    amSteps.push({
      order: 2,
      phase: 'Tone & Prep',
      productName: 'Глубоко увлажняющий тонер-эссенция с 5 видами гиалуроновой кислоты',
      productType: 'Шелковистый увлажняющий тонер',
      targetConcerns: ['Мгновенное насыщение влагой', 'Смягчение эпидермиса'],
      keyActives: ['Гиалуроновая кислота (микро и макро)', 'Бета-глюкан', 'Пантенол'],
      usageAdvice: 'Нанеси несколько капель прямо на ладони и аккуратно «вбей» подушечками пальцев в кожу лица и шеи.',
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
  if (rednessSensitivity < 60 || skinType === 'Sensitive') {
    amSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Успокаивающая Cica-сыворотка с мадекассосидом',
      productType: 'Барьерный успокаивающий концентрат',
      targetConcerns: ['Снятие покраснений', 'Укрепление хрупких капилляров'],
      keyActives: ['Мадекассосид', 'Центелла азиатская', 'Пантенол 5%'],
      usageAdvice: 'Распредели 3–4 капли по щекам и крыльям носа до полного комфортного впитывания.',
    });
  } else if (sebumControl < 60 || skinType === 'Oily') {
    amSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Себорегулирующая сыворотка с ниацинамидом и цинком',
      productType: 'Матирующий легкий серум',
      targetConcerns: ['Контроль блеска в течение дня', 'Сужение пор'],
      keyActives: ['Ниацинамид 5%', 'Цинк 1%', 'Экстракт коры белой ивы'],
      usageAdvice: 'Нанеси тонким слоем на Т-зону и лоб перед нанесением увлажняющего крема.',
    });
  } else {
    amSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Антиоксидантная сыворотка-сияние с витамином C и феруловой кислотой',
      productType: 'Осветляющая сыворотка для ровного тона',
      targetConcerns: ['Защита от смога и фотостарения', 'Естественный Glass-Skin глянец'],
      keyActives: ['Стабильный витамин C (E-AA)', 'Феруловая кислота', 'Витамин E'],
      usageAdvice: '3 капли утром придадут коже фарфоровое свечение и усилят действие солнцезащитного крема.',
    });
  }

  // Шаг 4: Дневной увлажняющий крем
  if (skinType === 'Oily' || sebumControl < 50) {
    amSteps.push({
      order: 4,
      phase: 'Hydrate & Seal',
      productName: 'Невесомый крем-гель без масел (Oil-Free Water Gel)',
      productType: 'Матирующий крем-флюид',
      targetConcerns: ['Увлажнение без липкости', 'Бархатистый матовый финиш'],
      keyActives: ['Сок березы', 'Гиалуронат натрия', 'Экстракт центеллы'],
      usageAdvice: 'Легкий горошины хватит на все лицо. Быстро впитывается и служит идеальной базой под макияж.',
    });
  } else {
    amSteps.push({
      order: 4,
      phase: 'Hydrate & Seal',
      productName: 'Восстанавливающий барьерный крем-шелк с церамидами',
      productType: 'Шелковистый ламеллярный крем',
      targetConcerns: ['Удержание влаги весь день', 'Защита от кондиционеров и ветра'],
      keyActives: ['Церамиды NP, AP, EOP', 'Сквалан', 'Фитосфингозин'],
      usageAdvice: 'Разогрей крем между пальцами и мягкими прижимающими движениями нанеси на лицо и шею.',
    });
  }

  // Шаг 5: Невесомая защита от солнца SPF 50+
  amSteps.push({
    order: 5,
    phase: 'Sun Defense',
    productName: 'Невидимый солнцезащитный флюид SPF 50+ PA++++',
    productType: 'Увлажняющий санскрин на современных химических фильтрах нового поколения',
    targetConcerns: ['Профилактика пигментации', 'Защита от UVA/UVB лучей и фотостарения'],
    keyActives: ['Uvinul A Plus', 'Tinosorb S', 'Ниацинамид 2%'],
    usageAdvice: 'Наноси правилом двух пальцев за 15 минут до выхода. Не белит, не забивает поры и оставляет красивое свечение.',
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
    targetConcerns: ['Растворение стойкого SPF и косметики', 'Глубокое очищение пор от пыли'],
    keyActives: ['Масло жожоба', 'Масло рисовых отрубей', 'Экстракт центеллы'],
    usageAdvice: 'Нанеси сухими руками на сухое лицо, помассируй 1 минуту, добавь каплю воды до образования белого молочка и смой.',
  });

  // Шаг 2: Второй этап очищения
  pmSteps.push({
    order: 2,
    phase: 'Cleanse',
    productName: 'Нежная пенка для умывания с физиологическим pH 5.5',
    productType: 'Успокаивающая пенка с пантенолом',
    targetConcerns: ['Финальное чистое умывание', 'Сохранение естественной микрофлоры'],
    keyActives: ['Аминокислоты яблока', 'Аллантоин', 'Пантенол'],
    usageAdvice: 'Взбей нежную пену в ладонях, мягко смой остатки гидрофильного масла и промокни полотенцем.',
  });

  // Шаг 3: Вечернее тонизирование
  pmSteps.push({
    order: 3,
    phase: 'Tone & Prep',
    productName: 'Восстанавливающий молочный тонер-комфорт',
    productType: 'Двухфазный питательный тонер',
    targetConcerns: ['Восстановление гидробаланса после дня', 'Мягкость и бархатистость'],
    keyActives: ['Экстракт риса 77%', 'Керамиды', 'Ниацинамид'],
    usageAdvice: 'Встряхни флакон, нанеси ладонями в 2 тонких слоя для эффекта упругой, напитанной кожи.',
  });

  // Шаг 4: Ночной интенсивный уход
  if (poreClarity < 60 || sebumControl < 50) {
    pmSteps.push({
      order: 4,
      phase: 'Target & Treat',
      productName: 'Ночная сыворотка с салициловой кислотой 2% и цинком',
      productType: 'Эксфолиирующий очищающий ночной концентрат',
      targetConcerns: ['Растворение сальных пробок', 'Осветление черных точек'],
      keyActives: ['Бетаин салицилат 2%', 'Цинк PCA', 'Центелла'],
      usageAdvice: 'Используй 2-3 раза в неделю на ночь на сухую кожу Т-зоны. Избегай зоны вокруг глаз.',
    });
  } else if (skinType === 'Sensitive' || rednessSensitivity < 60) {
    pmSteps.push({
      order: 4,
      phase: 'Target & Treat',
      productName: 'Интенсивная барьерная сыворотка с бифидобактериями и Cica',
      productType: 'Ночной регенерирующий концентрат',
      targetConcerns: ['Снятие дневного воспаления', 'Укрепление микробиома кожи'],
      keyActives: ['Лизат бифидобактерий', 'Мадекассосид', 'Пептидный комплекс'],
      usageAdvice: 'Нанеси 4 капли на все лицо мягкими разглаживающими движениями перед сном.',
    });
  } else {
    pmSteps.push({
      order: 4,
      phase: 'Target & Treat',
      productName: 'Омолаживающая пептидная сыворотка Multi-Peptide Glow',
      productType: 'Укрепляющий антивозрастной эликсир',
      targetConcerns: ['Повышение эластичности', 'Сглаживание мимических линий'],
      keyActives: ['Matrixyl 3000', 'Медные пептиды', 'Гиалуроновая кислота'],
      usageAdvice: 'Распредели по массажным линиям от центра лица к периферии и шее.',
    });
  }

  // Шаг 5: Ночной питательный крем-бальзам
  pmSteps.push({
    order: 5,
    phase: 'Hydrate & Seal',
    productName: 'Ночной крем глубокого восстановления с церамидами и скваланом',
    productType: 'Питательный барьерный крем «вторая кожа»',
    targetConcerns: ['Ночная регенерация клеток', 'Пробуждение со свежей отдохнувшей кожей'],
    keyActives: ['Комплекс 5 церамидов', 'Сквалан сахарного тростника', 'Холестерол'],
    usageAdvice: 'Нанеси за 30 минут до сна щедрым комфортным слоем. Утром кожа будет мягкой, гладкой и напитанной.',
  });

  // ==========================================
  // Твои супер-ингредиенты и чего избегать
  // ==========================================
  keyIngredients.push(
    {
      ingredient: 'Центелла азиатская (Cica)',
      benefit: 'Быстро успокаивает покраснения, ускоряет регенерацию и снимает ощущение жара.',
    },
    {
      ingredient: 'Ниацинамид (Витамин B3, 2–5%)',
      benefit: 'Нормализует выработку кожного сала, мягко сужает поры и стирает следы усталости.',
    },
    {
      ingredient: 'Церамиды NP / AP / EOP',
      benefit: 'Скрепляют клетки защитного барьера подобно цементу, запирая драгоценную влагу внутри.',
    },
    {
      ingredient: 'Гиалуроновая кислота разной массы',
      benefit: 'Притягивает и удерживает до 1000 раз больше своего веса в воде, создавая сочный объем.',
    }
  );

  ingredientsToAvoid.push(
    {
      ingredient: 'Денатурированный спирт (Alcohol Denat)',
      benefit: '',
      reason: 'Мгновенно обезвоживает верхний слой кожи и стимулирует сальные железы выделять еще больше жира.',
    },
    {
      ingredient: 'Агрессивные сульфаты (SLS / SLES)',
      benefit: '',
      reason: 'Смывают защитную липидную пленку, приводя к раздражению, сухости и ранним морщинкам.',
    },
    {
      ingredient: 'Тяжелые комедогенные минеральные масла',
      benefit: '',
      reason: 'Создают воздухонепроницаемую пленку и провоцируют закупорку протоков сальных желез.',
    }
  );

  weeklyRituals.push(
    '1 раз в неделю: Мягкий энзимный пилинг-пудра с папаином для гладкого Glass-Skin сияния.',
    '2 раза в неделю: Успокаивающая тканевая маска с центеллой после душа для глубокого релакса.'
  );

  lifestyleTips.push(
    'Пей не менее 1.5–2 литров чистой теплой воды в день для клеточной гидратации.',
    'Меняй наволочку на шелковую каждые 3–4 дня — это предотвращает бактериальные высыпания и заломы.',
    'Используй увлажнитель воздуха в комнате, особенно при включенном кондиционере или отоплении.'
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
          recommendation: 'Мягкое вечернее очищение гидрофильным маслом + BHA 2 раза в неделю.',
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
          observation: 'Небольшие следы недосыпа и сухость от гаджетов.',
          recommendation: 'Освежающий крем-гель с пептидами и кофеином утром.',
        },
        {
          zone: 'Chin' as const,
          metric: 'Защитный барьер',
          score: 78,
          severity: 'Optimal' as const,
          observation: 'Здоровый барьер, воспалений и шелушений не обнаружено.',
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
          observation: 'Заметный румянец и хрупкие сосуды, реагирующие на перепад температур.',
          recommendation: 'Сыворотка с высокой концентрацией Cica (центеллы) и мадекассосида.',
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
          recommendation: 'Ежедневное мягкое очищение салициловой кислотой BHA 0.5%.',
        },
        {
          zone: 'Cheeks' as const,
          metric: 'Ровность тона',
          score: 65,
          severity: 'Mild' as const,
          observation: 'Небольшие следы после старых воспалений.',
          recommendation: 'Ниацинамид 5% ускорит осветление пятнышек постакне.',
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
          recommendation: 'Точечное применение азелаиновой кислоты на ночь.',
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
          recommendation: 'Продолжай ежедневную защиту сывороткой с витамином C.',
        },
        {
          zone: 'T-Zone' as const,
          metric: 'Чистота пор',
          score: 84,
          severity: 'Optimal' as const,
          observation: 'Поры узкие, чистые, жирный блеск отсутствует.',
          recommendation: 'Раз в неделю деликатная энзимная пудра для полировки кожи.',
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
 * Deterministically simulates skin metric analysis from uploaded images
 * using pixel luminance, color distribution, and facial aspect heuristics.
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
      observation: sebumControl < 50 ? 'Заметный блеск на лобной зоне.' : 'Хорошо сбалансированная бархатная текстура.',
      recommendation: sebumControl < 50 ? 'Нанеси легкий флюид с ниацинамидом 2%.' : 'Продолжай мягкое ежедневное увлажнение.',
    },
    {
      zone: 'T-Zone',
      metric: 'Чистота пор',
      score: poreClarity,
      severity: poreClarity < 50 ? 'Needs Attention' : poreClarity < 70 ? 'Mild' : 'Optimal',
      observation: poreClarity < 50 ? 'Легкая закупорка пор на крыльях носа.' : 'Поры чистые, микрорельеф ровный.',
      recommendation: 'Мягкое очищение с салициловой кислотой BHA 2 раза в неделю.',
    },
    {
      zone: 'Cheeks',
      metric: 'Увлажненность и капилляры',
      score: rednessSensitivity,
      severity: rednessSensitivity < 50 ? 'Needs Attention' : rednessSensitivity < 70 ? 'Mild' : 'Optimal',
      observation: rednessSensitivity < 50 ? 'Заметна чувствительность и румянец на щеках.' : 'Спокойный ровный тон.',
      recommendation: 'Сыворотка с центеллой азиатской и мадекассосидом для укрепления сосудов.',
    },
    {
      zone: 'Under-Eye',
      metric: 'Свежесть зоны вокруг глаз',
      score: eyeAreaFatigue,
      severity: eyeAreaFatigue < 55 ? 'Needs Attention' : 'Optimal',
      observation: eyeAreaFatigue < 55 ? 'Легкие следы усталости и сухость от экранов.' : 'Отдохнувший свежий взгляд.',
      recommendation: 'Крем-гель для век с пептидами и кофеином.',
    },
    {
      zone: 'Chin',
      metric: 'Крепость защитного барьера',
      score: barrierHealth,
      severity: barrierHealth < 60 ? 'Needs Attention' : 'Optimal',
      observation: barrierHealth < 60 ? 'Чувство сухости и нежный барьер.' : 'Крепкий защитный барьер.',
      recommendation: 'Восстанавливающий крем с церамидами на ночь.',
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
