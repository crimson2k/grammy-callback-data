# grammy-callback-data

Type-safe utility for handling callback data in [grammY](https://grammy.dev/) bots.

## Installation

```bash
npm install grammy-callback-data
# or
bun add grammy-callback-data
```

## Quick Start

```typescript
import { Bot, InlineKeyboard } from "grammy";
import { CallbackData, t } from "grammy-callback-data";

// 1. Define your callback data
const PostCD = new CallbackData("post", {
  action: t.string,
  postId: t.number,
  isConfirmed: t.boolean,
});

// 2. Create keyboard with callback data
const keyboard = new InlineKeyboard()
  .text("👍 Like", PostCD.pack({ action: "like", postId: 123 }))
  .text("❌ Delete", PostCD.pack({ action: "delete", postId: 123 }));

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
      PostCD.pack({ action: "delete", postId, isConfirmed: true })
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

- 🔒 Type-safe callback data handling with TypeScript
- 🎯 Built-in data validation
- 🔍 Powerful filtering by action and fields
- 💪 Support for string, number and boolean values
- 🎭 Compact data format for Telegram's 64-byte limit

## API

### Creating Callback Data

```typescript
const callback = new CallbackData(prefix, {
  field1: { type: DataType.string },
  field2: { type: DataType.number, required: false },
  field3: { type: DataType.boolean },
});
```

### Packing Data

```typescript
const data = callback.pack({
  field1: "value",
  field2: 123,
  field3: true,
});
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

## Documentation

For detailed documentation and examples, visit the [package directory](./).

## License

MIT
