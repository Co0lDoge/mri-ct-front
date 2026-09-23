const path = require('path');

/**
 * Общая функция для настройки webpack в Next.js приложениях
 * @param {Object} config - Конфигурация webpack
 * @param {Object} options - Опции
 * @param {boolean} options.isServer - Запускается ли на сервере
 * @param {string} options.appDir - Директория приложения (относительно корня монорепо)
 * @returns {Object} - Обновленная конфигурация webpack
 */
function configureWebpack(config, { isServer: _isServer, appDir: _appDir }) {

  // Добавляем алиасы для workspace пакетов
  config.resolve.alias = {
    ...config.resolve.alias,
    '@medml/config': path.resolve(__dirname),
    '@medml/ui': path.resolve(__dirname, '../ui/src'),
    '@medml/store': path.resolve(__dirname, '../store/src'),
    '@medml/shared': path.resolve(__dirname, '../shared/src'),
    '@medml/auth': path.resolve(__dirname, '../../domains/auth/src'),
    '@medml/layout': path.resolve(__dirname, '../../domains/layout/src'),
  };
  
  // Настройка для обработки шрифтов
  config.module.rules.push({
    test: /\.(otf|woff|woff2|eot|ttf)$/,
    type: 'asset/resource',
    generator: {
      filename: 'static/fonts/[name][ext]',
    },
  });
  
  return config;
}

module.exports = { configureWebpack };
