export const metadata = {
  title: "Cardápio",
};

export default function MenuLandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-space-md p-margin text-center">
      <span className="font-icon text-5xl text-primary">qr_code_2</span>
      <h1 className="font-display text-headline-lg text-on-surface">
        Escaneie o QR code da mesa
      </h1>
      <p className="text-body-md text-on-surface-variant">
        Abra a câmera e aponte para o código na sua mesa para acessar o cardápio do
        restaurante.
      </p>
    </main>
  );
}
