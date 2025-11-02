declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        onDidFinishLoad?: () => void;
        onDidStartLoading?: () => void;
        onDidFailLoad?: (event: any) => void;
        partition?: string;
        allowpopups?: boolean;
        webpreferences?: string;
      },
      HTMLElement
    >;
  }
}

interface HTMLWebViewElement extends HTMLElement {
  src: string;
  reload(): void;
  goBack(): void;
  goForward(): void;
}
