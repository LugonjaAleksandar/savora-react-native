import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ContainerProvider, createContainer } from '@/core/di/container';
import { InMemoryKeyValueStore } from '@/core/storage/keyValueStore';
import { summary } from '@/test/fixtures';

import { ToastHost } from '../ToastHost';

describe('ToastHost', () => {
  it('runs the undo action and restores the removed favorite', async () => {
    const container = createContainer({ storage: new InMemoryKeyValueStore() });
    const favorites = container.favoritesStore;
    favorites.getState().add(summary);
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <ContainerProvider container={container}>
          <ToastHost />
        </ContainerProvider>
      </SafeAreaProvider>,
    );

    await act(async () => {
      const index = favorites.getState().remove(summary.id);
      container.toastStore
        .getState()
        .show('Removed from saved', { label: 'Undo', onPress: () => favorites.getState().add(summary, index ?? 0) });
    });
    expect(favorites.getState().favorites).toEqual([]);

    await act(async () => {
      fireEvent.press(screen.getByText('Undo'));
    });

    expect(favorites.getState().favorites).toEqual([summary]);
    expect(container.toastStore.getState().toast).toBeNull();
  });
});
