CREATE TABLE `caregiver_private_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`caregiver_id` text NOT NULL,
	`senior_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `conversation_messages` ADD `author_id` text;--> statement-breakpoint
ALTER TABLE `conversation_messages` ADD `author_name` text;