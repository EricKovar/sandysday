import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const checkins = sqliteTable('checkins', {
 id:text('id').primaryKey(), userId:text('user_id').notNull(), name:text('name').notNull(), videoKey:text('video_key').notNull(), mime:text('mime').notNull(), bytes:integer('bytes').notNull(), createdAt:text('created_at').notNull()
});
export const messages=sqliteTable('conversation_messages',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),role:text('role').notNull(),content:text('content').notNull(),createdAt:integer('created_at').notNull(),authorId:text('author_id'),authorName:text('author_name')
});
export const careProfiles=sqliteTable('care_profiles',{
 userId:text('user_id').primaryKey(),name:text('name').notNull(),role:text('role').notNull()
});
export const careInvitations=sqliteTable('care_invitations',{
 id:text('id').primaryKey(),tokenHash:text('token_hash').notNull().unique(),creatorId:text('creator_id').notNull(),creatorName:text('creator_name').notNull(),creatorRole:text('creator_role').notNull(),targetEmail:text('target_email').notNull(),targetName:text('target_name').notNull(),status:text('status').notNull(),expiresAt:integer('expires_at').notNull(),acceptedBy:text('accepted_by'),createdAt:integer('created_at').notNull()
});
export const careConnections=sqliteTable('care_connections',{
 id:text('id').primaryKey(),seniorId:text('senior_id').notNull(),caregiverId:text('caregiver_id').notNull(),seniorName:text('senior_name').notNull(),caregiverName:text('caregiver_name').notNull(),createdAt:integer('created_at').notNull()
},table=>({pair:uniqueIndex('care_connections_pair').on(table.seniorId,table.caregiverId)}));

export const caregiverPrivateMessages=sqliteTable('caregiver_private_messages',{
 id:text('id').primaryKey(),caregiverId:text('caregiver_id').notNull(),seniorId:text('senior_id').notNull(),role:text('role').notNull(),content:text('content').notNull(),createdAt:integer('created_at').notNull()
});

export const sparkSessions=sqliteTable('spark_sessions',{
 userId:text('user_id').primaryKey(),state:text('state').notNull(),revision:integer('revision').notNull(),updatedAt:integer('updated_at').notNull()
});

export const moveSessions=sqliteTable('move_sessions',{
 userId:text('user_id').primaryKey(),state:text('state').notNull(),revision:integer('revision').notNull()
});
