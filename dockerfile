FROM node:16-alpine
# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app
# Копируем package.json и package-lock.json в контейнер
COPY package*.json ./
# Устанавливаем зависимости
RUN npm ci
# Копируем остальные файлы проекта в контейнер
COPY . .
# Указываем порт, на котором будет работать бот
EXPOSE 3000
# Запускаем команду для запуска бота
CMD ["npm", "start"]
