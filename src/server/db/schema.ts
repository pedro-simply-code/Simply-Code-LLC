import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { env } from "~/env";

/** All app tables are prefixed via `DB_TABLE_PREFIX` (multi-app Neon clusters). */
export const createTable = pgTableCreator(
  (name) => `${env.DB_TABLE_PREFIX}_${name}`,
);

/**
 * Team roles inherit downwards:
 *   founder  -> everything (lead + developer + client access)
 *   lead     -> lead + developer
 *   developer
 *   client   -> portal only
 *
 * `user` / `admin` are legacy values kept so existing databases can be
 * migrated without dropping rows. `normalizeRole` in `src/lib/roles.ts`
 * maps them to `developer` / `founder`.
 */
export const userRoleEnum = pgEnum(`${env.DB_TABLE_PREFIX}_user_role`, [
  "user",
  "admin",
  "founder",
  "lead",
  "developer",
  "client",
]);

export const users = createTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  /** Argon2id hash; null when the account is OAuth-only. */
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("client"),
  title: text("title"),
  /** Short public bio for /about#team (team) or context in portal (clients). */
  bio: text("bio"),
  /** Optional phone for scheduling and project contact (E.164 or free-form). */
  phone: text("phone"),
  /** IANA timezone id, e.g. America/Guatemala */
  timezone: text("timezone"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  /** Shown as skill chips on the public About team section. */
  profileSkills: jsonb("profile_skills")
    .$type<string[]>()
    .notNull()
    .default([]),
  /** When true, team members appear on /about#team (founder, lead, developer only). */
  showOnAbout: boolean("show_on_about").notNull().default(false),
  /** Base32 TOTP secret for founder 2FA (studio access). */
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const accounts = createTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => ({
    providerAccountUnique: uniqueIndex(
      `${env.DB_TABLE_PREFIX}_accounts_provider_account_unique`,
    ).on(table.provider, table.providerAccountId),
  }),
);

export const sessions = createTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = createTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  }),
);

/** Technologies the studio can assign to developers and projects. */
export const technologies = createTable(
  "technologies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull().default("General"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex(
      `${env.DB_TABLE_PREFIX}_technologies_slug_unique`,
    ).on(table.slug),
  }),
);

export const userTechnologies = createTable(
  "user_technologies",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "cascade" }),
    level: text("level").notNull().default("practicing"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.technologyId] }),
  }),
);

/** A client account can contain several people from the same company. */
export const clients = createTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    contactEmail: text("contact_email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex(`${env.DB_TABLE_PREFIX}_clients_slug_unique`).on(
      table.slug,
    ),
  }),
);

export const clientMembers = createTable(
  "client_members",
  {
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.clientId, table.userId] }),
  }),
);

/**
 * Invite-only account creation. Founders create a tokenised invite; the
 * recipient opens the emailed link and sets their own password. Public
 * registration stays disabled.
 */
export const invites = createTable(
  "invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull(),
    email: text("email").notNull(),
    name: text("name"),
    role: userRoleEnum("role").notNull().default("developer"),
    title: text("title"),
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "cascade",
    }),
    invitedById: uuid("invited_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    tokenUnique: uniqueIndex(`${env.DB_TABLE_PREFIX}_invites_token_unique`).on(
      table.token,
    ),
    emailIdx: index(`${env.DB_TABLE_PREFIX}_invites_email_idx`).on(table.email),
  }),
);

export const projects = createTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull().default("Next.js"),
    clientName: text("client_name").notNull().default(""),
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    year: text("year").notNull().default(""),
    summary: text("summary").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    services: jsonb("services").$type<string[]>().notNull().default([]),
    image: text("image"),
    liveUrl: text("live_url"),
    status: text("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    createdById: uuid("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex(`${env.DB_TABLE_PREFIX}_projects_slug_unique`).on(
      table.slug,
    ),
    statusIdx: index(`${env.DB_TABLE_PREFIX}_projects_status_idx`).on(
      table.status,
    ),
  }),
);

export const projectMembers = createTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** `lead` receives project email and can manage the project. */
    projectRole: text("project_role").notNull().default("developer"),
    assignedById: uuid("assigned_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
  }),
);

export const projectTechnologies = createTable(
  "project_technologies",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.technologyId] }),
  }),
);

export const projectUpdates = createTable("project_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  /** `client` is visible in the portal; `internal` is studio-only. */
  visibility: text("visibility").notNull().default("client"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const projectMilestones = createTable(
  "project_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    /** pending | in_progress | completed */
    status: text("status").notNull().default("pending"),
    sortOrder: integer("sort_order").notNull().default(0),
    targetDate: timestamp("target_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    projectIdx: index(
      `${env.DB_TABLE_PREFIX}_project_milestones_project_idx`,
    ).on(table.projectId, table.sortOrder),
  }),
);

export const projectDeliverables = createTable(
  "project_deliverables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    contentType: text("content_type").notNull(),
    /** client = portal; internal = studio only */
    visibility: text("visibility").notNull().default("client"),
    uploadedById: uuid("uploaded_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    projectIdx: index(
      `${env.DB_TABLE_PREFIX}_project_deliverables_project_idx`,
    ).on(table.projectId, table.createdAt),
  }),
);

export const projectRequests = createTable("project_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  type: text("type").notNull().default("request"),
  priority: text("priority").notNull().default("normal"),
  /** `open` | `completed` | `rejected` */
  status: text("status").notNull().default("open"),
  /** Reason/note attached when a request is rejected or completed. */
  resolutionNote: text("resolution_note"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const reviews = createTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  quote: text("quote").notNull(),
  authorName: text("author_name").notNull().default("Client"),
  authorRole: text("author_role"),
  company: text("company"),
  projectTitle: text("project_title"),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  rating: integer("rating").notNull().default(5),
  /** `upwork` | `client` | `manual` | `google` */
  source: text("source").notNull().default("manual"),
  sourceUrl: text("source_url"),
  period: text("period"),
  /** `pending` | `approved` | `hidden` */
  status: text("status").notNull().default("pending"),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const notifications = createTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** contact | project | review | request | system */
    type: text("type").notNull().default("system"),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    href: text("href"),
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, string>>().default({}),
    dedupeKey: text("dedupe_key"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userReadIdx: index(`${env.DB_TABLE_PREFIX}_notifications_user_read_idx`).on(
      table.userId,
      table.readAt,
    ),
    userCreatedIdx: index(
      `${env.DB_TABLE_PREFIX}_notifications_user_created_idx`,
    ).on(table.userId, table.createdAt),
    userDedupeIdx: uniqueIndex(
      `${env.DB_TABLE_PREFIX}_notifications_user_dedupe_idx`,
    )
      .on(table.userId, table.dedupeKey)
      .where(sql`${table.dedupeKey} is not null`),
  }),
);

export const contactMessages = createTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  service: text("service"),
  message: text("message").notNull(),
  attachments: jsonb("attachments")
    .$type<import("~/lib/message-attachments").MessageAttachment[]>()
    .notNull()
    .default([]),
  /** new | replied | archived */
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/** Founder → client replies (portal inbox and/or email audit). */
export const clientInboxMessages = createTable(
  "client_inbox_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Null when the reply was email-only (studio history still kept on the enquiry). */
    recipientUserId: uuid("recipient_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    contactMessageId: uuid("contact_message_id").references(
      () => contactMessages.id,
      {
        onDelete: "set null",
      },
    ),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    attachments: jsonb("attachments")
      .$type<import("~/lib/message-attachments").MessageAttachment[]>()
      .notNull()
      .default([]),
    /** portal | email | both */
    channel: text("channel").notNull(),
    sentById: uuid("sent_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    recipientIdx: index(`${env.DB_TABLE_PREFIX}_client_inbox_recipient_idx`).on(
      table.recipientUserId,
      table.createdAt,
    ),
  }),
);

/** Append-only security and compliance trail. */
export const auditEvents = createTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ipAddress: varchar("ip_address", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    createdIdx: index(`${env.DB_TABLE_PREFIX}_audit_events_created_idx`).on(
      table.createdAt,
    ),
    actorIdx: index(`${env.DB_TABLE_PREFIX}_audit_events_actor_idx`).on(
      table.actorUserId,
      table.createdAt,
    ),
  }),
);

/** Fixed-window counters for login, contact, and other abuse-prone endpoints. */
export const rateLimits = createTable("rate_limits", {
  bucket: varchar("bucket", { length: 200 }).primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

export const uploadClaimKindEnum = pgEnum(
  `${env.DB_TABLE_PREFIX}_upload_claim_kind`,
  ["avatar", "message_attachment", "project_deliverable"],
);

/** UploadThing URLs registered on upload; required before attach or discard. */
export const userUploadClaims = createTable(
  "user_upload_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    kind: uploadClaimKindEnum("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    urlUnique: uniqueIndex(
      `${env.DB_TABLE_PREFIX}_user_upload_claims_url_unique`,
    ).on(table.url),
    userCreatedIdx: index(
      `${env.DB_TABLE_PREFIX}_user_upload_claims_user_created_idx`,
    ).on(table.userId, table.createdAt),
  }),
);

/** Singleton row (`key = global`) for founder-controlled site appearance and flags. */
export const siteSettings = createTable("site_settings", {
  key: text("key").primaryKey().notNull(),
  settings: jsonb("settings").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedById: uuid("updated_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
});

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type Project = typeof projects.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
