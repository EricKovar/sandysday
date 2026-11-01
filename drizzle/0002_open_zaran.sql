CREATE TABLE `care_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`senior_id` text NOT NULL,
	`caregiver_id` text NOT NULL,
	`senior_name` text NOT NULL,
	`caregiver_name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `care_connections_pair` ON `care_connections` (`senior_id`,`caregiver_id`);--> statement-breakpoint
CREATE TABLE `care_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`creator_id` text NOT NULL,
	`creator_name` text NOT NULL,
	`creator_role` text NOT NULL,
	`target_email` text NOT NULL,
	`target_name` text NOT NULL,
	`status` text NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `care_invitations_token_hash_unique` ON `care_invitations` (`token_hash`);--> statement-breakpoint
CREATE TABLE `care_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL
);
