import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
}
