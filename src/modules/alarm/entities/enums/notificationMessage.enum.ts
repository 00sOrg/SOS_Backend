export enum NotificationMessage {
  FAVORITE_REQUEST = `{{sender}}님이 지인 등록 요청을 보냈습니다.`,
  NEARBY_EVENT = '주변에 큰 사고가 발생했습니다.',
  HELP_REQUEST = `{{nickname}}님이 도움을 요청했습니다.`,
  FAVORITE_NEARBY_EVENT = '{{nickname}}님의 주변에서 사고가 발생했습니다.',
}

export function formatNotificationMessage(
  template: string,
  params: Record<string, string>,
) {
  return template.replace(/{{(.*?)}}/g, (_, key) => params[key.trim()] || '');
}
