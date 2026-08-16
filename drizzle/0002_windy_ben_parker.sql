ALTER TABLE `evaluation_results` MODIFY COLUMN `percentile` double;--> statement-breakpoint
ALTER TABLE `evaluation_results` ADD `scorePercent` double NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `legalName` varchar(240);--> statement-breakpoint
ALTER TABLE `organizations` ADD `address` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `privacyChannel` varchar(320);--> statement-breakpoint
ALTER TABLE `organizations` ADD `privacyNoticeVersion` varchar(50) DEFAULT 'lfpdppp-mvp-2026-01' NOT NULL;