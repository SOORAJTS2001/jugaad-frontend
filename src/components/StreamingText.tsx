interface HtmlTextProps {
  text: string; // may contain HTML
}

export const HtmlText = ({ text }: HtmlTextProps) => {
  return (
    <span dangerouslySetInnerHTML={{ __html: text }} />
  );
};
