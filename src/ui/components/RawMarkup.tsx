type RawMarkupProps = {
  markup: string;
};

export function RawMarkup({ markup }: RawMarkupProps) {
  return <div class="preact-markup" dangerouslySetInnerHTML={{ __html: markup }} />;
}
