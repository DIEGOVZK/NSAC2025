import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core';


// objects of interest from TESS, K2 and Kepler missions
export const transits = sqliteTable('transits', {
	period: real('period'),
	transit_epoch_bjd: real('transit_epoch_bjd'),
	transit_duration_hrs: real('transit_duration_hrs'),
	transit_depth_ppm: real('transit_depth_ppm'),
	planet_radius_earth: real('planet_radius_earth'),
	star_radius_sol: real('star_radius_sol'),
	star_teff: real('star_teff'),
	star_logg: real('star_logg'),
	disposition_text: text('disposition_text'),
	source: text('source'),
	target_encoded: integer('target_encoded')
});
