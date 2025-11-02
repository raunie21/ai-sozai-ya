export interface SiteUpdate {
  date: string; // 'MM/DD' 形式
  text: string; // 表示文言
}

// 直近が先頭
export const siteUpdates: SiteUpdate[] = [
  { date: '10/30', text: '様々な犬の素材（計105点）を追加しました。' },
  { date: '10/23', text: '挙手する人物の素材など（計10点）を追加しました。' },
];


