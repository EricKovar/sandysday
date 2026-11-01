CREATE TABLE `spark_sessions` (
	`user_id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` integer NOT NULL
);
