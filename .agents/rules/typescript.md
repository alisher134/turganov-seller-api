# TypeScript

`tsconfig.json` has `strict: true` — still validate incoming data using `class-validator` and `class-transformer` for DTOs. Do not turn `strict` off as a drive-by change.

- Do not add new `any`. Existing `any` on the boundary is tolerated; do not globally rewrite it
- Prefer `unknown` + narrowing over `any`
- Avoid `@ts-ignore` / `@ts-expect-error` unless unavoidable and commented why
- Prefer `type` for data shapes; `interface` when you need `extends` or declaration merging
- Domain types and DTOs live in the module (`dto/`, `entities/`), not inside a controller
- Prettier: single quotes for TS/JS, semicolons

## Nullable database/external fields

### BAD — assumes field exists from DB/external API

```ts
async function getProductPrice(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  // Error if product is null
  return product.price;
}
```

### GOOD — explicit guard

```ts
async function getProductPrice(id: string): Promise<number> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  return product.price;
}
```

## unknown vs any

Especially relevant for Exception Filters and `try-catch` blocks.

### BAD

```ts
catch (error: any) {
  logger.error(error.message);
}
```

### GOOD

```ts
catch (error: unknown) {
  if (error instanceof Error) {
    logger.error(error.message);
  } else {
    logger.error('Произошла неизвестная ошибка', String(error));
  }
}
```

## Type location

### BAD — DTO inside controller file

```ts
// products.controller.ts
export class CreateProductDto {
  @IsString()
  title: string;
}

@Controller('products')
export class ProductsController {
  @Post()
  create(@Body() dto: CreateProductDto) {}
}
```

### GOOD — DTO in its own file

```ts
// dto/create-product.dto.ts
export class CreateProductDto {
  @IsString()
  title: string;
}

// products.controller.ts
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  @Post()
  create(@Body() dto: CreateProductDto) {}
}
```

## Const assertions and satisfies

Use `as const satisfies` for config objects that must stay typed and readonly.

### BAD

```ts
export const cacheConfig = {
  ttl: 60,
  strategy: 'memory',
};
// strategy becomes string, not union of specific literals
```

### GOOD

```ts
export type CacheStrategy = 'memory' | 'redis';

export const cacheConfig = {
  ttl: 60,
  strategy: 'memory',
} as const satisfies { ttl: number; strategy: CacheStrategy };
```

## Enums

Prefer string union types over `enum` where possible for internal business logic.
_Note: Prisma генерирует TypeScript `enum` для базы данных. Используйте их для работы с БД, но для внутренней логики приложения рассмотрите union типы._

### BAD

```ts
enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
}
```

### GOOD

```ts
type OrderStatus = 'pending' | 'paid' | 'cancelled';
```
