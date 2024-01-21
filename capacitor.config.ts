import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // appId: 'io.ionic.starter',
  appId: 'app.momochenisme.aiconversationapp',   // 建議新專案的第一步就是修改appId設定，以避免未來在修改時，不會自動同步的問題。如果未來真的要改，就只能自行到Android和iOS專案上手動修改
  // appName: 'AI_Conversation_APP',
  appName: 'AI 英語口說導師',   // 改
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
