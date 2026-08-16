CREATE TABLE `evaluation_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`personId` int NOT NULL,
	`testId` int NOT NULL,
	`process` varchar(120) NOT NULL,
	`status` enum('assigned','in_progress','completed','expired') NOT NULL DEFAULT 'assigned',
	`consentAccepted` boolean NOT NULL DEFAULT false,
	`consentVersion` varchar(50),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`dueAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evaluation_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evaluation_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`rawScore` double NOT NULL,
	`maxScore` double NOT NULL,
	`percentile` double NOT NULL,
	`level` enum('bajo','medio','alto') NOT NULL,
	`recommendation` enum('seleccion','desarrollo','alerta') NOT NULL,
	`interpretation` text NOT NULL,
	`dimensionScores` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evaluation_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `evaluation_results_assignmentId_unique` UNIQUE(`assignmentId`)
);
--> statement-breakpoint
CREATE TABLE `item_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`itemId` int NOT NULL,
	`numericScore` double NOT NULL,
	`answeredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `item_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `assignment_item_unique` UNIQUE(`assignmentId`,`itemId`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`privacyContactEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int,
	`fullName` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`personType` enum('candidate','employee') NOT NULL,
	`position` varchar(120) NOT NULL,
	`area` varchar(120) NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `people_id` PRIMARY KEY(`id`),
	CONSTRAINT `people_org_email_unique` UNIQUE(`organizationId`,`email`)
);
--> statement-breakpoint
CREATE TABLE `privacy_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`personId` int NOT NULL,
	`assignmentId` int NOT NULL,
	`documentVersion` varchar(50) NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`method` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `privacy_consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychometric_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(180) NOT NULL,
	`category` enum('reasoning','personality','competency') NOT NULL,
	`audience` enum('operativo','mandos_medios','todos') NOT NULL,
	`durationMinutes` int NOT NULL,
	`instructions` text NOT NULL,
	`scoringConfig` json NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `psychometric_tests_id` PRIMARY KEY(`id`),
	CONSTRAINT `psychometric_tests_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `test_dimensions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`code` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`sortOrder` int NOT NULL,
	CONSTRAINT `test_dimensions_id` PRIMARY KEY(`id`),
	CONSTRAINT `test_dimension_unique` UNIQUE(`testId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `test_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`dimensionId` int NOT NULL,
	`code` varchar(80) NOT NULL,
	`prompt` text NOT NULL,
	`itemType` enum('single_choice','likert') NOT NULL,
	`options` json NOT NULL,
	`reverseScored` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `test_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `test_item_unique` UNIQUE(`testId`,`code`)
);
--> statement-breakpoint
CREATE INDEX `assignments_person_idx` ON `evaluation_assignments` (`personId`);--> statement-breakpoint
CREATE INDEX `assignments_test_idx` ON `evaluation_assignments` (`testId`);--> statement-breakpoint
CREATE INDEX `assignments_status_idx` ON `evaluation_assignments` (`status`);--> statement-breakpoint
CREATE INDEX `responses_assignment_idx` ON `item_responses` (`assignmentId`);--> statement-breakpoint
CREATE INDEX `people_user_idx` ON `people` (`userId`);--> statement-breakpoint
CREATE INDEX `consents_assignment_idx` ON `privacy_consents` (`assignmentId`);--> statement-breakpoint
CREATE INDEX `dimensions_test_idx` ON `test_dimensions` (`testId`);--> statement-breakpoint
CREATE INDEX `items_test_idx` ON `test_items` (`testId`);