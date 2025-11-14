// next-intl types
type Messages = typeof import('./src/messages/zh.json');  
type IntlMessages = Messages

// Theme preference types
interface Window {
  __THEME_PREFERENCE__?: {
    theme: string;
    shouldBeDark: boolean;
  };
}
