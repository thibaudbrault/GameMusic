import { relations } from 'drizzle-orm';
import {
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	real,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'user']);
export const visibilityEnum = pgEnum('visibility', ['public', 'private']);

export const albums = pgTable('albums', {
	id: uuid('id').notNull().primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	cover: text('cover').notNull().unique(),
	release: integer('release').notNull(),
	popularity: integer('popularity').default(0),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(
		() => new Date(),
	),
	gameId: uuid('game_id').notNull(),
});

export const albumsRelations = relations(albums, ({ one, many }) => ({
	games: one(games, { fields: [albums.gameId], references: [games.id] }),
	favoritedByUsers: many(favoritesAlbums),
	music: many(musics),
}));

export const musics = pgTable('musics', {
	id: uuid('id').notNull().primaryKey().defaultRandom(),
	name: text('name').notNull(),
	url: text('url').notNull().unique(),
	number: real('number').notNull(),
	duration: integer('duration').notNull(),
	popularity: integer('popularity').default(0),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(
		() => new Date(),
	),
	albumId: uuid('album_id').notNull(),
});

export const musicsRelations = relations(musics, ({ one, many }) => ({
	album: one(albums, { fields: [musics.albumId], references: [albums.id] }),
	authors: many(musicsToAuthors),
	favoritedByUsers: many(favoritesMusics),
	playlists: many(playlistMusics),
}));

export const users = pgTable('users', {
	id: uuid('id').notNull().primaryKey(),
	name: text('name'),
	email: text('email').notNull(),
	image: text('image'),
	role: roleEnum('role').default('user'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(
		() => new Date(),
	),
});

export const usersRelations = relations(users, ({ many }) => ({
	musics: many(favoritesMusics),
	albums: many(favoritesAlbums),
}));

export const authors = pgTable('authors', {
	id: uuid('id').notNull().primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(
		() => new Date(),
	),
});

export const authorsRelations = relations(authors, ({ many }) => ({
	musics: many(musicsToAuthors),
}));

export const playlists = pgTable('playlists', {
	id: uuid('id').notNull().primaryKey().defaultRandom(),
	name: text('name').notNull(),
	value: text('value').notNull().unique(),
	visibility: visibilityEnum('visibility').default('public'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(
		() => new Date(),
	),
	userId: uuid('user_id').notNull(),
});

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
	user: one(users, { fields: [playlists.userId], references: [users.id] }),
	musics: many(playlistMusics),
}));

export const games = pgTable('games', {
	id: uuid('id').notNull().primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	value: text('value').notNull().unique(),
	cover: text('cover').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(
		() => new Date(),
	),
	companyId: uuid('company_id').notNull(),
});

export const gamesRelations = relations(games, ({ one, many }) => ({
	companies: one(companies, {
		fields: [games.companyId],
		references: [companies.id],
	}),
	albums: many(albums),
}));

export const companies = pgTable('companies', {
	id: uuid('id').notNull().primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	value: text('value').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(
		() => new Date(),
	),
});

export const companiesRelations = relations(companies, ({ many }) => ({
	games: many(games),
}));

export const musicsToAuthors = pgTable(
	'musics_authors',
	{
		musicId: uuid('music_id')
			.notNull()
			.references(() => musics.id, { onDelete: 'cascade' }),
		authorId: uuid('author_id')
			.notNull()
			.references(() => authors.id, { onDelete: 'cascade' }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.musicId, t.authorId] }),
	}),
);

export const musicToAuthorsRelations = relations(
	musicsToAuthors,
	({ one }) => ({
		music: one(musics, {
			fields: [musicsToAuthors.musicId],
			references: [musics.id],
		}),
		author: one(authors, {
			fields: [musicsToAuthors.authorId],
			references: [authors.id],
		}),
	}),
);

export const gameToAuthors = pgTable(
	'games_authors',
	{
		gameId: uuid('game_id')
			.notNull()
			.references(() => games.id, { onDelete: 'cascade' }),
		authorId: uuid('author_id')
			.notNull()
			.references(() => authors.id, { onDelete: 'cascade' }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.gameId, t.authorId] }),
	}),
);

export const gameToAuthorsRelations = relations(gameToAuthors, ({ one }) => ({
	game: one(games, {
		fields: [gameToAuthors.gameId],
		references: [games.id],
	}),
	author: one(authors, {
		fields: [gameToAuthors.authorId],
		references: [authors.id],
	}),
}));

export const favoritesMusics = pgTable(
	'favorites_musics',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		musicId: uuid('music_id')
			.notNull()
			.references(() => musics.id, { onDelete: 'cascade' }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.musicId] }),
	}),
);

export const favoritesMusicsRelations = relations(
	favoritesMusics,
	({ one }) => ({
		music: one(musics, {
			fields: [favoritesMusics.musicId],
			references: [musics.id],
		}),
		user: one(users, {
			fields: [favoritesMusics.userId],
			references: [users.id],
		}),
	}),
);

export const favoritesAlbums = pgTable(
	'favorites_albums',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		albumId: uuid('album_id')
			.notNull()
			.references(() => albums.id, { onDelete: 'cascade' }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.albumId] }),
	}),
);

export const favoritesAlbumsRelations = relations(
	favoritesAlbums,
	({ one }) => ({
		album: one(albums, {
			fields: [favoritesAlbums.albumId],
			references: [albums.id],
		}),
		user: one(users, {
			fields: [favoritesAlbums.userId],
			references: [users.id],
		}),
	}),
);

export const playlistMusics = pgTable(
	'playlist_musics',
	{
		playlistId: uuid('playlist_id')
			.notNull()
			.references(() => playlists.id),
		musicId: uuid('music_id')
			.notNull()
			.references(() => musics.id),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.playlistId, t.musicId] }),
	}),
);

export const playlistMusicsRelations = relations(playlistMusics, ({ one }) => ({
	playlist: one(playlists, {
		fields: [playlistMusics.playlistId],
		references: [playlists.id],
	}),
	music: one(musics, {
		fields: [playlistMusics.musicId],
		references: [musics.id],
	}),
}));

export const history = pgTable(
	'history',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		musicId: uuid('music_id')
			.notNull()
			.references(() => musics.id, { onDelete: 'cascade' }),
		listenedAt: timestamp('listened_at').defaultNow().notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.musicId] }),
	}),
);

export const historyRelations = relations(history, ({ one }) => ({
	music: one(musics, {
		fields: [history.musicId],
		references: [musics.id],
	}),
	user: one(users, {
		fields: [history.userId],
		references: [users.id],
	}),
}));

export type InsertAlbum = typeof albums.$inferInsert;
export type SelectAlbum = typeof albums.$inferSelect;

export type InsertMusic = typeof musics.$inferInsert;
export type SelectMusic = typeof musics.$inferSelect;

export type InsertAuthor = typeof authors.$inferInsert;
export type SelectAuthor = typeof authors.$inferSelect;

export type InsertGame = typeof games.$inferInsert;
export type SelectGame = typeof games.$inferSelect;

export type InsertCompany = typeof companies.$inferInsert;
export type SelectCompany = typeof companies.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertFavoritesMusic = typeof favoritesMusics.$inferInsert;
export type SelectFavoritesMusic = typeof favoritesMusics.$inferSelect;

export type SelectFavoritesAlbum = typeof favoritesAlbums.$inferSelect;
export type InsertFavoritesAlbum = typeof favoritesAlbums.$inferInsert;
