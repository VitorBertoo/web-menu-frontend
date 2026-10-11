"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardMedia,
  CardPrice,
  CardTitle,
  CheckboxOption,
  Chip,
  ChipTrack,
  Dialog,
  Icon,
  Input,
  QuantityStepper,
  RadioGroup,
  RadioOption,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-space-md">
      <h2 className="font-display text-headline-md text-on-surface">{title}</h2>
      <div className="flex flex-wrap items-start gap-space-md">{children}</div>
    </section>
  );
}

export default function StyleguidePage() {
  const [quantity, setQuantity] = useState(2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [category, setCategory] = useState("lanches");

  return (
    <div className="flex flex-col gap-space-2xl">
      <header>
        <p className="text-label-sm uppercase tracking-wider text-secondary">
          Design System
        </p>
        <h1 className="font-display text-headline-lg text-on-surface">
          Culinary Modernity
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Referência dos primitivos em <code>components/ui</code>.
        </p>
      </header>

      <Section title="Buttons">
        <Button>
          <Icon name="add_circle" /> Novo Produto
        </Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="ghost">
          <Icon name="edit" /> Editar
        </Button>
        <Button variant="danger">Cancelar</Button>
        <Button variant="inverse">POS</Button>
        <Button size="sm">Pequeno</Button>
        <Button size="lg">Grande 48px</Button>
        <Button size="icon" aria-label="Adicionar">
          <Icon name="add" />
        </Button>
      </Section>

      <Section title="Badges">
        <Badge variant="required">Obrigatório</Badge>
        <Badge variant="optional">Adicional</Badge>
        <Badge variant="success">Disponível</Badge>
        <Badge variant="warning">Pausado</Badge>
        <Badge variant="danger">Esgotado</Badge>
        <Badge variant="primary">Chef's Choice</Badge>
      </Section>

      <Section title="Chips & Tabs">
        <ChipTrack className="w-full">
          {["lanches", "bebidas", "porcoes", "sobremesas"].map((item) => (
            <Chip
              key={item}
              variant={category === item ? "active" : "inactive"}
              onClick={() => setCategory(item)}
            >
              {item}
            </Chip>
          ))}
          <Chip variant="dark">Todos</Chip>
          <Chip variant="outline">Sem Glúten</Chip>
        </ChipTrack>
      </Section>

      <Section title="Menu Card">
        <Card className="w-72 overflow-hidden">
          <CardMedia className="aspect-video">
            <div className="flex h-full w-full items-center justify-center bg-surface-container-high text-outline">
              <Icon name="restaurant" size="xl" />
            </div>
          </CardMedia>
          <CardContent className="flex flex-col gap-space-xs">
            <div className="flex items-start justify-between gap-2">
              <CardTitle>Smash Angus Prime</CardTitle>
              <CardPrice>R$ 44,90</CardPrice>
            </div>
            <CardDescription>
              Blend 180g, cheddar inglês, bacon rústico e maionese defumada.
            </CardDescription>
            <Button className="mt-space-xs">
              <Icon name="tune" /> Personalizar & Adicionar
            </Button>
          </CardContent>
        </Card>
      </Section>

      <Section title="Form fields">
        <div className="w-72">
          <Input label="Nome do produto" placeholder="Ex.: Spaghetti ao Sugo" />
        </div>
        <div className="w-72">
          <Input label="Buscar" leftIcon="search" placeholder="Buscar pratos..." />
        </div>
        <div className="w-72">
          <Input label="Preço" placeholder="0,00" error="Informe um valor válido." />
        </div>
        <div className="w-72">
          <Textarea label="Observações" placeholder="Sem cebola..." />
        </div>
      </Section>

      <Section title="Radio & Checkbox">
        <RadioGroup className="w-80">
          <RadioOption
            name="ponto"
            value="ao_ponto"
            defaultChecked
            label="Ao Ponto Rosado"
            description="Centro suculento e levemente rosado"
            badge="Recomendado"
          />
          <RadioOption
            name="ponto"
            value="bem_passado"
            label="Bem Passado"
            description="Cozimento uniforme sem tonalidade rósea"
          />
        </RadioGroup>
        <div className="flex w-80 flex-col gap-space-sm">
          <CheckboxOption
            label="Bacon extra"
            description="Tiras crocantes"
            priceDelta="+ R$ 4,00"
          />
          <CheckboxOption label="Queijo cheddar" priceDelta="+ R$ 3,00" />
        </div>
      </Section>

      <Section title="Stepper">
        <QuantityStepper
          value={quantity}
          min={1}
          max={10}
          onIncrement={() => setQuantity((v) => Math.min(10, v + 1))}
          onDecrement={() => setQuantity((v) => Math.max(1, v - 1))}
        />
        <QuantityStepper
          size="sm"
          value={1}
          onIncrement={() => {}}
          onDecrement={() => {}}
        />
      </Section>

      <Section title="Dialog">
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          Abrir modal
        </Button>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          side="bottom"
          title="Personalizar seu prato"
          description="Escolha os componentes do item."
          footer={
            <Button block onClick={() => setDialogOpen(false)}>
              Adicionar ao pedido
            </Button>
          }
        >
          <RadioGroup>
            <RadioOption
              name="demo"
              value="a"
              defaultChecked
              label="Opção A"
              description="Descrição da opção A"
            />
            <RadioOption name="demo" value="b" label="Opção B" />
          </RadioGroup>
        </Dialog>
      </Section>

      <Section title="Skeleton">
        <div className="flex w-72 flex-col gap-space-sm">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Section>

      <Section title="Palette">
        <div className="flex flex-wrap gap-space-sm">
          {[
            "bg-primary",
            "bg-primary-hover",
            "bg-secondary",
            "bg-tertiary",
            "bg-inverse-surface",
            "bg-surface-container",
            "bg-surface-container-highest",
            "bg-error",
          ].map((token) => (
            <div key={token} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-14 w-14 rounded-lg border border-outline-variant",
                  token,
                )}
              />
              <span className="text-label-sm text-on-surface-variant">{token}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
