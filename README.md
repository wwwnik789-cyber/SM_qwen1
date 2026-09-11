# РекламаКальк - Калькулятор рекламных конструкций

Полнофункциональный калькулятор для расчёта стоимости рекламных вывесок, баннеров, световых коробов и других рекламных конструкций.

## 🚀 Возможности

- **10 типов изделий**: объёмные буквы, лайтбоксы, баннеры, неоновые вывески, таблички, пилоны, крышные установки, стритлайны, LED-экраны, панели-кронштейны
- **9 материалов**: ПВХ, акрил, АКП, металл, алюминий
- **18 типов подсветки**: лицевая, контражурная, RGB, динамическая, пиксельная и другие
- **Автоматический расчёт доставки** на основе объёма и веса конструкции
- **Детальная смета** с разбивкой по категориям
- **Адаптивный дизайн** для мобильных и десктопных устройств

## 🛠️ Технологии

- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion
- Lucide React

## 📦 Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен-сборки
npm run preview
```

## 🌐 Деплой на Vercel

### Автоматический деплой через GitHub

1. Создайте репозиторий на GitHub и загрузите проект:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ваш-username/ваш-репозиторий.git
git push -u origin main
```

2. Перейдите на [vercel.com](https://vercel.com) и войдите через GitHub

3. Нажмите "Add New Project" и выберите ваш репозиторий

4. Vercel автоматически определит настройки из `vercel.json`:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node.js: 20.x

5. Нажмите "Deploy"

### Ручная настройка Vercel

Если автоматическое определение не сработало, настройте вручную:

1. **Settings → General**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node Version: `20.x`

2. **Redeploy** проект

## 📁 Структура проекта

```
├── src/
│   ├── App.tsx              # Главный компонент приложения
│   ├── main.tsx             # Точка входа
│   ├── index.css            # Глобальные стили
│   └── data/
│       └── products.ts      # Данные о продуктах и ценах
├── public/                  # Статические файлы
├── dist/                    # Продакшен-сборка
├── index.html               # HTML шаблон
├── package.json             # Зависимости проекта
├── tsconfig.json            # Настройки TypeScript
├── vite.config.js           # Настройки Vite
├── vercel.json              # Настройки деплоя на Vercel
└── .npmrc                   # Настройки npm
```

## 🔧 Решение проблем

### Ошибка 404 на Vercel

1. Проверьте настройки проекта:
   - Output Directory должен быть `dist`
   - Build Command: `npm run build`

2. Убедитесь, что файл `vercel.json` присутствует в корне репозитория

3. Проверьте логи деплоя в Vercel Dashboard

### Ошибки npm при установке

Если видите предупреждения о `allow-scripts`:

```bash
# Вариант 1: Разрешить все скрипты
npm config set auto-approve-scripts true
npm install

# Вариант 2: Использовать legacy peer deps
npm install --legacy-peer-deps

# Вариант 3: Очистить кэш npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Пустая страница после выбора

Если после выбора продукта открывается пустая страница:

1. Очистите кэш браузера (Ctrl+Shift+Delete)
2. Проверьте консоль браузера (F12) на наличие ошибок
3. Убедитесь, что все зависимости установлены: `npm install`
4. Пересоберите проект: `npm run build`

## 📝 Лицензия

MIT

## 👨‍💻 Автор

Создано для рекламных агентств и производителей наружной рекламы.
