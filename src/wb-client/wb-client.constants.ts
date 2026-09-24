export const WB_BASE_URLS = {
  common: 'https://common-api.wildberries.ru',
  content: 'https://content-api.wildberries.ru',
  marketplace: 'https://marketplace-api.wildberries.ru',
  prices: 'https://discounts-prices-api.wildberries.ru',
  analytics: 'https://seller-analytics-api.wildberries.ru',
  statistics: 'https://statistics-api.wildberries.ru',
  feedbacks: 'https://feedbacks-api.wildberries.ru',
  promotion: 'https://advert-api.wildberries.ru',
  chat: 'https://buyer-chat-api.wildberries.ru',
  supplies: 'https://supplies-api.wildberries.ru',
  documents: 'https://documents-api.wildberries.ru',
  finance: 'https://finance-api.wildberries.ru',
  returns: 'https://returns-api.wildberries.ru',
  userManagement: 'https://user-management-api.wildberries.ru',
} as const;

export type WbServiceType = keyof typeof WB_BASE_URLS;
