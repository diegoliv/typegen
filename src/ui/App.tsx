import { useLayoutEffect } from 'preact/hooks';
import { RawMarkup } from './components/RawMarkup';

type AppProps = {
  markup: string;
  onRendered: () => void;
};

export function App({ markup, onRendered }: AppProps) {
  useLayoutEffect(() => {
    onRendered();
  }, [markup, onRendered]);

  return (
    <div class="preact-app">
      <RawMarkup markup={markup} />
    </div>
  );
}
