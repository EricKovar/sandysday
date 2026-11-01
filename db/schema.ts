import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const checkins = sqliteTable('checkins', {
 id:text('id').primaryKey(), userId:text('user_id').notNull(), name:text('name').notNull(), videoKey:text('video_key').notNull(), mime:text('mime').notNull(), bytes:integer('bytes').notNull(), createdAt:text('created_at').notNull()
});
export const messages=sqliteTable('conversation_messages',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),role:text('role').notNull(),content:text('content').notNull(),createdAt:integer('created_at').notNull()
});
