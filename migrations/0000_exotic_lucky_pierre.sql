CREATE TABLE `leagues` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_token` text NOT NULL,
	`view_token` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`table_count` integer DEFAULT 2 NOT NULL,
	`match_format` text DEFAULT '3_game' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leagues_admin_token_unique` ON `leagues` (`admin_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `leagues_view_token_unique` ON `leagues` (`view_token`);--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`league_id` text NOT NULL,
	`player1_id` text NOT NULL,
	`player2_id` text NOT NULL,
	`table_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`winner_id` text,
	`sets_data` text,
	`sets_won_player1` integer DEFAULT 0 NOT NULL,
	`sets_won_player2` integer DEFAULT 0 NOT NULL,
	`input_by` text,
	`started_at` text,
	`completed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player1_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player2_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`league_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` text PRIMARY KEY NOT NULL,
	`league_id` text NOT NULL,
	`table_number` integer NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`current_match_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`current_match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tables_league_id_table_number_unique` ON `tables` (`league_id`,`table_number`);