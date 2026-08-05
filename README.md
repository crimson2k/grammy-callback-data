# grammy-callback-data

Type-safe utility for packing, unpacking, and filtering Telegram `callback_data` in [grammY](https://grammy.dev/) bots.

Works with both ESM and CommonJS. Requires Node.js 18+.

## Installation

```bash
pnpm add grammy-callback-data
# or
npm install grammy-callback-data
# or
bun add grammy-callback-data
```

## Quick Start

```typescript
import { Bot, InlineKeyboard } from "grammy";
import { CallbackData, t } from "grammy-callback-data";

// 1. Define your callback data schema
const PostCD = new CallbackData("post", {
  action: t.string(),
  postId: t.number(),
  isConfirmed: t.boolean(),
});

// 2. Create keyboard with packed callback data
const keyboard = new InlineKeyboard()
  .text("👍 Like", PostCD.pack({ action: "like", postId: 123, isConfirmed: false }))
  .text("❌ Delete", PostCD.pack({ action: "delete", postId: 123, isConfirmed: false }));

// 3. Use keyboard in your bot
bot.command("post", async (ctx) => {
  await ctx.reply("Post actions:", {
    reply_markup: keyboard,
  });
});

// 4. Handle specific actions using filter
bot.callbackQuery(PostCD.filter({ action: "like" }), async (ctx) => {
  const { postId } = PostCD.unpack(ctx.callbackQuery.data);
  await ctx.reply(`Post ${postId} liked!`);
});

// Handle delete with confirmation
bot.callbackQuery(PostCD.filter({ action: "delete" }), async (ctx) => {
  const { postId, isConfirmed } = PostCD.unpack(ctx.callbackQuery.data);

  if (!isConfirmed) {
    const confirmKeyboard = new InlineKeyboard().text(
      "Confirm Delete",
      PostCD.pack({ action: "delete", postId, isConfirmed: true }),
    );

    await ctx.reply("Are you sure?", {
      reply_markup: confirmKeyboard,
    });
    return;
  }

  await ctx.reply(`Post ${postId} deleted!`);
});
```

## Features

- Type-safe callback data handling with TypeScript
- Compact `prefix:value:...` format for Telegram's 64-byte limit
- Built-in serializers for `string`, `number`, and `boolean`
- RegExp filters for `bot.callbackQuery(...)`
- Dual ESM / CJS publish with source maps

## API

### Creating Callback Data

```typescript
const callback = new CallbackData("prefix", {
  field1: t.string(),
  field2: t.number(),
  field3: t.boolean(),
});
```

### Packing Data

```typescript
const data = callback.pack({
  field1: "value",
  field2: 123,
  field3: true,
});
// => "prefix:value:123:1"
```

### Unpacking Data

```typescript
const { field1, field2, field3 } = callback.unpack(ctx.callbackQuery.data);
```

### Filtering Callbacks

```typescript
// Filter by prefix only
bot.callbackQuery(callback.filter(), handler);

// Filter by specific fields
bot.callbackQuery(callback.filter({ field1: "value" }), handler);
```

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## License

MIT
